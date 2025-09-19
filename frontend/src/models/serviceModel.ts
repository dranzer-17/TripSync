/**
 * Defines the possible compensation types for a service post.
 * Using an enum ensures we use the exact same string values as the backend.
 */
export enum CompensationType {
    VOLUNTEER = "volunteer",
    FIXED_PRICE = "fixed_price",
    HOURLY_RATE = "hourly_rate",
    NEGOTIABLE = "negotiable"
}