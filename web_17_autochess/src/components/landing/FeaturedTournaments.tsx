"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { getCountryFlag, formatDateRange, getStatusBadgeClass, getGameTypeBadgeClass } from "@/library/formatters";
import type { Tournament } from "@/shared/types";

interface FeaturedTournamentsProps {
  tournaments: Tournament[];
}

export function FeaturedTournaments({ tournaments }: FeaturedTournamentsProps) {
  const router = useSeedRouter();
  const featured = tournaments.slice(0, 5);

  return (
    <DynamicWrapper>
      <section className="my-8">
        <h2 className="text-xl font-bold text-white mb-4">
          <DynamicText value="Featured Tournaments" type="text" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((t) => (
            <div
              key={t.id}
              className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-4 hover:border-emerald-700/50 transition-all cursor-pointer group"
              onClick={() => router.push(`/tournaments/${t.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors text-sm leading-tight">
                  <DynamicText value={t.name} type="text" />
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(t.status)}`}>
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div className="flex items-center gap-1">
                  <span>{getCountryFlag(t.countryCode)}</span>
                  <span><DynamicText value={`${t.location}, ${t.country}`} type="text" /></span>
                </div>
                <div>{formatDateRange(t.startDate, t.endDate)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${getGameTypeBadgeClass(t.gameType)}`}>
                    {t.gameType}
                  </span>
                  <span>{t.playerCount} players</span>
                  <span>{t.rounds} rounds</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DynamicWrapper>
  );
}
