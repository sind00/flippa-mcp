import { z } from "zod";
import { TOOL_PROPERTY_TYPES, LISTING_STATUSES, SALE_METHODS, SORT_ALIASES, } from "../constants.js";
/** Response format schema shared across all tools */
export const responseFormatSchema = z
    .enum(["markdown", "json"])
    .default("markdown")
    .describe("Response format: 'markdown' for human-readable or 'json' for structured data");
/** Schema for flippa_search_listings tool input */
export const searchListingsSchema = z.object({
    property_type: z
        .enum(TOOL_PROPERTY_TYPES)
        .optional()
        .describe("Filter by property/business type (e.g., 'saas', 'website', 'ecommerce_store')"),
    status: z
        .enum(LISTING_STATUSES)
        .default("open")
        .describe("Filter by listing status: 'open' (active), 'closed' (sold), or 'ended' (expired)"),
    sale_method: z
        .enum(SALE_METHODS)
        .optional()
        .describe("Filter by sale method: 'auction' or 'classified' (fixed price)"),
    sort_alias: z
        .enum(SORT_ALIASES)
        .optional()
        .describe("Sort order for results (e.g., 'most_recent', 'highest_price', 'most_profitable')"),
    page_number: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe("Page number for pagination, starting at 1"),
    page_size: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(30)
        .describe("Number of results per page (1-100, default 30)"),
    response_format: responseFormatSchema,
}).strict();
/** Schema for flippa_get_listing tool input */
export const getListingSchema = z.object({
    listing_id: z
        .string()
        .min(1)
        .describe("The Flippa listing ID (e.g., '12299903')"),
    response_format: responseFormatSchema,
}).strict();
/** Schema for flippa_analyze_listing tool input */
export const analyzeListingSchema = z.object({
    listing_id: z
        .string()
        .min(1)
        .describe("The Flippa listing ID to analyze (e.g., '12299903')"),
    response_format: responseFormatSchema,
}).strict();
/** Schema for flippa_comparable_sales tool input */
export const comparableSalesSchema = z.object({
    listing_id: z
        .string()
        .optional()
        .describe("Find comparable listings for this listing ID. If provided, the listing's property_type and revenue range are used for matching."),
    property_type: z
        .enum(TOOL_PROPERTY_TYPES)
        .optional()
        .describe("Filter comparables by property type. If listing_id is provided, this overrides the listing's type."),
    page_size: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(10)
        .describe("Number of comparable listings to return (1-20, default 10)"),
    response_format: responseFormatSchema,
}).strict();
/** Schema for flippa_market_overview tool input */
export const marketOverviewSchema = z.object({
    property_type: z
        .enum(TOOL_PROPERTY_TYPES)
        .optional()
        .describe("Focus on a specific property type. If omitted, aggregates across all major types."),
    response_format: responseFormatSchema,
}).strict();
//# sourceMappingURL=listing.js.map