import { DISTRICT_COORDS } from "@/features/data/mockData";

export type LocationCategory =
  | "education"
  | "healthcare"
  | "shopping"
  | "office"
  | "transit"
  | "landmark"
  | "district"
  | "custom";

export interface DesiredLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  category: LocationCategory;
  source: "preset" | "map" | "nominatim";
  keywords: string[];
}

const DISTRICT_OPTIONS: DesiredLocation[] = Object.entries(DISTRICT_COORDS).map(([district, [lat, lng]]) => ({
  id: `district-${normalizeText(district).replace(/\s+/g, "-")}`,
  name: district,
  address: `Trung tâm ${district}`,
  district,
  lat,
  lng,
  category: "district",
  source: "preset",
  keywords: [normalizeText(district), district],
}));

const PRESET_LOCATION_OPTIONS: DesiredLocation[] = [
  {
    id: "bach-khoa",
    name: "Đại học Bách Khoa",
    address: "268 Lý Thường Kiệt, Phường 14",
    district: "Quận 10",
    lat: 10.7721,
    lng: 106.6579,
    category: "education",
    source: "preset",
    keywords: ["bach khoa", "dai hoc bach khoa", "ly thuong kiet", "quan 10", "hcmut"],
  },
  {
    id: "kinh-te",
    name: "Đại học Kinh tế TP.HCM",
    address: "59C Nguyễn Đình Chiểu, Phường Võ Thị Sáu",
    district: "Quận 3",
    lat: 10.7786,
    lng: 106.6882,
    category: "education",
    source: "preset",
    keywords: ["ueh", "kinh te", "nguyen dinh chieu", "quan 3"],
  },
  {
    id: "y-duoc",
    name: "Đại học Y Dược",
    address: "217 Hồng Bàng, Phường 11",
    district: "Quận 5",
    lat: 10.7552,
    lng: 106.6644,
    category: "education",
    source: "preset",
    keywords: ["y duoc", "hong bang", "quan 5", "ump"],
  },
  {
    id: "cho-ben-thanh",
    name: "Chợ Bến Thành",
    address: "Lê Lợi, Phường Bến Thành",
    district: "Quận 1",
    lat: 10.7725,
    lng: 106.698,
    category: "landmark",
    source: "preset",
    keywords: ["ben thanh", "cho ben thanh", "le loi", "quan 1"],
  },
  {
    id: "vincom-dong-khoi",
    name: "Vincom Đồng Khởi",
    address: "72 Lê Thánh Tôn, Phường Bến Nghé",
    district: "Quận 1",
    lat: 10.7781,
    lng: 106.701,
    category: "shopping",
    source: "preset",
    keywords: ["vincom dong khoi", "le thanh ton", "quan 1", "vincom"],
  },
  {
    id: "landmark-81",
    name: "Landmark 81",
    address: "720A Điện Biên Phủ, Phường 22",
    district: "Bình Thạnh",
    lat: 10.7949,
    lng: 106.7219,
    category: "landmark",
    source: "preset",
    keywords: ["landmark 81", "dien bien phu", "binh thanh", "vinhomes central park"],
  },
  {
    id: "san-bay-tsn",
    name: "Sân bay Tân Sơn Nhất",
    address: "Trường Sơn, Phường 2",
    district: "Tân Bình",
    lat: 10.8188,
    lng: 106.6519,
    category: "transit",
    source: "preset",
    keywords: ["tan son nhat", "san bay", "truong son", "tan binh", "airport"],
  },
  {
    id: "bv-cho-ray",
    name: "Bệnh viện Chợ Rẫy",
    address: "201B Nguyễn Chí Thanh, Phường 12",
    district: "Quận 5",
    lat: 10.7572,
    lng: 106.6595,
    category: "healthcare",
    source: "preset",
    keywords: ["cho ray", "benh vien cho ray", "nguyen chi thanh", "quan 5"],
  },
  {
    id: "bv-tu-du",
    name: "Bệnh viện Từ Dũ",
    address: "284 Cống Quỳnh, Phường Phạm Ngũ Lão",
    district: "Quận 1",
    lat: 10.7667,
    lng: 106.6879,
    category: "healthcare",
    source: "preset",
    keywords: ["tu du", "benh vien tu du", "cong quynh", "quan 1"],
  },
  {
    id: "etown",
    name: "E.Town Cộng Hòa",
    address: "364 Cộng Hòa, Phường 13",
    district: "Tân Bình",
    lat: 10.8018,
    lng: 106.6405,
    category: "office",
    source: "preset",
    keywords: ["etown", "cong hoa", "tan binh", "office"],
  },
  {
    id: "thu-thiem",
    name: "Khu đô thị Thủ Thiêm",
    address: "Đường Trần Bạch Đằng, Phường Thủ Thiêm",
    district: "Quận 2",
    lat: 10.7776,
    lng: 106.7189,
    category: "office",
    source: "preset",
    keywords: ["thu thiem", "tran bach dang", "quan 2", "khu do thi thu thiem"],
  },
  {
    id: "crescent-mall",
    name: "Crescent Mall",
    address: "101 Tôn Dật Tiên, Tân Phú",
    district: "Quận 7",
    lat: 10.7297,
    lng: 106.7185,
    category: "shopping",
    source: "preset",
    keywords: ["crescent mall", "ton dat tien", "quan 7", "phu my hung"],
  },
];

export const LOCATION_OPTIONS: DesiredLocation[] = [...DISTRICT_OPTIONS, ...PRESET_LOCATION_OPTIONS];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function filterLocations(options: DesiredLocation[], query: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [...options]
      .sort((a, b) => {
        if (a.category === "district" && b.category !== "district") {
          return -1;
        }
        if (a.category !== "district" && b.category === "district") {
          return 1;
        }
        return a.name.localeCompare(b.name, "vi");
      })
      .slice(0, 24);
  }

  return options
    .filter((option) => {
      const haystack = [option.name, option.address, option.district, option.category, ...option.keywords]
        .map(normalizeText)
        .join(" ");
      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (a.category === "district" && b.category !== "district") {
        return -1;
      }
      if (a.category !== "district" && b.category === "district") {
        return 1;
      }
      return a.name.localeCompare(b.name, "vi");
    })
    .slice(0, 24);
}

export function mergeLocationOptions(baseOptions: DesiredLocation[], extraOptions: DesiredLocation[]) {
  const merged = new Map<string, DesiredLocation>();

  for (const option of [...baseOptions, ...extraOptions]) {
    const key = `${normalizeText(option.name)}|${option.lat.toFixed(5)}|${option.lng.toFixed(5)}`;
    if (!merged.has(key)) {
      merged.set(key, option);
    }
  }

  return Array.from(merged.values());
}

export function haversineDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(distanceKm: number | null) {
  if (distanceKm === null) {
    return "Chưa xác định";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}
