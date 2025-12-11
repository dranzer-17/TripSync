# Backend WebSocket API

The TripSync backend provides real-time communication capabilities using WebSockets, primarily for features like pooling notifications or live updates. The `ConnectionManager` handles active connections and message delivery.

## `ConnectionManager`

Located in `backend/app/core/ws_manager.py`, the `ConnectionManager` class is responsible for managing active WebSocket connections for users.

```python
# backend/app/core/ws_manager.py
from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        """Accepts a new WebSocket connection and stores it."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"User {user_id} connected via WebSocket.")

    def disconnect(self, user_id: int):
        """Removes a WebSocket connection."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"User {user_id} disconnected from WebSocket.")

    async def send_personal_message(self, message: dict, user_id: int):
        """Sends a JSON message to a specific user."""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)
            print(f"Sent message to user {user_id}: {message}")

manager = ConnectionManager()
```

### Key Methods:

*   `connect(user_id: int, websocket: WebSocket)`: Accepts a new WebSocket connection and associates it with a `user_id`.
*   `disconnect(user_id: int)`: Removes a user's WebSocket connection.
*   `send_personal_message(message: dict, user_id: int)`: Sends a JSON message to a specific connected user.

## WebSocket Endpoint (Conceptual)

Although the specific endpoint (URI) for WebSocket connections is not explicitly defined in the provided `ws_manager.py`, the inclusion of `pooling_ws_router` in `backend/app/router.py` suggests a WebSocket endpoint for pooling-related real-time updates. Typically, this would be exposed via a path like `/ws/pool/{user_id}`.

Clients are expected to establish a WebSocket connection to the designated endpoint, passing their user identifier, to receive real-time updates.