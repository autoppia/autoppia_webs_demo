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
  generateStandings,
  generateTournaments,
} from "@/data/generators";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES } from "@/library/events";
import {
  formatDate,
  formatDateRange,
  formatRating,
  getCountryFlag,
  getGameTypeBadgeClass,
  getStatusBadgeClass,
} from "@/library/formatters";
import {
  BarChart3,
  Calendar,
  MapPin,
  Swords,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

type TabId = "standings" | "games" | "info";

export default function TournamentDetailPage() {
  const params = useParams();
  const { seed } = useSeed();
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();
  const tournamentId = Number(params.id);

  const tournaments = useMemo(() => generateTournaments(50, seed), [seed]);
  const players = useMemo(() => generatePlayers(200, seed), [seed]);
  const tournament = useMemo(
    () => tournaments.find((t) => t.id === tournamentId),
    [tournaments, tournamentId],
  );
  const standings = useMemo(
    () => (tournament ? generateStandings(tournament, players, seed) : []),
    [tournament, players, seed],
  );
  const allGames = useMemo(
    () => generateGames(tournaments, players, 100, seed),
    [tournaments, players, seed],
  );
  const tournamentGames = useMemo(
    () => allGames.filter((g) => g.tournamentId === tournamentId).slice(0, 30),
    [allGames, tournamentId],
  );

  const [activeTab, setActiveTab] = useState<TabId>("standings");

  // Group games by round
  const gamesByRound = useMemo(() => {
    const grouped: Record<number, typeof tournamentGames> = {};
    for (const g of tournamentGames) {
      if (!grouped[g.round]) grouped[g.round] = [];
      grouped[g.round].push(g);
    }
    return grouped;
  }, [tournamentGames]);

  const roundNumbers = Object.keys(gamesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  useEffect(() => {
    if (tournament) {
      logInteraction(EVENT_TYPES.VIEW_TOURNAMENT, {
        tournament_id: tournament.id,
        name: tournament.name,
        location: tournament.location,
        gameType: tournament.gameType,
        playerCount: tournament.playerCount,
        status: tournament.status,
      });
    }
  }, [tournament, logInteraction]);

  if (!tournament) {
    return (
      <div className="py-6 text-center text-zinc-400">
        <DynamicText value="Tournament not found" type="text" />
      </div>
    );
  }

  // Stats calculations
  const decisiveGames = tournamentGames.filter(
    (g) => g.result !== "1/2-1/2",
  ).length;
  const drawRate =
    tournamentGames.length > 0
      ? (
          ((tournamentGames.length - decisiveGames) / tournamentGames.length) *
          100
        ).toFixed(0)
      : "0";
  const avgMoves =
    tournamentGames.length > 0
      ? Math.round(
          tournamentGames.reduce((s, g) => s + g.moveCount, 0) /
            tournamentGames.length,
        )
      : 0;

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
            onClick={() => router.push("/tournaments")}
            className="text-zinc-500 hover:text-amber-400 transition-colors"
          >
            Tournaments
          </button>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 truncate max-w-[250px]">
            {tournament.name}
          </span>
        </nav>
      </DynamicWrapper>

      {/* Header */}
      <DynamicWrapper>
        <div className="bg-gradient-to-r from-[#1a1412] to-[#1c1917] border border-stone-800/80 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className={`text-xs px-2.5 py-1 rounded border font-medium ${getStatusBadgeClass(tournament.status)}`}
            >
              {tournament.status.charAt(0).toUpperCase() +
                tournament.status.slice(1)}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded border font-medium ${getGameTypeBadgeClass(tournament.gameType)}`}
            >
              {tournament.gameType}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            <DynamicText value={tournament.name} type="text" />
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-zinc-500" />
              {getCountryFlag(tournament.countryCode)} {tournament.location},{" "}
              {tournament.country}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-zinc-500" />
              {formatDateRange(tournament.startDate, tournament.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-zinc-500" />
              {tournament.playerCount} players
            </span>
            <span className="flex items-center gap-1.5">
              <Swords className="h-4 w-4 text-zinc-500" />
              {tournament.rounds} rounds
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <QuickStat
              icon={<Trophy className="h-4 w-4" />}
              label="ELO Range"
              value={`${tournament.eloMin} - ${tournament.eloMax}`}
            />
            <QuickStat
              icon={<Swords className="h-4 w-4" />}
              label="Games Recorded"
              value={String(tournamentGames.length)}
            />
            <QuickStat
              icon={<BarChart3 className="h-4 w-4" />}
              label="Draw Rate"
              value={`${drawRate}%`}
            />
            <QuickStat
              icon={<Timer className="h-4 w-4" />}
              label="Avg Moves"
              value={String(avgMoves)}
            />
          </div>
        </div>
      </DynamicWrapper>

      {/* Tabs */}
      <DynamicWrapper>
        <div className="flex gap-1 mb-6 border-b border-stone-800/60">
          {(["standings", "games", "info"] as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-amber-400 border-amber-400"
                  : "text-zinc-400 border-transparent hover:text-white"
              }`}
            >
              {tab === "standings"
                ? "Standings"
                : tab === "games"
                  ? "Games"
                  : "Info"}
            </button>
          ))}
        </div>
      </DynamicWrapper>

      {/* Tab Content */}
      {activeTab === "standings" && (
        <DynamicWrapper>
          <div className="bg-[#1c1917] border border-stone-800/60 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-stone-800/60 hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-12">#</TableHead>
                  <TableHead className="text-zinc-400">Player</TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Rating
                  </TableHead>
                  <TableHead className="text-zinc-400 text-right hidden md:table-cell">
                    Perf
                  </TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Pts
                  </TableHead>
                  <TableHead className="text-zinc-400 text-center hidden md:table-cell">
                    W/D/L
                  </TableHead>
                  <TableHead className="text-zinc-400 text-right hidden lg:table-cell">
                    TB
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((s, idx) => {
                  const perfDiff = s.performanceRating - s.rating;
                  return (
                    <TableRow
                      key={s.playerId}
                      className={`border-stone-800/40 hover:bg-white/5 cursor-pointer ${idx === 0 ? "bg-amber-500/5" : idx < 3 ? "bg-amber-500/5" : ""}`}
                      onClick={() => router.push(`/players/${s.playerId}`)}
                    >
                      <TableCell className="font-mono text-zinc-500">
                        {s.rank === 1 ? (
                          <span className="text-amber-400">1</span>
                        ) : (
                          s.rank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {s.playerTitle && (
                            <span className="text-amber-400 font-bold text-xs">
                              {s.playerTitle}
                            </span>
                          )}
                          <span className="text-white hover:text-amber-400 transition-colors">
                            {getCountryFlag(s.playerCountry)} {s.playerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-zinc-400 font-mono">
                        {formatRating(s.rating)}
                      </TableCell>
                      <TableCell className="text-right font-mono hidden md:table-cell">
                        <span
                          className={
                            perfDiff >= 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {formatRating(s.performanceRating)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-amber-400 font-bold">
                        {s.points}
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <span className="text-green-400">{s.wins}</span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-400">{s.draws}</span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-red-400">{s.losses}</span>
                      </TableCell>
                      <TableCell className="text-right text-zinc-500 hidden lg:table-cell">
                        {s.tiebreak}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DynamicWrapper>
      )}

      {activeTab === "games" && (
        <DynamicWrapper>
          {roundNumbers.length === 0 ? (
            <div className="bg-[#1c1917] border border-stone-800/60 rounded-xl p-12 text-center">
              <Swords className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-300 mb-2">
                No games recorded
              </h3>
              <p className="text-sm text-zinc-500">
                Games for this tournament will appear here once available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {roundNumbers.map((round) => (
                <div
                  key={round}
                  className="bg-[#1c1917] border border-stone-800/60 rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-amber-900/10 border-b border-stone-800/40">
                    <h3 className="text-sm font-semibold text-white">
                      Round {round}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-stone-800/60 hover:bg-transparent">
                        <TableHead className="text-zinc-400">White</TableHead>
                        <TableHead className="text-zinc-400 text-center w-20">
                          Result
                        </TableHead>
                        <TableHead className="text-zinc-400">Black</TableHead>
                        <TableHead className="text-zinc-400 hidden md:table-cell">
                          Opening
                        </TableHead>
                        <TableHead className="text-zinc-400 text-right hidden md:table-cell">
                          Moves
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gamesByRound[round].map((g) => (
                        <TableRow
                          key={g.id}
                          className="border-stone-800/40 hover:bg-white/5 cursor-pointer"
                          onClick={() => router.push(`/analysis?game=${g.id}`)}
                        >
                          <TableCell>
                            <span className="text-white text-sm">
                              {g.whitePlayer.name}
                            </span>
                            <span className="text-zinc-500 text-xs ml-1">
                              ({g.whitePlayer.rating})
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`font-mono text-sm font-semibold ${
                                g.result === "1-0"
                                  ? "text-white"
                                  : g.result === "0-1"
                                    ? "text-zinc-400"
                                    : "text-zinc-500"
                              }`}
                            >
                              {g.result}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-white text-sm">
                              {g.blackPlayer.name}
                            </span>
                            <span className="text-zinc-500 text-xs ml-1">
                              ({g.blackPlayer.rating})
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-400 text-sm hidden md:table-cell truncate max-w-[200px]">
                            {g.opening}
                          </TableCell>
                          <TableCell className="text-right text-zinc-500 hidden md:table-cell">
                            {g.moveCount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </DynamicWrapper>
      )}

      {activeTab === "info" && (
        <DynamicWrapper>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tournament Details */}
            <div className="bg-[#1c1917] border border-stone-800/60 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">
                Tournament Details
              </h3>
              <div className="space-y-3 text-sm">
                <InfoRow
                  label="Format"
                  value={`${tournament.gameType} - ${tournament.rounds} rounds`}
                />
                <InfoRow
                  label="Location"
                  value={`${tournament.location}, ${tournament.country}`}
                />
                <InfoRow
                  label="Dates"
                  value={formatDateRange(
                    tournament.startDate,
                    tournament.endDate,
                  )}
                />
                <InfoRow
                  label="Players"
                  value={String(tournament.playerCount)}
                />
                <InfoRow
                  label="ELO Range"
                  value={`${tournament.eloMin} - ${tournament.eloMax}`}
                />
                <InfoRow
                  label="Status"
                  value={
                    tournament.status.charAt(0).toUpperCase() +
                    tournament.status.slice(1)
                  }
                />
              </div>
              <p className="text-zinc-400 text-sm mt-4 pt-4 border-t border-stone-800/40">
                {tournament.description}
              </p>
            </div>

            {/* Statistics */}
            <div className="bg-[#1c1917] border border-stone-800/60 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-3 text-sm">
                <InfoRow
                  label="Games Played"
                  value={String(tournamentGames.length)}
                />
                <InfoRow
                  label="White Wins"
                  value={`${tournamentGames.filter((g) => g.result === "1-0").length} (${tournamentGames.length > 0 ? ((tournamentGames.filter((g) => g.result === "1-0").length / tournamentGames.length) * 100).toFixed(0) : 0}%)`}
                />
                <InfoRow
                  label="Black Wins"
                  value={`${tournamentGames.filter((g) => g.result === "0-1").length} (${tournamentGames.length > 0 ? ((tournamentGames.filter((g) => g.result === "0-1").length / tournamentGames.length) * 100).toFixed(0) : 0}%)`}
                />
                <InfoRow
                  label="Draws"
                  value={`${tournamentGames.filter((g) => g.result === "1/2-1/2").length} (${drawRate}%)`}
                />
                <InfoRow label="Avg Game Length" value={`${avgMoves} moves`} />
                <InfoRow
                  label="Shortest Game"
                  value={
                    tournamentGames.length > 0
                      ? `${Math.min(...tournamentGames.map((g) => g.moveCount))} moves`
                      : "-"
                  }
                />
                <InfoRow
                  label="Longest Game"
                  value={
                    tournamentGames.length > 0
                      ? `${Math.max(...tournamentGames.map((g) => g.moveCount))} moves`
                      : "-"
                  }
                />
              </div>

              {/* Popular Openings */}
              {tournamentGames.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-800/40">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2">
                    Popular Openings
                  </h4>
                  <div className="space-y-1.5">
                    {(() => {
                      const counts: Record<string, number> = {};
                      for (const g of tournamentGames) {
                        counts[g.opening] = (counts[g.opening] || 0) + 1;
                      }
                      return Object.entries(counts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]) => (
                          <div
                            key={name}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-zinc-400 truncate mr-2">
                              {name}
                            </span>
                            <span className="text-zinc-500 flex-shrink-0">
                              {count}x
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DynamicWrapper>
      )}
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1 text-zinc-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-white font-semibold text-sm">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300 font-medium text-right">{value}</span>
    </div>
  );
}
