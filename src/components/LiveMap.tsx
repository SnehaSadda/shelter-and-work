import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Database } from "@/integrations/supabase/types";

type Resource = Database["public"]["Tables"]["resources"]["Row"];

// Fix default icon paths (Leaflet default assumes webpack URL handling)
const icon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:oklch(0.65 0.15 250);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:oklch(0.78 0.16 65);border:3px solid white;box-shadow:0 0 0 6px oklch(0.78 0.16 65 / 0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function LiveMap({
  resources,
  userPos,
  height = 420,
}: {
  resources: Resource[];
  userPos: { lat: number; lng: number } | null;
  height?: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;
    const center: [number, number] = userPos ? [userPos.lat, userPos.lng] : [40.7128, -74.006];
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView(center, 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);
    instanceRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); instanceRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = instanceRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const points: L.LatLngExpression[] = [];

    if (userPos) {
      L.marker([userPos.lat, userPos.lng], { icon: userIcon })
        .bindPopup("<b>You are here</b>")
        .addTo(layer);
      points.push([userPos.lat, userPos.lng]);
    }

    resources.forEach((r) => {
      if (r.latitude == null || r.longitude == null) return;
      const lat = Number(r.latitude), lng = Number(r.longitude);
      L.marker([lat, lng], { icon })
        .bindPopup(
          `<div style="font-family:system-ui;min-width:180px">
            <div style="font-weight:600;font-size:14px">${escapeHtml(r.name)}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px">${escapeHtml(r.address)}</div>
            <div style="margin-top:6px"><span style="font-size:11px;background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:8px">${r.type}</span> <span style="font-size:11px;color:#475569">· ${r.status}</span></div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="display:inline-block;margin-top:8px;font-size:12px;color:oklch(0.55 0.18 250);font-weight:500">Get directions →</a>
          </div>`
        )
        .addTo(layer);
      points.push([lat, lng]);
    });

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points as L.LatLngTuple[]), { padding: [40, 40], maxZoom: 14 });
    }
  }, [resources, userPos]);

  return (
    <div
      ref={mapRef}
      style={{ height, borderRadius: "1rem", overflow: "hidden" }}
      className="border border-border shadow-[var(--shadow-soft)]"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
