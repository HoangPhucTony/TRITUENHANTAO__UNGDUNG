export const rawDataSample = [
  { title: "Phòng trọ cao cấp full nội thất", area: 28, price: 4.5, location: "Quận 1", amenities: "Máy lạnh, Tủ lạnh, Ban công" },
  { title: "Studio mới gần Đại học Bách Khoa", area: 22, price: 3.8, location: "Quận 10", amenities: "Thang máy, Bảo vệ" },
  { title: "Phòng giá rẻ cho sinh viên", area: 18, price: 2.2, location: "Thủ Đức", amenities: "WC riêng, Gác lửng" },
  { title: "Căn hộ mini 1PN view sông", area: 35, price: 6.5, location: "Bình Thạnh", amenities: "Full nội thất, Ban công, Thang máy" },
  { title: "Phòng trọ tiện nghi gần chợ", area: 25, price: 3.2, location: "Gò Vấp", amenities: "Máy lạnh, Bếp" },
];

export const priceDistribution = [
  { range: "1-2tr", count: 120 },
  { range: "2-3tr", count: 380 },
  { range: "3-4tr", count: 720 },
  { range: "4-5tr", count: 650 },
  { range: "5-7tr", count: 420 },
  { range: "7-10tr", count: 180 },
  { range: "10tr+", count: 65 },
];

export const areaDistribution = [
  { range: "<15m²", count: 95 },
  { range: "15-20m²", count: 280 },
  { range: "20-25m²", count: 540 },
  { range: "25-30m²", count: 680 },
  { range: "30-40m²", count: 410 },
  { range: "40m²+", count: 195 },
];

export const districtPrices = [
  { district: "Quận 1", price: 8.4 },
  { district: "Quận 3", price: 7.2 },
  { district: "Quận 10", price: 5.8 },
  { district: "Bình Thạnh", price: 5.1 },
  { district: "Phú Nhuận", price: 5.4 },
  { district: "Tân Bình", price: 4.6 },
  { district: "Gò Vấp", price: 3.8 },
  { district: "Quận 7", price: 4.9 },
  { district: "Thủ Đức", price: 3.2 },
  { district: "Bình Tân", price: 2.9 },
];

export const amenityImpact = [
  { amenity: "Nội thất", base: 60, withAmenity: 95 },
  { amenity: "Thang máy", base: 60, withAmenity: 88 },
  { amenity: "Ban công", base: 60, withAmenity: 78 },
  { amenity: "Máy lạnh", base: 60, withAmenity: 82 },
  { amenity: "Bảo vệ 24/7", base: 60, withAmenity: 75 },
  { amenity: "Bếp riêng", base: 60, withAmenity: 70 },
];

export const basicModels = [
  { model: "Linear Regression", MAE: 0.82, RMSE: 1.15, R2: 0.62, MAPE: 18.4 },
  { model: "Decision Tree", MAE: 0.74, RMSE: 1.02, R2: 0.71, MAPE: 15.2 },
  { model: "KNN", MAE: 0.69, RMSE: 0.96, R2: 0.74, MAPE: 14.1 },
];

export const advancedModels = [
  { model: "Random Forest", MAE: 0.42, RMSE: 0.61, R2: 0.89, MAPE: 8.6 },
  { model: "XGBoost", MAE: 0.36, RMSE: 0.54, R2: 0.92, MAPE: 7.2 },
];

export const ensembleResult = { MAE: 0.28, RMSE: 0.41, R2: 0.96, MAPE: 5.4 };

export const featureImportance = [
  { feature: "Diện tích", value: 0.32 },
  { feature: "Vị trí (Quận)", value: 0.28 },
  { feature: "Nội thất", value: 0.14 },
  { feature: "Thang máy", value: 0.09 },
  { feature: "Ban công", value: 0.06 },
  { feature: "Năm xây dựng", value: 0.05 },
  { feature: "Bảo vệ", value: 0.04 },
  { feature: "Khác", value: 0.02 },
];

export const districts = [
  "Quận 1", "Quận 3", "Quận 10", "Bình Thạnh", "Phú Nhuận",
  "Tân Bình", "Gò Vấp", "Quận 7", "Thủ Đức", "Bình Tân",
];

export const districtBasePrice: Record<string, number> = {
  "Quận 1": 8.4, "Quận 3": 7.2, "Quận 10": 5.8, "Bình Thạnh": 5.1,
  "Phú Nhuận": 5.4, "Tân Bình": 4.6, "Gò Vấp": 3.8, "Quận 7": 4.9,
  "Thủ Đức": 3.2, "Bình Tân": 2.9,
};

export type Listing = {
  id: number;
  title: string;
  district: string;
  area: number;
  listedPrice: number;
  aiPrice: number;
  amenities: string[];
  image: string;
  scores: { location: number; price: number; amenities: number };
};

export const mockListings: Listing[] = [
  { id: 1, title: "Studio cao cấp ngay trung tâm Q.1", district: "Quận 1", area: 30, listedPrice: 8.5, aiPrice: 8.7, amenities: ["Thang máy", "Nội thất", "Ban công"], image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", scores: { location: 95, price: 75, amenities: 90 } },
  { id: 2, title: "Phòng trọ giá hời view đẹp Q.3", district: "Quận 3", area: 28, listedPrice: 2.5, aiPrice: 6.8, amenities: ["Máy lạnh", "Ban công"], image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", scores: { location: 88, price: 98, amenities: 70 } },
  { id: 3, title: "Căn hộ mini Bình Thạnh full NT", district: "Bình Thạnh", area: 32, listedPrice: 5.2, aiPrice: 5.0, amenities: ["Nội thất", "Thang máy", "Bảo vệ"], image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", scores: { location: 78, price: 82, amenities: 88 } },
  { id: 4, title: "Studio mới Q.10 gần ĐH Y Dược", district: "Quận 10", area: 25, listedPrice: 4.2, aiPrice: 4.4, amenities: ["Máy lạnh", "Bếp", "WC riêng"], image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80", scores: { location: 85, price: 80, amenities: 75 } },
  { id: 5, title: "Phòng giá sốc gần sân bay Tân Bình", district: "Tân Bình", area: 26, listedPrice: 1.8, aiPrice: 4.6, amenities: ["Máy lạnh", "Thang máy"], image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80", scores: { location: 75, price: 99, amenities: 72 } },
  { id: 6, title: "Phòng trọ Gò Vấp tiện nghi", district: "Gò Vấp", area: 22, listedPrice: 3.5, aiPrice: 3.6, amenities: ["Máy lạnh", "Bếp"], image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80", scores: { location: 65, price: 78, amenities: 70 } },
];
