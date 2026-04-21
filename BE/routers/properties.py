from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from schemas import DatasetSummary, DistrictSummary, GeocodeSuggestion, PropertyResponse, PropertyTypeSummary
from services.data_service import data_service
from services.geocode_service import geocode_service
from services.model_service import model_service

router = APIRouter(prefix="/properties", tags=["properties"])
LISTING_PREDICTION_CACHE: dict[str, float] = {}
WARMED_MODELS: set[str] = set()


def _warm_listing_prediction_cache(model_key: str) -> None:
    if model_key in WARMED_MODELS:
        return

    source_properties = data_service.get_properties(limit=2000)
    feature_rows = [
        model_service.build_features(
            area=property_item["area"],
            district=property_item["district"],
            title=property_item["title"],
            property_type=property_item["propertyType"],
            property_type_key=property_item["propertyTypeKey"],
            is_studio=property_item["isStudio"],
            has_balcony=property_item["hasBalcony"],
            has_furniture=property_item["hasFurniture"],
            has_elevator=property_item["hasElevator"],
            is_new=property_item["isNew"],
        )
        for property_item in source_properties
    ]
    predictions = model_service.predict_many(feature_rows, model_key)

    for property_item, prediction in zip(source_properties, predictions):
        cache_key = f"{model_key}:{property_item['id']}"
        LISTING_PREDICTION_CACHE[cache_key] = float(prediction or property_item["price"])

    WARMED_MODELS.add(model_key)


@router.get("/", response_model=list[PropertyResponse])
async def get_properties(
    district: Optional[str] = None,
    property_type: Optional[str] = None,
    max_price: Optional[float] = Query(None, ge=0),
    limit: int = Query(2000, ge=1, le=2000),
):
    filters = {}
    if district:
        filters["district"] = district
    if property_type:
        filters["property_type"] = property_type
    if max_price is not None:
        filters["max_price"] = max_price

    properties = data_service.get_properties(limit=limit, filters=filters)
    listing_model_key = model_service.get_listing_model_key()

    if listing_model_key is None:
        return properties

    _warm_listing_prediction_cache(listing_model_key)

    for property_item in properties:
        cache_key = f"{listing_model_key}:{property_item['id']}"
        predicted_price = LISTING_PREDICTION_CACHE.get(cache_key)
        property_item["aiPrice"] = round(float(predicted_price or property_item["price"]), 2)
        property_item["aiModelKey"] = listing_model_key

    return properties


@router.get("/districts", response_model=list[DistrictSummary])
async def get_districts():
    return data_service.get_districts()


@router.get("/property-types", response_model=list[PropertyTypeSummary])
async def get_property_types():
    return data_service.get_property_types()


@router.get("/summary", response_model=DatasetSummary)
async def get_dataset_summary():
    return data_service.get_summary()


@router.get("/geocode", response_model=list[GeocodeSuggestion])
async def geocode_address(
    q: str = Query(..., min_length=3, description="Free-form address or place name"),
    limit: int = Query(5, ge=1, le=5),
):
    try:
        return list(geocode_service.search(q, limit))
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Không thể tra địa chỉ lúc này: {exc}",
        ) from exc
