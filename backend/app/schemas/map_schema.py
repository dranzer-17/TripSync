# backend/app/schemas/map_schema.py

from pydantic import BaseModel
from typing import List, Tuple

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float

class RouteDetails(BaseModel):
    # A list of [lng, lat] coordinates for drawing on the map
    polyline: List[Tuple[float, float]]
    distance_meters: int
    duration_seconds: int
    # Removed is_fallback since we're not using fallbacks anymore

class RouteResponse(BaseModel):
    status: str
    route: RouteDetails | None = None