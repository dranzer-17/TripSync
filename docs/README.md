# TripSync Backend API

Welcome to the TripSync Backend API documentation. This API powers the TripSync mobile application, facilitating features such as user management, ride-pooling, service exchange, and real-time communication.

## Technology Stack

The backend is built using the following technologies:

*   **Python**: The core programming language.
*   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **SQLAlchemy**: A powerful and flexible Object Relational Mapper (ORM) for interacting with SQL databases.
*   **PostgreSQL**: The relational database used for data storage.
*   **Pydantic**: Used for data validation and settings management.
*   **WebSockets**: For real-time communication features.

## Architecture Overview

The backend follows a modular architecture, organized into distinct components:

*   **`core/`**: Contains core configurations (e.g., environment settings, JWT settings) and utilities (e.g., WebSocket manager).
*   **`db/`**: Handles database connection, session management, and SQLAlchemy base definition.
*   **`models/`**: Defines the SQLAlchemy ORMs for all database entities (User, Profile, PoolingRequest, ServicePost, etc.).
*   **`routes/`**: Implements the API endpoints for specific functionalities (authentication, pooling, profiles, services, health, maps).
*   **`router.py`**: The main API router that aggregates all feature-specific routers under the `/api` prefix.
*   **`main.py`**: The entry point for the FastAPI application, handling startup/shutdown events, CORS configuration, and router inclusion.

## Getting Started

To get started with the TripSync backend, please refer to the [Setup Guide](setup.md) for detailed instructions on environment configuration, database setup, and running the application.
