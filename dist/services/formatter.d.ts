import type { FlippaListing, SearchResult, ListingAnalysis, ComparableSalesResult, MarketOverview, ResponseFormat } from "../types.js";
/** Truncate a string to the character limit with a message */
export declare function truncate(text: string): string;
/** Format a dollar amount */
export declare function formatUsd(value: number | null): string;
/** Format a number with commas */
export declare function formatNumber(value: number | null): string;
/** Format search results */
export declare function formatSearchResults(result: SearchResult, format: ResponseFormat): string;
/** Format a single listing detail */
export declare function formatListingDetails(listing: FlippaListing, format: ResponseFormat): string;
/** Format listing analysis */
export declare function formatAnalysis(analysis: ListingAnalysis, format: ResponseFormat): string;
/** Format comparable sales result */
export declare function formatComparables(result: ComparableSalesResult, format: ResponseFormat): string;
/** Format market overview */
export declare function formatMarketOverview(overview: MarketOverview, format: ResponseFormat): string;
//# sourceMappingURL=formatter.d.ts.map