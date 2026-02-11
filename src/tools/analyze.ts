import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { analyzeListingSchema } from "../schemas/listing.js";
import { getFlippaClient, FlippaApiError } from "../services/flippa-client.js";
import { formatAnalysis } from "../services/formatter.js";
import type { ListingAnalysis, FlippaListing, ResponseFormat } from "../types.js";

/** Compute valuation analysis from a listing */
export function analyzeListing(listing: FlippaListing): ListingAnalysis {
  const askingPrice = listing.current_price;
  const monthlyRevenue = listing.revenue_per_month;
  const monthlyProfit = listing.profit_per_month;
  const uniques = listing.uniques_per_month;

  const annualRevenue =
    monthlyRevenue !== null && monthlyRevenue !== 0
      ? monthlyRevenue * 12
      : null;

  const revenueMultiple =
    askingPrice !== null &&
    monthlyRevenue !== null &&
    monthlyRevenue !== 0
      ? askingPrice / (monthlyRevenue * 12)
      : null;

  const profitMultiple =
    askingPrice !== null &&
    monthlyProfit !== null &&
    monthlyProfit !== 0
      ? askingPrice / (monthlyProfit * 12)
      : null;

  const pricePerVisitor =
    askingPrice !== null && uniques !== null && uniques !== 0
      ? askingPrice / uniques
      : null;

  const estimatedRoiMonths =
    askingPrice !== null &&
    monthlyProfit !== null &&
    monthlyProfit !== 0
      ? askingPrice / monthlyProfit
      : null;

  const revenuePerVisitor =
    monthlyRevenue !== null && uniques !== null && uniques !== 0
      ? monthlyRevenue / uniques
      : null;

  // Determine verdict
  let verdict: ListingAnalysis["verdict"];
  let verdictReasoning: string;

  if (revenueMultiple === null) {
    verdict = "insufficient_data";
    verdictReasoning =
      "Cannot determine valuation: listing has no reported revenue data. " +
      "Revenue is needed to calculate revenue multiples and determine fair pricing.";
  } else if (revenueMultiple < 2) {
    verdict = "underpriced";
    verdictReasoning =
      `At a ${revenueMultiple.toFixed(2)}x revenue multiple, this listing appears underpriced. ` +
      `Most online businesses sell for 2-4x annual revenue. This could be a good deal, ` +
      `but investigate why the seller is pricing below market rate.`;
  } else if (revenueMultiple <= 4) {
    verdict = "fair";
    verdictReasoning =
      `At a ${revenueMultiple.toFixed(2)}x revenue multiple, this listing is priced within the ` +
      `typical 2-4x range for online businesses. The price appears fair relative to revenue.`;
  } else {
    verdict = "overpriced";
    verdictReasoning =
      `At a ${revenueMultiple.toFixed(2)}x revenue multiple, this listing is priced above the ` +
      `typical 2-4x range. The seller may be factoring in growth potential, brand value, ` +
      `or other intangibles. Negotiate or ensure the premium is justified.`;
  }

  // Compute risk factors
  const riskFactors: string[] = [];

  if (monthlyRevenue === null || monthlyRevenue === 0) {
    riskFactors.push("No reported revenue");
  }
  if (monthlyProfit === null || monthlyProfit === 0) {
    riskFactors.push("No reported profit");
  }
  if (uniques === null) {
    riskFactors.push("No traffic data available");
  } else if (uniques < 1000) {
    riskFactors.push("Very low traffic");
  }
  if (!listing.has_verified_revenue) {
    riskFactors.push("Revenue not verified by Flippa");
  }
  if (!listing.has_verified_traffic) {
    riskFactors.push("Traffic not verified by Flippa");
  }
  if (!listing.super_seller) {
    riskFactors.push("Seller is not a verified Super Seller");
  }
  if (listing.bid_count === 0) {
    riskFactors.push("No bids yet");
  }
  if (!listing.images || listing.images.length === 0) {
    riskFactors.push("No images provided");
  }
  if (listing.summary !== null && listing.summary.length < 100) {
    riskFactors.push("Very short listing description");
  }
  if (listing.confidential) {
    riskFactors.push("Confidential listing - limited data");
  }

  return {
    listing_id: listing.id,
    title: listing.title,
    asking_price: askingPrice,
    monthly_revenue: monthlyRevenue,
    monthly_profit: monthlyProfit,
    annual_revenue: annualRevenue,
    revenue_multiple: revenueMultiple,
    profit_multiple: profitMultiple,
    price_per_visitor: pricePerVisitor,
    estimated_roi_months: estimatedRoiMonths,
    revenue_per_visitor: revenuePerVisitor,
    verdict,
    verdict_reasoning: verdictReasoning,
    risk_factors: riskFactors,
  };
}

export function registerAnalyzeTool(server: McpServer): void {
  server.registerTool(
    "flippa_analyze_listing",
    {
      title: "Analyze Flippa Listing",
      description: `Analyze a Flippa listing's valuation, compute financial metrics, and assess risk.

This is a computed tool that fetches listing data and calculates valuation metrics including revenue multiples, profit multiples, ROI estimates, and risk factors.

Args:
  - listing_id: The Flippa listing ID to analyze (e.g., "12299903"). Required.
  - response_format: "markdown" (default) or "json"

Returns:
  Computed analysis including:
  - Financial metrics: revenue/profit multiples, annual revenue, price per visitor, ROI estimate
  - Verdict: "underpriced" (<2x revenue), "fair" (2-4x), "overpriced" (>4x), or "insufficient_data"
  - Risk factors: unverified revenue/traffic, low traffic, no bids, missing images, etc.

Examples:
  - Analyze a listing: { "listing_id": "12299903" }
  - Get analysis as JSON: { "listing_id": "12299903", "response_format": "json" }`,
      inputSchema: analyzeListingSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
      },
    },
    async (input: Record<string, unknown>) => {
      try {
        const parsed = analyzeListingSchema.parse(input);
        const client = getFlippaClient();

        const response = await client.getListing(parsed.listing_id);
        const analysis = analyzeListing(response.data);

        const formatted = formatAnalysis(
          analysis,
          parsed.response_format as ResponseFormat
        );

        return {
          content: [{ type: "text" as const, text: formatted }],
        };
      } catch (error) {
        if (error instanceof FlippaApiError) {
          return {
            content: [{ type: "text" as const, text: `Error: ${error.message}` }],
            isError: true,
          };
        }
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Unexpected error analyzing listing: ${message}. Verify the listing_id is correct and try again.`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
