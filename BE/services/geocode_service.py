from __future__ import annotations

import json
from functools import lru_cache
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class GeocodeService:
    SEARCH_URL = "https://nominatim.openstreetmap.org/search"
    USER_AGENT = "SmartStayAI/1.0 (demo geocoding)"
    HCMC_VIEWBOX = "106.30,11.15,106.95,10.45"

    @staticmethod
    def _build_address(item: dict[str, Any]) -> str:
        address = item.get("address") or {}
        parts = [
            address.get("house_number"),
            address.get("road"),
            address.get("suburb"),
            address.get("city_district"),
            address.get("city"),
        ]
        compact = ", ".join(str(part).strip() for part in parts if part)
        if compact:
            return compact

        return str(item.get("display_name", "")).strip()

    @staticmethod
    def _extract_district(item: dict[str, Any]) -> str:
        address = item.get("address") or {}
        district = (
            address.get("city_district")
            or address.get("suburb")
            or address.get("borough")
            or address.get("town")
            or address.get("city")
            or "TP.HCM"
        )
        return str(district).strip()

    @lru_cache(maxsize=128)
    def search(self, query: str, limit: int = 5) -> tuple[dict[str, Any], ...]:
        cleaned_query = query.strip()
        if len(cleaned_query) < 3:
            return ()

        params = {
            "q": cleaned_query,
            "format": "jsonv2",
            "addressdetails": 1,
            "limit": max(1, min(limit, 5)),
            "countrycodes": "vn",
            "accept-language": "vi,en",
            "viewbox": self.HCMC_VIEWBOX,
            "bounded": 1,
        }

        request = Request(
            f"{self.SEARCH_URL}?{urlencode(params)}",
            headers={"User-Agent": self.USER_AGENT},
        )

        with urlopen(request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))

        suggestions: list[dict[str, Any]] = []
        for item in payload:
            try:
                lat = float(item["lat"])
                lng = float(item["lon"])
            except (KeyError, TypeError, ValueError):
                continue

            display_name = str(item.get("display_name", "")).strip()
            name = str(item.get("name") or display_name.split(",")[0]).strip()

            suggestions.append(
                {
                    "name": name or "Địa điểm đã tìm",
                    "address": self._build_address(item),
                    "district": self._extract_district(item),
                    "lat": lat,
                    "lng": lng,
                    "source": "nominatim",
                }
            )

        return tuple(suggestions)


geocode_service = GeocodeService()
