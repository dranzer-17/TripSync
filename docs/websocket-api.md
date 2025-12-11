# Real-time Communication (WebSockets)

The TripSync backend incorporates WebSocket functionality to enable real-time, bidirectional communication between the server and connected clients. This is primarily used for features requiring instant updates, such as ride-pooling status changes or notifications.

## `ConnectionManager` (`app/core/ws_manager.py`)

The `ConnectionManager` class handles the lifecycle of WebSocket connections, managing active connections for individual users.

```python
# backend/app/core/ws_manager.py

from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        """Accepts a new WebSocket connection and stores it, associating it with a user_id."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"User {user_id} connected via WebSocket.")

    def disconnect(self, user_id: int):
        """Removes a WebSocket connection for a specific user."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"User {user_id} disconnected from WebSocket.")

    async def send_personal_message(self, message: dict, user_id: int):
        """Sends a JSON message to a specific user's active WebSocket connection."""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)
            print(f"Sent message to user {user_id}: {message}")

manager = ConnectionManager()
```

## How to Use

### Connecting to the WebSocket
Clients (e.g., frontend applications) will connect to a specific WebSocket endpoint provided by the pooling router (e.g., `/api/pool/ws/{user_id}`). The `connect` method of the `ConnectionManager` is called upon a successful connection.

### Disconnecting
When a client disconnects, the `disconnect` method is called to remove their WebSocket from the active connections.

### Sending Messages to Specific Users
To send a real-time update or notification to a particular user, the `send_personal_message` method can be used. It takes a dictionary (which will be JSON-serialized) and the target `user_id`.

#### Example (Backend-side usage):

```python
# Example of sending a message from an API endpoint
from app.core.ws_manager import manager # Import the global manager instance

async def notify_user_of_match(matching_user_id: int, pooling_request_id: int):
    message = {
        "type": "pooling_match",
        "request_id": pooling_request_id,
        "status": "matched",
        "details": "You have been matched for a pooling request!"
    }
    await manager.send_personal_message(message, matching_user_id)
```

This system allows for targeted real-time updates without needing to broadcast to all connected clients.