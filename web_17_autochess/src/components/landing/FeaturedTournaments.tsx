"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { getCountryFlag, formatDateRange, getStatusBadgeClass, getGameTypeBadgeClass } from "@/library/formatters";
import { Users, Calendar, ArrowRight, MapPin } from "lucide-react";
import type { Tournament } from "@/shared/types";

interface FeaturedTournamentsProps {
  tournaments: Tournament[];
}

export function FeaturedTournaments({ tournaments }: FeaturedTournamentsProps) {
  const router = useSeedRouter();
  const featured = tournaments.slice(0, 6);

  return (
    <DynamicWrapper>
      <section className="my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">
              <DynamicText value="Featured Tournaments" type="text" />
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">Upcoming and ongoing events</p>
          </div>
          <button
            onClick={() => router.push("/tournaments")}
            className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors group"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((t, idx) => (
            <div
              key={t.id}
              className={`bg-[#1c1917] border rounded-xl overflow-hidden transition-all hover:border-amber-700/50 cursor-pointer group ${
                idx === 0 ? "border-amber-800/40 md:col-span-2 lg:col-span-1" : "border-stone-800/80"
              }`}
              onClick={() => router.push(`/tournaments/${t.id}`)}
            >
              {/* Top color accent bar */}
              <div className={`h-1 ${
                t.status === "active" ? "bg-green-500" : t.status === "upcoming" ? "bg-amber-500" : "bg-stone-700"
              }`} />

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-amber-400 transition-colors line-clamp-1">
                      <DynamicText value={t.name} type="text" />
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-400">
                      <MapPin className="h-3 w-3 text-stone-500 flex-shrink-0" />
                      <span className="truncate">{getCountryFlag(t.countryCode)} <DynamicText value={`${t.location}`} type="text" /></span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${getStatusBadgeClass(t.status)}`}>
                    {t.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
                  <Calendar className="h-3 w-3 text-stone-500" />
                  <span>{formatDateRange(t.startDate, t.endDate)}</span>
                </div>

                {/* Bottom row: badges + player count */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getGameTypeBadgeClass(t.gameType)}`}>
                      {t.gameType}
                    </span>
                    <span className="text-xs text-stone-500">{t.rounds} rds</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Users className="h-3 w-3" />
                    <span>{t.playerCount}</span>
                    <span className="text-stone-600">|</span>
                    <span className="text-stone-500">{t.eloMin}-{t.eloMax}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DynamicWrapper>
  );
}
