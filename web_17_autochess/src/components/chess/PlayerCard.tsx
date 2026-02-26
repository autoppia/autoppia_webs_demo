"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { getCountryFlag, formatRating } from "@/library/formatters";
import type { Player } from "@/shared/types";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const router = useSeedRouter();

  const winRate = player.gamesPlayed > 0
    ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
    : "0";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/players/${player.id}`);
    }
  };

  return (
    <DynamicWrapper>
      <div
        className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4 transition-all hover:border-amber-700/50 cursor-pointer group"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-400 font-bold text-lg flex-shrink-0">
            {player.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {player.title && (
                <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">
                  {player.title}
                </span>
              )}
              <h3 className="text-white font-semibold truncate group-hover:text-amber-400 transition-colors">
                <DynamicText value={player.name} type="text" />
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
              <span>{getCountryFlag(player.countryCode)}</span>
              <span><DynamicText value={player.country} type="text" /></span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-amber-400 font-bold text-lg">{formatRating(player.rating)}</div>
            <div className="text-xs text-zinc-500">ELO</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-800/60 grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="text-zinc-500">Rapid</div>
            <div className="text-zinc-300 font-medium">{formatRating(player.rapidRating)}</div>
          </div>
          <div>
            <div className="text-zinc-500">Blitz</div>
            <div className="text-zinc-300 font-medium">{formatRating(player.blitzRating)}</div>
          </div>
          <div>
            <div className="text-zinc-500">Win Rate</div>
            <div className="text-amber-400 font-medium">{winRate}%</div>
          </div>
        </div>
      </div>
    </DynamicWrapper>
  );
}
