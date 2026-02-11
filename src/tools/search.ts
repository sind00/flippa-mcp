import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchListingsSchema } from "../schemas/listing.js";
import { getFlippaClient, FlippaApiError } from "../services/flippa-client.js";
import { formatSearchResults } from "../services/formatter.js";
import type { SearchResult, ResponseFormat } from "../types.js";

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "flippa_search_listings",
    {
      title: "Search Flippa Listings",
      description: `Search and browse listings on the Flippa marketplace.

Args:
  - property_type: Filter by type (website, saas, ecommerce_store, fba, ios_app, android_app, ai_apps_and_tools, youtube, newsletter, service, other)
  - status: Filter by status (open, closed, ended). Default: "open"
  - sale_method: Filter by sale method (auction, classified)
  - sort_alias: Sort by (lowest_price, highest_price, most_active, most_recent, ending_soonest, most_profitable, most_relevant)
  - page_number: Page number (default 1)
  - page_size: Results per page, 1-100 (default 30)
  - response_format: "markdown" (default) or "json"

Returns:
  Paginated list of Flippa listings with price, revenue, profit, bid count, and verification status. Includes pagination metadata with has_more flag.

Examples:
  - Search all open SaaS listings: { "property_type": "saas" }
  - Most profitable websites: { "property_type": "website", "sort_alias": "most_profitable" }
  - Ending soon auctions: { "sale_method": "auction", "sort_alias": "ending_soonest" }`,
      inputSchema: searchListingsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (input: Record<string, unknown>) => {
      try {
        const parsed = searchListingsSchema.parse(input);
        const client = getFlippaClient();

        const response = await client.searchListings({
          page_number: parsed.page_number,
          page_size: parsed.page_size,
          property_type: parsed.property_type,
          status: parsed.status,
          sale_method: parsed.sale_method,
          sort_alias: parsed.sort_alias,
        });

        const hasMore =
          response.meta.page_number * response.meta.page_size <
          response.meta.total_results;

        const result: SearchResult = {
          meta: {
            ...response.meta,
            has_more: hasMore,
          },
          data: response.data,
        };

        const formatted = formatSearchResults(
          result,
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
              text: `Unexpected error searching Flippa listings: ${message}. Try again or adjust your search parameters.`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
