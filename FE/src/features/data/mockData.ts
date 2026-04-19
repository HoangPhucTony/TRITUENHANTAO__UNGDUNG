// Deterministic data — uses seeded RNG to avoid SSR/CSR hydration mismatch.
export type Property = {
  id: string;
  title: string;
  area: number;
  price: number;
  district: string;
  amenities: string[];
  isStudio: boolean;
  hasBalcony: boolean;
  hasFurniture: boolean;
  hasElevator: boolean;
  isNew: boolean;
  nearSchool: boolean;
  nearHospital: boolean;
  floodSafe: boolean;
  dangerZone: boolean;
  aiPrice: number;
  lat: number;
  lng: number;
};

// Approximate center coordinates for each district in Ho Chi Minh City
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Quận 1":    [10.7769, 106.7009],
  "Quận 3":    [10.7840, 106.6882],
  "Quận 10":   [10.7737, 106.6680],
  "Quận 5":    [10.7543, 106.6621],
  "Quận 7":    [10.7324, 106.7194],
  "Bình Thạnh":[10.8124, 106.7140],
  "Phú Nhuận": [10.7996, 106.6841],
  "Tân Bình":  [10.8013, 106.6528],
  "Gò Vấp":    [10.8384, 106.6651],
  "Thủ Đức":   [10.8700, 106.7517],
};


// Mulberry32 deterministic PRNG
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20250419);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];

const districts = [
  "Quận 1", "Quận 3", "Quận 10", "Quận 5", "Quận 7",
  "Bình Thạnh", "Phú Nhuận", "Tân Bình", "Gò Vấp", "Thủ Đức",
];

const amenityPool = ["Nội thất", "Thang máy", "Ban công", "Máy lạnh", "Bảo vệ 24/7", "Wifi", "Bếp riêng", "Gác lửng"];

export const DISTRICT_BASE: Record<string, number> = {
  "Quận 1": 7_500_000, "Quận 3": 6_500_000, "Quận 10": 5_500_000, "Quận 5": 5_000_000,
  "Quận 7": 5_200_000, "Bình Thạnh": 4_800_000, "Phú Nhuận": 4_700_000,
  "Tân Bình": 4_300_000, "Gò Vấp": 3_800_000, "Thủ Đức": 3_500_000,
};

function priceFor(district: string, area: number, opts: { furniture: boolean; elevator: boolean; balcony: boolean; isNew: boolean }) {
  let p = DISTRICT_BASE[district] ?? 4_000_000;
  p += (area - 20) * 80_000;
  if (opts.furniture) p += 600_000;
  if (opts.elevator) p += 500_000;
  if (opts.balcony) p += 300_000;
  if (opts.isNew) p += 400_000;
  return Math.max(2_000_000, Math.round(p / 100_000) * 100_000);
}

export const MOCK_PROPERTIES: Property[] = Array.from({ length: 30 }).map((_, i) => {
  const district = districts[i % districts.length];
  const area = 18 + Math.floor(rand() * 35);
  const isStudio = rand() > 0.5;
  const hasBalcony = rand() > 0.4;
  const hasFurniture = rand() > 0.3;
  const hasElevator = rand() > 0.5;
  const isNew = rand() > 0.6;
  const aiPrice = priceFor(district, area, { furniture: hasFurniture, elevator: hasElevator, balcony: hasBalcony, isNew });
  const r = rand();
  // 18% scam (overpriced), 12% suspiciously cheap, rest normal
  let price: number;
  if (r < 0.18) price = Math.round(aiPrice * (1.4 + rand() * 0.5));
  else if (r < 0.3) price = Math.round(aiPrice * (0.45 + rand() * 0.15));
  else price = Math.round(aiPrice * (0.92 + rand() * 0.12));
  const amenities = amenityPool.filter(() => rand() > 0.55);
  if (hasFurniture && !amenities.includes("Nội thất")) amenities.push("Nội thất");
  if (hasElevator && !amenities.includes("Thang máy")) amenities.push("Thang máy");
  if (hasBalcony && !amenities.includes("Ban công")) amenities.push("Ban công");
  const [baseLat, baseLng] = DISTRICT_COORDS[district] ?? [10.78, 106.70];
  return {
    id: `p-${i + 1}`,
    title: `${isStudio ? "Studio" : "Phòng trọ"} ${pick(["cao cấp", "view đẹp", "full nội thất", "mới xây", "yên tĩnh", "tiện nghi", "thoáng mát"])} ${district}`,
    area,
    price,
    district,
    amenities,
    isStudio, hasBalcony, hasFurniture, hasElevator, isNew,
    nearSchool: rand() > 0.45,
    nearHospital: rand() > 0.55,
    floodSafe: rand() > 0.3,
    dangerZone: rand() < 0.15,
    aiPrice,
    lat: baseLat + (rand() - 0.5) * 0.014,
    lng: baseLng + (rand() - 0.5) * 0.014,
  };
});

export const DISTRICTS = districts;

export type ModelKey = "linear" | "tree" | "knn" | "rf" | "xgb" | "ensemble";

export const MODELS: { key: ModelKey; name: string; type: "basic" | "advanced" | "ensemble"; MAE: number; RMSE: number; R2: number; MAPE: number; color: string }[] = [
  { key: "linear", name: "Linear Regression", type: "basic", MAE: 0.82, RMSE: 1.05, R2: 0.71, MAPE: 18.5, color: "oklch(0.78 0.17 75)" },
  { key: "tree", name: "Decision Tree", type: "basic", MAE: 0.74, RMSE: 0.98, R2: 0.76, MAPE: 16.2, color: "oklch(0.7 0.2 25)" },
  { key: "knn", name: "KNN", type: "basic", MAE: 0.69, RMSE: 0.91, R2: 0.79, MAPE: 14.8, color: "oklch(0.65 0.22 320)" },
  { key: "rf", name: "Random Forest", type: "advanced", MAE: 0.52, RMSE: 0.71, R2: 0.89, MAPE: 9.3, color: "oklch(0.7 0.18 160)" },
  { key: "xgb", name: "XGBoost", type: "advanced", MAE: 0.41, RMSE: 0.58, R2: 0.93, MAPE: 7.1, color: "oklch(0.65 0.21 265)" },
  { key: "ensemble", name: "Ensemble (RF+XGB+KNN)", type: "ensemble", MAE: 0.32, RMSE: 0.48, R2: 0.96, MAPE: 5.2, color: "oklch(0.75 0.22 300)" },
];

export function predictPrice(input: {
  area: number; district: string; isStudio: boolean; hasBalcony: boolean;
  hasFurniture: boolean; hasElevator: boolean; isNew: boolean;
  model?: ModelKey;
}) {
  const base = priceFor(input.district, input.area, {
    furniture: input.hasFurniture, elevator: input.hasElevator,
    balcony: input.hasBalcony, isNew: input.isNew,
  });
  // Different models produce slightly different predictions
  const adj: Record<ModelKey, number> = {
    linear: 0.94, tree: 1.05, knn: 0.98, rf: 1.01, xgb: 1.0, ensemble: 1.0,
  };
  const mk = input.model ?? "ensemble";
  const price = Math.round((base * adj[mk]) / 100_000) * 100_000;
  const districtPremium = (DISTRICT_BASE[input.district] ?? 4_000_000) - 4_000_000;
  const factors: { label: string; value: number }[] = [
    { label: `Khu vực ${input.district}`, value: districtPremium },
    { label: `Diện tích ${input.area}m²`, value: Math.round((input.area - 20) * 80_000) },
    { label: "Nội thất", value: input.hasFurniture ? 600_000 : 0 },
    { label: "Thang máy", value: input.hasElevator ? 500_000 : 0 },
    { label: "Ban công", value: input.hasBalcony ? 300_000 : 0 },
    { label: "Nhà mới", value: input.isNew ? 400_000 : 0 },
    { label: "Studio", value: input.isStudio ? -200_000 : 0 },
  ].filter(f => f.value !== 0);
  // Confidence based on model R²
  const model = MODELS.find(m => m.key === mk)!;
  const confidence = Math.round(model.R2 * 100);
  return { price, factors, confidence, model };
}

export function formatVND(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
}
