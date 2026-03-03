"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSeed } from "@/context/SeedContext";
import {
  generateGames,
  generatePlayers,
  generateTournaments,
} from "@/data/generators";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES } from "@/library/events";
import {
  formatDate,
  formatPercentage,
  formatRating,
  getCountryFlag,
} from "@/library/formatters";
import { Calendar, Swords, TrendingUp, Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function PlayerDetailPage() {
  const params = useParams();
  const { seed } = useSeed();
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();
  const playerId = Number(params.id);

  const players = useMemo(() => generatePlayers(200, seed), [seed]);
  const allGames = useMemo(() => {
    const t = generateTournaments(50, seed);
    return generateGames(t, players, 100, seed);
  }, [seed, players]);
  const player = useMemo(
    () => players.find((p) => p.id === playerId),
    [players, playerId],
  );
  const playerGames = useMemo(
    () =>
      allGames
        .filter(
          (g) => g.whitePlayer.id === playerId || g.blackPlayer.id === playerId,
        )
        .slice(0, 30),
    [allGames, playerId],
  );

  // Calculate detailed statistics
  const stats = useMemo(() => {
    if (!player || playerGames.length === 0) return null;

    let whiteGames = 0,
      whiteWins = 0,
      whiteDraws = 0;
    let blackGames = 0,
      blackWins = 0,
      blackDraws = 0;
    const openingStats: Record<
      string,
      { games: number; wins: number; draws: number; losses: number }
    > = {};
    let totalOpponentRating = 0;

    for (const g of playerGames) {
      const isWhite = g.whitePlayer.id === playerId;
      const opRating = isWhite ? g.blackPlayer.rating : g.whitePlayer.rating;
      totalOpponentRating += opRating;

      // Opening stats
      if (!openingStats[g.opening]) {
        openingStats[g.opening] = { games: 0, wins: 0, draws: 0, losses: 0 };
      }
      const os = openingStats[g.opening];
      os.games++;

      if (isWhite) {
        whiteGames++;
        if (g.result === "1-0") {
          whiteWins++;
          os.wins++;
        } else if (g.result === "1/2-1/2") {
          whiteDraws++;
          os.draws++;
        } else {
          os.losses++;
        }
      } else {
        blackGames++;
        if (g.result === "0-1") {
          blackWins++;
          os.wins++;
        } else if (g.result === "1/2-1/2") {
          blackDraws++;
          os.draws++;
        } else {
          os.losses++;
        }
      }
    }

    const avgOpponentRating = Math.round(
      totalOpponentRating / playerGames.length,
    );

    // Top openings (by frequency)
    const topOpenings = Object.entries(openingStats)
      .sort((a, b) => b[1].games - a[1].games)
      .slice(0, 5)
      .map(([name, s]) => ({
        name,
        games: s.games,
        score: (((s.wins + s.draws * 0.5) / s.games) * 100).toFixed(0),
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
      }));

    return {
      whiteGames,
      whiteWins,
      whiteDraws,
      whiteLosses: whiteGames - whiteWins - whiteDraws,
      blackGames,
      blackWins,
      blackDraws,
      blackLosses: blackGames - blackWins - blackDraws,
      avgOpponentRating,
      topOpenings,
    };
  }, [player, playerGames, playerId]);

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

  return (
    <div className="py-6">
      {/* Breadcrumb */}
      <DynamicWrapper>
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-amber-400 transition-colors"
          >
            Home
          </button>
          <span className="text-zinc-600">/</span>
          <button
            onClick={() => router.push("/players")}
            className="text-zinc-500 hover:text-amber-400 transition-colors"
          >
            Players
          </button>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 truncate max-w-[200px]">
            {player.name}
          </span>
        </nav>
      </DynamicWrapper>

      {/* Profile Header */}
      <DynamicWrapper>
        <div className="bg-gradient-to-r from-[#1a1412] to-[#1c1917] border border-stone-800/80 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-400 font-bold text-3xl flex-shrink-0 border-2 border-amber-800/50">
              {player.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {player.title && (
                  <span className="text-amber-400 font-bold text-sm bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {player.title}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-white">
                  <DynamicText value={player.name} type="text" />
                </h1>
              </div>
              <div className="flex items-center gap-4 text-zinc-400 text-sm mt-1">
                <span>
                  {getCountryFlag(player.countryCode)} {player.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatDate(player.joinDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <RatingCard
              label="Classical"
              value={player.rating}
              icon={<Trophy className="h-4 w-4" />}
              highlight
            />
            <RatingCard
              label="Rapid"
              value={player.rapidRating}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <RatingCard
              label="Blitz"
              value={player.blitzRating}
              icon={<Swords className="h-4 w-4" />}
            />
            <RatingCard label="Peak Rating" value={player.bestRating} />
            <RatingCard
              label="Avg Opponent"
              value={stats?.avgOpponentRating || 0}
            />
          </div>
        </div>
      </DynamicWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart + Games (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Summary */}
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-5">
              <h2 className="text-lg font-bold text-white mb-4">Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBlock
                  label="Games Played"
                  value={String(player.gamesPlayed)}
                />
                <StatBlock
                  label="Win Rate"
                  value={formatPercentage(player.wins, player.gamesPlayed)}
                  color="text-green-400"
                />
                <StatBlock
                  label="Draw Rate"
                  value={formatPercentage(player.draws, player.gamesPlayed)}
                />
                <StatBlock
                  label="Loss Rate"
                  value={formatPercentage(player.losses, player.gamesPlayed)}
                  color="text-red-400"
                />
              </div>

              {/* W/D/L Bar */}
              <div className="mt-4">
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(player.wins / player.gamesPlayed) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-zinc-500"
                    style={{
                      width: `${(player.draws / player.gamesPlayed) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(player.losses / player.gamesPlayed) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                  <span className="text-green-400">{player.wins}W</span>
                  <span className="text-zinc-400">{player.draws}D</span>
                  <span className="text-red-400">{player.losses}L</span>
                </div>
              </div>
            </div>
          </DynamicWrapper>

          {/* Rating Chart */}
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-5">
              <h2 className="text-lg font-bold text-white mb-4">
                Rating History
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={player.ratingHistory}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    tick={{ fill: "#888", fontSize: 11 }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#888", fontSize: 11 }}
                    domain={["dataMin - 50", "dataMax + 50"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1917",
                      border: "1px solid #44403c",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#888" }}
                    itemStyle={{ color: "#f59e0b" }}
                    formatter={(value: number) => [
                      formatRating(value),
                      "Rating",
                    ]}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#ratingGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DynamicWrapper>

          {/* Recent Games */}
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-stone-800/40">
                <h2 className="text-lg font-bold text-white">Recent Games</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-800/60 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-zinc-400">Color</TableHead>
                    <TableHead className="text-zinc-400">Opponent</TableHead>
                    <TableHead className="text-zinc-400 text-center">
                      Result
                    </TableHead>
                    <TableHead className="text-zinc-400 hidden md:table-cell">
                      Opening
                    </TableHead>
                    <TableHead className="text-zinc-400 text-right hidden md:table-cell">
                      Moves
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerGames.map((g) => {
                    const isWhite = g.whitePlayer.id === playerId;
                    const opponent = isWhite ? g.blackPlayer : g.whitePlayer;
                    const resultForPlayer = isWhite
                      ? g.result === "1-0"
                        ? "Win"
                        : g.result === "0-1"
                          ? "Loss"
                          : "Draw"
                      : g.result === "0-1"
                        ? "Win"
                        : g.result === "1-0"
                          ? "Loss"
                          : "Draw";
                    const resultColor =
                      resultForPlayer === "Win"
                        ? "text-green-400"
                        : resultForPlayer === "Loss"
                          ? "text-red-400"
                          : "text-zinc-400";

                    return (
                      <TableRow
                        key={g.id}
                        className="border-stone-800/40 hover:bg-white/5 cursor-pointer"
                        onClick={() => router.push(`/analysis?game=${g.id}`)}
                      >
                        <TableCell className="text-zinc-400 text-sm">
                          {formatDate(g.date)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block w-4 h-4 rounded-sm border ${isWhite ? "bg-white border-zinc-300" : "bg-zinc-800 border-zinc-600"}`}
                          />
                        </TableCell>
                        <TableCell className="text-white text-sm">
                          {opponent.name}
                          <span className="text-zinc-500 ml-1">
                            ({opponent.rating})
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-center font-semibold text-sm ${resultColor}`}
                        >
                          {resultForPlayer}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm hidden md:table-cell truncate max-w-[180px]">
                          {g.opening}
                        </TableCell>
                        <TableCell className="text-right text-zinc-500 hidden md:table-cell">
                          {g.moveCount}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {playerGames.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-zinc-500 py-8"
                      >
                        No games found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DynamicWrapper>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Color Stats */}
          {stats && (
            <DynamicWrapper>
              <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Results by Color
                </h3>
                <div className="space-y-3">
                  <ColorStatRow
                    color="White"
                    games={stats.whiteGames}
                    wins={stats.whiteWins}
                    draws={stats.whiteDraws}
                    losses={stats.whiteLosses}
                  />
                  <ColorStatRow
                    color="Black"
                    games={stats.blackGames}
                    wins={stats.blackWins}
                    draws={stats.blackDraws}
                    losses={stats.blackLosses}
                  />
                </div>
              </div>
            </DynamicWrapper>
          )}

          {/* Opening Repertoire */}
          {stats && stats.topOpenings.length > 0 && (
            <DynamicWrapper>
              <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Top Openings
                </h3>
                <div className="space-y-2.5">
                  {stats.topOpenings.map((o) => (
                    <div key={o.name} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-zinc-300 truncate mr-2">
                          {o.name}
                        </span>
                        <span className="text-zinc-500 flex-shrink-0">
                          {o.games}g
                        </span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-800">
                        <div
                          className="bg-green-500"
                          style={{ width: `${(o.wins / o.games) * 100}%` }}
                        />
                        <div
                          className="bg-zinc-500"
                          style={{ width: `${(o.draws / o.games) * 100}%` }}
                        />
                        <div
                          className="bg-red-500"
                          style={{ width: `${(o.losses / o.games) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-0.5 text-zinc-500">
                        <span>
                          +{o.wins} ={o.draws} -{o.losses}
                        </span>
                        <span className="text-amber-400">{o.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DynamicWrapper>
          )}

          {/* Quick Facts */}
          <DynamicWrapper>
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                Quick Facts
              </h3>
              <div className="space-y-2 text-sm">
                <FactRow label="FIDE ID" value={`#${100000 + player.id}`} />
                <FactRow
                  label="Peak Rating"
                  value={formatRating(player.bestRating)}
                />
                <FactRow
                  label="Rating Change"
                  value={
                    player.ratingHistory.length >= 2
                      ? (() => {
                          const diff =
                            player.ratingHistory[
                              player.ratingHistory.length - 1
                            ].rating -
                            player.ratingHistory[
                              player.ratingHistory.length - 2
                            ].rating;
                          return diff >= 0 ? `+${diff}` : String(diff);
                        })()
                      : "-"
                  }
                />
                <FactRow
                  label="Active Since"
                  value={formatDate(player.joinDate)}
                />
              </div>
            </div>
          </DynamicWrapper>
        </div>
      </div>
    </div>
  );
}

function RatingCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${highlight ? "bg-amber-900/30 border border-amber-700/30" : "bg-white/5 border border-white/5"}`}
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon && (
          <span className={highlight ? "text-amber-400" : "text-zinc-500"}>
            {icon}
          </span>
        )}
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
      <div
        className={`text-lg font-bold ${highlight ? "text-amber-400" : "text-white"}`}
      >
        {formatRating(value)}
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  color,
}: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color || "text-white"}`}>
        {value}
      </div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

function ColorStatRow({
  color,
  games,
  wins,
  draws,
  losses,
}: {
  color: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
}) {
  if (games === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-sm border ${color === "White" ? "bg-white border-zinc-300" : "bg-zinc-800 border-zinc-600"}`}
          />
          <span className="text-zinc-300 text-sm">{color}</span>
        </div>
        <span className="text-zinc-500 text-xs">{games} games</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-800">
        <div
          className="bg-green-500"
          style={{ width: `${(wins / games) * 100}%` }}
        />
        <div
          className="bg-zinc-500"
          style={{ width: `${(draws / games) * 100}%` }}
        />
        <div
          className="bg-red-500"
          style={{ width: `${(losses / games) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-0.5 text-zinc-500">
        <span>
          +{wins} ={draws} -{losses}
        </span>
        <span className="text-amber-400">
          {games > 0 ? ((wins / games) * 100).toFixed(0) : 0}%
        </span>
      </div>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300 font-medium">{value}</span>
    </div>
  );
}
