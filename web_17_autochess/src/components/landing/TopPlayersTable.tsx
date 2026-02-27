"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { getCountryFlag, formatRating, formatPercentage } from "@/library/formatters";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import type { Player } from "@/shared/types";

interface TopPlayersTableProps {
  players: Player[];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs">1</span>;
  if (rank === 2) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-400/20 text-stone-300 font-bold text-xs">2</span>;
  if (rank === 3) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 font-bold text-xs">3</span>;
  return <span className="text-stone-500 font-mono w-6 text-center inline-block">{rank}</span>;
}

export function TopPlayersTable({ players }: TopPlayersTableProps) {
  const router = useSeedRouter();
  const topPlayers = players.slice(0, 10);

  return (
    <DynamicWrapper>
      <section className="my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">
              <DynamicText value="Top Players" type="text" />
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">Classical rating leaderboard</p>
          </div>
          <button
            onClick={() => router.push("/players")}
            className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors group"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-stone-800/60 hover:bg-transparent">
                <TableHead className="text-stone-500 w-14">#</TableHead>
                <TableHead className="text-stone-500">Player</TableHead>
                <TableHead className="text-stone-500 text-right">Classical</TableHead>
                <TableHead className="text-stone-500 text-right hidden md:table-cell">Rapid</TableHead>
                <TableHead className="text-stone-500 text-right hidden md:table-cell">Blitz</TableHead>
                <TableHead className="text-stone-500 text-right hidden lg:table-cell">Games</TableHead>
                <TableHead className="text-stone-500 text-right hidden lg:table-cell">Win %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPlayers.map((p, idx) => (
                <TableRow
                  key={p.id}
                  className="border-stone-800/40 hover:bg-white/[0.03] cursor-pointer transition-colors"
                  onClick={() => router.push(`/players/${p.id}`)}
                >
                  <TableCell>
                    <RankBadge rank={idx + 1} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.title && (
                        <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">{p.title}</span>
                      )}
                      <span className="text-white hover:text-amber-400 transition-colors font-medium">{p.name}</span>
                      <span className="text-sm">{getCountryFlag(p.countryCode)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-amber-400 font-mono font-semibold">{formatRating(p.rating)}</TableCell>
                  <TableCell className="text-right text-stone-400 font-mono hidden md:table-cell">{formatRating(p.rapidRating)}</TableCell>
                  <TableCell className="text-right text-stone-400 font-mono hidden md:table-cell">{formatRating(p.blitzRating)}</TableCell>
                  <TableCell className="text-right text-stone-500 hidden lg:table-cell">{p.gamesPlayed}</TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    <span className={`font-medium ${
                      (p.wins / p.gamesPlayed) > 0.55 ? "text-green-400" : (p.wins / p.gamesPlayed) > 0.45 ? "text-stone-300" : "text-stone-500"
                    }`}>
                      {formatPercentage(p.wins, p.gamesPlayed)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </DynamicWrapper>
  );
}
