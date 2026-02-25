"use client";

import React, { useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSeed } from "@/context/SeedContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generatePlayers, generateGames, generateTournaments } from "@/data/generators";
import { getCountryFlag, formatRating, formatDate, formatPercentage } from "@/library/formatters";
import { EVENT_TYPES } from "@/library/events";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PlayerDetailPage() {
  const params = useParams();
  const { seed } = useSeed();
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();
  const playerId = Number(params.id);

  const players = useMemo(() => generatePlayers(200, seed), [seed]);
  const tournaments = useMemo(() => generateTournaments(50, seed), [seed]);
  const allGames = useMemo(() => generateGames(tournaments, players, 500, seed), [tournaments, players, seed]);

  const player = useMemo(() => players.find((p) => p.id === playerId), [players, playerId]);
  const playerGames = useMemo(
    () => allGames.filter((g) => g.whitePlayer.id === playerId || g.blackPlayer.id === playerId).slice(0, 20),
    [allGames, playerId]
  );

  useEffect(() => {
    if (player) {
      logInteraction(EVENT_TYPES.VIEW_PLAYER, {
        player_id: player.id,
        name: player.name,
        country: player.country,
        title: player.title,
        rating: player.rating,
      });
    }
  }, [player, logInteraction]);

  if (!player) {
    return (
      <div className="py-6 text-center text-zinc-400">
        <DynamicText value="Player not found" type="text" />
      </div>
    );
  }

  const avgOpponentRating = playerGames.length > 0
    ? Math.round(
        playerGames.reduce((sum, g) => {
          const opRating = g.whitePlayer.id === playerId ? g.blackPlayer.rating : g.whitePlayer.rating;
          return sum + opRating;
        }, 0) / playerGames.length
      )
    : 0;

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <DynamicWrapper>
        <nav className="flex items-center gap-2 text-sm mb-6">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); router.push("/"); }}
            className="text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            Home
          </a>
          <span className="text-zinc-600">/</span>
          <a
            href="/players"
            onClick={(e) => { e.preventDefault(); router.push("/players"); }}
            className="text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            Players
          </a>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 truncate max-w-[200px]">{player.name}</span>
        </nav>
      </DynamicWrapper>

      {/* Profile Header */}
      <DynamicWrapper>
        <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-900/40 flex items-center justify-center text-emerald-400 font-bold text-3xl flex-shrink-0">
              {player.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {player.title && (
                  <span className="text-amber-400 font-bold text-sm bg-amber-400/10 px-2 py-0.5 rounded">
                    {player.title}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-white">
                  <DynamicText value={player.name} type="text" />
                </h1>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <span>{getCountryFlag(player.countryCode)} {player.country}</span>
                <span>Joined {formatDate(player.joinDate)}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <StatItem label="Classical" value={formatRating(player.rating)} highlight />
            <StatItem label="Rapid" value={formatRating(player.rapidRating)} />
            <StatItem label="Blitz" value={formatRating(player.blitzRating)} />
            <StatItem label="Best Rating" value={formatRating(player.bestRating)} />
            <StatItem label="Avg Opponent" value={avgOpponentRating > 0 ? formatRating(avgOpponentRating) : "-"} />
          </div>

          {/* Win/Draw/Loss */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <StatItem label="Games" value={String(player.gamesPlayed)} />
            <StatItem label="Wins" value={String(player.wins)} className="text-green-400" />
            <StatItem label="Draws" value={String(player.draws)} className="text-zinc-400" />
            <StatItem label="Losses" value={String(player.losses)} className="text-red-400" />
          </div>
        </div>
      </DynamicWrapper>

      {/* Rating Chart */}
      <DynamicWrapper>
        <h2 className="text-xl font-bold text-white mb-4">
          <DynamicText value="Rating History" type="text" />
        </h2>
        <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-4 mb-8">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={player.ratingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
              <XAxis
                dataKey="date"
                stroke="#666"
                tick={{ fill: "#888", fontSize: 12 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                }}
              />
              <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 12 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111a11", border: "1px solid #1a3a1a", borderRadius: 8 }}
                labelStyle={{ color: "#888" }}
                itemStyle={{ color: "#10b981" }}
              />
              <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DynamicWrapper>

      {/* Recent Games */}
      <DynamicWrapper>
        <h2 className="text-xl font-bold text-white mb-4">
          <DynamicText value="Recent Games" type="text" />
        </h2>
        <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-900/30 hover:bg-transparent">
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-zinc-400">Opponent</TableHead>
                <TableHead className="text-zinc-400 text-center">Result</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Opening</TableHead>
                <TableHead className="text-zinc-400 text-right hidden md:table-cell">Moves</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerGames.map((g) => {
                const isWhite = g.whitePlayer.id === playerId;
                const opponent = isWhite ? g.blackPlayer : g.whitePlayer;
                const resultForPlayer = isWhite
                  ? g.result === "1-0" ? "Win" : g.result === "0-1" ? "Loss" : "Draw"
                  : g.result === "0-1" ? "Win" : g.result === "1-0" ? "Loss" : "Draw";
                const resultColor = resultForPlayer === "Win" ? "text-green-400" : resultForPlayer === "Loss" ? "text-red-400" : "text-zinc-400";

                return (
                  <TableRow key={g.id} className="border-emerald-900/20 hover:bg-emerald-900/10 cursor-pointer"
                    onClick={() => router.push(`/analysis?game=${g.id}`)}
                  >
                    <TableCell className="text-zinc-400 text-sm">{formatDate(g.date)}</TableCell>
                    <TableCell className="text-white text-sm">
                      {opponent.name} ({opponent.rating})
                      <span className="text-zinc-500 ml-1">{isWhite ? "(B)" : "(W)"}</span>
                    </TableCell>
                    <TableCell className={`text-center font-semibold ${resultColor}`}>{resultForPlayer}</TableCell>
                    <TableCell className="text-zinc-400 text-sm hidden md:table-cell">{g.opening}</TableCell>
                    <TableCell className="text-right text-zinc-500 hidden md:table-cell">{g.moveCount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DynamicWrapper>
    </div>
  );
}

function StatItem({ label, value, highlight, className }: { label: string; value: string; highlight?: boolean; className?: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${highlight ? "text-emerald-400" : className || "text-white"}`}>{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
