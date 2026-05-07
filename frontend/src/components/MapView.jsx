import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function MapView({ points, selectedRegion }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!containerRef.current || mapRef.current) return;
      const leaflet = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = leaflet.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([34.5, 9.8], 6);

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        })
        .addTo(map);

      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
    }

    setupMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function renderPoints() {
      if (!mapRef.current || !layerRef.current) return;
      const leaflet = await import("leaflet");
      if (cancelled || !mapRef.current || !layerRef.current) return;

      const layer = layerRef.current;
      const map = mapRef.current;
      if (!layer || !map) return;
      layer.clearLayers();

      if (!points.length) {
        map.setView([34.5, 9.8], 6);
        return;
      }

      const bounds = [];
      points.forEach((point) => {
        const color = point.region === selectedRegion ? "#c76b00" : "#0f766e";
        const marker = leaflet.marker([point.latitude, point.longitude], {
          icon: leaflet.divIcon({
            className: "custom-marker",
            html: `<span style="background:${color}"></span>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
        });

        marker.bindPopup(
          `<strong>${point.product_name}</strong><br />${Number(point.price).toFixed(3)} TND<br />${point.city || "Ville inconnue"}${point.region ? `, ${point.region}` : ""}`
        );
        marker.addTo(layer);
        bounds.push([point.latitude, point.longitude]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 11);
      } else {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    renderPoints();

    return () => {
      cancelled = true;
    };
  }, [points, selectedRegion]);

  return <div ref={containerRef} className="leaflet-shell" />;
}
