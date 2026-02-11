/** Compute median of a numeric array. Returns null for empty arrays. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

/** Compute average of a numeric array. Returns null for empty arrays. */
export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Compute numeric stats (min, max, avg, median) from an array. Returns null for empty arrays. */
export function computeStats(values: number[]): {
  min: number;
  max: number;
  avg: number;
  median: number;
} | null {
  if (values.length === 0) return null;
  const avg = average(values) as number;
  const med = median(values) as number;
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Math.round(avg * 100) / 100,
    median: Math.round(med * 100) / 100,
  };
}
