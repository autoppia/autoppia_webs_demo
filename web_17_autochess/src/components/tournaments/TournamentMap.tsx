"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Tournament } from "@/shared/types";
import { getCountryFlag, formatDateRange, getGameTypeBadgeClass, getStatusBadgeClass } from "@/library/formatters";

// Fix Leaflet default marker icon (broken in bundlers)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface TournamentMapProps {
  tournaments: Tournament[];
}

export default function TournamentMap({ tournaments }: TournamentMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  // Calculate center from tournaments or default to Europe
  const center: [number, number] = tournaments.length > 0
    ? [
      tournaments.reduce((s, t) => s + t.lat, 0) / tournaments.length,
      tournaments.reduce((s, t) => s + t.lng, 0) / tournaments.length,
    ]
    : [48.86, 2.35];

  return (
    <div className="rounded-xl overflow-hidden border border-stone-800/80" style={{ height: 500 }}>
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {tournaments.map((t) => (
          <Marker key={t.id} position={[t.lat, t.lng]} icon={defaultIcon}>
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-semibold text-base mb-1">{t.name}</div>
                <div className="text-gray-600 mb-1">
                  {getCountryFlag(t.countryCode)} {t.location}
                </div>
                <div className="text-gray-500 mb-1">{formatDateRange(t.startDate, t.endDate)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded border ${getGameTypeBadgeClass(t.gameType)}`}>
                    {t.gameType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(t.status)}`}>
                    {t.status}
                  </span>
                </div>
                <div className="text-gray-500 mt-1">{t.playerCount} players</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
