# backend/app/routes/map_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import map_schema
from app.services import map_service, auth_service
from app.models import user_model
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/route", response_model=map_schema.RouteResponse)
async def get_route(
    request_data: map_schema.RouteRequest,
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Provides route details (polyline, distance, duration) between two points.
    This endpoint is protected and requires user authentication.
    """
    logger.info(f"Route request from user {current_user.id}: "
                f"({request_data.start_lat}, {request_data.start_lng}) -> "
                f"({request_data.end_lat}, {request_data.end_lng})")
    
    # Validate coordinates before calling the service
    if not (-90 <= request_data.start_lat <= 90) or not (-180 <= request_data.start_lng <= 180):
        logger.error(f"Invalid start coordinates: {request_data.start_lat}, {request_data.start_lng}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid start coordinates: latitude must be between -90 and 90, longitude must be between -180 and 180",
        )
    
    if not (-90 <= request_data.end_lat <= 90) or not (-180 <= request_data.end_lng <= 180):
        logger.error(f"Invalid end coordinates: {request_data.end_lat}, {request_data.end_lng}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid end coordinates: latitude must be between -90 and 90, longitude must be between -180 and 180",
        )
    
    try:
        route_details = await map_service.get_route_from_ola(
            start_lat=request_data.start_lat,
            start_lng=request_data.start_lng,
            end_lat=request_data.end_lat,
            end_lng=request_data.end_lng,
        )

        if not route_details:
            logger.error("Route service returned None - no route found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No route could be found between the specified locations. Please verify that both locations are accessible by road and try again with different locations.",
            )

        logger.info(f"Route found successfully: {route_details['distance_meters']}m, {route_details['duration_seconds']}s")
        
        return map_schema.RouteResponse(
            status="success",
            route=map_schema.RouteDetails(**route_details)
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in route endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while calculating the route. Please try again later.",
        )

# Debug endpoint for testing OLA Maps API directly
@router.get("/debug/ola-test")
async def test_ola_api(
    start_lat: float,
    start_lng: float, 
    end_lat: float,
    end_lng: float,
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """Debug endpoint to test Ola Maps API directly"""
    import httpx
    from app.core.config import settings
    
    origin_str = f"{start_lat},{start_lng}"
    destination_str = f"{end_lat},{end_lng}"
    
    params = {
        "origin": origin_str,
        "destination": destination_str,
        "api_key": settings.OLA_MAPS_API_KEY,
        "mode": "driving",
        "alternatives": "false",
        "steps": "false", 
        "geometries": "polyline",
        "overview": "full"
    }
    
    # Configure proxy if available
    proxy_config = settings.OLA_MAPS_PROXY if hasattr(settings, 'OLA_MAPS_PROXY') and settings.OLA_MAPS_PROXY else None
    
    client_config = {
        "timeout": 30.0,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Referer": "https://olamaps.io/"
        },
        "verify": False
    }
    
    if proxy_config:
        client_config["proxies"] = {"https://": proxy_config, "http://": proxy_config}
    
    async with httpx.AsyncClient(**client_config) as client:
        try:
            response = await client.get(
                "https://api.olamaps.io/routing/v1/directions",
                params=params
            )
            
            # Check if response is a carrier filter block page
            if "Web Filter Violation" in response.text or "Access Blocked" in response.text:
                return {
                    "error": "Carrier filter is blocking api.olamaps.io. Please use a VPN or contact your carrier.",
                    "status_code": 403,
                    "params_sent": params
                }
            
            return {
                "status_code": response.status_code,
                "request_url": str(response.url),
                "response_json": response.json() if response.status_code == 200 else None,
                "response_text": response.text[:2000] if response.status_code != 200 else "Success",
                "headers": dict(response.headers)
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "params_sent": params
            }