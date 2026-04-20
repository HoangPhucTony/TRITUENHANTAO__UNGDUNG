from fastapi import APIRouter, Query
from typing import Optional, List
from services.data_service import data_service
from services.model_service import model_service

router = APIRouter(prefix="/properties", tags=["properties"])

@router.get("/")
async def get_properties(
    district: Optional[str] = None,
    max_price: Optional[float] = None,
    limit: int = 50
):
    filters = {}
    if district: filters['district'] = district
    if max_price: filters['max_price'] = max_price
    
    properties = data_service.get_properties(limit=limit, filters=filters)
    
    # Enrich with AI price using the best model (XGBoost)
    for p in properties:
        # Construct input for model
        area_group = "Nhỏ (<25m²)"
        if p['area'] > 50: area_group = "Lớn (>50m²)"
        elif p['area'] >= 25: area_group = "Vừa (25-50m²)"

        input_dict = {
            "area_m2": p['area'],
            "standardized_location": p['district'],
            "vitri": p['district'],
            "has_studio": p['isStudio'],
            "has_balcony": p['hasBalcony'],
            "has_furniture": p['hasFurniture'],
            "has_elevator": p['hasElevator'],
            "has_new": p['isNew'],
            "area_group": area_group,
            "property_type_clean": "Phòng trọ",
            "phanloai": "PhongTro",
            "sophong": 1,
            "tieude": p['title'],
            "dientich": f"{p['area']} m"
        }
        p['aiPrice'] = model_service.predict(input_dict, "xgb")
        
    return properties

@router.get("/districts")
async def get_districts():
    return data_service.get_districts()
