"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { getCountryFlag, formatRating, formatPercentage } from "@/library/formatters";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { Player } from "@/shared/types";

interface TopPlayersTableProps {
  players: Player[];
}

export function TopPlayersTable({ players }: TopPlayersTableProps) {
  const router = useSeedRouter();
  const topPlayers = players.slice(0, 10);

  return (
    <DynamicWrapper>
      <section className="my-8">
        <h2 className="text-xl font-bold text-white mb-4">
          <DynamicText value="Top Players" type="text" />
        </h2>
        <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-900/30 hover:bg-transparent">
                <TableHead className="text-zinc-400 w-12">#</TableHead>
                <TableHead className="text-zinc-400">Player</TableHead>
                <TableHead className="text-zinc-400 text-right">Rating</TableHead>
                <TableHead className="text-zinc-400 text-right hidden md:table-cell">Games</TableHead>
                <TableHead className="text-zinc-400 text-right hidden md:table-cell">Win %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPlayers.map((p, idx) => (
                <TableRow
                  key={p.id}
                  className="border-emerald-900/20 hover:bg-emerald-900/10 cursor-pointer"
                  onClick={() => router.push(`/players/${p.id}`)}
                >
                  <TableCell className="text-zinc-500 font-mono">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.title && (
                        <span className="text-amber-400 font-bold text-xs">{p.title}</span>
                      )}
                      <span className="text-white">{p.name}</span>
                      <span className="text-sm">{getCountryFlag(p.countryCode)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-emerald-400 font-mono">{formatRating(p.rating)}</TableCell>
                  <TableCell className="text-right text-zinc-400 hidden md:table-cell">{p.gamesPlayed}</TableCell>
                  <TableCell className="text-right text-zinc-400 hidden md:table-cell">
                    {formatPercentage(p.wins, p.gamesPlayed)}
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
