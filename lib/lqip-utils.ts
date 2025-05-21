/**
 * Extract color information from an LQIP integer
 */
export function extractLqipColors(lqip: number) {
  // Extract the bits from the LQIP integer
  const bits = lqip + 2 ** 19

  const ca = (bits >> 18) & 0b11
  const cb = (bits >> 16) & 0b11
  const cc = (bits >> 14) & 0b11
  const cd = (bits >> 12) & 0b11
  const ce = (bits >> 10) & 0b11
  const cf = (bits >> 8) & 0b11
  const ll = (bits >> 6) & 0b11
  const aaa = (bits >> 3) & 0b111
  const bbb = bits & 0b111

  // Convert bits to OkLab values
  const l = (ll / 0b11) * 0.6 + 0.2
  const a = (aaa / 0b1000) * 0.7 - 0.35
  const b = ((bbb + 1) / 0b1000) * 0.7 - 0.35

  // Convert 2-bit values to normalized values [0-1]
  const cells = [ca / 0b11, cb / 0b11, cc / 0b11, cd / 0b11, ce / 0b11, cf / 0b11]

  return { l, a, b, cells }
}

/**
 * Convert OkLab color to RGB
 */
export function oklabToRgb(L: number, a: number, b: number) {
  // Convert OkLab to LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  // Apply inverse nonlinear transformation
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  // Convert LMS to linear RGB
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b_ = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  // Clamp and convert to 8-bit
  const clamp = (x: number) => Math.max(0, Math.min(1, x))

  return {
    r: Math.round(clamp(r) * 255),
    g: Math.round(clamp(g) * 255),
    b: Math.round(clamp(b_) * 255),
  }
}
