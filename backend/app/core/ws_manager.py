# backend/app/core/ws_manager.py

from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # This dictionary will hold the active connections
        # The key will be the user's ID (integer)
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

# Create a single, global instance of the manager that our app can use
manager = ConnectionManager()