/** Default Flippa API base URL */
export const DEFAULT_BASE_URL = "https://flippa.com/v3";
/** Maximum character limit for MCP tool responses */
export const CHARACTER_LIMIT = 25000;
/** Rate limiting: max requests per minute */
export const MAX_REQUESTS_PER_MINUTE = 60;
/** Request timeout in milliseconds */
export const REQUEST_TIMEOUT_MS = 15000;
/** Retry configuration */
export const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelayMs: 1000,
    multiplier: 2,
};
/** Default page size for search results */
export const DEFAULT_PAGE_SIZE = 30;
/** Max page size allowed */
export const MAX_PAGE_SIZE = 100;
/** Valid property types for the filter[property_type] parameter */
export const PROPERTY_TYPES = [
    "website",
    "saas",
    "ecommerce_store",
    "fba",
    "ios_app",
    "android_app",
    "plugin_and_extension",
    "ai_apps_and_tools",
    "youtube",
    "game",
    "crypto_app",
    "social_media",
    "newsletter",
    "service_and_agency",
    "service",
    "projects_and_concepts",
    "other",
];
/** Property types exposed in tool input (simplified subset) */
export const TOOL_PROPERTY_TYPES = [
    "website",
    "saas",
    "ecommerce_store",
    "fba",
    "ios_app",
    "android_app",
    "ai_apps_and_tools",
    "youtube",
    "newsletter",
    "service",
    "other",
];
/** Valid listing statuses */
export const LISTING_STATUSES = ["open", "closed", "ended"];
/** Valid sale methods */
export const SALE_METHODS = ["auction", "classified"];
/** Valid sort options */
export const SORT_ALIASES = [
    "lowest_price",
    "highest_price",
    "most_active",
    "most_recent",
    "ending_soonest",
    "most_profitable",
    "most_relevant",
];
/** Major property types used for market overview aggregation */
export const MAJOR_PROPERTY_TYPES = [
    "website",
    "saas",
    "ecommerce_store",
    "fba",
    "ios_app",
    "android_app",
    "ai_apps_and_tools",
    "youtube",
    "newsletter",
    "service",
];
//# sourceMappingURL=constants.js.map