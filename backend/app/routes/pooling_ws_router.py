# backend/app/routes/pooling_ws_router.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json

from app.core.ws_manager import manager
from app.services import auth_service
from app.models import user_model, message_model
from app.db.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.websocket("/ws/pool")
async def websocket_endpoint(
    websocket: WebSocket,
    # We protect the WebSocket just like an HTTP endpoint.
    # The token will be sent as a subprotocol from the client.
    current_user: user_model.User = Depends(auth_service.get_current_user_from_token)
):
    """
    Handles the WebSocket connection for a user waiting for a pool match.
    
    The frontend must connect to this endpoint with a 'token' subprotocol
    containing the valid JWT.
    e.g., new WebSocket("ws://...", ["token", "your_jwt_here"])
    """
    if not current_user:
        # If the token is invalid, close the connection.
        await websocket.close(code=1008)
        return

    # If the token is valid, accept the connection and add it to the manager.
    await manager.connect(current_user.id, websocket)
    
    try:
        # This loop will keep the connection alive.
        # It waits for messages from the client (we can handle chat messages here).
        while True:
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")
                
                if message_type == "chat_message":
                    # Handle chat message
                    connection_id = message_data.get("connection_id")
                    content = message_data.get("content")
                    receiver_id = message_data.get("receiver_id")
                    
                    if connection_id and content and receiver_id:
                        # Store message in database (we'll use dependency injection)
                        # For now, just forward the message to the receiver
                        chat_message = {
                            "type": "chat_message",
                            "sender_id": current_user.id,
                            "sender_name": current_user.full_name,
                            "content": content,
                            "connection_id": connection_id,
                            "created_at": message_data.get("created_at")
                        }
                        await manager.send_personal_message(chat_message, receiver_id)
                        print(f"Chat message from {current_user.id} to {receiver_id}: {content}")
                
            except json.JSONDecodeError:
                print(f"Invalid JSON from user {current_user.id}: {data}")

    except WebSocketDisconnect:
        # This block is executed when the client disconnects.
        manager.disconnect(current_user.id)