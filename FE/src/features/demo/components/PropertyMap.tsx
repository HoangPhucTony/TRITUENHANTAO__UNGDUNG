import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import type { Property } from "@/features/data/mockData";

// Fix the default marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeIcon(color: "green" | "orange" | "red") {
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

interface PropertyMapProps {
  properties: (Property & { score: number; priceMatch: number; locationScore: number; amenityScore: number })[];
}

export function PropertyMap({ properties }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [10.7769, 106.7009],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever filtered properties change
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (properties.length === 0) return;

    const bounds: [number, number][] = [];

    properties.forEach((p, idx) => {
      const ratio = p.price / p.aiPrice;
      const isOverpriced = ratio > 1.3;
      const isCheap = ratio < 0.6;
      const color = isOverpriced ? "red" : isCheap ? "orange" : "green";

      const marker = L.marker([p.lat, p.lng], { icon: makeIcon(color) });

      const statusLabel = isOverpriced
        ? `<span style="color:#ef4444;font-weight:600;">⚠ Cảnh báo lừa đảo</span>`
        : isCheap
        ? `<span style="color:#f97316;font-weight:600;">⚠ Giá quá rẻ</span>`
        : `<span style="color:#22c55e;font-weight:600;">✔ Giá hợp lý</span>`;

      marker.bindPopup(
        `<div style="min-width:200px;font-family:system-ui,sans-serif;">
          <div style="font-weight:700;font-size:13px;margin-bottom:6px;line-height:1.3;">#${idx + 1} ${p.title}</div>
          <div style="margin-bottom:4px;">${statusLabel}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;margin-bottom:6px;">
            <div><span style="color:#6b7280;">Giá đăng:</span><br/><b>${(p.price / 1_000_000).toFixed(1)}tr</b></div>
            <div><span style="color:#6b7280;">Giá AI:</span><br/><b style="color:#6366f1;">${(p.aiPrice / 1_000_000).toFixed(1)}tr</b></div>
          </div>
          <div style="font-size:11px;color:#6b7280;">📍 ${p.district} · ${p.area}m² · Match <b>${p.score}</b></div>
        </div>`,
        { maxWidth: 260 }
      );

      marker.addTo(layer);
      bounds.push([p.lat, p.lng]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, [properties]);

  return (
    <div
      ref={containerRef}
      style={{ height: "420px", width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
    />
  );
}
