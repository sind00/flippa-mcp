/** Default Flippa API base URL */
export declare const DEFAULT_BASE_URL = "https://flippa.com/v3";
/** Maximum character limit for MCP tool responses */
export declare const CHARACTER_LIMIT = 25000;
/** Rate limiting: max requests per minute */
export declare const MAX_REQUESTS_PER_MINUTE = 60;
/** Request timeout in milliseconds */
export declare const REQUEST_TIMEOUT_MS = 15000;
/** Retry configuration */
export declare const RETRY_CONFIG: {
    readonly maxRetries: 3;
    readonly baseDelayMs: 1000;
    readonly multiplier: 2;
};
/** Default page size for search results */
export declare const DEFAULT_PAGE_SIZE = 30;
/** Max page size allowed */
export declare const MAX_PAGE_SIZE = 100;
/** Valid property types for the filter[property_type] parameter */
export declare const PROPERTY_TYPES: readonly ["website", "saas", "ecommerce_store", "fba", "ios_app", "android_app", "plugin_and_extension", "ai_apps_and_tools", "youtube", "game", "crypto_app", "social_media", "newsletter", "service_and_agency", "service", "projects_and_concepts", "other"];
/** Property types exposed in tool input (simplified subset) */
export declare const TOOL_PROPERTY_TYPES: readonly ["website", "saas", "ecommerce_store", "fba", "ios_app", "android_app", "ai_apps_and_tools", "youtube", "newsletter", "service", "other"];
/** Valid listing statuses */
export declare const LISTING_STATUSES: readonly ["open", "closed", "ended"];
/** Valid sale methods */
export declare const SALE_METHODS: readonly ["auction", "classified"];
/** Valid sort options */
export declare const SORT_ALIASES: readonly ["lowest_price", "highest_price", "most_active", "most_recent", "ending_soonest", "most_profitable", "most_relevant"];
/** Major property types used for market overview aggregation */
export declare const MAJOR_PROPERTY_TYPES: readonly ["website", "saas", "ecommerce_store", "fba", "ios_app", "android_app", "ai_apps_and_tools", "youtube", "newsletter", "service"];
//# sourceMappingURL=constants.d.ts.map