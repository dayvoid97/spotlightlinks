/**
 * Wilson score interval — a port of xsl-backend/src/lib/stats.ts.
 *
 * Kept in sync by hand rather than shared, because the two repos don't have a
 * common package. The reason it exists is worth repeating here: a rate with no
 * interval is a lie at small n, and the keyword matrix is almost entirely small
 * n. "100%" from two runs and "100%" from forty runs are not the same claim,
 * and rendering them identically is the failure this module exists to prevent.
 */
export function wilson(successes: number, n: number, z = 1.96): [number, number] {
  if (n === 0) return [0, 0]
  const p = successes / n
  const d = 1 + (z * z) / n
  const centre = p + (z * z) / (2 * n)
  const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))
  return [Math.max(0, (centre - spread) / d), Math.min(1, (centre + spread) / d)]
}

/**
 * Two rates are only different when their intervals do not overlap.
 * Unused by the matrix today; here so cycle-over-cycle movement can be added
 * without re-deriving the rule that a difference has to clear the noise first.
 */
export function separated(a: [number, number], b: [number, number]): 'up' | 'down' | 'flat' {
  if (a[0] > b[1]) return 'up'
  if (a[1] < b[0]) return 'down'
  return 'flat'
}

export const pct = (x: number) => Math.round(x * 100)

/**
 * How confident the sample is, independent of how good the result is. Drives
 * the "needs more runs" hint — a 60-point-wide interval is not a measurement
 * yet, however encouraging its midpoint looks.
 */
export function intervalWidth(successes: number, n: number): number {
  const [lo, hi] = wilson(successes, n)
  return hi - lo
}
