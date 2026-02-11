import type {
  FlippaListing,
  FlippaSearchResponse,
  FlippaListingResponse,
} from "../../src/types.js";

export function createListing(
  overrides: Partial<FlippaListing> = {}
): FlippaListing {
  return {
    type: "listing",
    id: "12345",
    title: "Test SaaS Business",
    property_name: "test-saas.com",
    property_type: "saas",
    status: "open",
    sale_method: "classified",
    current_price: 50000,
    display_price: 50000,
    buy_it_now_price: null,
    average_revenue: 2000,
    average_profit: 1500,
    revenue_per_month: 2000,
    profit_per_month: 1500,
    bid_count: 5,
    business_model: "subscription",
    industry: "technology",
    uniques_per_month: 10000,
    page_views_per_month: 30000,
    app_downloads_per_month: null,
    has_verified_revenue: true,
    has_verified_traffic: true,
    confidential: false,
    reserve_met: true,
    watching: false,
    super_seller: true,
    turnkey_listing: false,
    post_auction_negotiable: false,
    seller_location: "United States",
    summary:
      "A well-established SaaS business with consistent revenue and growing user base. " +
      "Monthly recurring revenue has been stable for the past 12 months with strong retention.",
    established_at: "2020-01-15T00:00:00+00:00",
    starts_at: "2024-01-01T00:00:00+00:00",
    ends_at: "2024-02-01T00:00:00+00:00",
    hostname: "test-saas.com",
    html_url: "https://flippa.com/12345",
    external_url: "https://test-saas.com",
    revenue_sources: "Subscriptions, one-time purchases",
    images: [{ url: "https://flippa.com/images/12345/screenshot.png" }],
    relationships: {},
    links: {},
    ...overrides,
  };
}

export function createSearchResponse(
  listings: FlippaListing[],
  overrides: {
    page_number?: number;
    page_size?: number;
    total_results?: number;
  } = {}
): FlippaSearchResponse {
  return {
    meta: {
      page_number: overrides.page_number ?? 1,
      page_size: overrides.page_size ?? 30,
      total_results: overrides.total_results ?? listings.length,
    },
    links: {},
    data: listings,
  };
}

export function createListingResponse(
  listing: FlippaListing
): FlippaListingResponse {
  return {
    data: listing,
    links: {},
  };
}
