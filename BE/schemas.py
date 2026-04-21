from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class DistrictSummary(BaseModel):
    name: str
    avg_price: float
    count: int


class DatasetSummary(BaseModel):
    total_properties: int
    total_districts: int
    min_price: float
    max_price: float
    avg_price: float
    median_price: float
    min_area: float
    max_area: float
    avg_area: float


class PropertyResponse(BaseModel):
    id: str
    title: str
    area: float
    price: float
    district: str
    amenities: list[str]
    isStudio: bool
    hasBalcony: bool
    hasFurniture: bool
    hasElevator: bool
    isNew: bool
    nearSchool: bool
    nearHospital: bool
    floodSafe: bool
    dangerZone: bool
    lat: float
    lng: float
    aiPrice: float


class ModelMetadata(BaseModel):
    key: str
    name: str
    type: Literal["basic", "advanced", "ensemble"]
    MAE: float
    RMSE: float
    R2: float
    MAPE: float
    color: str
    speed: int
    interpret: int
    features: str
    whyChosen: str
    characteristics: str
    weakness: str
    available: bool = True


class PredictionInput(BaseModel):
    area: float = Field(gt=0)
    district: str = Field(min_length=1)
    isStudio: bool = False
    hasBalcony: bool = False
    hasFurniture: bool = False
    hasElevator: bool = False
    isNew: bool = False
    hasMezzanine: bool = False
    hasWindow: bool = False
    model: Literal["linear", "tree", "knn", "rf", "xgb", "ensemble", "auto"] = "ensemble"


class PredictionFactor(BaseModel):
    label: str
    value: int


class PredictionResponse(BaseModel):
    price: float
    factors: list[PredictionFactor]
    confidence: int
    model: ModelMetadata
    requestedModel: str
    resolvedModel: str


class HealthResponse(BaseModel):
    status: str
    data_loaded: bool
    models_loaded: list[str]
    cors_origins: list[str]
    allow_origin_regex: str
    dataset: DatasetSummary | None = None
