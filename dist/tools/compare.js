import { comparableSalesSchema } from "../schemas/listing.js";
import { getFlippaClient, FlippaApiError } from "../services/flippa-client.js";
import { formatComparables } from "../services/formatter.js";
import { median, average } from "../utils/math.js";
export function registerCompareTool(server) {
    server.registerTool("flippa_comparable_sales", {
        title: "Find Comparable Flippa Listings",
        description: `Find comparable listings on Flippa for valuation comparison.

If a listing_id is provided, fetches that listing first and uses its property_type and revenue range (0.5x-2x) to find similar listings. You can also search by property_type directly.

Args:
  - listing_id: Find comparables for this listing. Optional.
  - property_type: Filter by type. Overrides the target listing's type if both provided. Optional.
  - page_size: Number of comparables to return, 1-20 (default 10)
  - response_format: "markdown" (default) or "json"

Returns:
  Target listing (if listing_id provided), list of comparable listings, average price, median price, average revenue multiple, and price range.

Examples:
  - Comps for a listing: { "listing_id": "12299903" }
  - SaaS comparables: { "property_type": "saas", "page_size": 15 }`,
        inputSchema: comparableSalesSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
        },
    }, async (input) => {
        try {
            const parsed = comparableSalesSchema.parse(input);
            const client = getFlippaClient();
            let targetListing = null;
            let searchPropertyType = parsed.property_type;
            // Step 1: Fetch target listing if provided
            if (parsed.listing_id) {
                const response = await client.getListing(parsed.listing_id);
                targetListing = response.data;
                if (!searchPropertyType) {
                    searchPropertyType = targetListing.property_type;
                }
            }
            if (!searchPropertyType && !parsed.listing_id) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: Provide either a listing_id or property_type to find comparable listings.",
                        },
                    ],
                    isError: true,
                };
            }
            // Step 2: Search for comparable listings
            const searchResponse = await client.searchListings({
                page_size: parsed.page_size,
                property_type: searchPropertyType,
                status: "open",
                sort_alias: "most_relevant",
            });
            // Filter out the target listing itself and filter by revenue range if applicable
            let comparables = searchResponse.data.filter((l) => l.id !== parsed.listing_id);
            if (targetListing &&
                targetListing.revenue_per_month !== null &&
                targetListing.revenue_per_month > 0) {
                const minRevenue = targetListing.revenue_per_month * 0.5;
                const maxRevenue = targetListing.revenue_per_month * 2;
                const revenueFiltered = comparables.filter((l) => l.revenue_per_month !== null &&
                    l.revenue_per_month >= minRevenue &&
                    l.revenue_per_month <= maxRevenue);
                // Only apply revenue filter if it produces results
                if (revenueFiltered.length > 0) {
                    comparables = revenueFiltered;
                }
            }
            comparables = comparables.slice(0, parsed.page_size);
            // Step 3: Compute aggregate stats
            const prices = comparables
                .map((l) => l.current_price)
                .filter((p) => p !== null && p > 0);
            const revenueMultiples = comparables
                .filter((l) => l.current_price !== null &&
                l.current_price > 0 &&
                l.revenue_per_month !== null &&
                l.revenue_per_month > 0)
                .map((l) => l.current_price / (l.revenue_per_month * 12));
            const result = {
                target_listing: targetListing,
                comparables,
                avg_price: average(prices),
                median_price: median(prices),
                avg_revenue_multiple: average(revenueMultiples),
                price_range: prices.length > 0
                    ? { min: Math.min(...prices), max: Math.max(...prices) }
                    : null,
            };
            const formatted = formatComparables(result, parsed.response_format);
            return {
                content: [{ type: "text", text: formatted }],
            };
        }
        catch (error) {
            if (error instanceof FlippaApiError) {
                return {
                    content: [{ type: "text", text: `Error: ${error.message}` }],
                    isError: true,
                };
            }
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Unexpected error finding comparables: ${message}. Try again or adjust parameters.`,
                    },
                ],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=compare.js.map