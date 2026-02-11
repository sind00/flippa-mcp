import { marketOverviewSchema } from "../schemas/listing.js";
import { getFlippaClient, FlippaApiError } from "../services/flippa-client.js";
import { formatMarketOverview } from "../services/formatter.js";
import { MAJOR_PROPERTY_TYPES } from "../constants.js";
import { average, computeStats } from "../utils/math.js";
export function registerMarketTool(server) {
    server.registerTool("flippa_market_overview", {
        title: "Flippa Market Overview",
        description: `Get aggregate market statistics from the Flippa marketplace.

Queries listings across property types to build a market snapshot including total counts, price/revenue/profit statistics, and verification rates.

Args:
  - property_type: Focus on a specific type (website, saas, ecommerce_store, etc.). If omitted, aggregates across all major types. Optional.
  - response_format: "markdown" (default) or "json"

Returns:
  Market overview with total listings, breakdown by property type (count, avg price, avg revenue), price/revenue/profit statistics (min, max, avg, median), average revenue multiple, and verified revenue percentage.

Examples:
  - Full market overview: {}
  - SaaS market overview: { "property_type": "saas" }`,
        inputSchema: marketOverviewSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
        },
    }, async (input) => {
        try {
            const parsed = marketOverviewSchema.parse(input);
            const client = getFlippaClient();
            let allListings = [];
            let totalListings = 0;
            const typeBreakdown = [];
            if (parsed.property_type) {
                // Single property type query
                const response = await client.searchListings({
                    property_type: parsed.property_type,
                    status: "open",
                    page_size: 100,
                });
                allListings = response.data;
                totalListings = response.meta.total_results;
                const prices = allListings
                    .map((l) => l.current_price)
                    .filter((p) => p !== null && p > 0);
                const revenues = allListings
                    .map((l) => l.revenue_per_month)
                    .filter((r) => r !== null);
                typeBreakdown.push({
                    type: parsed.property_type,
                    count: totalListings,
                    avg_price: prices.length > 0 ? Math.round(average(prices)) : null,
                    avg_revenue: revenues.length > 0 ? Math.round(average(revenues)) : null,
                });
            }
            else {
                // Query across all major property types
                const responses = await Promise.all(MAJOR_PROPERTY_TYPES.map(async (ptype) => {
                    const response = await client.searchListings({
                        property_type: ptype,
                        status: "open",
                        page_size: 100,
                    });
                    return { type: ptype, response };
                }));
                for (const { type, response } of responses) {
                    allListings.push(...response.data);
                    totalListings += response.meta.total_results;
                    const prices = response.data
                        .map((l) => l.current_price)
                        .filter((p) => p !== null && p > 0);
                    const revenues = response.data
                        .map((l) => l.revenue_per_month)
                        .filter((r) => r !== null);
                    typeBreakdown.push({
                        type,
                        count: response.meta.total_results,
                        avg_price: prices.length > 0 ? Math.round(average(prices)) : null,
                        avg_revenue: revenues.length > 0 ? Math.round(average(revenues)) : null,
                    });
                }
            }
            // Aggregate stats across all fetched listings
            const allPrices = allListings
                .map((l) => l.current_price)
                .filter((p) => p !== null && p > 0);
            const allRevenues = allListings
                .map((l) => l.revenue_per_month)
                .filter((r) => r !== null);
            const allProfits = allListings
                .map((l) => l.profit_per_month)
                .filter((p) => p !== null);
            const revenueMultiples = allListings
                .filter((l) => l.current_price !== null &&
                l.current_price > 0 &&
                l.revenue_per_month !== null &&
                l.revenue_per_month > 0)
                .map((l) => l.current_price / (l.revenue_per_month * 12));
            const verifiedCount = allListings.filter((l) => l.has_verified_revenue).length;
            const overview = {
                total_listings: totalListings,
                property_type_breakdown: typeBreakdown.sort((a, b) => b.count - a.count),
                price_stats: computeStats(allPrices),
                revenue_stats: computeStats(allRevenues),
                profit_stats: computeStats(allProfits),
                avg_revenue_multiple: revenueMultiples.length > 0
                    ? Math.round(average(revenueMultiples) * 100) / 100
                    : null,
                verified_percentage: allListings.length > 0
                    ? Math.round((verifiedCount / allListings.length) * 1000) / 1000
                    : 0,
            };
            const formatted = formatMarketOverview(overview, parsed.response_format);
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
                        text: `Unexpected error generating market overview: ${message}. Try specifying a property_type to reduce the query scope.`,
                    },
                ],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=market.js.map