import { describe, it, expect, vi, beforeEach } from "vitest";
import { createListing, createSearchResponse, createListingResponse } from "../helpers/fixtures.js";

// Mock the flippa-client module
const mockSearchListings = vi.fn();
const mockGetListing = vi.fn();

vi.mock("../../src/services/flippa-client.js", () => ({
  getFlippaClient: () => ({
    searchListings: mockSearchListings,
    getListing: mockGetListing,
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

// We need to import the tool registerers after mocking
import { registerSearchTool } from "../../src/tools/search.js";
import { registerDetailsTool } from "../../src/tools/details.js";
import { registerAnalyzeTool } from "../../src/tools/analyze.js";
import { registerCompareTool } from "../../src/tools/compare.js";
import { registerMarketTool } from "../../src/tools/market.js";

/**
 * Utility: creates a fake McpServer that captures tool registrations
 * so we can call tool handlers directly.
 */
function createFakeServer() {
  const tools: Record<
    string,
    {
      config: Record<string, unknown>;
      handler: (input: Record<string, unknown>) => Promise<unknown>;
    }
  > = {};

  return {
    registerTool(
      name: string,
      config: Record<string, unknown>,
      handler: (input: Record<string, unknown>) => Promise<unknown>
    ) {
      tools[name] = { config, handler };
    },
    tools,
  };
}

describe("Tool handlers (integration)", () => {
  let server: ReturnType<typeof createFakeServer>;

  beforeEach(() => {
    server = createFakeServer();
    vi.clearAllMocks();

    // Register all tools
    registerSearchTool(server as any);
    registerDetailsTool(server as any);
    registerAnalyzeTool(server as any);
    registerCompareTool(server as any);
    registerMarketTool(server as any);
  });

  describe("flippa_search_listings", () => {
    it("returns formatted results on success", async () => {
      const listing = createListing();
      const searchResp = createSearchResponse([listing]);
      mockSearchListings.mockResolvedValueOnce(searchResp);

      const result = (await server.tools["flippa_search_listings"].handler({})) as any;

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Flippa Listings Search Results");
      expect(result.isError).toBeUndefined();
    });

    it("computes has_more correctly when more pages exist", async () => {
      const listing = createListing();
      // page 1, page_size 30, total 100 → has_more = true
      const searchResp = createSearchResponse([listing], {
        page_number: 1,
        page_size: 30,
        total_results: 100,
      });
      mockSearchListings.mockResolvedValueOnce(searchResp);

      const result = (await server.tools["flippa_search_listings"].handler({})) as any;
      // Since format is markdown by default, the output should contain "Page 1"
      expect(result.content[0].text).toContain("Page 1");
    });

    it("returns error when API fails", async () => {
      const { FlippaApiError } = await import("../../src/services/flippa-client.js");
      mockSearchListings.mockRejectedValueOnce(
        new FlippaApiError("Service unavailable", 503)
      );

      const result = (await server.tools["flippa_search_listings"].handler({})) as any;
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error");
    });

    it("passes JSON format through", async () => {
      const listing = createListing();
      const searchResp = createSearchResponse([listing]);
      mockSearchListings.mockResolvedValueOnce(searchResp);

      const result = (await server.tools["flippa_search_listings"].handler({
        response_format: "json",
      })) as any;

      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
    });
  });

  describe("flippa_get_listing", () => {
    it("returns formatted listing on success", async () => {
      const listing = createListing({ title: "My Great SaaS" });
      mockGetListing.mockResolvedValueOnce(createListingResponse(listing));

      const result = (await server.tools["flippa_get_listing"].handler({
        listing_id: "12345",
      })) as any;

      expect(result.content[0].text).toContain("My Great SaaS");
      expect(result.isError).toBeUndefined();
    });

    it("returns error for missing listing", async () => {
      const { FlippaApiError } = await import("../../src/services/flippa-client.js");
      mockGetListing.mockRejectedValueOnce(
        new FlippaApiError("Flippa API returned 404: Not Found.", 404)
      );

      const result = (await server.tools["flippa_get_listing"].handler({
        listing_id: "99999",
      })) as any;

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("404");
    });
  });

  describe("flippa_analyze_listing", () => {
    it("returns analysis with verdict on success", async () => {
      const listing = createListing({
        current_price: 50000,
        revenue_per_month: 2000,
      });
      mockGetListing.mockResolvedValueOnce(createListingResponse(listing));

      const result = (await server.tools["flippa_analyze_listing"].handler({
        listing_id: "12345",
      })) as any;

      expect(result.content[0].text).toContain("Verdict");
      expect(result.isError).toBeUndefined();
    });

    it("returns insufficient_data when no revenue", async () => {
      const listing = createListing({ revenue_per_month: null });
      mockGetListing.mockResolvedValueOnce(createListingResponse(listing));

      const result = (await server.tools["flippa_analyze_listing"].handler({
        listing_id: "12345",
      })) as any;

      expect(result.content[0].text).toContain("INSUFFICIENT_DATA");
    });

    it("returns error on API failure", async () => {
      const { FlippaApiError } = await import("../../src/services/flippa-client.js");
      mockGetListing.mockRejectedValueOnce(
        new FlippaApiError("Server error", 500)
      );

      const result = (await server.tools["flippa_analyze_listing"].handler({
        listing_id: "12345",
      })) as any;

      expect(result.isError).toBe(true);
    });
  });

  describe("flippa_comparable_sales", () => {
    it("returns comparables for a listing", async () => {
      const target = createListing({
        id: "111",
        title: "Target Biz",
        revenue_per_month: 2000,
      });
      const comp1 = createListing({
        id: "222",
        title: "Comp A",
        revenue_per_month: 1500,
      });
      const comp2 = createListing({
        id: "333",
        title: "Comp B",
        revenue_per_month: 2500,
      });

      mockGetListing.mockResolvedValueOnce(createListingResponse(target));
      mockSearchListings.mockResolvedValueOnce(
        createSearchResponse([target, comp1, comp2])
      );

      const result = (await server.tools["flippa_comparable_sales"].handler({
        listing_id: "111",
      })) as any;

      expect(result.content[0].text).toContain("Target Biz");
      expect(result.isError).toBeUndefined();
    });

    it("filters out target listing from comparables", async () => {
      const target = createListing({
        id: "111",
        title: "Target Biz",
        revenue_per_month: 2000,
      });
      const comp = createListing({
        id: "222",
        title: "Comp Only",
        revenue_per_month: 1800,
      });

      mockGetListing.mockResolvedValueOnce(createListingResponse(target));
      mockSearchListings.mockResolvedValueOnce(
        createSearchResponse([target, comp])
      );

      const result = (await server.tools["flippa_comparable_sales"].handler({
        listing_id: "111",
        response_format: "json",
      })) as any;

      const parsed = JSON.parse(result.content[0].text);
      const compIds = parsed.comparables.map((c: any) => c.id);
      expect(compIds).not.toContain("111");
      expect(compIds).toContain("222");
    });

    it("returns error when no listing_id or property_type", async () => {
      const result = (await server.tools["flippa_comparable_sales"].handler(
        {}
      )) as any;

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Provide either");
    });

    it("works with property_type only", async () => {
      const comp = createListing({ id: "555", property_type: "website" });
      mockSearchListings.mockResolvedValueOnce(createSearchResponse([comp]));

      const result = (await server.tools["flippa_comparable_sales"].handler({
        property_type: "website",
      })) as any;

      expect(result.isError).toBeUndefined();
    });
  });

  describe("flippa_market_overview", () => {
    it("makes single API call for specific property_type", async () => {
      const listing = createListing({ property_type: "saas" });
      mockSearchListings.mockResolvedValueOnce(
        createSearchResponse([listing], { total_results: 200 })
      );

      const result = (await server.tools["flippa_market_overview"].handler({
        property_type: "saas",
      })) as any;

      expect(mockSearchListings).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain("200");
      expect(result.isError).toBeUndefined();
    });

    it("makes 10 parallel calls when no property_type specified", async () => {
      // Mock 10 responses for MAJOR_PROPERTY_TYPES
      for (let i = 0; i < 10; i++) {
        const listing = createListing();
        mockSearchListings.mockResolvedValueOnce(
          createSearchResponse([listing], { total_results: 50 })
        );
      }

      const result = (await server.tools["flippa_market_overview"].handler(
        {}
      )) as any;

      expect(mockSearchListings).toHaveBeenCalledTimes(10);
      expect(result.isError).toBeUndefined();
    });

    it("returns error on API failure", async () => {
      const { FlippaApiError } = await import("../../src/services/flippa-client.js");
      mockSearchListings.mockRejectedValueOnce(
        new FlippaApiError("Rate limited", 429)
      );

      const result = (await server.tools["flippa_market_overview"].handler({
        property_type: "saas",
      })) as any;

      expect(result.isError).toBe(true);
    });

    it("returns JSON when requested", async () => {
      const listing = createListing();
      mockSearchListings.mockResolvedValueOnce(
        createSearchResponse([listing], { total_results: 100 })
      );

      const result = (await server.tools["flippa_market_overview"].handler({
        property_type: "saas",
        response_format: "json",
      })) as any;

      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.total_listings).toBe(100);
    });
  });
});
