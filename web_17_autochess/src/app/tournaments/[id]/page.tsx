"use client";

import React, { useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSeed } from "@/context/SeedContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generateTournaments, generatePlayers, generateStandings, generateGames } from "@/data/generators";
import { getCountryFlag, formatDateRange, getStatusBadgeClass, getGameTypeBadgeClass, formatRating } from "@/library/formatters";
import { EVENT_TYPES } from "@/library/events";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function TournamentDetailPage() {
  const params = useParams();
  const { seed } = useSeed();
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();
  const tournamentId = Number(params.id);

  const tournaments = useMemo(() => generateTournaments(50, seed), [seed]);
  const players = useMemo(() => generatePlayers(200, seed), [seed]);
  const tournament = useMemo(() => tournaments.find((t) => t.id === tournamentId), [tournaments, tournamentId]);
  const standings = useMemo(
    () => tournament ? generateStandings(tournament, players, seed) : [],
    [tournament, players, seed]
  );
  const allGames = useMemo(() => generateGames(tournaments, players, 500, seed), [tournaments, players, seed]);
  const tournamentGames = useMemo(
    () => allGames.filter((g) => g.tournamentId === tournamentId).slice(0, 20),
    [allGames, tournamentId]
  );

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
            href="/tournaments"
            onClick={(e) => { e.preventDefault(); router.push("/tournaments"); }}
            className="text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            Tournaments
          </a>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 truncate max-w-[200px]">{tournament.name}</span>
        </nav>
      </DynamicWrapper>

      {/* Header */}
      <DynamicWrapper>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(tournament.status)}`}>
              {tournament.status}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border ${getGameTypeBadgeClass(tournament.gameType)}`}>
              {tournament.gameType}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            <DynamicText value={tournament.name} type="text" />
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span>{getCountryFlag(tournament.countryCode)} {tournament.location}, {tournament.country}</span>
            <span>{formatDateRange(tournament.startDate, tournament.endDate)}</span>
            <span>{tournament.rounds} rounds</span>
            <span>{tournament.playerCount} players</span>
            <span>ELO {tournament.eloMin}-{tournament.eloMax}</span>
          </div>
          <p className="text-zinc-400 mt-3 text-sm">{tournament.description}</p>
        </div>
      </DynamicWrapper>

      {/* Standings */}
      <DynamicWrapper>
        <h2 className="text-xl font-bold text-white mb-4">
          <DynamicText value="Standings" type="text" />
        </h2>
        <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl overflow-hidden mb-8">
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-900/30 hover:bg-transparent">
                <TableHead className="text-zinc-400 w-12">#</TableHead>
                <TableHead className="text-zinc-400">Player</TableHead>
                <TableHead className="text-zinc-400 text-right">Rating</TableHead>
                <TableHead className="text-zinc-400 text-right">Pts</TableHead>
                <TableHead className="text-zinc-400 text-right hidden md:table-cell">W</TableHead>
                <TableHead className="text-zinc-400 text-right hidden md:table-cell">D</TableHead>
                <TableHead className="text-zinc-400 text-right hidden md:table-cell">L</TableHead>
                <TableHead className="text-zinc-400 text-right hidden lg:table-cell">TB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((s) => (
                <TableRow
                  key={s.playerId}
                  className="border-emerald-900/20 hover:bg-emerald-900/10 cursor-pointer"
                  onClick={() => router.push(`/players/${s.playerId}`)}
                >
                  <TableCell className="text-zinc-500 font-mono">{s.rank}</TableCell>
                  <TableCell>
                    <span className="text-white">{getCountryFlag(s.playerCountry)} {s.playerName}</span>
                  </TableCell>
                  <TableCell className="text-right text-zinc-400 font-mono">{formatRating(s.rating)}</TableCell>
                  <TableCell className="text-right text-emerald-400 font-bold">{s.points}</TableCell>
                  <TableCell className="text-right text-green-400 hidden md:table-cell">{s.wins}</TableCell>
                  <TableCell className="text-right text-zinc-400 hidden md:table-cell">{s.draws}</TableCell>
                  <TableCell className="text-right text-red-400 hidden md:table-cell">{s.losses}</TableCell>
                  <TableCell className="text-right text-zinc-500 hidden lg:table-cell">{s.tiebreak}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DynamicWrapper>

      {/* Recent Games */}
      <DynamicWrapper>
        <h2 className="text-xl font-bold text-white mb-4">
          <DynamicText value="Games" type="text" />
        </h2>
        <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-900/30 hover:bg-transparent">
                <TableHead className="text-zinc-400">Rd</TableHead>
                <TableHead className="text-zinc-400">White</TableHead>
                <TableHead className="text-zinc-400 text-center">Result</TableHead>
                <TableHead className="text-zinc-400">Black</TableHead>
                <TableHead className="text-zinc-400 hidden md:table-cell">Opening</TableHead>
                <TableHead className="text-zinc-400 text-right hidden md:table-cell">Moves</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournamentGames.map((g) => (
                <TableRow key={g.id} className="border-emerald-900/20 hover:bg-emerald-900/10 cursor-pointer"
                  onClick={() => router.push(`/analysis?game=${g.id}`)}
                >
                  <TableCell className="text-zinc-500">{g.round}</TableCell>
                  <TableCell className="text-white text-sm">{g.whitePlayer.name} ({g.whitePlayer.rating})</TableCell>
                  <TableCell className="text-center font-mono text-emerald-400 text-sm">{g.result}</TableCell>
                  <TableCell className="text-white text-sm">{g.blackPlayer.name} ({g.blackPlayer.rating})</TableCell>
                  <TableCell className="text-zinc-400 text-sm hidden md:table-cell">{g.opening}</TableCell>
                  <TableCell className="text-right text-zinc-500 hidden md:table-cell">{g.moveCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DynamicWrapper>
    </div>
  );
}
