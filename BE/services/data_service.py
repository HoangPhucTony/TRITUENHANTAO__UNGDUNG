from __future__ import annotations

import hashlib
import re
import unicodedata
from pathlib import Path
from typing import Any

import pandas as pd

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

DISTRICT_CODE_MAP = {
    760: "Quận 1",
    765: "Bình Thạnh",
    769: "Thủ Đức",
    783: "Củ Chi",
    784: "Hóc Môn",
    785: "Bình Chánh",
    786: "Nhà Bè",
    787: "Cần Giờ",
}

FLOOD_RISK_BASELINE_DISTRICTS = {
    "Quận 7",
    "Bình Chánh",
    "Nhà Bè",
    "Thủ Đức",
    "Cần Giờ",
    "Hóc Môn",
}

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CLEANED_DATA_PATH = PROJECT_ROOT / "Analysis" / "outputs" / "data" / "phongtro_cleaned.csv"
EXTERNAL_DATA_DIR = PROJECT_ROOT / "Analysis" / "Dataset" / "raw" / "external"


def _normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    without_accents = "".join(char for char in normalized if not unicodedata.combining(char))
    lowered = without_accents.lower()
    return " ".join(re.sub(r"[^a-z0-9]+", " ", lowered).strip().split())


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
        self.district_aliases: list[tuple[str, str]] = []
        self.property_type_lookup: dict[str, str] = {}
        self.property_type_key_lookup: dict[str, str] = {}
        self.property_type_options: list[dict[str, str | int]] = []
        self.external_context_by_district: dict[str, dict[str, Any]] = {}
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

    def _create_district_aliases(self, districts: list[str]) -> None:
        alias_lookup: dict[str, str] = {}
        alias_pairs: list[tuple[str, str]] = []
        special_aliases = {
            "Thủ Đức": ["thanh pho thu duc", "tp thu duc", "quan thu duc", "thu duc city"],
            "Bình Thạnh": ["quan binh thanh", "q binh thanh"],
            "Phú Nhuận": ["quan phu nhuan", "q phu nhuan"],
            "Tân Bình": ["quan tan binh", "q tan binh"],
            "Gò Vấp": ["quan go vap", "q go vap"],
            "Bình Tân": ["quan binh tan", "q binh tan"],
            "Tân Phú": ["quan tan phu", "q tan phu"],
            "Bình Chánh": ["huyen binh chanh"],
            "Hóc Môn": ["huyen hoc mon"],
            "Củ Chi": ["huyen cu chi"],
            "Nhà Bè": ["huyen nha be"],
            "Cần Giờ": ["huyen can gio"],
        }

        for district in districts:
            aliases = {district, _normalize_text(district)}
            if district.startswith("Quận "):
                district_number = district.split()[-1]
                aliases.update({f"quan {district_number}", f"q {district_number}", f"q{district_number}"})
            aliases.update(special_aliases.get(district, []))

            for alias in aliases:
                normalized_alias = _normalize_text(alias)
                if normalized_alias:
                    alias_lookup[normalized_alias] = district
                    alias_pairs.append((normalized_alias, district))

        self.district_lookup = alias_lookup
        self.district_aliases = sorted(set(alias_pairs), key=lambda item: len(item[0]), reverse=True)

    def _create_property_type_lookup(self, df: pd.DataFrame) -> None:
        grouped = (
            df.groupby(["property_type_clean", "phanloai"])
            .size()
            .reset_index(name="count")
            .sort_values(["count", "property_type_clean"], ascending=[False, True])
        )

        type_lookup: dict[str, str] = {}
        key_lookup: dict[str, str] = {}
        options: list[dict[str, str | int]] = []
        for row in grouped.itertuples(index=False):
            display_name = str(row.property_type_clean).strip()
            key = str(row.phanloai).strip()
            count = int(row.count)
            normalized_display = _normalize_text(display_name)
            normalized_key = _normalize_text(key)
            type_lookup[normalized_display] = display_name
            type_lookup[normalized_key] = display_name
            key_lookup[normalized_display] = key
            key_lookup[normalized_key] = key
            options.append({"key": key, "name": display_name, "count": count})

        self.property_type_lookup = type_lookup
        self.property_type_key_lookup = key_lookup
        self.property_type_options = options

    def _extract_district_name(self, raw_text: Any) -> str | None:
        if pd.isna(raw_text):
            return None
        normalized = _normalize_text(str(raw_text))
        if not normalized:
            return None
        if normalized in self.district_lookup:
            return self.district_lookup[normalized]
        padded = f" {normalized} "
        for alias, district in self.district_aliases:
            if f" {alias} " in padded:
                return district
        return None

    def _read_external_frame(self, filename: str) -> pd.DataFrame:
        path = EXTERNAL_DATA_DIR / filename
        if not path.exists():
            return pd.DataFrame()
        if path.suffix.lower() == ".csv":
            return pd.read_csv(path)
        return pd.read_excel(path)

    def _new_context_template(self, districts: list[str]) -> dict[str, dict[str, Any]]:
        return {
            district: {
                "schoolCount": 0,
                "hospitalCount": 0,
                "landslideAlerts": 0,
                "relocationHouseholds": 0,
                "districtRentBenchmark": 0.0,
                "waterPeakLevel": 0.0,
                "nearSchool": False,
                "nearHospital": False,
                "floodSafe": True,
                "dangerZone": False,
                "environmentScore": 50,
                "contextNotes": [],
            }
            for district in districts
        }

    def _positive_percentile(self, values: list[float], percentile: float) -> float:
        positives = sorted(value for value in values if value > 0)
        if not positives:
            return 0.0
        index = min(len(positives) - 1, round((len(positives) - 1) * percentile))
        return float(positives[index])

    def _merge_count_by_text(self, context: dict[str, dict[str, Any]], df: pd.DataFrame, column: str, target: str) -> None:
        if df.empty or column not in df.columns:
            return
        counts: dict[str, int] = {}
        for raw_text in df[column].dropna().astype(str):
            district = self._extract_district_name(raw_text)
            if district:
                counts[district] = counts.get(district, 0) + 1
        for district, count in counts.items():
            context[district][target] += int(count)

    def _merge_rent_benchmark(self, context: dict[str, dict[str, Any]]) -> None:
        df = self._read_external_frame("VietNamHouseRentDataset2022.csv")
        if df.empty:
            return
        grouped_prices: dict[str, list[float]] = {}
        for _, row in df.iterrows():
            district = self._extract_district_name(row.get("address"))
            price_million = _safe_float(row.get("price"))
            if district and price_million > 0:
                grouped_prices.setdefault(district, []).append(price_million * 1_000_000)
        for district, prices in grouped_prices.items():
            context[district]["districtRentBenchmark"] = float(pd.Series(prices).median())

    def _merge_relocation_context(self, context: dict[str, dict[str, Any]]) -> None:
        df = self._read_external_frame("DuKienDiDan.xls")
        if df.empty:
            return
        for _, row in df.iterrows():
            district = self._extract_district_name(row.get("QuanHuyen"))
            if not district:
                continue
            estimated_households = max(
                _safe_float(row.get("soHoCanDiD")),
                _safe_float(row.get("soHo_bao10")),
                _safe_float(row.get("soHo_bao8_")),
            )
            context[district]["relocationHouseholds"] = int(estimated_households)

    def _merge_landslide_context(self, context: dict[str, dict[str, Any]]) -> None:
        df = self._read_external_frame("BienCanhBaoSatLo.xls")
        if df.empty:
            return
        for _, row in df.iterrows():
            district = DISTRICT_CODE_MAP.get(int(_safe_float(row.get("maHuyen"), 0)))
            if district is None:
                district = self._extract_district_name(row.get("viTriSatLo"))
            if district:
                context[district]["landslideAlerts"] += 1

    def _merge_water_context(self, context: dict[str, dict[str, Any]]) -> None:
        df = self._read_external_frame("MucNuoc.xls")
        if df.empty or "maHuyen" not in df.columns:
            return
        grouped_levels: dict[str, list[float]] = {}
        for _, row in df.iterrows():
            district = DISTRICT_CODE_MAP.get(int(_safe_float(row.get("maHuyen"), 0)))
            peak_level = _safe_float(row.get("doCaoDinhT"))
            if district and peak_level > 0:
                grouped_levels.setdefault(district, []).append(peak_level)
        for district, levels in grouped_levels.items():
            context[district]["waterPeakLevel"] = round(float(pd.Series(levels).mean()), 3)

    def _build_context_notes(self, district: str, values: dict[str, Any]) -> list[str]:
        notes: list[str] = []
        if values["schoolCount"] > 0:
            notes.append(f"{values['schoolCount']} THPT được nhận diện từ dữ liệu giáo dục.")
        if values["hospitalCount"] > 0:
            notes.append(f"{values['hospitalCount']} cơ sở khám chữa bệnh trong dữ liệu y tế.")
        if values["districtRentBenchmark"] > 0:
            notes.append(
                f"Giá thuê tham chiếu ngoài nguồn chính khoảng {values['districtRentBenchmark'] / 1_000_000:.1f} triệu."
            )
        if values["relocationHouseholds"] > 0:
            notes.append(f"Khu vực có dữ liệu di dời khoảng {values['relocationHouseholds']} hộ.")
        if values["landslideAlerts"] > 0:
            notes.append(f"Ghi nhận {values['landslideAlerts']} điểm cảnh báo sạt lở.")
        if values["waterPeakLevel"] > 0:
            notes.append(f"Mức nước đỉnh trung bình trạm gần nhất khoảng {values['waterPeakLevel']:.2f} m.")
        if not notes:
            notes.append(f"Chưa có nhiều tín hiệu ngoại sinh cho {district} trong bộ dữ liệu hiện tại.")
        return notes[:4]

    def _build_external_context(self, districts: list[str]) -> dict[str, dict[str, Any]]:
        context = self._new_context_template(districts)
        self._merge_count_by_text(context, self._read_external_frame("cosokhamchuabenh.csv"), "DiaChi", "hospitalCount")
        self._merge_count_by_text(context, self._read_external_frame("edu_ds_donvi_thpt_cong_lap_0.csv"), "DiaChi", "schoolCount")
        self._merge_count_by_text(context, self._read_external_frame("edu_ds_donvi_thpt_tu_thuc.csv"), "DiaChi", "schoolCount")
        self._merge_rent_benchmark(context)
        self._merge_relocation_context(context)
        self._merge_landslide_context(context)
        self._merge_water_context(context)

        school_threshold = self._positive_percentile([v["schoolCount"] for v in context.values()], 0.45)
        hospital_threshold = self._positive_percentile([v["hospitalCount"] for v in context.values()], 0.45)
        relocation_threshold = self._positive_percentile([v["relocationHouseholds"] for v in context.values()], 0.55)
        water_threshold = self._positive_percentile([v["waterPeakLevel"] for v in context.values()], 0.5)

        max_school = max((v["schoolCount"] for v in context.values()), default=1) or 1
        max_hospital = max((v["hospitalCount"] for v in context.values()), default=1) or 1
        max_relocation = max((v["relocationHouseholds"] for v in context.values()), default=1) or 1

        for district, values in context.items():
            school_count = int(values["schoolCount"])
            hospital_count = int(values["hospitalCount"])
            landslide_alerts = int(values["landslideAlerts"])
            relocation_households = int(values["relocationHouseholds"])
            water_peak_level = float(values["waterPeakLevel"])

            values["nearSchool"] = school_count > 0 and school_count >= school_threshold
            values["nearHospital"] = hospital_count > 0 and hospital_count >= hospital_threshold
            values["dangerZone"] = landslide_alerts > 0 or (
                relocation_threshold > 0 and relocation_households >= relocation_threshold
            )

            flood_risk_points = 0
            if district in FLOOD_RISK_BASELINE_DISTRICTS:
                flood_risk_points += 1
            if water_threshold > 0 and water_peak_level >= water_threshold:
                flood_risk_points += 2
            if landslide_alerts > 0:
                flood_risk_points += 1
            if relocation_threshold > 0 and relocation_households >= relocation_threshold and district in FLOOD_RISK_BASELINE_DISTRICTS:
                flood_risk_points += 1

            values["floodSafe"] = flood_risk_points < 2

            environment_score = 58
            environment_score += round((school_count / max_school) * 12)
            environment_score += round((hospital_count / max_hospital) * 12)
            environment_score -= round((relocation_households / max_relocation) * 14)
            environment_score -= min(12, landslide_alerts * 6)
            environment_score -= flood_risk_points * 5
            values["environmentScore"] = max(15, min(95, int(environment_score)))
            values["contextNotes"] = self._build_context_notes(district, values)

        return context

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
            df["tieude"] = df["tieude"].fillna("Phòng trọ").astype(str)
            df["property_type_clean"] = df["property_type_clean"].fillna("Phòng trọ").astype(str).str.strip()
            df["phanloai"] = df["phanloai"].fillna("PhongTro").astype(str).str.strip()
            df["price_group"] = df["price_group"].fillna("Không xác định").astype(str).str.strip()
            df["area_group"] = df["area_group"].fillna("Không xác định").astype(str).str.strip()
            df["area_m2"] = pd.to_numeric(df["area_m2"], errors="coerce").fillna(0.0)
            df["giavnd"] = pd.to_numeric(df["giavnd"], errors="coerce").fillna(0.0)

            district_names = sorted(df["standardized_location"].dropna().unique())
            self._create_district_aliases(district_names)
            self._create_property_type_lookup(df)

            grouped_stats = (
                df.groupby("standardized_location")["giavnd"]
                .agg(["mean", "count"])
                .sort_index()
                .to_dict("index")
            )
            self.district_stats = {
                district: {"avg_price": float(values["mean"]), "count": int(values["count"])}
                for district, values in grouped_stats.items()
            }
            self.external_context_by_district = self._build_external_context(district_names)

            coords = [self._get_coords(str(row["standardized_location"]), str(index)) for index, row in df.iterrows()]
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
            self.district_aliases = []
            self.property_type_lookup = {}
            self.property_type_key_lookup = {}
            self.property_type_options = []
            self.external_context_by_district = {}
            self.summary = {}

    def resolve_district_name(self, district: str | None) -> str | None:
        if district is None:
            return None
        normalized = _normalize_text(district.strip())
        if not normalized:
            return None
        return self.district_lookup.get(normalized) or self._extract_district_name(district)

    def resolve_property_type(self, property_type: str | None) -> tuple[str | None, str | None]:
        if property_type is None:
            return None, None
        normalized = _normalize_text(property_type.strip())
        if not normalized:
            return None, None
        display_name = self.property_type_lookup.get(normalized)
        type_key = self.property_type_key_lookup.get(normalized)
        return display_name, type_key

    def get_summary(self) -> dict[str, float | int]:
        return self.summary

    def get_districts(self) -> list[dict[str, float | int | str | bool | list[str]]]:
        if not self.district_stats:
            return [
                {
                    "name": district,
                    "avg_price": 4_000_000.0,
                    "count": 0,
                    "schoolCount": 0,
                    "hospitalCount": 0,
                    "landslideAlerts": 0,
                    "relocationHouseholds": 0,
                    "districtRentBenchmark": 0.0,
                    "environmentScore": 50,
                    "floodSafe": True,
                    "dangerZone": False,
                    "contextNotes": [],
                }
                for district in sorted(DISTRICT_COORDS)
            ]

        results = []
        for district, values in self.district_stats.items():
            context = self.external_context_by_district.get(district, self._new_context_template([district])[district])
            results.append(
                {
                    "name": district,
                    "avg_price": values["avg_price"],
                    "count": values["count"],
                    "schoolCount": int(context["schoolCount"]),
                    "hospitalCount": int(context["hospitalCount"]),
                    "landslideAlerts": int(context["landslideAlerts"]),
                    "relocationHouseholds": int(context["relocationHouseholds"]),
                    "districtRentBenchmark": float(context["districtRentBenchmark"]),
                    "environmentScore": int(context["environmentScore"]),
                    "floodSafe": bool(context["floodSafe"]),
                    "dangerZone": bool(context["dangerZone"]),
                    "contextNotes": list(context["contextNotes"]),
                }
            )
        return results

    def get_property_types(self) -> list[dict[str, str | int]]:
        return list(self.property_type_options)

    def get_properties(self, limit: int = 2000, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
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

            property_type_name, property_type_key = self.resolve_property_type(filters.get("property_type"))
            if filters.get("property_type") and property_type_name and property_type_key:
                filtered_df = filtered_df[
                    (filtered_df["property_type_clean"] == property_type_name)
                    | (filtered_df["phanloai"] == property_type_key)
                ]
            elif filters.get("property_type"):
                return []

        result: list[dict[str, Any]] = []
        for index, row in filtered_df.head(limit).iterrows():
            district = str(row.get("standardized_location", "Chưa rõ"))
            context = self.external_context_by_district.get(district, self._new_context_template([district])[district])

            property_item = {
                "id": str(index),
                "title": str(row.get("tieude", "Phòng trọ")),
                "propertyType": str(row.get("property_type_clean", "Phòng trọ")),
                "propertyTypeKey": str(row.get("phanloai", "PhongTro")),
                "areaGroup": str(row.get("area_group", "Không xác định")),
                "priceGroup": str(row.get("price_group", "Không xác định")),
                "area": _safe_float(row.get("area_m2")),
                "price": _safe_float(row.get("giavnd")),
                "district": district,
                "amenities": [],
                "isStudio": _coerce_bool(row.get("has_studio")),
                "hasBalcony": _coerce_bool(row.get("has_balcony")),
                "hasFurniture": _coerce_bool(row.get("has_furniture")),
                "hasElevator": _coerce_bool(row.get("has_elevator")),
                "isNew": _coerce_bool(row.get("has_new")),
                "nearSchool": bool(context["nearSchool"]),
                "nearHospital": bool(context["nearHospital"]),
                "floodSafe": bool(context["floodSafe"]),
                "dangerZone": bool(context["dangerZone"]),
                "schoolCount": int(context["schoolCount"]),
                "hospitalCount": int(context["hospitalCount"]),
                "landslideAlerts": int(context["landslideAlerts"]),
                "relocationHouseholds": int(context["relocationHouseholds"]),
                "districtRentBenchmark": float(context["districtRentBenchmark"]),
                "environmentScore": int(context["environmentScore"]),
                "contextNotes": list(context["contextNotes"]),
                "lat": _safe_float(row.get("lat"), DEFAULT_COORDS[0]),
                "lng": _safe_float(row.get("lng"), DEFAULT_COORDS[1]),
                "aiPrice": 0.0,
                "aiModelKey": "",
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
