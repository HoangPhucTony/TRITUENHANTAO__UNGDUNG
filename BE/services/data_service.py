from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any
import unicodedata

import pandas as pd

# Geocoding data mirrored from the frontend demo layer.
DISTRICT_COORDS = {
    "Quận 1": [10.7769, 106.7009],
    "Quận 2": [10.7872, 106.7498],
    "Quận 3": [10.7840, 106.6882],
    "Quận 4": [10.7580, 106.7067],
    "Quận 5": [10.7543, 106.6621],
    "Quận 6": [10.7481, 106.6341],
    "Quận 7": [10.7324, 106.7194],
    "Quận 8": [10.7235, 106.6586],
    "Quận 9": [10.8248, 106.8282],
    "Quận 10": [10.7737, 106.6680],
    "Quận 11": [10.7629, 106.6501],
    "Quận 12": [10.8671, 106.6413],
    "Bình Thạnh": [10.8124, 106.7140],
    "Phú Nhuận": [10.7996, 106.6841],
    "Tân Bình": [10.8013, 106.6528],
    "Gò Vấp": [10.8384, 106.6651],
    "Thủ Đức": [10.8700, 106.7517],
    "Bình Tân": [10.7630, 106.6025],
    "Tân Phú": [10.7925, 106.6268],
    "Bình Chánh": [10.6865, 106.5921],
    "Hóc Môn": [10.8841, 106.5944],
    "Củ Chi": [10.9991, 106.4952],
    "Nhà Bè": [10.6656, 106.7262],
    "Cần Giờ": [10.5076, 106.8621],
}
DEFAULT_COORDS = [10.78, 106.70]
FLOOD_PRONE_DISTRICTS = {"Quận 7", "Bình Chánh", "Nhà Bè", "Thủ Đức", "Cần Giờ", "Hóc Môn"}
HIGH_RISK_DISTRICTS = {"Bình Chánh", "Củ Chi", "Cần Giờ", "Hóc Môn"}
CLEANED_DATA_PATH = (
    Path(__file__).resolve().parents[2] / "Analysis" / "outputs" / "data" / "phongtro_cleaned.csv"
)


def _normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    without_accents = "".join(char for char in normalized if not unicodedata.combining(char))
    return " ".join(without_accents.lower().strip().split())


def _safe_float(value: Any, default: float = 0.0) -> float:
    if pd.isna(value):
        return default

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _coerce_bool(value: Any) -> bool:
    if pd.isna(value):
        return False

    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)):
        return value != 0

    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}

    return bool(value)


class DataService:
    def __init__(self) -> None:
        self.df = pd.DataFrame()
        self.district_stats: dict[str, dict[str, float | int]] = {}
        self.district_lookup: dict[str, str] = {}
        self.summary: dict[str, float | int] = {}
        self.load_error: str | None = None
        self.load_data()

    def _stable_ratio(self, key: str) -> float:
        digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
        return int(digest[:8], 16) / 0xFFFFFFFF

    def _get_coords(self, district: str, item_id: str) -> tuple[float, float]:
        base_lat, base_lng = DISTRICT_COORDS.get(district, DEFAULT_COORDS)
        lat_offset = (self._stable_ratio(f"{district}:{item_id}:lat") - 0.5) * 0.018
        lng_offset = (self._stable_ratio(f"{district}:{item_id}:lng") - 0.5) * 0.018
        return round(base_lat + lat_offset, 7), round(base_lng + lng_offset, 7)

    def _estimate_context_flags(self, district: str, item_id: str) -> dict[str, bool]:
        school_ratio = self._stable_ratio(f"{district}:{item_id}:school")
        hospital_ratio = self._stable_ratio(f"{district}:{item_id}:hospital")
        danger_ratio = self._stable_ratio(f"{district}:{item_id}:danger")

        dense_urban_core = {"Quận 1", "Quận 3", "Quận 5", "Quận 10", "Bình Thạnh", "Phú Nhuận"}

        return {
            "nearSchool": district in dense_urban_core or school_ratio >= 0.45,
            "nearHospital": district in dense_urban_core or hospital_ratio >= 0.5,
            "floodSafe": district not in FLOOD_PRONE_DISTRICTS,
            "dangerZone": district in HIGH_RISK_DISTRICTS and danger_ratio >= 0.88,
        }

    def _build_summary(self, df: pd.DataFrame) -> dict[str, float | int]:
        return {
            "total_properties": int(len(df)),
            "total_districts": int(df["standardized_location"].nunique()),
            "min_price": _safe_float(df["giavnd"].min()),
            "max_price": _safe_float(df["giavnd"].max()),
            "avg_price": _safe_float(df["giavnd"].mean()),
            "median_price": _safe_float(df["giavnd"].median()),
            "min_area": _safe_float(df["area_m2"].min()),
            "max_area": _safe_float(df["area_m2"].max()),
            "avg_area": _safe_float(df["area_m2"].mean()),
        }

    def load_data(self) -> None:
        try:
            df = pd.read_csv(CLEANED_DATA_PATH)
            if df.empty:
                raise ValueError("Dataset is empty.")

            df["standardized_location"] = df["standardized_location"].fillna("Chưa rõ").astype(str).str.strip()
            df["tieude"] = df["tieude"].fillna("Phòng trọ")
            df["area_m2"] = pd.to_numeric(df["area_m2"], errors="coerce").fillna(0.0)
            df["giavnd"] = pd.to_numeric(df["giavnd"], errors="coerce").fillna(0.0)

            self.district_lookup = {
                _normalize_text(district): district
                for district in sorted(df["standardized_location"].dropna().unique())
            }

            stats = (
                df.groupby("standardized_location")["giavnd"]
                .agg(["mean", "count"])
                .sort_index()
                .to_dict("index")
            )
            self.district_stats = {
                district: {"avg_price": float(values["mean"]), "count": int(values["count"])}
                for district, values in stats.items()
            }

            coords = [
                self._get_coords(str(row["standardized_location"]), str(index))
                for index, row in df.iterrows()
            ]
            df["lat"] = [lat for lat, _ in coords]
            df["lng"] = [lng for _, lng in coords]

            self.df = df
            self.summary = self._build_summary(df)
            self.load_error = None
        except Exception as exc:
            self.load_error = str(exc)
            print(f"Error loading data: {exc}")
            self.df = pd.DataFrame()
            self.district_stats = {}
            self.district_lookup = {}
            self.summary = {}

    def resolve_district_name(self, district: str | None) -> str | None:
        if district is None:
            return None

        cleaned = district.strip()
        if not cleaned:
            return None

        normalized = _normalize_text(cleaned)
        return self.district_lookup.get(normalized, cleaned)

    def get_summary(self) -> dict[str, float | int]:
        return self.summary

    def get_districts(self) -> list[dict[str, float | int | str]]:
        if not self.district_stats:
            return [
                {"name": district, "avg_price": 4_000_000.0, "count": 0}
                for district in sorted(DISTRICT_COORDS)
            ]

        return [
            {"name": district, "avg_price": values["avg_price"], "count": values["count"]}
            for district, values in self.district_stats.items()
        ]

    def get_properties(self, limit: int = 200, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        if self.df.empty:
            return []

        filtered_df = self.df.copy()

        if filters:
            district = self.resolve_district_name(filters.get("district"))
            if filters.get("district") and district:
                filtered_df = filtered_df[filtered_df["standardized_location"] == district]
            elif filters.get("district"):
                return []

            max_price = filters.get("max_price")
            if max_price is not None:
                filtered_df = filtered_df[filtered_df["giavnd"] <= float(max_price) * 1_000_000]

        result: list[dict[str, Any]] = []
        for index, row in filtered_df.head(limit).iterrows():
            district = str(row.get("standardized_location", "Chưa rõ"))
            item_id = str(index)
            context_flags = self._estimate_context_flags(district, item_id)

            property_item = {
                "id": item_id,
                "title": str(row.get("tieude", "Phòng trọ")),
                "area": _safe_float(row.get("area_m2")),
                "price": _safe_float(row.get("giavnd")),
                "district": district,
                "amenities": [],
                "isStudio": _coerce_bool(row.get("has_studio")),
                "hasBalcony": _coerce_bool(row.get("has_balcony")),
                "hasFurniture": _coerce_bool(row.get("has_furniture")),
                "hasElevator": _coerce_bool(row.get("has_elevator")),
                "isNew": _coerce_bool(row.get("has_new")),
                "nearSchool": context_flags["nearSchool"],
                "nearHospital": context_flags["nearHospital"],
                "floodSafe": context_flags["floodSafe"],
                "dangerZone": context_flags["dangerZone"],
                "lat": _safe_float(row.get("lat"), DEFAULT_COORDS[0]),
                "lng": _safe_float(row.get("lng"), DEFAULT_COORDS[1]),
                "aiPrice": 0.0,
            }

            if property_item["hasFurniture"]:
                property_item["amenities"].append("Nội thất")
            if property_item["hasElevator"]:
                property_item["amenities"].append("Thang máy")
            if property_item["hasBalcony"]:
                property_item["amenities"].append("Ban công")
            if _coerce_bool(row.get("has_window")):
                property_item["amenities"].append("Cửa sổ")
            if _coerce_bool(row.get("has_mezzanine")):
                property_item["amenities"].append("Gác lửng")

            result.append(property_item)

        return result


data_service = DataService()
