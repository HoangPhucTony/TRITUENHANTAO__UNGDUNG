from __future__ import annotations

from fastapi import APIRouter, HTTPException

from schemas import ModelMetadata, PredictionInput, PredictionResponse
from services.data_service import data_service
from services.model_service import model_service

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/", response_model=list[ModelMetadata])
async def get_models():
    return model_service.get_model_metadata()


@router.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionInput):
    resolved_district = data_service.resolve_district_name(data.district) or data.district.strip()
    resolved_model = model_service.resolve_model_key(data.model)

    feature_payload = model_service.build_features(
        area=data.area,
        district=resolved_district,
        is_studio=data.isStudio,
        has_balcony=data.hasBalcony,
        has_furniture=data.hasFurniture,
        has_elevator=data.hasElevator,
        is_new=data.isNew,
        has_mezzanine=data.hasMezzanine,
        has_window=data.hasWindow,
    )

    price = model_service.predict(feature_payload, resolved_model)
    if price is None:
        raise HTTPException(
            status_code=503,
            detail="Backend chưa có model khả dụng để dự đoán. Hãy kiểm tra lại file model hoặc môi trường Python.",
        )

    model_info = model_service.get_model_metadata_by_key(resolved_model)
    district_stat = data_service.district_stats.get(resolved_district, {"avg_price": 5_000_000})
    avg_price = float(district_stat["avg_price"])

    factors = [
        {"label": f"Vị trí: {resolved_district}", "value": int(avg_price * 0.4)},
        {"label": f"Diện tích: {data.area}m²", "value": int(data.area * 150_000)},
        {
            "label": "Nội thất & Tiện ích",
            "value": (800_000 if data.hasFurniture else 0) + (500_000 if data.hasElevator else 0),
        },
        {
            "label": "Ưu điểm khác (Ban công, Studio...)",
            "value": (300_000 if data.hasBalcony else 0) + (400_000 if data.isNew else 0),
        },
    ]

    total_factor_value = sum(factor["value"] for factor in factors)
    if total_factor_value > 0:
        scale = price / total_factor_value
        for factor in factors:
            factor["value"] = int(factor["value"] * scale)

    return {
        "price": price,
        "factors": factors,
        "confidence": int(model_info.get("R2", 0.7) * 100),
        "model": model_info,
        "requestedModel": data.model,
        "resolvedModel": resolved_model,
    }
