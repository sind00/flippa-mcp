import { describe, it, expect } from "vitest";
import { median, average, computeStats } from "../../src/utils/math.js";

describe("median", () => {
  it("returns null for empty array", () => {
    expect(median([])).toBeNull();
  });

  it("returns the single element for length-1 array", () => {
    expect(median([42])).toBe(42);
  });

  it("returns middle element for odd-length array", () => {
    expect(median([1, 3, 5])).toBe(3);
  });

  it("returns average of two middle elements for even-length array", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("handles unsorted input correctly", () => {
    expect(median([5, 1, 3])).toBe(3);
  });

  it("handles negative values", () => {
    expect(median([-10, -5, 0, 5, 10])).toBe(0);
  });

  it("handles all same values", () => {
    expect(median([7, 7, 7])).toBe(7);
  });
});

describe("average", () => {
  it("returns null for empty array", () => {
    expect(average([])).toBeNull();
  });

  it("returns the single element for length-1 array", () => {
    expect(average([100])).toBe(100);
  });

  it("returns correct mean for multiple elements", () => {
    expect(average([10, 20, 30])).toBe(20);
  });

  it("handles floating point values", () => {
    expect(average([1.5, 2.5])).toBe(2);
  });

  it("handles negative values", () => {
    expect(average([-10, 10])).toBe(0);
  });
});

describe("computeStats", () => {
  it("returns null for empty array", () => {
    expect(computeStats([])).toBeNull();
  });

  it("returns correct stats for single element", () => {
    const result = computeStats([100]);
    expect(result).toEqual({
      min: 100,
      max: 100,
      avg: 100,
      median: 100,
    });
  });

  it("returns correct stats for multiple elements", () => {
    const result = computeStats([10, 20, 30, 40, 50]);
    expect(result).toEqual({
      min: 10,
      max: 50,
      avg: 30,
      median: 30,
    });
  });

  it("rounds avg and median to 2 decimal places", () => {
    const result = computeStats([1, 2, 4]);
    expect(result).not.toBeNull();
    expect(result!.avg).toBe(2.33);
    expect(result!.median).toBe(2);
  });

  it("computes correct min and max", () => {
    const result = computeStats([500, 100, 300, 200, 400]);
    expect(result!.min).toBe(100);
    expect(result!.max).toBe(500);
  });
});
