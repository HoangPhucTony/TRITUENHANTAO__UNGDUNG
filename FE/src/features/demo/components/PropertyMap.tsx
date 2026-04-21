import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LeafletMouseEvent } from "leaflet";
import L from "leaflet";

import type { Property } from "@/features/data/mockData";
import type { DesiredLocation } from "@/features/demo/data/locationOptions";
import { formatDistanceKm } from "@/features/demo/data/locationOptions";

type RankedProperty = Property & {
  score: number;
  priceMatch: number;
  locationScore: number;
  amenityScore: number;
  contextScore: number;
  distanceKm: number | null;
  withinPreferredRadius: boolean;
};

interface PropertyMapProps {
  properties: RankedProperty[];
  selectedLocation: DesiredLocation | null;
  preferredRadiusKm: number;
  mapSelectionEnabled?: boolean;
  onSelectLocation?: (coords: { lat: number; lng: number }) => void;
}

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeListingIcon(color: "green" | "orange" | "red") {
  const colors = {
    green: { bg: "#22c55e", border: "#16a34a" },
    orange: { bg: "#f97316", border: "#ea580c" },
    red: { bg: "#ef4444", border: "#dc2626" },
  };
  const { bg, border } = colors[color];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -38],
  });
}

function makeTargetIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="30" height="42">
    <path d="M15 0C7.2 0 0.9 6.3 0.9 14.1c0 10.5 14.1 27.9 14.1 27.9s14.1-17.4 14.1-27.9C29.1 6.3 22.8 0 15 0z" fill="#2563eb"/>
    <circle cx="15" cy="14" r="6.2" fill="#ffffff"/>
    <circle cx="15" cy="14" r="2.8" fill="#2563eb"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
}

export function PropertyMap({
  properties,
  selectedLocation,
  preferredRadiusKm,
  mapSelectionEnabled = false,
  onSelectLocation,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const listingLayerRef = useRef<L.LayerGroup | null>(null);
  const selectionLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: [10.7769, 106.7009],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    listingLayerRef.current = L.layerGroup().addTo(map);
    selectionLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    function handleMapClick(event: LeafletMouseEvent) {
      if (!mapSelectionEnabled || !onSelectLocation) {
        return;
      }

      onSelectLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
    }

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [mapSelectionEnabled, onSelectLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.getContainer().style.cursor = mapSelectionEnabled ? "crosshair" : "";
  }, [mapSelectionEnabled]);

  useEffect(() => {
    const map = mapRef.current;
    const listingLayer = listingLayerRef.current;
    const selectionLayer = selectionLayerRef.current;

    if (!map || !listingLayer || !selectionLayer) {
      return;
    }

    listingLayer.clearLayers();
    selectionLayer.clearLayers();

    const bounds: [number, number][] = [];

    properties.forEach((property, index) => {
      const ratio = property.price / property.aiPrice;
      const isHighVsAi = ratio > 1.25;
      const needsVerification = ratio < 0.65;
      const color = isHighVsAi ? "red" : needsVerification ? "orange" : "green";

      const marker = L.marker([property.lat, property.lng], {
        icon: makeListingIcon(color),
      });

      const statusLabel = isHighVsAi
        ? `<span style="color:#ef4444;font-weight:600;">Giá cao hơn AI</span>`
        : needsVerification
          ? `<span style="color:#f97316;font-weight:600;">Cần kiểm tra thêm</span>`
          : `<span style="color:#22c55e;font-weight:600;">Giá hợp lý</span>`;

      const distanceLine =
        property.distanceKm !== null
          ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">Khoảng cách: <b>${formatDistanceKm(property.distanceKm)}</b></div>`
          : "";

      const benchmarkLine =
        property.districtRentBenchmark > 0
          ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">Benchmark quận: <b>${(property.districtRentBenchmark / 1_000_000).toFixed(1)}tr</b></div>`
          : "";

      marker.bindPopup(
        `<div style="min-width:220px;font-family:system-ui,sans-serif;">
          <div style="font-weight:700;font-size:13px;margin-bottom:6px;line-height:1.3;">#${index + 1} ${property.title}</div>
          <div style="margin-bottom:4px;">${statusLabel}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">${property.propertyType} · ${property.areaGroup}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;margin-bottom:6px;">
            <div><span style="color:#6b7280;">Giá đăng:</span><br/><b>${(property.price / 1_000_000).toFixed(1)}tr</b></div>
            <div><span style="color:#6b7280;">Giá AI:</span><br/><b style="color:#6366f1;">${(property.aiPrice / 1_000_000).toFixed(1)}tr</b></div>
          </div>
          <div style="font-size:11px;color:#6b7280;">${property.district} · ${property.area}m² · Match <b>${property.score}</b></div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Bối cảnh quận: <b>${property.environmentScore}</b>/100 · ${property.schoolCount} THPT · ${property.hospitalCount} CSYT</div>
          ${distanceLine}
          ${benchmarkLine}
        </div>`,
        { maxWidth: 280 },
      );

      marker.addTo(listingLayer);
      bounds.push([property.lat, property.lng]);
    });

    if (selectedLocation) {
      const targetMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: makeTargetIcon(),
      });

      targetMarker.bindPopup(
        `<div style="min-width:200px;font-family:system-ui,sans-serif;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${selectedLocation.name}</div>
          <div style="font-size:12px;color:#6b7280;">${selectedLocation.address}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:6px;">Bán kính ưu tiên: <b>${preferredRadiusKm.toFixed(1)} km</b></div>
        </div>`,
      );

      targetMarker.addTo(selectionLayer);

      L.circle([selectedLocation.lat, selectedLocation.lng], {
        radius: preferredRadiusKm * 1000,
        color: "#2563eb",
        weight: 1.5,
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
      }).addTo(selectionLayer);

      bounds.push([selectedLocation.lat, selectedLocation.lng]);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      return;
    }

    if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, [preferredRadiusKm, properties, selectedLocation]);

  return (
    <div
      ref={containerRef}
      style={{ height: "420px", width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
    />
  );
}
