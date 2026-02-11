import { describe, it, expect, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchTool } from "../../src/tools/search.js";
import { registerDetailsTool } from "../../src/tools/details.js";
import { registerAnalyzeTool } from "../../src/tools/analyze.js";
import { registerCompareTool } from "../../src/tools/compare.js";
import { registerMarketTool } from "../../src/tools/market.js";

// Mock flippa-client so no real HTTP calls are made during registration
vi.mock("../../src/services/flippa-client.js", () => ({
  getFlippaClient: () => ({
    searchListings: vi.fn(),
    getListing: vi.fn(),
  }),
  FlippaApiError: class FlippaApiError extends Error {
    public readonly statusCode: number | null;
    constructor(message: string, statusCode: number | null) {
      super(message);
      this.name = "FlippaApiError";
      this.statusCode = statusCode;
    }
  },
}));

describe("MCP Server registration", () => {
  it("registers all 5 tools without errors", () => {
    const server = new McpServer({
      name: "flippa-mcp-server",
      version: "1.0.0",
    });

    expect(() => {
      registerSearchTool(server);
      registerDetailsTool(server);
      registerAnalyzeTool(server);
      registerCompareTool(server);
      registerMarketTool(server);
    }).not.toThrow();
  });

  it("registers tools with expected names", () => {
    // Use a spy server to capture registrations
    const registeredNames: string[] = [];

    const spyServer = {
      registerTool(name: string, _config: unknown, _handler: unknown) {
        registeredNames.push(name);
      },
    };

    registerSearchTool(spyServer as any);
    registerDetailsTool(spyServer as any);
    registerAnalyzeTool(spyServer as any);
    registerCompareTool(spyServer as any);
    registerMarketTool(spyServer as any);

    expect(registeredNames).toEqual([
      "flippa_search_listings",
      "flippa_get_listing",
      "flippa_analyze_listing",
      "flippa_comparable_sales",
      "flippa_market_overview",
    ]);
  });

  it("all tools have readOnlyHint annotation set to true", () => {
    const registeredConfigs: Record<string, any>[] = [];

    const spyServer = {
      registerTool(_name: string, config: any, _handler: unknown) {
        registeredConfigs.push(config);
      },
    };

    registerSearchTool(spyServer as any);
    registerDetailsTool(spyServer as any);
    registerAnalyzeTool(spyServer as any);
    registerCompareTool(spyServer as any);
    registerMarketTool(spyServer as any);

    for (const config of registeredConfigs) {
      expect(config.annotations.readOnlyHint).toBe(true);
    }
  });
});
