# backend/app/routes/chat_ws_router.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
import json

from app.db.database import get_db
from app.services import auth_service
from app.core.ws_manager import manager
from app.models import user_model

router = APIRouter()

@router.websocket("/ws/chat")
async def chat_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Dedicated WebSocket endpoint for chat messaging.
    Separate from pooling WebSocket to avoid conflicts.
    """
    try:
        # Authenticate user
        current_user = await auth_service.get_current_user_ws(token=token, db=db)
        user_id = current_user.id
        
        # Accept connection and register with manager
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                msg_type = message_data.get("type")
                
                if msg_type == "chat_message":
                    # Forward chat message to receiver
                    receiver_id = message_data.get("receiver_id")
                    if receiver_id:
                        await manager.send_personal_message(
                            {
                                "type": "chat_message",
                                "message_id": message_data.get("message_id"),
                                "connection_id": message_data.get("connection_id"),
                                "sender_id": user_id,
                                "content": message_data.get("content"),
                                "created_at": message_data.get("created_at")
                            },
                            receiver_id
                        )
                elif msg_type == "ping":
                    # Respond to ping to keep connection alive
                    await websocket.send_json({"type": "pong"})
                    
        except WebSocketDisconnect:
            manager.disconnect(user_id)
            
    except Exception as e:
        print(f"Chat WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
