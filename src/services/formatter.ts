import { CHARACTER_LIMIT } from "../constants.js";
import type {
  FlippaListing,
  SearchResult,
  ListingAnalysis,
  ComparableSalesResult,
  MarketOverview,
  ResponseFormat,
  NumericStats,
} from "../types.js";

/** Truncate a string to the character limit with a message */
export function truncate(text: string): string {
  if (text.length <= CHARACTER_LIMIT) {
    return text;
  }
  const truncated = text.slice(0, CHARACTER_LIMIT - 100);
  return truncated + "\n\n---\n⚠️ Response truncated at 25,000 characters. Use page_size or filters to narrow results.";
}

/** Format a dollar amount */
export function formatUsd(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  return `$${value.toLocaleString("en-US")}`;
}

/** Format a number with commas */
export function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("en-US");
}

/** Format a listing as a markdown summary line */
function formatListingSummary(listing: FlippaListing, index: number): string {
  const lines: string[] = [];
  lines.push(`### ${index}. ${listing.title}`);
  lines.push(`- **ID:** ${listing.id} | **Type:** ${listing.property_type} | **Status:** ${listing.status}`);
  lines.push(`- **Price:** ${formatUsd(listing.current_price)} | **Sale Method:** ${listing.sale_method}`);
  lines.push(`- **Revenue/mo:** ${formatUsd(listing.revenue_per_month)} | **Profit/mo:** ${formatUsd(listing.profit_per_month)}`);
  lines.push(`- **Bids:** ${listing.bid_count} | **Verified Revenue:** ${listing.has_verified_revenue ? "Yes" : "No"} | **Verified Traffic:** ${listing.has_verified_traffic ? "Yes" : "No"}`);

  if (listing.uniques_per_month !== null) {
    lines.push(`- **Uniques/mo:** ${formatNumber(listing.uniques_per_month)}`);
  }

  if (listing.html_url) {
    lines.push(`- **URL:** ${listing.html_url}`);
  }

  return lines.join("\n");
}

/** Format a full listing detail as markdown */
function formatListingDetail(listing: FlippaListing): string {
  const lines: string[] = [];
  lines.push(`# ${listing.title}`);
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Listing ID | ${listing.id} |`);
  lines.push(`| Property Type | ${listing.property_type} |`);
  lines.push(`| Status | ${listing.status} |`);
  lines.push(`| Sale Method | ${listing.sale_method} |`);
  lines.push(`| Current Price | ${formatUsd(listing.current_price)} |`);
  lines.push(`| Display Price | ${formatUsd(listing.display_price)} |`);
  lines.push(`| Buy It Now Price | ${formatUsd(listing.buy_it_now_price)} |`);
  lines.push(`| Revenue/mo | ${formatUsd(listing.revenue_per_month)} |`);
  lines.push(`| Profit/mo | ${formatUsd(listing.profit_per_month)} |`);
  lines.push(`| Avg Revenue | ${formatUsd(listing.average_revenue)} |`);
  lines.push(`| Avg Profit | ${formatUsd(listing.average_profit)} |`);
  lines.push(`| Bid Count | ${listing.bid_count} |`);
  lines.push(`| Industry | ${listing.industry ?? "N/A"} |`);
  lines.push(`| Business Model | ${listing.business_model ?? "N/A"} |`);
  lines.push(`| Uniques/mo | ${formatNumber(listing.uniques_per_month)} |`);
  lines.push(`| Page Views/mo | ${formatNumber(listing.page_views_per_month)} |`);
  lines.push(`| App Downloads/mo | ${formatNumber(listing.app_downloads_per_month)} |`);
  lines.push(`| Verified Revenue | ${listing.has_verified_revenue ? "Yes" : "No"} |`);
  lines.push(`| Verified Traffic | ${listing.has_verified_traffic ? "Yes" : "No"} |`);
  lines.push(`| Super Seller | ${listing.super_seller ? "Yes" : "No"} |`);
  lines.push(`| Confidential | ${listing.confidential ? "Yes" : "No"} |`);
  lines.push(`| Reserve Met | ${listing.reserve_met ? "Yes" : "No"} |`);
  lines.push(`| Seller Location | ${listing.seller_location ?? "N/A"} |`);
  lines.push(`| Established | ${listing.established_at ?? "N/A"} |`);
  lines.push(`| Starts | ${listing.starts_at ?? "N/A"} |`);
  lines.push(`| Ends | ${listing.ends_at ?? "N/A"} |`);
  lines.push(`| Hostname | ${listing.hostname ?? "N/A"} |`);
  lines.push(`| Listing URL | ${listing.html_url ?? "N/A"} |`);
  lines.push(`| External URL | ${listing.external_url ?? "N/A"} |`);

  if (listing.summary) {
    lines.push("");
    lines.push("## Description");
    lines.push(listing.summary);
  }

  if (listing.revenue_sources) {
    lines.push("");
    lines.push("## Revenue Sources");
    lines.push(listing.revenue_sources);
  }

  return lines.join("\n");
}

/** Format search results */
export function formatSearchResults(
  result: SearchResult,
  format: ResponseFormat
): string {
  if (format === "json") {
    return truncate(JSON.stringify(result, null, 2));
  }

  const lines: string[] = [];
  lines.push(`# Flippa Listings Search Results`);
  lines.push("");
  lines.push(`**Page ${result.meta.page_number}** | **${result.meta.total_results} total results** | **${result.data.length} shown** | **Has more:** ${result.meta.has_more ? "Yes" : "No"}`);
  lines.push("");

  if (result.data.length === 0) {
    lines.push("No listings found matching your criteria. Try broadening your search filters.");
  } else {
    result.data.forEach((listing, i) => {
      lines.push(formatListingSummary(listing, i + 1));
      lines.push("");
    });
  }

  return truncate(lines.join("\n"));
}

/** Format a single listing detail */
export function formatListingDetails(
  listing: FlippaListing,
  format: ResponseFormat
): string {
  if (format === "json") {
    return truncate(JSON.stringify(listing, null, 2));
  }

  return truncate(formatListingDetail(listing));
}

/** Format listing analysis */
export function formatAnalysis(
  analysis: ListingAnalysis,
  format: ResponseFormat
): string {
  if (format === "json") {
    return truncate(JSON.stringify(analysis, null, 2));
  }

  const lines: string[] = [];
  lines.push(`# Listing Analysis: ${analysis.title}`);
  lines.push("");
  lines.push(`## Financial Summary`);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Asking Price | ${formatUsd(analysis.asking_price)} |`);
  lines.push(`| Monthly Revenue | ${formatUsd(analysis.monthly_revenue)} |`);
  lines.push(`| Monthly Profit | ${formatUsd(analysis.monthly_profit)} |`);
  lines.push(`| Annual Revenue | ${formatUsd(analysis.annual_revenue)} |`);
  lines.push(`| Revenue Multiple | ${analysis.revenue_multiple !== null ? `${analysis.revenue_multiple.toFixed(2)}x` : "N/A"} |`);
  lines.push(`| Profit Multiple | ${analysis.profit_multiple !== null ? `${analysis.profit_multiple.toFixed(2)}x` : "N/A"} |`);
  lines.push(`| Price per Visitor | ${analysis.price_per_visitor !== null ? `$${analysis.price_per_visitor.toFixed(2)}` : "N/A"} |`);
  lines.push(`| Est. ROI (months) | ${analysis.estimated_roi_months !== null ? analysis.estimated_roi_months.toFixed(1) : "N/A"} |`);
  lines.push(`| Revenue per Visitor | ${analysis.revenue_per_visitor !== null ? `$${analysis.revenue_per_visitor.toFixed(4)}` : "N/A"} |`);
  lines.push("");
  lines.push(`## Verdict: **${analysis.verdict.toUpperCase()}**`);
  lines.push(analysis.verdict_reasoning);
  lines.push("");

  if (analysis.risk_factors.length > 0) {
    lines.push(`## Risk Factors`);
    analysis.risk_factors.forEach((risk) => {
      lines.push(`- ⚠️ ${risk}`);
    });
  } else {
    lines.push(`## Risk Factors`);
    lines.push("No significant risk factors identified.");
  }

  return truncate(lines.join("\n"));
}

/** Format comparable sales result */
export function formatComparables(
  result: ComparableSalesResult,
  format: ResponseFormat
): string {
  if (format === "json") {
    return truncate(JSON.stringify(result, null, 2));
  }

  const lines: string[] = [];
  lines.push(`# Comparable Sales Analysis`);
  lines.push("");

  if (result.target_listing) {
    lines.push(`## Target Listing`);
    lines.push(`- **${result.target_listing.title}** (ID: ${result.target_listing.id})`);
    lines.push(`- Price: ${formatUsd(result.target_listing.current_price)} | Revenue/mo: ${formatUsd(result.target_listing.revenue_per_month)}`);
    lines.push("");
  }

  lines.push(`## Market Comparison`);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Avg Price | ${formatUsd(result.avg_price)} |`);
  lines.push(`| Median Price | ${formatUsd(result.median_price)} |`);
  lines.push(`| Avg Revenue Multiple | ${result.avg_revenue_multiple !== null ? `${result.avg_revenue_multiple.toFixed(2)}x` : "N/A"} |`);
  if (result.price_range) {
    lines.push(`| Price Range | ${formatUsd(result.price_range.min)} - ${formatUsd(result.price_range.max)} |`);
  }
  lines.push("");

  lines.push(`## Comparable Listings (${result.comparables.length})`);
  lines.push("");

  if (result.comparables.length === 0) {
    lines.push("No comparable listings found. Try broadening the search criteria.");
  } else {
    result.comparables.forEach((listing, i) => {
      lines.push(formatListingSummary(listing, i + 1));
      lines.push("");
    });
  }

  return truncate(lines.join("\n"));
}

/** Format market overview */
export function formatMarketOverview(
  overview: MarketOverview,
  format: ResponseFormat
): string {
  if (format === "json") {
    return truncate(JSON.stringify(overview, null, 2));
  }

  const lines: string[] = [];
  lines.push(`# Flippa Market Overview`);
  lines.push("");
  lines.push(`**Total Active Listings:** ${formatNumber(overview.total_listings)}`);
  lines.push(`**Verified Revenue Rate:** ${(overview.verified_percentage * 100).toFixed(1)}%`);
  if (overview.avg_revenue_multiple !== null) {
    lines.push(`**Avg Revenue Multiple:** ${overview.avg_revenue_multiple.toFixed(2)}x`);
  }
  lines.push("");

  if (overview.property_type_breakdown.length > 0) {
    lines.push(`## Listings by Type`);
    lines.push(`| Type | Count | Avg Price | Avg Revenue/mo |`);
    lines.push(`|------|-------|-----------|----------------|`);
    overview.property_type_breakdown.forEach((entry) => {
      lines.push(`| ${entry.type} | ${entry.count} | ${formatUsd(entry.avg_price)} | ${formatUsd(entry.avg_revenue)} |`);
    });
    lines.push("");
  }

  const formatStats = (label: string, stats: NumericStats | null): void => {
    if (!stats) return;
    lines.push(`## ${label}`);
    lines.push(`| Stat | Value |`);
    lines.push(`|------|-------|`);
    lines.push(`| Min | ${formatUsd(stats.min)} |`);
    lines.push(`| Max | ${formatUsd(stats.max)} |`);
    lines.push(`| Average | ${formatUsd(stats.avg)} |`);
    lines.push(`| Median | ${formatUsd(stats.median)} |`);
    lines.push("");
  };

  formatStats("Price Statistics", overview.price_stats);
  formatStats("Revenue Statistics (Monthly)", overview.revenue_stats);
  formatStats("Profit Statistics (Monthly)", overview.profit_stats);

  return truncate(lines.join("\n"));
}
