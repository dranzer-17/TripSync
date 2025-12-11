# User Profiles API

The User Profile API allows users to manage their personal information, contact details, preferences, and social media links. Each `User` has a one-to-one relationship with a `Profile`.

## Profile Model

The `Profile` data model is defined in `backend/app/models/profile_model.py` and includes the following fields:

*   `id` (Integer): Primary key for the profile.
*   `user_id` (Integer): Foreign key linking to the `User`'s ID, unique.
*   `username` (String): A unique username for the profile.
*   `phone_number` (String): User's phone number.
*   `bio` (Text): A longer text field for user biography.
*   `year_of_study` (String): User's year of study (e.g., 'Freshman', 'Sophomore').
*   `reviews` (JSONB): A flexible JSON field to store reviews or ratings (e.g., `{"communication": 5, "punctuality": 4}`).
*   `preferences` (JSONB): A flexible JSON field for user preferences (e.g., `{"allow_smoking": false, "preferred_music": "pop"}`).
*   `social_media_links` (JSONB): A flexible JSON field for social media profiles (e.g., `{"linkedin": "url", "twitter": "url"}`).
*   `emergency_contact` (JSONB): A flexible JSON field for emergency contact details (e.g., `{"name": "Jane Doe", "phone": "1234567890"}`).

## Endpoints

*(Note: Specific endpoints for creating, retrieving, updating, and deleting profiles will be documented here once implemented in `app/routes/profile_router.py`.)*
