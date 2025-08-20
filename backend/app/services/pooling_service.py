# backend/app/services/pooling_service.py

from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List

# --- Local Imports ---
from app.models import user_model, pooling_model
from app.schemas import pooling_schema
from app.core.config import settings
from app.core.ws_manager import manager # <-- Import the WebSocket manager

# --- External Libraries ---
import httpx

# --- Constants for matching logic ---
# Increased radius for easier testing, as requested.
START_LOCATION_RADIUS_METERS = 5000  # 5km
DESTINATION_RADIUS_METERS = 5000 # 5km
ACTIVE_TIMEOUT_MINUTES = 15
OLA_DISTANCE_MATRIX_BASIC_API_URL = "https://api.olamaps.io/routing/v1/distanceMatrix/basic"


async def _get_distances_from_ola(origin: tuple, destinations: List[tuple]) -> List[float | None]:
    """
    Helper function to call the OLA Distance Matrix Basic API.
    (This function is unchanged and confirmed working).
    """
    if not destinations:
        return []

    origin_str = f"{origin[0]},{origin[1]}"
    destinations_str = "|".join([f"{dest[0]},{dest[1]}" for dest in destinations])

    params = {
        "origins": origin_str,
        "destinations": destinations_str,
        "api_key": settings.OLA_MAPS_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(OLA_DISTANCE_MATRIX_BASIC_API_URL, params=params)
            response.raise_for_status()
            results = response.json()
            if "distances" in results:
                return [dist for dist in results["distances"]]
        except httpx.HTTPStatusError as e:
            print(f"OLA Maps API Error: {e.response.status_code} - {e.response.text}")
            try:
                print("OLA Error Details:", e.response.json())
            except: pass
    
    return [None] * len(destinations)


def create_or_update_pooling_request(
    db: Session, user: user_model.User, request_data: pooling_schema.PoolingRequestCreate
) -> pooling_model.PoolingRequest:
    """
    Creates a new pooling request, cancelling any previous active ones.
    (This function is unchanged and confirmed working).
    """
    db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.user_id == user.id,
        pooling_model.PoolingRequest.status == pooling_model.PoolingRequestStatus.ACTIVE
    ).update({"status": pooling_model.PoolingRequestStatus.CANCELLED})

    new_request = pooling_model.PoolingRequest(
        user_id=user.id,
        start_latitude=request_data.start_latitude,
        start_longitude=request_data.start_longitude,
        destination_latitude=request_data.destination_latitude,
        destination_longitude=request_data.destination_longitude,
        destination_name=request_data.destination_name
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request



async def find_matches(db: Session, new_request: pooling_model.PoolingRequest) -> List[user_model.User]:
    """
    Finds matches, updates statuses, and notifies all parties via WebSocket.
    """
    print(f"\n--- Starting Match Search for Request ID: {new_request.id} (User: {new_request.user.id}) ---")
    time_threshold = datetime.utcnow() - timedelta(minutes=ACTIVE_TIMEOUT_MINUTES)
    
    potential_matches_from_db = db.query(pooling_model.PoolingRequest).options(
        joinedload(pooling_model.PoolingRequest.user)
    ).filter(
        pooling_model.PoolingRequest.status == pooling_model.PoolingRequestStatus.ACTIVE,
        pooling_model.PoolingRequest.id != new_request.id,
        pooling_model.PoolingRequest.user.has(user_model.User.college_id == new_request.user.college_id),
        pooling_model.PoolingRequest.created_at >= time_threshold
    ).all()

    print(f"Found {len(potential_matches_from_db)} potential candidates in DB from the same college.")
    if not potential_matches_from_db:
        return []

    # Filter by START location proximity
    origin_start = (new_request.start_latitude, new_request.start_longitude)
    destination_starts = [(req.start_latitude, req.start_longitude) for req in potential_matches_from_db]
    start_distances = await _get_distances_from_ola(origin_start, destination_starts)
    
    close_by_start_requests = []
    for i, req in enumerate(potential_matches_from_db):
        distance = start_distances[i]
        if distance is not None and distance <= START_LOCATION_RADIUS_METERS:
            close_by_start_requests.append(req)

    print(f"{len(close_by_start_requests)} candidates passed START location check.")
    if not close_by_start_requests:
        return []

    # Filter by DESTINATION location proximity
    origin_dest = (new_request.destination_latitude, new_request.destination_longitude)
    destination_dests = [(req.destination_latitude, req.destination_longitude) for req in close_by_start_requests]
    dest_distances = await _get_distances_from_ola(origin_dest, destination_dests)
    matched_users_for_http_response = []
    
    for i, matched_request in enumerate(close_by_start_requests):
        distance = dest_distances[i]
        if distance is not None and distance <= DESTINATION_RADIUS_METERS:
            print(f"VALID MATCH FOUND: Request {new_request.id} <--> Request {matched_request.id}")

            # 1. Add the objects to the session to track changes
            db.add(matched_request)
            db.add(new_request)

            # 2. Update statuses
            matched_request.status = pooling_model.PoolingRequestStatus.MATCHED
            new_request.status = pooling_model.PoolingRequestStatus.MATCHED
            
            # 3. Commit the transaction to the database
            db.commit()
            
            # 4. Prepare and send WebSocket notification
            message_for_waiting_user = {
                "type": "match_found",
                "match": pooling_schema.MatchedUser.from_orm(new_request.user).model_dump()
            }
            await manager.send_personal_message(message_for_waiting_user, matched_request.user.id)

            # 5. Prepare HTTP response
            matched_users_for_http_response.append(matched_request.user)
            
            break 
    
    print(f"--- Search Complete. Returning {len(matched_users_for_http_response)} matches. ---")
    return matched_users_for_http_response