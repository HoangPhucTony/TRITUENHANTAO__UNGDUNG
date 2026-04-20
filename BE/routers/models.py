from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.model_service import model_service
from services.data_service import data_service
import pandas as pd
import os

router = APIRouter(prefix="/models", tags=["models"])

class PredictionInput(BaseModel):
    area: float
    district: str
    isStudio: bool = False
    hasBalcony: bool = False
    hasFurniture: bool = False
    hasElevator: bool = False
    isNew: bool = False
    hasMezzanine: bool = False
    hasWindow: bool = False
    model: str = "ensemble"

@router.get("/")
async def get_models():
    return model_service.get_model_metadata()

@router.post("/predict")
async def predict(data: PredictionInput):
    # Construct input for model
    area_group = "Nhỏ (<25m²)"
    if data.area > 50: area_group = "Lớn (>50m²)"
    elif data.area >= 25: area_group = "Vừa (25-50m²)"

    input_dict = {
        "area_m2": data.area,
        "standardized_location": data.district,
        "vitri": data.district,
        "has_studio": data.isStudio,
        "has_balcony": data.hasBalcony,
        "has_furniture": data.hasFurniture,
        "has_elevator": data.hasElevator,
        "has_new": data.isNew,
        "has_mezzanine": data.hasMezzanine,
        "has_window": data.hasWindow,
        "area_group": area_group,
        "property_type_clean": "Phòng trọ",
        "phanloai": "PhongTro",
        "sophong": 1,
        "tieude": f"Phòng trọ {data.district} {data.area}m2",
        "dientich": f"{data.area} m"
    }
    
    price = model_service.predict(input_dict, data.model)
    
    # Get model info for response
    all_models = await get_models()
    model_info = next((m for m in all_models if m["key"] == data.model), {"name": data.model, "MAE": 0, "R2": 0})

    # AI Explanation Logic - Better factor calculation
    # Using real district stats to show relative value
    district_stat = data_service.district_stats.get(data.district, {"avg_price": 5000000})
    avg_price = district_stat["avg_price"]
    
    # Base price adjustment for factors (Rough estimates based on general market)
    factors = [
        {"label": f"Vị trí: {data.district}", "value": int(avg_price * 0.4)}, # District contribution
        {"label": f"Diện tích: {data.area}m²", "value": int(data.area * 150000)},
        {"label": "Nội thất & Tiện ích", "value": (800000 if data.hasFurniture else 0) + (500000 if data.hasElevator else 0)},
        {"label": "Ưu điểm khác (Ban công, Studio...)", "value": (300000 if data.hasBalcony else 0) + (400000 if data.isNew else 0)}
    ]
    
    # If the model prediction is high (e.g. Q1), ensure factors reflect that
    # We normalize factors to sum up near the predicted price for "Explainable AI" feel
    total_factor_val = sum(f["value"] for f in factors)
    if total_factor_val > 0:
        scale = price / total_factor_val
        for f in factors:
            f["value"] = int(f["value"] * scale)

    return {
        "price": price,
        "factors": factors,
        "confidence": int(model_info.get("R2", 0.7) * 100),
        "model": model_info
    }
