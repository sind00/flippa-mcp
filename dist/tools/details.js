import { getListingSchema } from "../schemas/listing.js";
import { getFlippaClient, FlippaApiError } from "../services/flippa-client.js";
import { formatListingDetails } from "../services/formatter.js";
export function registerDetailsTool(server) {
    server.registerTool("flippa_get_listing", {
        title: "Get Flippa Listing Details",
        description: `Get full details for a specific Flippa listing by ID.

Args:
  - listing_id: The Flippa listing ID (e.g., "12299903"). Required.
  - response_format: "markdown" (default) or "json"

Returns:
  Complete listing details including price, revenue, profit, traffic stats, seller info, verification status, description, and more.

Examples:
  - Get listing details: { "listing_id": "12299903" }
  - Get as JSON: { "listing_id": "12299903", "response_format": "json" }`,
        inputSchema: getListingSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
        },
    }, async (input) => {
        try {
            const parsed = getListingSchema.parse(input);
            const client = getFlippaClient();
            const response = await client.getListing(parsed.listing_id);
            const formatted = formatListingDetails(response.data, parsed.response_format);
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
                        text: `Unexpected error fetching listing: ${message}. Verify the listing_id is correct and try again.`,
                    },
                ],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=details.js.map