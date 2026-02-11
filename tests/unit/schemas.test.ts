import { describe, it, expect } from "vitest";
import {
  searchListingsSchema,
  getListingSchema,
  analyzeListingSchema,
  comparableSalesSchema,
  marketOverviewSchema,
} from "../../src/schemas/listing.js";

describe("searchListingsSchema", () => {
  it("accepts empty input with defaults", () => {
    const result = searchListingsSchema.parse({});
    expect(result.status).toBe("open");
    expect(result.page_number).toBe(1);
    expect(result.page_size).toBe(30);
    expect(result.response_format).toBe("markdown");
  });

  it("accepts full valid input", () => {
    const input = {
      property_type: "saas" as const,
      status: "closed" as const,
      sale_method: "auction" as const,
      sort_alias: "highest_price" as const,
      page_number: 2,
      page_size: 50,
      response_format: "json" as const,
    };
    const result = searchListingsSchema.parse(input);
    expect(result.property_type).toBe("saas");
    expect(result.status).toBe("closed");
    expect(result.page_size).toBe(50);
  });

  it("rejects invalid property_type", () => {
    expect(() =>
      searchListingsSchema.parse({ property_type: "invalid_type" })
    ).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() =>
      searchListingsSchema.parse({ status: "pending" })
    ).toThrow();
  });

  it("rejects page_size over 100", () => {
    expect(() =>
      searchListingsSchema.parse({ page_size: 101 })
    ).toThrow();
  });

  it("rejects page_size less than 1", () => {
    expect(() =>
      searchListingsSchema.parse({ page_size: 0 })
    ).toThrow();
  });

  it("rejects page_number less than 1", () => {
    expect(() =>
      searchListingsSchema.parse({ page_number: 0 })
    ).toThrow();
  });

  it("rejects non-integer page_number", () => {
    expect(() =>
      searchListingsSchema.parse({ page_number: 1.5 })
    ).toThrow();
  });

  it("rejects extra fields due to strict()", () => {
    expect(() =>
      searchListingsSchema.parse({ unknown_field: "test" })
    ).toThrow();
  });
});

describe("getListingSchema", () => {
  it("accepts valid listing_id", () => {
    const result = getListingSchema.parse({ listing_id: "12345" });
    expect(result.listing_id).toBe("12345");
    expect(result.response_format).toBe("markdown");
  });

  it("rejects missing listing_id", () => {
    expect(() => getListingSchema.parse({})).toThrow();
  });

  it("rejects empty listing_id", () => {
    expect(() =>
      getListingSchema.parse({ listing_id: "" })
    ).toThrow();
  });

  it("rejects extra fields", () => {
    expect(() =>
      getListingSchema.parse({ listing_id: "12345", extra: "field" })
    ).toThrow();
  });
});

describe("analyzeListingSchema", () => {
  it("accepts valid listing_id", () => {
    const result = analyzeListingSchema.parse({ listing_id: "12345" });
    expect(result.listing_id).toBe("12345");
  });

  it("rejects missing listing_id", () => {
    expect(() => analyzeListingSchema.parse({})).toThrow();
  });
});

describe("comparableSalesSchema", () => {
  it("accepts empty input (both optional)", () => {
    const result = comparableSalesSchema.parse({});
    expect(result.page_size).toBe(10);
    expect(result.response_format).toBe("markdown");
  });

  it("accepts listing_id alone", () => {
    const result = comparableSalesSchema.parse({ listing_id: "12345" });
    expect(result.listing_id).toBe("12345");
  });

  it("accepts property_type alone", () => {
    const result = comparableSalesSchema.parse({ property_type: "saas" });
    expect(result.property_type).toBe("saas");
  });

  it("rejects page_size over 20", () => {
    expect(() =>
      comparableSalesSchema.parse({ page_size: 21 })
    ).toThrow();
  });

  it("rejects extra fields", () => {
    expect(() =>
      comparableSalesSchema.parse({ extra: "field" })
    ).toThrow();
  });
});

describe("marketOverviewSchema", () => {
  it("accepts empty input", () => {
    const result = marketOverviewSchema.parse({});
    expect(result.response_format).toBe("markdown");
  });

  it("accepts valid property_type", () => {
    const result = marketOverviewSchema.parse({ property_type: "website" });
    expect(result.property_type).toBe("website");
  });

  it("rejects invalid property_type", () => {
    expect(() =>
      marketOverviewSchema.parse({ property_type: "invalid" })
    ).toThrow();
  });

  it("rejects extra fields", () => {
    expect(() =>
      marketOverviewSchema.parse({ extra: "field" })
    ).toThrow();
  });
});
