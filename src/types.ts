/** Flippa API listing object matching confirmed response shape */
export interface FlippaListing {
  type: string;
  id: string;
  title: string;
  property_name: string;
  property_type: string;
  status: string;
  sale_method: string;
  current_price: number | null;
  display_price: number | null;
  buy_it_now_price: number | null;
  average_revenue: number | null;
  average_profit: number | null;
  revenue_per_month: number | null;
  profit_per_month: number | null;
  bid_count: number;
  business_model: string | null;
  industry: string | null;
  uniques_per_month: number | null;
  page_views_per_month: number | null;
  app_downloads_per_month: number | null;
  has_verified_revenue: boolean;
  has_verified_traffic: boolean;
  confidential: boolean;
  reserve_met: boolean;
  watching: boolean;
  super_seller: boolean;
  turnkey_listing: boolean;
  post_auction_negotiable: boolean;
  seller_location: string | null;
  summary: string | null;
  established_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  hostname: string | null;
  html_url: string | null;
  external_url: string | null;
  revenue_sources: string | null;
  images: FlippaImage[];
  relationships: Record<string, unknown>;
  links: Record<string, unknown>;
}

export interface FlippaImage {
  url: string;
  [key: string]: unknown;
}

/** Pagination metadata from the Flippa API */
export interface FlippaMeta {
  page_number: number;
  page_size: number;
  total_results: number;
}

/** Search/list response from GET /v3/listings */
export interface FlippaSearchResponse {
  meta: FlippaMeta;
  links: Record<string, unknown>;
  data: FlippaListing[];
}

/** Single listing response from GET /v3/listings/{id} */
export interface FlippaListingResponse {
  data: FlippaListing;
  links?: Record<string, unknown>;
}

/** Analysis result from the flippa_analyze_listing computed tool */
export interface ListingAnalysis {
  listing_id: string;
  title: string;
  asking_price: number | null;
  monthly_revenue: number | null;
  monthly_profit: number | null;
  annual_revenue: number | null;
  revenue_multiple: number | null;
  profit_multiple: number | null;
  price_per_visitor: number | null;
  estimated_roi_months: number | null;
  revenue_per_visitor: number | null;
  verdict: "underpriced" | "fair" | "overpriced" | "insufficient_data";
  verdict_reasoning: string;
  risk_factors: string[];
}

/** Comparable sales result */
export interface ComparableSalesResult {
  target_listing: FlippaListing | null;
  comparables: FlippaListing[];
  avg_price: number | null;
  median_price: number | null;
  avg_revenue_multiple: number | null;
  price_range: { min: number; max: number } | null;
}

/** Market overview stats */
export interface MarketOverview {
  total_listings: number;
  property_type_breakdown: PropertyTypeStats[];
  price_stats: NumericStats | null;
  revenue_stats: NumericStats | null;
  profit_stats: NumericStats | null;
  avg_revenue_multiple: number | null;
  verified_percentage: number;
}

export interface PropertyTypeStats {
  type: string;
  count: number;
  avg_price: number | null;
  avg_revenue: number | null;
}

export interface NumericStats {
  min: number;
  max: number;
  avg: number;
  median: number;
}

/** Search tool formatted result */
export interface SearchResult {
  meta: FlippaMeta & { has_more: boolean };
  data: FlippaListing[];
}

/** Response format option */
export type ResponseFormat = "markdown" | "json";
