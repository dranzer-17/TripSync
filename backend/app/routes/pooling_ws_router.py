# backend/app/routes/pooling_ws_router.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends

from app.core.ws_manager import manager
from app.services import auth_service
from app.models import user_model

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
        # It waits for messages from the client (we aren't using this part yet).
        while True:
            data = await websocket.receive_text()
            # We can add logic here later, e.g., for chat or live location updates.
            print(f"Received message from user {current_user.id}: {data}")

    except WebSocketDisconnect:
        # This block is executed when the client disconnects.
        manager.disconnect(current_user.id)