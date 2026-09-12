export const SEAM_MULTIPLIER: Record<string, number> = {
  "پرچین": 1,
  "پیلی‌دار": 1.08,
  "حلقه‌ای": 1.04,
};
export const BASE_WIDTH_CM = 200;
export const SEAM_TYPES = Object.keys(SEAM_MULTIPLIER) as Array<
  keyof typeof SEAM_MULTIPLIER
>;

export function computeUnitPrice(
  basePrice: number,
  widthCm: number,
  seamType: string
) {
  const widthFactor = widthCm / BASE_WIDTH_CM;
  const seamFactor = SEAM_MULTIPLIER[seamType] ?? 1;
  return Math.round(basePrice * widthFactor * seamFactor);
}
