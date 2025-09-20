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
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                "https://api.olamaps.io/routing/v1/directions",
                params=params
            )
            
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