# WebSocket API (Real-time Pooling)

The TripSync API utilizes WebSockets for real-time communication, primarily for updates related to ride-pooling requests. This allows for instant notifications and dynamic matching without continuous polling.

## Connection Manager

The backend uses a `ConnectionManager` (`backend/app/core/ws_manager.py`) to handle active WebSocket connections. Each connected user is associated with their `user_id`, enabling personal message delivery.

### Key Methods:

*   `connect(user_id: int, websocket: WebSocket)`: Accepts a new WebSocket connection for a given `user_id`.
*   `disconnect(user_id: int)`: Removes a connection when a user disconnects.
*   `send_personal_message(message: dict, user_id: int)`: Sends a JSON message to a specific user's active WebSocket connection.

## Establishing a WebSocket Connection

To connect to the pooling WebSocket, clients will typically use a WebSocket URI. The endpoint is defined in `app/routes/pooling_ws_router.py` (once implemented). The connection will likely require a `user_id` as part of the path or query parameters, and may require authentication.

Example (conceptual):

```
ws://localhost:8000/api/ws/pool/{user_id}
```

## Sending and Receiving Messages

Clients are expected to send and receive JSON messages over the WebSocket connection. The structure of these messages will depend on the specific real-time features implemented (e.g., pooling request updates, match notifications).

*(Note: Specific message formats and client-side implementation details will be expanded here once the pooling WebSocket routes are fully defined and tested.)*
