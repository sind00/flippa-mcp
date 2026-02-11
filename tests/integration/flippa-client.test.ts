import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FlippaClient, FlippaApiError } from "../../src/services/flippa-client.js";

// Use vi.hoisted so the mocks are available when vi.mock factory runs (hoisted)
const { mockGet, mockCreate } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockCreate = vi.fn(() => ({ get: mockGet }));
  return { mockGet, mockCreate };
});

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: mockCreate,
    },
  };
});

describe("FlippaClient", () => {
  let client: FlippaClient;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGet.mockReset();
    client = new FlippaClient();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env["FLIPPA_API_TOKEN"];
    delete process.env["FLIPPA_BASE_URL"];
  });

  describe("successful requests", () => {
    it("returns data on first successful attempt", async () => {
      const mockData = { data: [{ id: "1" }], meta: { total_results: 1 } };
      mockGet.mockResolvedValueOnce({ data: mockData });

      const result = await client.searchListings({ status: "open" });

      expect(result).toEqual(mockData);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it("passes correct query params to searchListings", async () => {
      const mockData = { data: [], meta: { total_results: 0 } };
      mockGet.mockResolvedValueOnce({ data: mockData });

      await client.searchListings({
        page_number: 2,
        page_size: 50,
        property_type: "saas",
        status: "open",
        sale_method: "auction",
        sort_alias: "highest_price",
      });

      expect(mockGet).toHaveBeenCalledWith("/listings", {
        params: {
          page_number: 2,
          page_size: 50,
          "filter[property_type]": "saas",
          "filter[status]": "open",
          "filter[sale_method]": "auction",
          sort_alias: "highest_price",
        },
      });
    });

    it("strips undefined params from query", async () => {
      const mockData = { data: [], meta: {} };
      mockGet.mockResolvedValueOnce({ data: mockData });

      await client.searchListings({ status: "open" });

      const calledParams = mockGet.mock.calls[0][1].params;
      for (const value of Object.values(calledParams)) {
        expect(value).not.toBeUndefined();
      }
    });

    it("calls correct path for getListing", async () => {
      const mockData = { data: { id: "99999" } };
      mockGet.mockResolvedValueOnce({ data: mockData });

      await client.getListing("99999");

      expect(mockGet).toHaveBeenCalledWith("/listings/99999", { params: {} });
    });
  });

  describe("retry logic", () => {
    it("retries on 5xx errors up to maxRetries", { timeout: 15000 }, async () => {
      const { AxiosError } = await import("axios");
      const axiosError = new AxiosError(
        "Server Error",
        undefined,
        undefined,
        undefined,
        {
          status: 500,
          statusText: "Internal Server Error",
          headers: {},
          data: {},
          config: {} as any,
        } as any
      );

      mockGet.mockRejectedValue(axiosError);

      await expect(client.searchListings({})).rejects.toThrow(FlippaApiError);

      // Initial attempt + 3 retries = 4 total calls
      expect(mockGet).toHaveBeenCalledTimes(4);
    });

    it("succeeds after transient failure", async () => {
      const { AxiosError } = await import("axios");
      const axiosError = new AxiosError(
        "Bad Gateway",
        undefined,
        undefined,
        undefined,
        {
          status: 502,
          statusText: "Bad Gateway",
          headers: {},
          data: {},
          config: {} as any,
        } as any
      );

      const mockData = { data: [{ id: "1" }], meta: { total_results: 1 } };

      mockGet
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce({ data: mockData });

      const result = await client.searchListings({});
      expect(result).toEqual(mockData);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe("4xx error handling", () => {
    it("does not retry on 404", async () => {
      const { AxiosError } = await import("axios");
      const axiosError = new AxiosError(
        "Not Found",
        undefined,
        undefined,
        undefined,
        {
          status: 404,
          statusText: "Not Found",
          headers: {},
          data: {},
          config: {} as any,
        } as any
      );

      mockGet.mockRejectedValueOnce(axiosError);

      await expect(client.getListing("nonexistent")).rejects.toThrow(
        FlippaApiError
      );
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it("does not retry on 400", async () => {
      const { AxiosError } = await import("axios");
      const axiosError = new AxiosError(
        "Bad Request",
        undefined,
        undefined,
        undefined,
        {
          status: 400,
          statusText: "Bad Request",
          headers: {},
          data: {},
          config: {} as any,
        } as any
      );

      mockGet.mockRejectedValueOnce(axiosError);

      await expect(client.searchListings({})).rejects.toThrow(FlippaApiError);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it("includes status code in FlippaApiError", async () => {
      const { AxiosError } = await import("axios");
      const axiosError = new AxiosError(
        "Not Found",
        undefined,
        undefined,
        undefined,
        {
          status: 404,
          statusText: "Not Found",
          headers: {},
          data: {},
          config: {} as any,
        } as any
      );

      mockGet.mockRejectedValueOnce(axiosError);

      try {
        await client.getListing("bad-id");
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(FlippaApiError);
        expect((err as FlippaApiError).statusCode).toBe(404);
      }
    });
  });

  describe("auth header", () => {
    it("sets Authorization header when FLIPPA_API_TOKEN is set", () => {
      process.env["FLIPPA_API_TOKEN"] = "test-token-123";
      const clientWithAuth = new FlippaClient();

      const lastCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
      expect(lastCall.headers["Authorization"]).toBe("Bearer test-token-123");
    });

    it("does not set Authorization header without FLIPPA_API_TOKEN", () => {
      delete process.env["FLIPPA_API_TOKEN"];
      const clientNoAuth = new FlippaClient();

      const lastCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
      expect(lastCall.headers["Authorization"]).toBeUndefined();
    });
  });

  describe("custom base URL", () => {
    it("uses FLIPPA_BASE_URL env var when set", () => {
      process.env["FLIPPA_BASE_URL"] = "https://custom-api.example.com/v3";
      const customClient = new FlippaClient();

      const lastCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
      expect(lastCall.baseURL).toBe("https://custom-api.example.com/v3");
    });

    it("defaults to Flippa base URL", () => {
      delete process.env["FLIPPA_BASE_URL"];
      const defaultClient = new FlippaClient();

      const lastCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
      expect(lastCall.baseURL).toBe("https://flippa.com/v3");
    });
  });

  describe("FlippaApiError", () => {
    it("has correct name and properties", () => {
      const err = new FlippaApiError("Not found", 404);
      expect(err.name).toBe("FlippaApiError");
      expect(err.message).toBe("Not found");
      expect(err.statusCode).toBe(404);
      expect(err).toBeInstanceOf(Error);
    });

    it("handles null status code", () => {
      const err = new FlippaApiError("Network error", null);
      expect(err.statusCode).toBeNull();
    });
  });
});
