import pandas as pd
import os
import random

# Geocoding data from FE mockData.ts
DISTRICT_COORDS = {
    "Quận 1":    [10.7769, 106.7009],
    "Quận 2":    [10.7872, 106.7498],
    "Quận 3":    [10.7840, 106.6882],
    "Quận 4":    [10.7580, 106.7067],
    "Quận 5":    [10.7543, 106.6621],
    "Quận 6":    [10.7481, 106.6341],
    "Quận 7":    [10.7324, 106.7194],
    "Quận 8":    [10.7235, 106.6586],
    "Quận 9":    [10.8248, 106.8282],
    "Quận 10":   [10.7737, 106.6680],
    "Quận 11":   [10.7629, 106.6501],
    "Quận 12":   [10.8671, 106.6413],
    "Bình Thạnh":[10.8124, 106.7140],
    "Phú Nhuận": [10.7996, 106.6841],
    "Tân Bình":  [10.8013, 106.6528],
    "Gò Vấp":    [10.8384, 106.6651],
    "Thủ Đức":   [10.8700, 106.7517],
    "Bình Tân":  [10.7630, 106.6025],
    "Tân Phú":   [10.7925, 106.6268],
    "Bình Chánh":[10.6865, 106.5921],
    "Hóc Môn":   [10.8841, 106.5944],
    "Củ Chi":    [10.9991, 106.4952],
    "Nhà Bè":    [10.6656, 106.7262],
    "Cần Giờ":   [10.5076, 106.8621],
}

CLEANED_DATA_PATH = os.path.join(os.path.dirname(__file__), "../../Analysis/outputs/data/phongtro_cleaned.csv")

class DataService:
    def __init__(self):
        self.df = None
        self.district_stats = {}
        self.load_data()

    def load_data(self):
        try:
            self.df = pd.read_csv(CLEANED_DATA_PATH)
            
            # Compute stats per district for FE logic
            stats = self.df.groupby('standardized_location')['giavnd'].agg(['mean', 'count']).to_dict('index')
            self.district_stats = {
                d: {"avg_price": float(v['mean']), "count": int(v['count'])}
                for d, v in stats.items()
            }

            def get_coords(district):
                base = DISTRICT_COORDS.get(district, [10.78, 106.70])
                return [
                    base[0] + (random.random() - 0.5) * 0.018,
                    base[1] + (random.random() - 0.5) * 0.018
                ]
            
            self.df['coords'] = self.df['standardized_location'].apply(get_coords)
            self.df['lat'] = self.df['coords'].apply(lambda x: x[0])
            self.df['lng'] = self.df['coords'].apply(lambda x: x[1])
            
        except Exception as e:
            print(f"Error loading data: {e}")
            self.df = pd.DataFrame()

    def get_districts(self):
        if not self.district_stats:
            return [{"name": d, "avg_price": 4000000, "count": 0} for d in DISTRICT_COORDS.keys()]
        
        return [
            {"name": d, "avg_price": v['avg_price'], "count": v['count']}
            for d, v in sorted(self.district_stats.items())
        ]

    def get_properties(self, limit=200, filters=None):
        if self.df.empty:
            return []
        
        filtered_df = self.df.copy()
        
        if filters:
            if filters.get('district'):
                filtered_df = filtered_df[filtered_df['standardized_location'] == filters['district']]
            if filters.get('max_price'):
                filtered_df = filtered_df[filtered_df['giavnd'] <= filters['max_price'] * 1_000_000]
        
        # Convert to list of dicts for FE
        result = []
        for _, row in filtered_df.head(limit).iterrows():
            # Basic mapping
            p = {
                "id": str(row.name), # Use index as ID
                "title": row.get('tieude', "Phòng trọ"),
                "area": float(row.get('area_m2', 0)),
                "price": float(row.get('giavnd', 0)),
                "district": row.get('standardized_location', "Chưa rõ"),
                "amenities": [], 
                "isStudio": row.get('has_studio', False),
                "hasBalcony": row.get('has_balcony', False),
                "hasFurniture": row.get('has_furniture', False),
                "hasElevator": row.get('has_elevator', False),
                "isNew": row.get('has_new', False),
                "nearSchool": random.random() > 0.5, 
                "nearHospital": random.random() > 0.5,
                "floodSafe": random.random() > 0.3,
                "dangerZone": random.random() < 0.1,
                "lat": row.get('lat'),
                "lng": row.get('lng'),
                "aiPrice": 0 
            }
            # Extract some amenities from booleans
            if p["hasFurniture"]: p["amenities"].append("Nội thất")
            if p["hasElevator"]: p["amenities"].append("Thang máy")
            if p["hasBalcony"]: p["amenities"].append("Ban công")

            result.append(p)
            
        return result

data_service = DataService()
