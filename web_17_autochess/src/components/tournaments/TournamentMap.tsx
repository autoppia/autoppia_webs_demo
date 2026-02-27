"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Tournament } from "@/shared/types";
import { getCountryFlag, formatDateRange } from "@/library/formatters";

// Color-coded SVG marker icons by game type
function createColorIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -34],
    html: `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>`,
  });
}

const markerIcons: Record<string, L.DivIcon> = {
  Classical: createColorIcon("#22c55e"),  // green
  Rapid: createColorIcon("#3b82f6"),      // blue
  Blitz: createColorIcon("#f59e0b"),      // amber
};

const completedIcon = createColorIcon("#71717a"); // gray for completed

function getMarkerIcon(tournament: Tournament): L.DivIcon {
  if (tournament.status === "completed") return completedIcon;
  return markerIcons[tournament.gameType] || markerIcons.Classical;
}

interface TournamentMapProps {
  tournaments: Tournament[];
  height?: number;
  onTournamentClick?: (id: number) => void;
}

export default function TournamentMap({ tournaments, height = 450, onTournamentClick }: TournamentMapProps) {
  useEffect(() => {
    // No-op: we use custom icons per marker
  }, []);

  const center: [number, number] = tournaments.length > 0
    ? [
      tournaments.reduce((s, t) => s + t.lat, 0) / tournaments.length,
      tournaments.reduce((s, t) => s + t.lng, 0) / tournaments.length,
    ]
    : [48.86, 2.35];

  return (
    <div className="relative">
      <div className="rounded-xl overflow-hidden border border-stone-800/80" style={{ height }}>
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
            <Marker key={t.id} position={[t.lat, t.lng]} icon={getMarkerIcon(t)}>
              <Popup>
                <div className="text-sm min-w-[220px] font-sans">
                  <div className="font-bold text-sm text-gray-900 mb-1.5">{t.name}</div>
                  <div className="text-gray-600 text-xs mb-1">
                    {getCountryFlag(t.countryCode)} {t.location}, {t.country}
                  </div>
                  <div className="text-gray-500 text-xs mb-2">{formatDateRange(t.startDate, t.endDate)}</div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      t.gameType === "Classical" ? "bg-green-100 text-green-700" :
                      t.gameType === "Rapid" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {t.gameType}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      t.status === "active" ? "bg-green-100 text-green-700" :
                      t.status === "upcoming" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{t.playerCount} players</span>
                    <span>{t.rounds} rounds</span>
                  </div>
                  {onTournamentClick && (
                    <button
                      onClick={() => onTournamentClick(t.id)}
                      className="mt-2 w-full text-xs text-center py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 font-medium transition-colors"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#1c1917]/90 backdrop-blur-sm border border-stone-700/60 rounded-lg px-3 py-2 flex items-center gap-3">
        <LegendItem color="#22c55e" label="Classical" />
        <LegendItem color="#3b82f6" label="Rapid" />
        <LegendItem color="#f59e0b" label="Blitz" />
        <LegendItem color="#71717a" label="Completed" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-stone-400">{label}</span>
    </div>
  );
}
