import axios, { AxiosInstance, AxiosError } from "axios";
import {
  DEFAULT_BASE_URL,
  MAX_REQUESTS_PER_MINUTE,
  REQUEST_TIMEOUT_MS,
  RETRY_CONFIG,
} from "../constants.js";
import type {
  FlippaSearchResponse,
  FlippaListingResponse,
} from "../types.js";

/** Rate limiter tracking request timestamps */
class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0]!;
      const waitMs = this.windowMs - (now - oldest) + 10;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    this.timestamps.push(Date.now());
  }
}

/** Shared Flippa API HTTP client with retry and rate limiting */
export class FlippaClient {
  private readonly client: AxiosInstance;
  private readonly rateLimiter: RateLimiter;

  constructor() {
    const baseURL = process.env["FLIPPA_BASE_URL"] || DEFAULT_BASE_URL;
    const apiToken = process.env["FLIPPA_API_TOKEN"];

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "flippa-mcp-server/1.0.0",
    };

    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    this.client = axios.create({
      baseURL,
      timeout: REQUEST_TIMEOUT_MS,
      headers,
    });

    this.rateLimiter = new RateLimiter(MAX_REQUESTS_PER_MINUTE, 60_000);
  }

  /** Execute a GET request with retry and rate limiting */
  private async get<T>(
    path: string,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    await this.rateLimiter.waitForSlot();

    const cleanParams: Record<string, string | number> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          cleanParams[key] = value;
        }
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const response = await this.client.get<T>(path, {
          params: cleanParams,
        });
        return response.data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof AxiosError) {
          // Don't retry on client errors (4xx) except 429
          if (
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500 &&
            error.response.status !== 429
          ) {
            throw new FlippaApiError(
              `Flippa API returned ${error.response.status}: ${error.response.statusText}. ` +
                `Check that the listing ID or parameters are correct.`,
              error.response.status
            );
          }

          // Rate limited - wait longer
          if (error.response?.status === 429) {
            const retryAfter = Number(error.response.headers["retry-after"]) || 30;
            if (attempt < RETRY_CONFIG.maxRetries) {
              await new Promise((resolve) =>
                setTimeout(resolve, retryAfter * 1000)
              );
              continue;
            }
          }
        }

        // Exponential backoff for retryable errors
        if (attempt < RETRY_CONFIG.maxRetries) {
          const delay =
            RETRY_CONFIG.baseDelayMs *
            Math.pow(RETRY_CONFIG.multiplier, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new FlippaApiError(
      `Failed to reach Flippa API after ${RETRY_CONFIG.maxRetries + 1} attempts. ` +
        `Last error: ${lastError?.message ?? "Unknown error"}. ` +
        `Try again in a few moments.`,
      null
    );
  }

  /** Search listings with query parameters */
  async searchListings(params: {
    page_number?: number;
    page_size?: number;
    property_type?: string;
    status?: string;
    sale_method?: string;
    sort_alias?: string;
  }): Promise<FlippaSearchResponse> {
    const queryParams: Record<string, string | number | undefined> = {
      page_number: params.page_number,
      page_size: params.page_size,
      "filter[status]": params.status,
      "filter[sale_method]": params.sale_method,
      sort_alias: params.sort_alias,
    };

    if (params.property_type) {
      queryParams["filter[property_type]"] = params.property_type;
    }

    return this.get<FlippaSearchResponse>("/listings", queryParams);
  }

  /** Get a single listing by ID */
  async getListing(listingId: string): Promise<FlippaListingResponse> {
    return this.get<FlippaListingResponse>(`/listings/${listingId}`);
  }
}

/** Custom error class for Flippa API errors */
export class FlippaApiError extends Error {
  public readonly statusCode: number | null;

  constructor(message: string, statusCode: number | null) {
    super(message);
    this.name = "FlippaApiError";
    this.statusCode = statusCode;
  }
}

/** Singleton client instance */
let clientInstance: FlippaClient | null = null;

export function getFlippaClient(): FlippaClient {
  if (!clientInstance) {
    clientInstance = new FlippaClient();
  }
  return clientInstance;
}
