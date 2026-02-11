import { z } from "zod";
/** Response format schema shared across all tools */
export declare const responseFormatSchema: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
/** Schema for flippa_search_listings tool input */
export declare const searchListingsSchema: z.ZodObject<{
    property_type: z.ZodOptional<z.ZodEnum<["website", "saas", "ecommerce_store", "fba", "ios_app", "android_app", "ai_apps_and_tools", "youtube", "newsletter", "service", "other"]>>;
    status: z.ZodDefault<z.ZodEnum<["open", "closed", "ended"]>>;
    sale_method: z.ZodOptional<z.ZodEnum<["auction", "classified"]>>;
    sort_alias: z.ZodOptional<z.ZodEnum<["lowest_price", "highest_price", "most_active", "most_recent", "ending_soonest", "most_profitable", "most_relevant"]>>;
    page_number: z.ZodDefault<z.ZodNumber>;
    page_size: z.ZodDefault<z.ZodNumber>;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    status: "open" | "closed" | "ended";
    page_number: number;
    page_size: number;
    response_format: "markdown" | "json";
    property_type?: "website" | "saas" | "ecommerce_store" | "fba" | "ios_app" | "android_app" | "ai_apps_and_tools" | "youtube" | "newsletter" | "service" | "other" | undefined;
    sale_method?: "auction" | "classified" | undefined;
    sort_alias?: "lowest_price" | "highest_price" | "most_active" | "most_recent" | "ending_soonest" | "most_profitable" | "most_relevant" | undefined;
}, {
    property_type?: "website" | "saas" | "ecommerce_store" | "fba" | "ios_app" | "android_app" | "ai_apps_and_tools" | "youtube" | "newsletter" | "service" | "other" | undefined;
    status?: "open" | "closed" | "ended" | undefined;
    sale_method?: "auction" | "classified" | undefined;
    sort_alias?: "lowest_price" | "highest_price" | "most_active" | "most_recent" | "ending_soonest" | "most_profitable" | "most_relevant" | undefined;
    page_number?: number | undefined;
    page_size?: number | undefined;
    response_format?: "markdown" | "json" | undefined;
}>;
/** Schema for flippa_get_listing tool input */
export declare const getListingSchema: z.ZodObject<{
    listing_id: z.ZodString;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    response_format: "markdown" | "json";
    listing_id: string;
}, {
    listing_id: string;
    response_format?: "markdown" | "json" | undefined;
}>;
/** Schema for flippa_analyze_listing tool input */
export declare const analyzeListingSchema: z.ZodObject<{
    listing_id: z.ZodString;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    response_format: "markdown" | "json";
    listing_id: string;
}, {
    listing_id: string;
    response_format?: "markdown" | "json" | undefined;
}>;
/** Schema for flippa_comparable_sales tool input */
export declare const comparableSalesSchema: z.ZodObject<{
    listing_id: z.ZodOptional<z.ZodString>;
    property_type: z.ZodOptional<z.ZodEnum<["website", "saas", "ecommerce_store", "fba", "ios_app", "android_app", "ai_apps_and_tools", "youtube", "newsletter", "service", "other"]>>;
    page_size: z.ZodDefault<z.ZodNumber>;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    page_size: number;
    response_format: "markdown" | "json";
    property_type?: "website" | "saas" | "ecommerce_store" | "fba" | "ios_app" | "android_app" | "ai_apps_and_tools" | "youtube" | "newsletter" | "service" | "other" | undefined;
    listing_id?: string | undefined;
}, {
    property_type?: "website" | "saas" | "ecommerce_store" | "fba" | "ios_app" | "android_app" | "ai_apps_and_tools" | "youtube" | "newsletter" | "service" | "other" | undefined;
    page_size?: number | undefined;
    response_format?: "markdown" | "json" | undefined;
    listing_id?: string | undefined;
}>;
/** Schema for flippa_market_overview tool input */
export declare const marketOverviewSchema: z.ZodObject<{
    property_type: z.ZodOptional<z.ZodEnum<["website", "saas", "ecommerce_store", "fba", "ios_app", "android_app", "ai_apps_and_tools", "youtube", "newsletter", "service", "other"]>>;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    response_format: "markdown" | "json";
    property_type?: "website" | "saas" | "ecommerce_store" | "fba" | "ios_app" | "android_app" | "ai_apps_and_tools" | "youtube" | "newsletter" | "service" | "other" | undefined;
}, {
    property_type?: "website" | "saas" | "ecommerce_store" | "fba" | "ios_app" | "android_app" | "ai_apps_and_tools" | "youtube" | "newsletter" | "service" | "other" | undefined;
    response_format?: "markdown" | "json" | undefined;
}>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type GetListingInput = z.infer<typeof getListingSchema>;
export type AnalyzeListingInput = z.infer<typeof analyzeListingSchema>;
export type ComparableSalesInput = z.infer<typeof comparableSalesSchema>;
export type MarketOverviewInput = z.infer<typeof marketOverviewSchema>;
//# sourceMappingURL=listing.d.ts.map