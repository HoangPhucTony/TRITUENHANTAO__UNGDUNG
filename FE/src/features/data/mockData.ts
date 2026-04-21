export type Property = {
  id: string;
  title: string;
  propertyType: string;
  propertyTypeKey: string;
  areaGroup: string;
  priceGroup: string;
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
  schoolCount: number;
  hospitalCount: number;
  landslideAlerts: number;
  relocationHouseholds: number;
  districtRentBenchmark: number;
  environmentScore: number;
  contextNotes: string[];
  aiPrice: number;
  aiModelKey: string;
  lat: number;
  lng: number;
};

export const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Quận 1": [10.7769, 106.7009],
  "Quận 2": [10.7872, 106.7498],
  "Quận 3": [10.784, 106.6882],
  "Quận 4": [10.758, 106.7067],
  "Quận 5": [10.7543, 106.6621],
  "Quận 6": [10.7481, 106.6341],
  "Quận 7": [10.7324, 106.7194],
  "Quận 8": [10.7235, 106.6586],
  "Quận 9": [10.8248, 106.8282],
  "Quận 10": [10.7737, 106.668],
  "Quận 11": [10.7629, 106.6501],
  "Quận 12": [10.8671, 106.6413],
  "Bình Thạnh": [10.8124, 106.714],
  "Phú Nhuận": [10.7996, 106.6841],
  "Tân Bình": [10.8013, 106.6528],
  "Gò Vấp": [10.8384, 106.6651],
  "Thủ Đức": [10.87, 106.7517],
  "Bình Tân": [10.763, 106.6025],
  "Tân Phú": [10.7925, 106.6268],
  "Bình Chánh": [10.6865, 106.5921],
  "Hóc Môn": [10.8841, 106.5944],
  "Củ Chi": [10.9991, 106.4952],
  "Nhà Bè": [10.6656, 106.7262],
  "Cần Giờ": [10.5076, 106.8621],
};

export type ModelKey = "linear" | "tree" | "knn" | "rf" | "xgb" | "ensemble";

export function formatVND(n: number) {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)} tr`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}k`;
  }
  return `${n}`;
}
