# backend/app/services/map_service.py

import httpx
from typing import Dict, Any
from app.core.config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

OLA_DIRECTIONS_API_URL = "https://api.olamaps.io/routing/v1/directions"

def decode_polyline(encoded_polyline: str) -> list[tuple[float, float]]:
    """Decode polyline string to list of (lng, lat) coordinates."""
    points = []
    index = 0
    lat = 0
    lng = 0
    len_encoded = len(encoded_polyline)

    while index < len_encoded:
        shift = 0
        result = 0
        while True:
            byte = ord(encoded_polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if not byte >= 0x20:
                break
        
        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat

        shift = 0
        result = 0
        while True:
            byte = ord(encoded_polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if not byte >= 0x20:
                break

        dlng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += dlng

        # Append as (longitude, latitude) for GeoJSON compatibility
        points.append((lng / 1E5, lat / 1E5))
    
    return points


async def get_route_from_ola(
    start_lat: float, start_lng: float, end_lat: float, end_lng: float
) -> Dict[str, Any] | None:
    """
    Calls the OLA Directions API to get a route between two points.
    """
    # Validate coordinates
    if not (-90 <= start_lat <= 90) or not (-180 <= start_lng <= 180):
        logger.error(f"Invalid start coordinates: {start_lat}, {start_lng}")
        return None
    
    if not (-90 <= end_lat <= 90) or not (-180 <= end_lng <= 180):
        logger.error(f"Invalid end coordinates: {end_lat}, {end_lng}")
        return None

    # Format coordinates for Ola API
    origin_str = f"{start_lat},{start_lng}"
    destination_str = f"{end_lat},{end_lng}"

    # Ola Maps API parameters
    params = {
        "origin": origin_str,
        "destination": destination_str,
        "api_key": settings.OLA_MAPS_API_KEY,
        "alternatives": "false",  # We only need one route
        "steps": "false",         # We don't need step-by-step directions
        "geometries": "polyline", # We want polyline encoding
        "overview": "full"        # Full geometry overview
    }

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": settings.OLA_MAPS_API_KEY  # Some APIs prefer header-based auth
    }

    logger.info(f"Requesting route from {origin_str} to {destination_str}")
    logger.debug(f"API params: {params}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Try with query parameters first
            response = await client.get(
                OLA_DIRECTIONS_API_URL, 
                params=params,
                headers=headers
            )
            
            logger.info(f"Ola API Response Status: {response.status_code}")
            logger.debug(f"Ola API Response: {response.text[:500]}...")  # Log first 500 chars
            
            response.raise_for_status()
            data = response.json()

            # Parse the response based on Ola Maps API format
            if "routes" in data and len(data["routes"]) > 0:
                route = data["routes"][0]
                logger.debug(f"Route keys: {route.keys()}")
                
                # Get the geometry (polyline)
                geometry = route.get("geometry", "")
                if not geometry:
                    logger.error("No geometry found in route")
                    return None
                
                # Get distance and duration from legs
                legs = route.get("legs", [])
                if not legs:
                    logger.error("No legs found in route")
                    return None
                
                leg = legs[0]  # Take the first leg
                
                # Extract distance and duration
                distance_meters = leg.get("distance", {}).get("value", 0) if isinstance(leg.get("distance"), dict) else leg.get("distance", 0)
                duration_seconds = leg.get("duration", {}).get("value", 0) if isinstance(leg.get("duration"), dict) else leg.get("duration", 0)
                
                # If distance/duration are still 0, try alternative formats
                if distance_meters == 0:
                    distance_meters = route.get("distance", 0)
                if duration_seconds == 0:
                    duration_seconds = route.get("duration", 0)
                
                logger.info(f"Route found - Distance: {distance_meters}m, Duration: {duration_seconds}s")
                
                # Decode polyline
                try:
                    decoded_points = decode_polyline(geometry)
                    logger.info(f"Decoded {len(decoded_points)} polyline points")
                except Exception as e:
                    logger.error(f"Failed to decode polyline: {e}")
                    return None

                return {
                    "polyline": decoded_points,
                    "distance_meters": int(distance_meters),
                    "duration_seconds": int(duration_seconds),
                    "is_fallback": False
                }
            else:
                logger.error("No routes found in API response")
                logger.debug(f"Full response: {data}")
                return None

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error {e.response.status_code}: {e.response.text}")
            
            # Try alternative API endpoint format if the first fails
            if e.response.status_code == 404:
                logger.info("Trying alternative API format...")
                try:
                    alt_params = {
                        "coordinates": f"{start_lng},{start_lat};{end_lng},{end_lat}",
                        "api_key": settings.OLA_MAPS_API_KEY
                    }
                    
                    alt_response = await client.get(
                        OLA_DIRECTIONS_API_URL,
                        params=alt_params,
                        headers=headers
                    )
                    
                    if alt_response.status_code == 200:
                        logger.info("Alternative format worked!")
                        # Process the alternative response the same way
                        alt_data = alt_response.json()
                        # ... (same parsing logic as above)
                        
                except Exception as alt_e:
                    logger.error(f"Alternative format also failed: {alt_e}")
            
            return None
            
        except httpx.TimeoutException:
            logger.error("Request to Ola Maps API timed out")
            return None
            
        except Exception as e:
            logger.error(f"Unexpected error calling Ola Maps API: {e}")
            return None

    return None