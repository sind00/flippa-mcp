import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ListingAnalysis, FlippaListing } from "../types.js";
/** Compute valuation analysis from a listing */
export declare function analyzeListing(listing: FlippaListing): ListingAnalysis;
export declare function registerAnalyzeTool(server: McpServer): void;
//# sourceMappingURL=analyze.d.ts.map