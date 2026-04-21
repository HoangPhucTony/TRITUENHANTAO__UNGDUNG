from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query

from schemas import DatasetSummary, DistrictSummary, PropertyResponse
from services.data_service import data_service
from services.model_service import model_service

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("/", response_model=list[PropertyResponse])
async def get_properties(
    district: Optional[str] = None,
    max_price: Optional[float] = Query(None, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    filters = {}
    if district:
        filters["district"] = district
    if max_price is not None:
        filters["max_price"] = max_price

    properties = data_service.get_properties(limit=limit, filters=filters)
    listing_model_key = model_service.get_listing_model_key()

    if listing_model_key is None:
        return properties

    for property_item in properties:
        feature_payload = model_service.build_features(
            area=property_item["area"],
            district=property_item["district"],
            title=property_item["title"],
            is_studio=property_item["isStudio"],
            has_balcony=property_item["hasBalcony"],
            has_furniture=property_item["hasFurniture"],
            has_elevator=property_item["hasElevator"],
            is_new=property_item["isNew"],
        )
        predicted_price = model_service.predict(feature_payload, listing_model_key)
        property_item["aiPrice"] = round(predicted_price or property_item["price"], 2)

    return properties


@router.get("/districts", response_model=list[DistrictSummary])
async def get_districts():
    return data_service.get_districts()


@router.get("/summary", response_model=DatasetSummary)
async def get_dataset_summary():
    return data_service.get_summary()
