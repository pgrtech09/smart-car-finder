"use client";

import { useEffect, useRef } from "react";
import type { Coordinates } from "@/types";

interface ParkingMapProps {
  carLocation?: { latitude: number; longitude: number };
  userLocation?: Coordinates | null;
  height?: string;
  zoom?: number;
}

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

export function ParkingMap({
  carLocation,
  userLocation,
  height = "300px",
  zoom = 16,
}: ParkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof window.L.map> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const center: [number, number] = carLocation
        ? [carLocation.latitude, carLocation.longitude]
        : userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : [0, 0];

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Car marker (blue pin)
      if (carLocation) {
        const carIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:32px;height:32px;
            background:linear-gradient(135deg,#4c6ef5,#06b6d4);
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid #fff;
            box-shadow:0 0 16px rgba(76,110,245,0.7);
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 28],
        });

        L.marker([carLocation.latitude, carLocation.longitude], { icon: carIcon })
          .addTo(map)
          .bindPopup(
            `<div style="color:#fff;font-family:Inter,sans-serif;">
              <strong>🚗 Your Car</strong><br/>
              <span style="font-size:11px;color:#94a3b8">Parked here</span>
            </div>`
          );
      }

      // User marker (green dot)
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:20px;height:20px;
            background:#10b981;
            border-radius:50%;
            border:3px solid #fff;
            box-shadow:0 0 12px rgba(16,185,129,0.6);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<div style="color:#fff;font-family:Inter,sans-serif;"><strong>📍 You</strong></div>`);
      }

      // Draw line between user and car
      if (carLocation && userLocation) {
        L.polyline(
          [
            [userLocation.latitude, userLocation.longitude],
            [carLocation.latitude, carLocation.longitude],
          ],
          { color: "#4c6ef5", weight: 2, dashArray: "6 6", opacity: 0.7 }
        ).addTo(map);

        // Fit bounds to show both
        const bounds = L.latLngBounds([
          [userLocation.latitude, userLocation.longitude],
          [carLocation.latitude, carLocation.longitude],
        ]);
        map.fitBounds(bounds, { padding: [48, 48] });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [carLocation?.latitude, carLocation?.longitude, userLocation?.latitude, userLocation?.longitude, zoom]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-xl overflow-hidden"
    />
  );
}
