import { describe, it, expect } from "vitest";
import {
  truncate,
  formatUsd,
  formatNumber,
  formatSearchResults,
  formatListingDetails,
  formatAnalysis,
  formatComparables,
  formatMarketOverview,
} from "../../src/services/formatter.js";
import { createListing } from "../helpers/fixtures.js";
import type {
  SearchResult,
  ListingAnalysis,
  ComparableSalesResult,
  MarketOverview,
} from "../../src/types.js";

describe("truncate", () => {
  it("returns text unchanged when under limit", () => {
    const text = "short text";
    expect(truncate(text)).toBe(text);
  });

  it("truncates text over 25000 characters with warning", () => {
    const text = "x".repeat(30000);
    const result = truncate(text);
    expect(result.length).toBeLessThanOrEqual(25000);
    expect(result).toContain("truncated");
  });

  it("returns text unchanged when exactly at limit", () => {
    const text = "x".repeat(25000);
    expect(truncate(text)).toBe(text);
  });
});

describe("formatUsd", () => {
  it("returns N/A for null", () => {
    expect(formatUsd(null)).toBe("N/A");
  });

  it("formats 0", () => {
    expect(formatUsd(0)).toBe("$0");
  });

  it("formats thousands with commas", () => {
    const result = formatUsd(1000);
    expect(result).toContain("$");
    expect(result).toContain("1");
  });

  it("formats large numbers", () => {
    const result = formatUsd(1234567);
    expect(result).toContain("$");
  });
});

describe("formatNumber", () => {
  it("returns N/A for null", () => {
    expect(formatNumber(null)).toBe("N/A");
  });

  it("formats numbers", () => {
    const result = formatNumber(10000);
    expect(result).toContain("10");
  });
});

describe("formatSearchResults", () => {
  it("returns valid JSON for json format", () => {
    const result: SearchResult = {
      meta: { page_number: 1, page_size: 30, total_results: 1, has_more: false },
      data: [createListing()],
    };
    const output = formatSearchResults(result, "json");
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("returns markdown with header for markdown format", () => {
    const result: SearchResult = {
      meta: { page_number: 1, page_size: 30, total_results: 1, has_more: false },
      data: [createListing()],
    };
    const output = formatSearchResults(result, "markdown");
    expect(output).toContain("Flippa Listings Search Results");
  });

  it("shows no listings message when empty", () => {
    const result: SearchResult = {
      meta: { page_number: 1, page_size: 30, total_results: 0, has_more: false },
      data: [],
    };
    const output = formatSearchResults(result, "markdown");
    expect(output).toContain("No listings found");
  });
});

describe("formatListingDetails", () => {
  it("returns valid JSON for json format", () => {
    const listing = createListing();
    const output = formatListingDetails(listing, "json");
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("returns markdown with title for markdown format", () => {
    const listing = createListing({ title: "My SaaS" });
    const output = formatListingDetails(listing, "markdown");
    expect(output).toContain("# My SaaS");
  });
});

describe("formatAnalysis", () => {
  const analysis: ListingAnalysis = {
    listing_id: "12345",
    title: "Test Business",
    asking_price: 50000,
    monthly_revenue: 2000,
    monthly_profit: 1500,
    annual_revenue: 24000,
    revenue_multiple: 2.08,
    profit_multiple: 2.78,
    price_per_visitor: 5,
    estimated_roi_months: 33.3,
    revenue_per_visitor: 0.2,
    verdict: "fair",
    verdict_reasoning: "Priced within typical range.",
    risk_factors: [],
  };

  it("returns valid JSON for json format", () => {
    const output = formatAnalysis(analysis, "json");
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("includes verdict in markdown", () => {
    const output = formatAnalysis(analysis, "markdown");
    expect(output).toContain("FAIR");
  });

  it("shows no risk factors message when empty", () => {
    const output = formatAnalysis(analysis, "markdown");
    expect(output).toContain("No significant risk factors identified");
  });

  it("shows risk factors when present", () => {
    const withRisks: ListingAnalysis = {
      ...analysis,
      risk_factors: ["No reported revenue", "No bids yet"],
    };
    const output = formatAnalysis(withRisks, "markdown");
    expect(output).toContain("No reported revenue");
    expect(output).toContain("No bids yet");
  });
});

describe("formatComparables", () => {
  it("includes target listing when present", () => {
    const result: ComparableSalesResult = {
      target_listing: createListing({ title: "Target Biz" }),
      comparables: [],
      avg_price: null,
      median_price: null,
      avg_revenue_multiple: null,
      price_range: null,
    };
    const output = formatComparables(result, "markdown");
    expect(output).toContain("Target Biz");
  });

  it("shows no comparables message when empty", () => {
    const result: ComparableSalesResult = {
      target_listing: null,
      comparables: [],
      avg_price: null,
      median_price: null,
      avg_revenue_multiple: null,
      price_range: null,
    };
    const output = formatComparables(result, "markdown");
    expect(output).toContain("No comparable listings found");
  });
});

describe("formatMarketOverview", () => {
  const overview: MarketOverview = {
    total_listings: 500,
    property_type_breakdown: [
      { type: "saas", count: 200, avg_price: 50000, avg_revenue: 2000 },
    ],
    price_stats: { min: 100, max: 1000000, avg: 50000, median: 25000 },
    revenue_stats: { min: 0, max: 50000, avg: 2000, median: 1000 },
    profit_stats: { min: 0, max: 30000, avg: 1500, median: 800 },
    avg_revenue_multiple: 3.5,
    verified_percentage: 0.45,
  };

  it("returns valid JSON for json format", () => {
    const output = formatMarketOverview(overview, "json");
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("includes total listings in markdown", () => {
    const output = formatMarketOverview(overview, "markdown");
    expect(output).toContain("500");
  });

  it("includes property type breakdown", () => {
    const output = formatMarketOverview(overview, "markdown");
    expect(output).toContain("saas");
    expect(output).toContain("200");
  });
});
