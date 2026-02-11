import type { FlippaSearchResponse, FlippaListingResponse } from "../types.js";
/** Shared Flippa API HTTP client with retry and rate limiting */
export declare class FlippaClient {
    private readonly client;
    private readonly rateLimiter;
    constructor();
    /** Execute a GET request with retry and rate limiting */
    private get;
    /** Search listings with query parameters */
    searchListings(params: {
        page_number?: number;
        page_size?: number;
        property_type?: string;
        status?: string;
        sale_method?: string;
        sort_alias?: string;
    }): Promise<FlippaSearchResponse>;
    /** Get a single listing by ID */
    getListing(listingId: string): Promise<FlippaListingResponse>;
}
/** Custom error class for Flippa API errors */
export declare class FlippaApiError extends Error {
    readonly statusCode: number | null;
    constructor(message: string, statusCode: number | null);
}
export declare function getFlippaClient(): FlippaClient;
//# sourceMappingURL=flippa-client.d.ts.map