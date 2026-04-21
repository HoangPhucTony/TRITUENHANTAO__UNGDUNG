const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api").replace(
  /\/+$/,
  "",
);

export interface PropertyDto {
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
  lat: number;
  lng: number;
  aiPrice: number;
}

export interface DistrictDto {
  name: string;
  avg_price: number;
  count: number;
}

export interface DatasetSummaryDto {
  total_properties: number;
  total_districts: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  median_price: number;
  min_area: number;
  max_area: number;
  avg_area: number;
}

export interface ModelMetadataDto {
  key: string;
  name: string;
  type: "basic" | "advanced" | "ensemble";
  MAE: number;
  RMSE: number;
  R2: number;
  MAPE: number;
  color: string;
  speed: number;
  interpret: number;
  features: string;
  whyChosen: string;
  characteristics: string;
  weakness: string;
  available: boolean;
}

export interface PredictionInputDto {
  area: number;
  district: string;
  isStudio: boolean;
  hasBalcony: boolean;
  hasFurniture: boolean;
  hasElevator: boolean;
  isNew: boolean;
  hasMezzanine: boolean;
  hasWindow: boolean;
  model: "linear" | "tree" | "knn" | "rf" | "xgb" | "ensemble" | "auto";
}

export interface PredictionFactorDto {
  label: string;
  value: number;
}

export interface PredictionResponseDto {
  price: number;
  factors: PredictionFactorDto[];
  confidence: number;
  model: ModelMetadataDto;
  requestedModel: string;
  resolvedModel: string;
}

interface GetPropertiesFilters {
  district?: string;
  maxPrice?: number;
  limit?: number;
}

interface ApiErrorPayload {
  message?: string;
  detail?: string | { message?: string };
}

function extractErrorMessage(payload: ApiErrorPayload | null, status: number) {
  if (!payload) {
    return `API Error: ${status}`;
  }

  if (typeof payload.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  if (payload.detail && typeof payload.detail === "object" && payload.detail.message) {
    return payload.detail.message;
  }

  if (payload.message?.trim()) {
    return payload.message;
  }

  return `API Error: ${status}`;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new Error(extractErrorMessage(errorPayload, response.status));
  }

  return response.json() as Promise<T>;
}

export const api = {
  getProperties: (filters?: GetPropertiesFilters) => {
    const params = new URLSearchParams();
    if (filters?.district && filters.district !== "all") {
      params.append("district", filters.district);
    }
    if (filters?.maxPrice !== undefined) {
      params.append("max_price", filters.maxPrice.toString());
    }
    if (filters?.limit !== undefined) {
      params.append("limit", filters.limit.toString());
    }

    const query = params.toString();
    return fetchApi<PropertyDto[]>(`/properties/${query ? `?${query}` : ""}`);
  },

  getDistricts: () => fetchApi<DistrictDto[]>("/properties/districts"),

  getDatasetSummary: () => fetchApi<DatasetSummaryDto>("/properties/summary"),

  getModels: () => fetchApi<ModelMetadataDto[]>("/models/"),

  predict: (data: PredictionInputDto) =>
    fetchApi<PredictionResponseDto>("/models/predict", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
