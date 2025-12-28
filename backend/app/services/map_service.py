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

def _is_filter_blocked(response_text: str) -> bool:
    """Check if response is a carrier filter block page"""
    filter_indicators = [
        "Web Filter Violation",
        "Access Blocked",
        "Web Page Blocked",
        "Internet usage policy",
        "Category",
        "Unrated"
    ]
    response_lower = response_text.lower()
    return any(indicator.lower() in response_lower for indicator in filter_indicators)


async def get_route_from_ola(
    start_lat: float, start_lng: float, end_lat: float, end_lng: float
) -> Optional[Dict[str, Any]]:
    """
    Enhanced debug version of OLA Directions API call with extensive logging.
    Now includes carrier filter detection and bypass attempts.
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
    
    # Headers to try (some might bypass filters)
    header_configs = [
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://olamaps.io/",
            "Origin": "https://olamaps.io"
        },
        {
            "User-Agent": "OlaMapsSDK/1.0",
            "Accept": "application/json"
        },
        {
            "User-Agent": "python-httpx/0.25.0",
            "Accept": "*/*"
        }
    ]
    
    logger.info(f"🗺️  Requesting route from OLA: {origin_str} -> {destination_str}")
    
    # Configure proxy if available
    proxy_config = settings.OLA_MAPS_PROXY if hasattr(settings, 'OLA_MAPS_PROXY') and settings.OLA_MAPS_PROXY else None
    
    for i, params in enumerate(param_configs, 1):
        logger.info(f"🔧 Trying parameter configuration #{i}: {json.dumps(params, indent=2)}")
        
        # Try each header configuration
        for header_idx, headers in enumerate(header_configs, 1):
            logger.info(f"📋 Trying header configuration #{header_idx}")
            
            client_config = {
                "timeout": 20.0,
                "headers": headers,
                "verify": False  # Disable SSL verification to avoid certificate issues
            }
            
            # Add proxy if configured
            if proxy_config:
                client_config["proxies"] = {"https://": proxy_config, "http://": proxy_config}
                logger.info(f"🔀 Using proxy: {proxy_config}")
            
            async with httpx.AsyncClient(**client_config) as client:
                try:
                    response = await client.get(OLA_DIRECTIONS_API_URL, params=params)
                    
                    logger.info(f"📡 HTTP Status: {response.status_code}")
                    logger.info(f"🔗 Request URL: {response.url}")
                    logger.info(f"📄 Response Headers: {dict(response.headers)}")
                    
                    # Check if response is a carrier filter block page
                    response_text = response.text
                    if _is_filter_blocked(response_text):
                        logger.error(f"🚫 CARRIER FILTER BLOCKED: Response is a web filter violation page")
                        logger.error(f"📄 Filter response preview: {response_text[:500]}")
                        # Try next header configuration
                        continue
                    
                    if response.status_code != 200:
                        logger.error(f"❌ HTTP Error {response.status_code}: {response.text[:500]}")
                        # If it's a 403, it might be the filter - check content
                        if response.status_code == 403 and _is_filter_blocked(response_text):
                            logger.error(f"🚫 403 is likely carrier filter block")
                            continue
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
                    logger.error(f"❌ HTTP Error for config #{i}, header #{header_idx}: {e.response.status_code} - {e.response.text[:500]}")
                    continue
                    
                except httpx.TimeoutException:
                    logger.error(f"⏰ Timeout for config #{i}, header #{header_idx}")
                    continue
                    
                except Exception as e:
                    logger.error(f"💥 Unexpected error for config #{i}, header #{header_idx}: {e}")
                    continue
    
    logger.error("❌ ALL PARAMETER CONFIGURATIONS FAILED")
    return None