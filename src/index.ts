#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSearchTool } from "./tools/search.js";
import { registerDetailsTool } from "./tools/details.js";
import { registerAnalyzeTool } from "./tools/analyze.js";
import { registerCompareTool } from "./tools/compare.js";
import { registerMarketTool } from "./tools/market.js";

async function main(): Promise<void> {
  const server = new McpServer({
    name: "flippa-mcp-server",
    version: "1.0.0",
  });

  // Register all tools
  registerSearchTool(server);
  registerDetailsTool(server);
  registerAnalyzeTool(server);
  registerCompareTool(server);
  registerMarketTool(server);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Fatal error starting flippa-mcp-server: ${message}\n`);
  process.exit(1);
});
