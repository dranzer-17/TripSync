# Pooling API

The Pooling API facilitates the creation and management of ride-pooling requests, allowing users to find and share rides. It integrates with real-time updates via WebSockets.

## PoolingRequest Status

Requests can transition through different statuses, defined by the `PoolingRequestStatus` enum:

*   `ACTIVE`: The request is open and actively looking for matches.
*   `MATCHED`: The request has been successfully matched with other users.
*   `COMPLETED`: The pooling request has been fulfilled (e.g., ride completed).
*   `CANCELLED`: The request has been cancelled by the user.

## PoolingRequest Model

The `PoolingRequest` data model is defined in `backend/app/models/pooling_model.py` and includes the following fields:

*   `id` (Integer): Primary key for the pooling request.
*   `user_id` (Integer): Foreign key linking to the user who posted the request.
*   `status` (Enum `PoolingRequestStatus`): Current status of the pooling request (default: `ACTIVE`).
*   `start_latitude` (Float): Latitude of the starting location.
*   `start_longitude` (Float): Longitude of the starting location.
*   `destination_latitude` (Float): Latitude of the destination.
*   `destination_longitude` (Float): Longitude of the destination.
*   `destination_name` (String): A human-readable name for the destination.
*   `created_at` (DateTime): Timestamp when the request was created.

## Endpoints

*(Note: Specific endpoints for creating, retrieving, updating, and deleting pooling requests will be documented here once implemented in `app/routes/pooling_router.py`.)*
