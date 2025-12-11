# TripSync Backend Database Schema

This document outlines the database tables, their columns, and relationships as defined by the SQLAlchemy ORM models in the `app/models/` directory.

## 1. `users` Table (from `user_model.py`)

Stores core user information.

| Column Name       | Type              | Constraints                                 | Description                                     |
| :---------------- | :---------------- | :------------------------------------------ | :---------------------------------------------- |
| `id`              | `Integer`         | Primary Key, Indexed                        | Unique identifier for the user                  |
| `email`           | `String`          | Unique, Indexed, Not Null                   | User's email address                            |
| `hashed_password` | `String`          | Not Null                                    | Hashed password of the user                     |
| `full_name`       | `String`          | Indexed                                     | Full name of the user                           |
| `college_id`      | `Integer`         | Foreign Key (`colleges.id`)                 | ID of the college the user belongs to           |
| `created_at`      | `DateTime`        | Default: `datetime.utcnow`                  | Timestamp when the user account was created     |

**Relationships:**
*   `college`: Many-to-one relationship with `College`.
*   `profile`: One-to-one relationship with `Profile` (back-populates `user`, `uselist=False`, cascade: `all, delete-orphan`).

## 2. `colleges` Table (from `user_model.py`)

Stores information about colleges.

| Column Name | Type      | Constraints     | Description                    |
| :---------- | :-------- | :-------------- | :----------------------------- |
| `id`        | `Integer` | Primary Key, Indexed | Unique identifier for the college |
| `name`      | `String`  | Unique, Indexed, Not Null | Name of the college            |

**Relationships:**
*   `users`: One-to-many relationship with `User` (back-populates `college`).

## 3. `profiles` Table (from `profile_model.py`)

Stores extended user profile information.

| Column Name          | Type        | Constraints                               | Description                                         |
| :------------------- | :---------- | :---------------------------------------- | :-------------------------------------------------- |
| `id`                 | `Integer`   | Primary Key, Indexed                      | Unique identifier for the profile                   |
| `user_id`            | `Integer`   | Foreign Key (`users.id`), Unique, Not Null | ID of the user this profile belongs to              |
| `username`           | `String`    | Unique, Indexed                           | User's chosen username                              |
| `phone_number`       | `String`    | Nullable                                  | User's phone number                                 |
| `bio`                | `Text`      | Nullable                                  | Short biography or description of the user          |
| `year_of_study`      | `String`    | Nullable                                  | User's year of study (e.g., 'First Year', 'Grad')   |
| `reviews`            | `JSONB`     | Nullable                                  | JSON object for aggregated reviews/ratings          |
| `preferences`        | `JSONB`     | Nullable                                  | JSON object for user preferences                    |
| `social_media_links` | `JSONB`     | Nullable                                  | JSON object for social media profiles (e.g., LinkedIn, Twitter) |
| `emergency_contact`  | `JSONB`     | Nullable                                  | JSON object for emergency contact details           |

**Relationships:**
*   `user`: One-to-one relationship with `User` (back-populates `profile`).

## 4. `pooling_requests` Table (from `pooling_model.py`)

Manages real-time pooling requests for rides.

| Column Name           | Type                      | Constraints                                  | Description                                     |
| :-------------------- | :------------------------ | :------------------------------------------- | :---------------------------------------------- |
| `id`                  | `Integer`                 | Primary Key, Indexed                         | Unique identifier for the pooling request       |
| `user_id`             | `Integer`                 | Foreign Key (`users.id`), Not Null           | ID of the user who made the request             |
| `status`              | `Enum` (`PoolingRequestStatus`) | Default: `"active"`, Not Null               | Current status of the pooling request (active, matched, completed, cancelled) |
| `start_latitude`      | `Float`                   | Not Null                                     | Latitude of the starting location               |
| `start_longitude`     | `Float`                   | Not Null                                     | Longitude of the starting location              |
| `destination_latitude`| `Float`                   | Not Null                                     | Latitude of the destination location            |
| `destination_longitude`| `Float`                   | Not Null                                     | Longitude of the destination location           |
| `destination_name`    | `String`                  | Nullable                                     | Name of the destination (e.g., 'Campus Library')|
| `created_at`          | `DateTime`                | Default: `datetime.utcnow`, Not Null         | Timestamp when the request was created          |

**Relationships:**
*   `user`: Many-to-one relationship with `User`.

**Enum `PoolingRequestStatus` values:** `"active"`, `"matched"`, `"completed"`, `"cancelled"`

## 5. `service_posts` Table (from `service_model.py`)

Stores details about service requests or offers.

| Column Name   | Type                      | Constraints                                     | Description                                     |
| :------------ | :------------------------ | :---------------------------------------------- | :---------------------------------------------- |
| `id`          | `Integer`                 | Primary Key, Indexed                            | Unique identifier for the service post          |
| `poster_user_id` | `Integer`                 | Foreign Key (`users.id`), Not Null              | ID of the user who created the service post     |
| `title`       | `String(100)`             | Not Null                                        | Title of the service post                       |
| `description` | `Text`                    | Not Null                                        | Detailed description of the service             |
| `status`      | `Enum` (`ServiceStatus`) | Default: `"open"`, Not Null                    | Current status of the service post (open, in_progress, completed, cancelled) |
| `is_paid`     | `Boolean`                 | Default: `false`, Not Null                      | Indicates if the service is a paid service      |
| `price`       | `Float`                   | Nullable                                        | Price of the service (if `is_paid` is true)     |
| `created_at`  | `DateTime`                | Default: `datetime.utcnow`, Not Null            | Timestamp when the post was created             |
| `updated_at`  | `DateTime`                | Default: `datetime.utcnow`, On Update `datetime.utcnow`, Not Null | Timestamp of the last update to the post        |

**Relationships:**
*   `poster`: Many-to-one relationship with `User`.
*   `requirements`: One-to-many relationship with `ServiceRequirement` (back-populates `service_post`, cascade: `all, delete-orphan`).
*   `filters`: One-to-many relationship with `ServiceFilter` (back-populates `service_post`, cascade: `all, delete-orphan`).

**Enum `ServiceStatus` values:** `"open"`, `"in_progress"`, `"completed"`, `"cancelled"`

## 6. `service_requirements` Table (from `service_model.py`)

Lists specific requirements for a service post.

| Column Name     | Type      | Constraints                             | Description                                 |
| :-------------- | :-------- | :-------------------------------------- | :------------------------------------------ |
| `id`            | `Integer` | Primary Key, Indexed                    | Unique identifier for the requirement       |
| `service_post_id` | `Integer` | Foreign Key (`service_posts.id`), Not Null | ID of the service post this requirement belongs to |
| `requirement`   | `String(255)` | Not Null                                | Description of the specific requirement     |

**Relationships:**
*   `service_post`: Many-to-one relationship with `ServicePost` (back-populates `requirements`).

## 7. `service_filters` Table (from `service_model.py`)

Applies filters or criteria to a service post.

| Column Name     | Type      | Constraints                             | Description                                 |
| :-------------- | :-------- | :-------------------------------------- | :------------------------------------------ |
| `id`            | `Integer` | Primary Key, Indexed                    | Unique identifier for the filter            |
| `service_post_id` | `Integer` | Foreign Key (`service_posts.id`), Not Null | ID of the service post this filter belongs to |
| `filter_type`   | `String(50)` | Not Null                               | Category or type of the filter (e.g., 'location', 'time') |
| `filter_value`  | `String(255)` | Not Null                               | The value or criteria for the filter        |

**Relationships:**
*   `service_post`: Many-to-one relationship with `ServicePost` (back-populates `filters`).