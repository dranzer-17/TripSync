# backend/app/services/pooling_service.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import HTTPException

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
MAX_PENDING_CONNECTIONS = 5
OLA_DISTANCE_MATRIX_BASIC_API_URL = "https://api.olamaps.io/routing/v1/distanceMatrix/basic"

async def _get_distances_from_ola(origin: tuple, destinations: List[tuple]) -> List[float | None]:
    """
    Helper function to call the OLA Distance Matrix Basic API,
    with the CORRECT response parsing logic based on the official documentation.
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

    # Configure proxy if available
    proxy_config = settings.OLA_MAPS_PROXY if hasattr(settings, 'OLA_MAPS_PROXY') and settings.OLA_MAPS_PROXY else None
    
    client_config = {
        "timeout": 20.0,
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
            response = await client.get(OLA_DISTANCE_MATRIX_BASIC_API_URL, params=params)
            
            # Check if response is a carrier filter block page
            response_text = response.text
            if "Web Filter Violation" in response_text or "Access Blocked" in response_text:
                print(f"OLA Maps API Error: Carrier filter blocked the request")
                return [None] * len(destinations)
            
            response.raise_for_status()
            results = response.json()
            
            # --- THIS IS THE CRITICAL FIX ---
            # We now parse the correct nested structure: rows -> elements -> distance
            if results.get("status") == "SUCCESS" and results.get("rows"):
                elements = results["rows"][0].get("elements", [])
                # Extract the 'distance' from each element. If an element or distance is missing, use None.
                distances = [
                    element.get("distance") if element and element.get("status") == "OK" else None
                    for element in elements
                ]
                return distances
            # --------------------------------

        except httpx.HTTPStatusError as e:
            print(f"OLA Maps API Error: {e.response.status_code} - {e.response.text}")
    
    return [None] * len(destinations) # Return None on failure



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

            # Update both requests to MATCHED status (not CONNECTED yet - that happens on approval)
            db.add(matched_request)
            db.add(new_request)
            matched_request.status = pooling_model.PoolingRequestStatus.MATCHED
            new_request.status = pooling_model.PoolingRequestStatus.MATCHED
            db.commit()
            
            # Prepare and send WebSocket notification with enriched user data
            matched_user_data = pooling_schema.MatchedUser(
                id=new_request.user.id,
                full_name=new_request.user.full_name,
                phone_number=None,  # Hide until connected
                email=None,  # Hide until connected
                year_of_study=None,  # Hide until connected
                bio=None,  # Hide until connected
                profile_image_url=None,
                request_id=new_request.id,
                connection_status='none',
                connection_id=None
            )
            
            message_for_waiting_user = {
                "type": "match_found",
                "match": matched_user_data.model_dump()
            }
            await manager.send_personal_message(message_for_waiting_user, matched_request.user.id)

            # Prepare HTTP response - return the matched REQUEST (not just user)
            matched_users_for_http_response.append(matched_request)
            
            # Don't break - allow multiple matches
    
    print(f"--- Search Complete. Returning {len(matched_users_for_http_response)} matches. ---")
    return matched_users_for_http_response


# ==================== CONNECTION MANAGEMENT ====================

async def send_connection_request(
    db: Session, 
    sender_request_id: int, 
    receiver_request_id: int,
    sender_user: user_model.User
) -> pooling_model.PoolingConnection:
    """
    Sends a connection request from one pooling request to another.
    Enforces max pending connections limit.
    """
    # Validate requests exist and are in MATCHED status
    sender_request = db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.id == sender_request_id
    ).first()
    
    receiver_request = db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.id == receiver_request_id
    ).first()
    
    if not sender_request or not receiver_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if sender_request.user_id != sender_user.id:
        raise HTTPException(status_code=403, detail="Not your request")
    
    if sender_request.status not in [pooling_model.PoolingRequestStatus.MATCHED, pooling_model.PoolingRequestStatus.ACTIVE]:
        raise HTTPException(status_code=400, detail="Request is not active or matched")
    
    # Check if connection already exists
    existing_connection = db.query(pooling_model.PoolingConnection).filter(
        or_(
            and_(
                pooling_model.PoolingConnection.sender_request_id == sender_request_id,
                pooling_model.PoolingConnection.receiver_request_id == receiver_request_id
            ),
            and_(
                pooling_model.PoolingConnection.sender_request_id == receiver_request_id,
                pooling_model.PoolingConnection.receiver_request_id == sender_request_id
            )
        )
    ).first()
    
    if existing_connection:
        if existing_connection.status == pooling_model.PoolingConnectionStatus.PENDING:
            raise HTTPException(status_code=400, detail="Connection request already exists")
        elif existing_connection.status == pooling_model.PoolingConnectionStatus.APPROVED:
            raise HTTPException(status_code=400, detail="Already connected")
        # If rejected, allow sending again
    
    # Check pending connections limit for sender
    pending_count = db.query(func.count(pooling_model.PoolingConnection.id)).filter(
        pooling_model.PoolingConnection.sender_request_id == sender_request_id,
        pooling_model.PoolingConnection.status == pooling_model.PoolingConnectionStatus.PENDING
    ).scalar()
    
    if pending_count >= MAX_PENDING_CONNECTIONS:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_PENDING_CONNECTIONS} pending connections reached")
    
    # Create connection
    connection = pooling_model.PoolingConnection(
        sender_request_id=sender_request_id,
        receiver_request_id=receiver_request_id,
        status=pooling_model.PoolingConnectionStatus.PENDING
    )
    
    db.add(connection)
    db.commit()
    db.refresh(connection)
    
    # Send WebSocket notification to receiver
    receiver_user = receiver_request.user
    receiver_message = {
        "type": "connection_request_received",
        "connection_id": connection.id,
        "from_user": {
            "id": sender_user.id,
            "full_name": sender_user.full_name,
            "request_id": sender_request_id
        }
    }
    await manager.send_personal_message(receiver_message, receiver_user.id)
    
    # Send WebSocket notification to sender (to update their UI)
    sender_message = {
        "type": "connection_request_sent",
        "connection_id": connection.id,
        "to_user": {
            "id": receiver_user.id,
            "full_name": receiver_user.full_name,
            "request_id": receiver_request_id
        }
    }
    await manager.send_personal_message(sender_message, sender_user.id)
    
    return connection


async def respond_to_connection(
    db: Session,
    connection_id: int,
    action: str,
    responder_user: user_model.User
) -> pooling_model.PoolingConnection:
    """
    Approve or reject a connection request.
    If approved, updates both requests to CONNECTED status.
    """
    connection = db.query(pooling_model.PoolingConnection).options(
        joinedload(pooling_model.PoolingConnection.sender_request).joinedload(pooling_model.PoolingRequest.user),
        joinedload(pooling_model.PoolingConnection.receiver_request).joinedload(pooling_model.PoolingRequest.user)
    ).filter(
        pooling_model.PoolingConnection.id == connection_id
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if connection.receiver_request.user_id != responder_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to respond")
    
    if connection.status != pooling_model.PoolingConnectionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Connection already responded to")
    
    # Update connection status
    if action == "approve":
        connection.status = pooling_model.PoolingConnectionStatus.APPROVED
        connection.responded_at = datetime.utcnow()
        
        # Update both requests to CONNECTED
        connection.sender_request.status = pooling_model.PoolingRequestStatus.CONNECTED
        connection.receiver_request.status = pooling_model.PoolingRequestStatus.CONNECTED
        
        sender_user = connection.sender_request.user
        
        # Notify sender via WebSocket
        sender_message = {
            "type": "connection_approved",
            "connection_id": connection.id,
            "user_request_id": connection.sender_request_id,
            "partner": {
                "id": responder_user.id,
                "full_name": responder_user.full_name,
                "phone_number": responder_user.profile.phone_number if responder_user.profile else None,
                "email": responder_user.email,
                "year_of_study": responder_user.profile.year_of_study if responder_user.profile else None,
                "bio": responder_user.profile.bio if responder_user.profile else None,
                "request_id": connection.receiver_request_id
            }
        }
        await manager.send_personal_message(sender_message, sender_user.id)
        
        # Notify receiver (approver) via WebSocket with sender's info
        receiver_message = {
            "type": "connection_approved",
            "connection_id": connection.id,
            "user_request_id": connection.receiver_request_id,
            "partner": {
                "id": sender_user.id,
                "full_name": sender_user.full_name,
                "phone_number": sender_user.profile.phone_number if sender_user.profile else None,
                "email": sender_user.email,
                "year_of_study": sender_user.profile.year_of_study if sender_user.profile else None,
                "bio": sender_user.profile.bio if sender_user.profile else None,
                "request_id": connection.sender_request_id
            }
        }
        await manager.send_personal_message(receiver_message, responder_user.id)
        
    elif action == "reject":
        connection.status = pooling_model.PoolingConnectionStatus.REJECTED
        connection.responded_at = datetime.utcnow()
        
        # Notify sender via WebSocket
        message = {
            "type": "connection_rejected",
            "connection_id": connection.id,
            "by_user": {
                "id": responder_user.id,
                "full_name": responder_user.full_name
            }
        }
        await manager.send_personal_message(message, connection.sender_request.user_id)
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
    db.commit()
    db.refresh(connection)
    
    return connection


def get_active_connection(db: Session, user_id: int) -> Optional[pooling_model.PoolingConnection]:
    """
    Gets the active (approved) connection for a user.
    Excludes cancelled connections and cancelled requests.
    """
    user_request = db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.user_id == user_id,
        pooling_model.PoolingRequest.status == pooling_model.PoolingRequestStatus.CONNECTED
    ).first()
    
    if not user_request:
        return None
    
    connection = db.query(pooling_model.PoolingConnection).options(
        joinedload(pooling_model.PoolingConnection.sender_request).joinedload(pooling_model.PoolingRequest.user).joinedload(user_model.User.profile),
        joinedload(pooling_model.PoolingConnection.receiver_request).joinedload(pooling_model.PoolingRequest.user).joinedload(user_model.User.profile)
    ).filter(
        pooling_model.PoolingConnection.status == pooling_model.PoolingConnectionStatus.APPROVED,
        or_(
            pooling_model.PoolingConnection.sender_request_id == user_request.id,
            pooling_model.PoolingConnection.receiver_request_id == user_request.id
        )
    ).first()
    
    return connection


async def cancel_pooling_request(db: Session, request_id: int, user: user_model.User):
    """
    Cancels a pooling request and notifies connected partners.
    """
    request = db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.id == request_id,
        pooling_model.PoolingRequest.user_id == user.id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # If connected, notify the partner and close the connection
    if request.status == pooling_model.PoolingRequestStatus.CONNECTED:
        connection = db.query(pooling_model.PoolingConnection).filter(
            pooling_model.PoolingConnection.status == pooling_model.PoolingConnectionStatus.APPROVED,
            or_(
                pooling_model.PoolingConnection.sender_request_id == request_id,
                pooling_model.PoolingConnection.receiver_request_id == request_id
            )
        ).first()
        
        if connection:
            # Find partner
            partner_request = connection.sender_request if connection.receiver_request_id == request_id else connection.receiver_request
            
            # Notify partner
            message = {
                "type": "ride_cancelled",
                "by_user": {
                    "id": user.id,
                    "full_name": user.full_name
                },
                "message": f"{user.full_name} cancelled the ride"
            }
            await manager.send_personal_message(message, partner_request.user_id)
            
            # Reset partner's request status to CANCELLED (request lifecycle)
            partner_request.status = pooling_model.PoolingRequestStatus.CANCELLED
            
            # Close the connection by marking it rejected on both sides
            connection.status = pooling_model.PoolingConnectionStatus.REJECTED
    
    # Cancel all pending connections
    db.query(pooling_model.PoolingConnection).filter(
        or_(
            pooling_model.PoolingConnection.sender_request_id == request_id,
            pooling_model.PoolingConnection.receiver_request_id == request_id
        ),
        pooling_model.PoolingConnection.status == pooling_model.PoolingConnectionStatus.PENDING
    ).update({"status": pooling_model.PoolingConnectionStatus.REJECTED})
    
    # Cancel the request
    request.status = pooling_model.PoolingRequestStatus.CANCELLED
    db.commit()
    
    return {"message": "Request cancelled successfully"}