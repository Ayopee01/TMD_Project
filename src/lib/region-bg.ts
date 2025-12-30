// src/lib/region-bg.ts
export const REGION_BG_MAP: Record<string, string> = {
  "ภาคเหนือ": "/img_daily/desktop/north.png",
  "ภาคตะวันออกเฉียงเหนือ": "/img_daily/desktop/isaan.png",
  "ภาคกลาง": "/img_daily/desktop/central.png",
  "ภาคใต้(ฝั่งตะวันออก)": "/img_daily/desktop/east.png",
  "ภาคใต้(ฝั่งตะวันตก)": "/img_daily/desktop/south.png",
  "กรุงเทพและปริมณฑล": "/img_daily/desktop/bkk.png",
};

export const DEFAULT_BG = "/img_daily/desktop/north.png";

export function getRegionBg(region: string) {
  return REGION_BG_MAP[region] ?? DEFAULT_BG;
}
