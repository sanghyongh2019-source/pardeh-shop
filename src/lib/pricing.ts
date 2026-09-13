export const SEAM_MULTIPLIER: Record<string, number> = {
  "پرچین": 1,
  "پیلی‌دار": 1.08,
  "حلقه‌ای": 1.04,
};
export const BASE_WIDTH_CM = 200;
export const SEAM_TYPES = Object.keys(SEAM_MULTIPLIER) as Array<
  keyof typeof SEAM_MULTIPLIER
>;

export const TEXTURE_MULTIPLIER: Record<string, number> = {
  "ساده": 1,
  "بافت‌دار": 1.06,
  "مخملی": 1.15,
};
export const TEXTURES = Object.keys(TEXTURE_MULTIPLIER) as Array<
  keyof typeof TEXTURE_MULTIPLIER
>;

export function computeUnitPrice(
  basePrice: number,
  widthCm: number,
  seamType: string,
  texture: string = "ساده"
) {
  const widthFactor = widthCm / BASE_WIDTH_CM;
  const seamFactor = SEAM_MULTIPLIER[seamType] ?? 1;
  const textureFactor = TEXTURE_MULTIPLIER[texture] ?? 1;
  return Math.round(basePrice * widthFactor * seamFactor * textureFactor);
}
