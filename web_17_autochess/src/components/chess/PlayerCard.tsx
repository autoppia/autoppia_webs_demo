"use client";

import React from "react";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { getCountryFlag, formatRating } from "@/library/formatters";
import type { Player } from "@/shared/types";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const winRate = player.gamesPlayed > 0
    ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
    : "0";

  return (
    <DynamicWrapper>
      <div
        className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-4 hover:border-emerald-700/50 transition-all cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-emerald-900/40 flex items-center justify-center text-emerald-400 font-bold text-lg flex-shrink-0">
            {player.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {player.title && (
                <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">
                  {player.title}
                </span>
              )}
              <h3 className="text-white font-semibold truncate group-hover:text-emerald-400 transition-colors">
                <DynamicText value={player.name} type="text" />
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
              <span>{getCountryFlag(player.countryCode)}</span>
              <span><DynamicText value={player.country} type="text" /></span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-emerald-400 font-bold text-lg">{formatRating(player.rating)}</div>
            <div className="text-xs text-zinc-500">ELO</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <span>{player.gamesPlayed} games</span>
          <span className="text-emerald-400">{winRate}% win rate</span>
        </div>
      </div>
    </DynamicWrapper>
  );
}
