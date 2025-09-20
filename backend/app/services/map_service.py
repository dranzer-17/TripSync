# backend/app/services/map_service.py (Debug Version)

import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
import logging
import json

logger = logging.getLogger(__name__)

OLA_DIRECTIONS_API_URL = "https://api.olamaps.io/routing/v1/directions"

def decode_polyline(encoded_polyline: str) -> list[tuple[float, float]]:
    """Decodes Google Polyline Algorithm encoded string to coordinates."""
    points = []
    index, lat, lng = 0, 0, 0
    len_encoded = len(encoded_polyline)
    
    while index < len_encoded:
        # Decode latitude
        shift, result = 0, 0
        while True:
            byte = ord(encoded_polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if not byte >= 0x20: 
                break
        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat
        
        # Decode longitude
        shift, result = 0, 0
        while True:
            byte = ord(encoded_polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if not byte >= 0x20: 
                break
        dlng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += dlng
        
        points.append((lng / 1E5, lat / 1E5))
    
    return points

async def get_route_from_ola(
    start_lat: float, start_lng: float, end_lat: float, end_lng: float
) -> Optional[Dict[str, Any]]:
    """
    Enhanced debug version of OLA Directions API call with extensive logging.
    """
    origin_str = f"{start_lat},{start_lng}"
    destination_str = f"{end_lat},{end_lng}"

    # Test multiple parameter configurations
    param_configs = [
        # Config 1: Basic parameters
        {
            "origin": origin_str,
            "destination": destination_str,
            "api_key": settings.OLA_MAPS_API_KEY,
        },
        # Config 2: With mode
        {
            "origin": origin_str,
            "destination": destination_str,
            "api_key": settings.OLA_MAPS_API_KEY,
            "mode": "driving",
        },
        # Config 3: With additional parameters
        {
            "origin": origin_str,
            "destination": destination_str,
            "api_key": settings.OLA_MAPS_API_KEY,
            "mode": "driving",
            "alternatives": "false",
            "steps": "false",
            "geometries": "polyline",
            "overview": "full",
        }
    ]
    
    logger.info(f"🗺️  Requesting route from OLA: {origin_str} -> {destination_str}")
    
    for i, params in enumerate(param_configs, 1):
        logger.info(f"🔧 Trying parameter configuration #{i}: {json.dumps(params, indent=2)}")
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.get(OLA_DIRECTIONS_API_URL, params=params)
                
                logger.info(f"📡 HTTP Status: {response.status_code}")
                logger.info(f"🔗 Request URL: {response.url}")
                logger.info(f"📄 Response Headers: {dict(response.headers)}")
                
                if response.status_code != 200:
                    logger.error(f"❌ HTTP Error {response.status_code}: {response.text}")
                    continue
                
                data = response.json()
                logger.info(f"📦 Raw Response: {json.dumps(data, indent=2)[:1000]}...")
                
                # Check response status
                api_status = data.get("status", "unknown")
                logger.info(f"🚦 API Status: {api_status}")
                
                if api_status != "Ok" and not data.get("routes"):
                    logger.warning(f"⚠️  API returned status '{api_status}' with no routes")
                    continue
                
                routes = data.get("routes", [])
                if not routes:
                    logger.warning("⚠️  No routes found in response")
                    continue
                
                route = routes[0]
                logger.info(f"🛣️  Route keys: {list(route.keys())}")
                
                # Validate route structure
                if not route.get("geometry"):
                    logger.error("❌ Missing 'geometry' in route")
                    continue
                
                if not route.get("legs"):
                    logger.error("❌ Missing 'legs' in route")
                    continue
                
                legs = route["legs"]
                if not legs:
                    logger.error("❌ Empty legs array")
                    continue
                
                logger.info(f"🦵 Found {len(legs)} legs in route")
                
                # Try to decode polyline
                try:
                    geometry = route["geometry"]
                    logger.info(f"📐 Geometry type: {type(geometry)}")
                    
                    if isinstance(geometry, str):
                        logger.info(f"🔤 Polyline string length: {len(geometry)}")
                        polyline_coords = decode_polyline(geometry)
                    else:
                        logger.error(f"❌ Unexpected geometry format: {geometry}")
                        continue
                        
                    if not polyline_coords or len(polyline_coords) < 2:
                        logger.error(f"❌ Decoded polyline has insufficient points: {len(polyline_coords)}")
                        continue
                        
                    logger.info(f"✅ Successfully decoded {len(polyline_coords)} polyline points")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to decode polyline: {e}")
                    continue
                
                # Extract distance and duration
                leg = legs[0]
                logger.info(f"🦵 First leg data: {json.dumps(leg, indent=2)}")
                
                distance_meters = 0
                duration_seconds = 0
                
                # Handle different response formats
                distance_data = leg.get("distance")
                duration_data = leg.get("duration")
                
                logger.info(f"📏 Distance data: {distance_data} (type: {type(distance_data)})")
                logger.info(f"⏱️  Duration data: {duration_data} (type: {type(duration_data)})")
                
                if isinstance(distance_data, dict):
                    distance_meters = distance_data.get("value", 0)
                elif isinstance(distance_data, (int, float)):
                    distance_meters = int(distance_data)
                
                if isinstance(duration_data, dict):
                    duration_seconds = duration_data.get("value", 0)
                elif isinstance(duration_data, (int, float)):
                    duration_seconds = int(duration_data)
                
                # Sum all legs if multiple exist
                for idx, additional_leg in enumerate(legs[1:], 1):
                    logger.info(f"🦵 Processing additional leg #{idx}")
                    
                    add_distance = additional_leg.get("distance", 0)
                    add_duration = additional_leg.get("duration", 0)
                    
                    if isinstance(add_distance, dict):
                        distance_meters += add_distance.get("value", 0)
                    elif isinstance(add_distance, (int, float)):
                        distance_meters += int(add_distance)
                        
                    if isinstance(add_duration, dict):
                        duration_seconds += add_duration.get("value", 0)
                    elif isinstance(add_duration, (int, float)):
                        duration_seconds += int(add_duration)
                
                logger.info(f"✅ SUCCESSFUL ROUTE FOUND!")
                logger.info(f"📊 Final stats: {distance_meters}m, {duration_seconds}s, {len(polyline_coords)} points")
                
                return {
                    "polyline": polyline_coords,
                    "distance_meters": int(distance_meters),
                    "duration_seconds": int(duration_seconds),
                    "is_fallback": False
                }
                
            except httpx.HTTPStatusError as e:
                logger.error(f"❌ HTTP Error for config #{i}: {e.response.status_code} - {e.response.text}")
                continue
                
            except httpx.TimeoutException:
                logger.error(f"⏰ Timeout for config #{i}")
                continue
                
            except Exception as e:
                logger.error(f"💥 Unexpected error for config #{i}: {e}")
                continue
    
    logger.error("❌ ALL PARAMETER CONFIGURATIONS FAILED")
    return None