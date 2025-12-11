# Services API

The Services API enables users to post and apply for various services, fostering a collaborative environment for task and skill exchange.

## Compensation Type

Service posts can specify different compensation types, defined by the `CompensationType` enum:

*   `VOLUNTEER`: No monetary compensation, purely volunteer-based.
*   `FIXED_PRICE`: A set, non-negotiable price for the service.
*   `HOURLY_RATE`: Compensation based on an hourly rate.
*   `NEGOTIABLE`: Compensation amount is open for negotiation.

## Application Status

Applications for services can have the following statuses, defined by the `ApplicationStatus` enum:

*   `PENDING`: The application has been submitted and is awaiting review.
*   `ACCEPTED`: The applicant has been selected for the service.
*   `REJECTED`: The application was not successful.

## Service Status

Service posts themselves also have a status, defined by the `ServiceStatus` enum:

*   `OPEN`: The service post is active and accepting applications.
*   `IN_PROGRESS`: The service is currently being performed by an accepted applicant.
*   `COMPLETED`: The service has been successfully finished.
*   `CANCELLED`: The service post or its performance was cancelled.

## Models

The following models are defined in `backend/app/models/service_model.py`:

### `Tag` Model

*   `id` (Integer): Primary key for the tag.
*   `name` (String): Unique name of the tag (e.g., 'tutoring', 'delivery').

### `ServicePost` Model

Represents a service request or offering posted by a user.

*   `id` (Integer): Primary key for the service post.
*   `poster_user_id` (Integer): Foreign key to the user who created the post.
*   `title` (String): Title of the service post.
*   `description` (Text): Detailed description of the service required or offered.
*   `status` (Enum `ServiceStatus`): Current status of the service post (default: `OPEN`).
*   `team_size` (Integer): Number of individuals required for the service (default: 1).
*   `deadline` (DateTime): Optional deadline for the service.
*   `compensation_type` (Enum `CompensationType`): How the service will be compensated.
*   `compensation_amount` (Float): The monetary amount if `FIXED_PRICE` or `HOURLY_RATE`.
*   `requires_resume` (Boolean): Indicates if a resume is required for applications.
*   `requires_cover_letter` (Boolean): Indicates if a cover letter is required for applications.
*   `is_anonymous` (Boolean): If true, the poster's identity is hidden.
*   `created_at` (DateTime): Timestamp when the service post was created.
*   `tags` (Many-to-Many Relationship): Associated tags for the service.

### `ServiceApplication` Model

Represents an application made by a user to a `ServicePost`.

*   `id` (Integer): Primary key for the application.
*   `service_post_id` (Integer): Foreign key to the `ServicePost` being applied for.
*   `applicant_user_id` (Integer): Foreign key to the user who submitted the application.
*   `status` (Enum `ApplicationStatus`): Current status of the application (default: `PENDING`).
*   `cover_letter_text` (Text): Optional cover letter text provided by the applicant.
*   `resume_url` (String): Optional URL to the applicant's resume.
*   `applied_at` (DateTime): Timestamp when the application was submitted.

## Endpoints

*(Note: Specific endpoints for creating/retrieving service posts and managing applications will be documented here once implemented in `app/routes/services_router.py`.)*
