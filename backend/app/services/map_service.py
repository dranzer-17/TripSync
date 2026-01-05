# backend/app/services/map_service.py

import httpx
from typing import Dict, Any
from app.core.config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

OLA_DIRECTIONS_API_URL = "https://api.olamaps.io/routing/v1/directions/basic"

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
        "overview": "full"        # Full geometry overview
    }

    headers = {
        "Content-Type": "application/json",
    }

    logger.info(f"Requesting route from {origin_str} to {destination_str}")
    logger.debug(f"API params: {params}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Use POST request as per Ola Maps API documentation
            response = await client.post(
                OLA_DIRECTIONS_API_URL, 
                params=params,
                headers=headers
            )
            
            logger.info(f"Ola API Response Status: {response.status_code}")
            logger.debug(f"Ola API Response: {response.text[:500]}...")  # Log first 500 chars
            
            response.raise_for_status()
            data = response.json()

            # Parse the response based on Ola Maps API format
            # The /basic endpoint returns a simpler structure with status: "SUCCESS"
            if data.get("status") == "SUCCESS" and "routes" in data and len(data["routes"]) > 0:
                route = data["routes"][0]
                logger.debug(f"Route keys: {route.keys()}")
                
                # Get the geometry (overview_polyline)
                geometry = route.get("overview_polyline", "")
                if not geometry:
                    logger.error("No overview_polyline found in route")
                    return None
                
                # Get distance and duration from legs
                legs = route.get("legs", [])
                if not legs:
                    logger.error("No legs found in route")
                    return None
                
                leg = legs[0]  # Take the first leg
                
                # Extract distance and duration - they are direct values in the /basic endpoint
                distance_meters = leg.get("distance", 0)
                duration_seconds = leg.get("duration", 0)
                
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
                logger.error(f"No routes found in API response or status is not SUCCESS. Status: {data.get('status')}")
                logger.debug(f"Full response: {data}")
                return None

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error {e.response.status_code}: {e.response.text}")
            return None
            
        except httpx.TimeoutException:
            logger.error("Request to Ola Maps API timed out")
            return None
            
        except Exception as e:
            logger.error(f"Unexpected error calling Ola Maps API: {e}")
            return None