const API_BASE_URL = "http://localhost:8000/api";

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getProperties: (filters?: { district?: string; maxPrice?: number }) => {
    const params = new URLSearchParams();
    if (filters?.district && filters.district !== "all") params.append("district", filters.district);
    if (filters?.maxPrice) params.append("max_price", filters.maxPrice.toString());
    return fetchApi(`/properties/?${params.toString()}`);
  },
  
  getDistricts: () => fetchApi("/properties/districts") as Promise<{name: string, avg_price: number, count: number}[]>,
  
  getModels: () => fetchApi("/models/"),
  
  predict: (data: any) => fetchApi("/models/predict", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};
