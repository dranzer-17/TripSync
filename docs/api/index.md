# TripSync API Documentation

This section provides detailed documentation for all API endpoints exposed by the TripSync backend. The API is built with FastAPI, providing automatic interactive API documentation via Swagger UI (at `/docs`) and ReDoc (at `/redoc`) when the application is running.

## Base URL

The base URL for all API endpoints is typically `http://localhost:8000/api` during development.

## API Sections

*   [Authentication](authentication.md): Endpoints for user registration, login, token refresh, and password management (future).
*   [User Profiles](profile.md): Managing user profiles, including personal details, preferences, and social links.
*   [Pooling](pooling.md): Endpoints for creating, finding, and managing ride-pooling requests.
*   [Pooling WebSocket](websockets.md): Real-time communication for pooling updates.
*   [Services](services.md): Endpoints for posting and applying for various services.
*   [Maps](map.md): Endpoints for map-related functionalities, potentially route calculation or location lookups.
*   [Health Check](health.md): Basic health check endpoint to verify API availability.
