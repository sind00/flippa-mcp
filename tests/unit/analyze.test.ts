import { describe, it, expect } from "vitest";
import { analyzeListing } from "../../src/tools/analyze.js";
import { createListing } from "../helpers/fixtures.js";

describe("analyzeListing", () => {
  describe("verdict logic", () => {
    it("returns insufficient_data when revenue_per_month is null", () => {
      const listing = createListing({ revenue_per_month: null });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("insufficient_data");
    });

    it("returns insufficient_data when revenue_per_month is 0", () => {
      const listing = createListing({ revenue_per_month: 0 });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("insufficient_data");
    });

    it("returns insufficient_data when current_price is null", () => {
      const listing = createListing({ current_price: null });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("insufficient_data");
    });

    it("returns underpriced when revenue multiple < 2x", () => {
      // price=10000, revenue/mo=1000, annual=12000, multiple=0.83x
      const listing = createListing({
        current_price: 10000,
        revenue_per_month: 1000,
      });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("underpriced");
    });

    it("returns fair when revenue multiple is exactly 2.0x", () => {
      // price=24000, revenue/mo=1000, annual=12000, multiple=2.0x
      const listing = createListing({
        current_price: 24000,
        revenue_per_month: 1000,
      });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("fair");
    });

    it("returns fair when revenue multiple is 3.0x", () => {
      const listing = createListing({
        current_price: 36000,
        revenue_per_month: 1000,
      });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("fair");
    });

    it("returns fair when revenue multiple is exactly 4.0x", () => {
      // price=48000, revenue/mo=1000, annual=12000, multiple=4.0x
      const listing = createListing({
        current_price: 48000,
        revenue_per_month: 1000,
      });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("fair");
    });

    it("returns overpriced when revenue multiple > 4x", () => {
      // price=100000, revenue/mo=1000, annual=12000, multiple=8.33x
      const listing = createListing({
        current_price: 100000,
        revenue_per_month: 1000,
      });
      const result = analyzeListing(listing);
      expect(result.verdict).toBe("overpriced");
    });
  });

  describe("metric computation", () => {
    it("computes annual_revenue correctly", () => {
      const listing = createListing({ revenue_per_month: 5000 });
      const result = analyzeListing(listing);
      expect(result.annual_revenue).toBe(60000);
    });

    it("returns null annual_revenue when revenue is null", () => {
      const listing = createListing({ revenue_per_month: null });
      const result = analyzeListing(listing);
      expect(result.annual_revenue).toBeNull();
    });

    it("returns null annual_revenue when revenue is 0", () => {
      const listing = createListing({ revenue_per_month: 0 });
      const result = analyzeListing(listing);
      expect(result.annual_revenue).toBeNull();
    });

    it("computes revenue_multiple correctly", () => {
      const listing = createListing({
        current_price: 36000,
        revenue_per_month: 1000,
      });
      const result = analyzeListing(listing);
      expect(result.revenue_multiple).toBe(3);
    });

    it("computes profit_multiple correctly", () => {
      const listing = createListing({
        current_price: 36000,
        profit_per_month: 1000,
      });
      const result = analyzeListing(listing);
      expect(result.profit_multiple).toBe(3);
    });

    it("returns null profit_multiple when profit is null", () => {
      const listing = createListing({ profit_per_month: null });
      const result = analyzeListing(listing);
      expect(result.profit_multiple).toBeNull();
    });

    it("returns null profit_multiple when profit is 0", () => {
      const listing = createListing({ profit_per_month: 0 });
      const result = analyzeListing(listing);
      expect(result.profit_multiple).toBeNull();
    });

    it("computes price_per_visitor correctly", () => {
      const listing = createListing({
        current_price: 50000,
        uniques_per_month: 10000,
      });
      const result = analyzeListing(listing);
      expect(result.price_per_visitor).toBe(5);
    });

    it("returns null price_per_visitor when uniques is null", () => {
      const listing = createListing({ uniques_per_month: null });
      const result = analyzeListing(listing);
      expect(result.price_per_visitor).toBeNull();
    });

    it("returns null price_per_visitor when uniques is 0", () => {
      const listing = createListing({ uniques_per_month: 0 });
      const result = analyzeListing(listing);
      expect(result.price_per_visitor).toBeNull();
    });

    it("computes estimated_roi_months correctly", () => {
      const listing = createListing({
        current_price: 30000,
        profit_per_month: 1500,
      });
      const result = analyzeListing(listing);
      expect(result.estimated_roi_months).toBe(20);
    });

    it("returns null estimated_roi_months when profit is 0", () => {
      const listing = createListing({ profit_per_month: 0 });
      const result = analyzeListing(listing);
      expect(result.estimated_roi_months).toBeNull();
    });

    it("computes revenue_per_visitor correctly", () => {
      const listing = createListing({
        revenue_per_month: 2000,
        uniques_per_month: 10000,
      });
      const result = analyzeListing(listing);
      expect(result.revenue_per_visitor).toBe(0.2);
    });

    it("returns null revenue_per_visitor when uniques is null", () => {
      const listing = createListing({ uniques_per_month: null });
      const result = analyzeListing(listing);
      expect(result.revenue_per_visitor).toBeNull();
    });

    it("never produces Infinity or NaN", () => {
      const listing = createListing({
        current_price: 50000,
        revenue_per_month: 0,
        profit_per_month: 0,
        uniques_per_month: 0,
      });
      const result = analyzeListing(listing);
      expect(result.revenue_multiple).toBeNull();
      expect(result.profit_multiple).toBeNull();
      expect(result.price_per_visitor).toBeNull();
      expect(result.estimated_roi_months).toBeNull();
      expect(result.revenue_per_visitor).toBeNull();
    });
  });

  describe("risk factors", () => {
    it("flags no reported revenue when revenue is null", () => {
      const listing = createListing({ revenue_per_month: null });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain("No reported revenue");
    });

    it("flags no reported revenue when revenue is 0", () => {
      const listing = createListing({ revenue_per_month: 0 });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain("No reported revenue");
    });

    it("flags no reported profit when profit is null", () => {
      const listing = createListing({ profit_per_month: null });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain("No reported profit");
    });

    it("flags no traffic data when uniques is null", () => {
      const listing = createListing({ uniques_per_month: null });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain("No traffic data available");
    });

    it("flags very low traffic when uniques < 1000", () => {
      const listing = createListing({ uniques_per_month: 500 });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain("Very low traffic");
    });

    it("does not flag low traffic when uniques is exactly 1000", () => {
      const listing = createListing({ uniques_per_month: 1000 });
      const result = analyzeListing(listing);
      expect(result.risk_factors).not.toContain("Very low traffic");
    });

    it("flags unverified revenue", () => {
      const listing = createListing({ has_verified_revenue: false });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain(
        "Revenue not verified by Flippa"
      );
    });

    it("flags unverified traffic", () => {
      const listing = createListing({ has_verified_traffic: false });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain(
        "Traffic not verified by Flippa"
      );
    });

    it("flags non-super seller", () => {
      const listing = createListing({ super_seller: false });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain(
        "Seller is not a verified Super Seller"
      );
    });

    it("flags no bids", () => {
      const listing = createListing({ bid_count: 0 });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain("No bids yet");
    });

    it("flags no images when images is empty", () => {
      const listing = createListing({ images: [] });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain("No images provided");
    });

    it("flags short description when summary < 100 chars", () => {
      const listing = createListing({ summary: "Short description." });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain(
        "Very short listing description"
      );
    });

    it("does not flag short description when summary is null", () => {
      const listing = createListing({ summary: null });
      const result = analyzeListing(listing);
      expect(result.risk_factors).not.toContain(
        "Very short listing description"
      );
    });

    it("flags confidential listing", () => {
      const listing = createListing({ confidential: true });
      const result = analyzeListing(listing);
      expect(result.risk_factors).toContain(
        "Confidential listing - limited data"
      );
    });

    it("returns empty risk factors for a perfect listing", () => {
      const listing = createListing();
      const result = analyzeListing(listing);
      expect(result.risk_factors).toEqual([]);
    });
  });

  describe("output shape", () => {
    it("includes all required fields", () => {
      const listing = createListing();
      const result = analyzeListing(listing);
      expect(result).toHaveProperty("listing_id");
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("asking_price");
      expect(result).toHaveProperty("monthly_revenue");
      expect(result).toHaveProperty("monthly_profit");
      expect(result).toHaveProperty("annual_revenue");
      expect(result).toHaveProperty("revenue_multiple");
      expect(result).toHaveProperty("profit_multiple");
      expect(result).toHaveProperty("price_per_visitor");
      expect(result).toHaveProperty("estimated_roi_months");
      expect(result).toHaveProperty("revenue_per_visitor");
      expect(result).toHaveProperty("verdict");
      expect(result).toHaveProperty("verdict_reasoning");
      expect(result).toHaveProperty("risk_factors");
    });

    it("maps listing fields correctly", () => {
      const listing = createListing({
        id: "99999",
        title: "My Business",
        current_price: 75000,
        revenue_per_month: 3000,
        profit_per_month: 2000,
      });
      const result = analyzeListing(listing);
      expect(result.listing_id).toBe("99999");
      expect(result.title).toBe("My Business");
      expect(result.asking_price).toBe(75000);
      expect(result.monthly_revenue).toBe(3000);
      expect(result.monthly_profit).toBe(2000);
    });
  });
});
