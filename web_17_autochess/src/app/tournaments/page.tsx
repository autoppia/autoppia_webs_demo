"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSeed } from "@/context/SeedContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generateTournaments } from "@/data/generators";
import { getCountryFlag, formatDateRange, getStatusBadgeClass, getGameTypeBadgeClass } from "@/library/formatters";
import { EVENT_TYPES } from "@/library/events";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { COUNTRIES, GAME_TYPES, TOURNAMENT_STATUSES } from "@/shared/constants";
import { TournamentMapLoader } from "@/components/tournaments/TournamentMapLoader";
import { Search, X, ArrowUpDown, Calendar, MapPin, List, Trophy, Zap } from "lucide-react";

type SortField = "name" | "date" | "players" | "elo";
type SortDir = "asc" | "desc";
type ViewMode = "list" | "map";

export default function TournamentsPage() {
  const { seed } = useSeed();
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();
  const searchParams = useSearchParams();
  const tournaments = useMemo(() => generateTournaments(50, seed), [seed]);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    const country = searchParams.get("country");
    const gameType = searchParams.get("gameType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const view = searchParams.get("view");

    if (country) setCountryFilter(country);
    if (gameType) {
      const types = gameType.split(",");
      // Single type: use the existing single-select filter
      if (types.length === 1 && GAME_TYPES.includes(types[0])) {
        setTypeFilter(types[0]);
      }
      // Multiple types: pick the first valid one (single-select filter)
      else if (types.length > 1) {
        const firstValid = types.find((t) => GAME_TYPES.includes(t));
        if (firstValid) setTypeFilter(firstValid);
      }
    }
    if (startDate) setStartDateFilter(startDate);
    if (endDate) setEndDateFilter(endDate);
    if (view === "map" || view === "list") setViewMode(view);
  }, [searchParams]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (value.length > 0) {
      logInteraction(EVENT_TYPES.SEARCH_TOURNAMENT, { query: value, country: countryFilter, gameType: typeFilter });
    }
  }, [countryFilter, typeFilter, logInteraction]);

  const handleFilter = useCallback((type: string, value: string) => {
    if (type === "country") setCountryFilter(value);
    else if (type === "gameType") setTypeFilter(value);
    else if (type === "status") setStatusFilter(value);

    logInteraction(EVENT_TYPES.FILTER_TOURNAMENT, {
      country: type === "country" ? value : countryFilter,
      gameType: type === "gameType" ? value : typeFilter,
      status: type === "status" ? value : statusFilter,
    });
  }, [countryFilter, typeFilter, statusFilter, logInteraction]);

  const hasActiveFilters = search || countryFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || startDateFilter || endDateFilter;

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setCountryFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
  }, []);

  const filtered = useMemo(() => {
    let result = tournaments.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (countryFilter !== "all" && t.countryCode !== countryFilter) return false;
      if (typeFilter !== "all" && t.gameType !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (startDateFilter && t.endDate < startDateFilter) return false;
      if (endDateFilter && t.startDate > endDateFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "date") cmp = a.startDate.localeCompare(b.startDate);
      else if (sortField === "players") cmp = a.playerCount - b.playerCount;
      else if (sortField === "elo") cmp = a.eloMax - b.eloMax;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tournaments, search, countryFilter, typeFilter, statusFilter, startDateFilter, endDateFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getCountryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name || code;

  const gameTypeIcon = (type: string) => {
    if (type === "Classical") return <Trophy className="h-3.5 w-3.5" />;
    return <Zap className="h-3.5 w-3.5" />;
  };

  return (
    <div className="py-6">
      {/* Page header */}
      <DynamicWrapper>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">
              <DynamicText value="Tournament Search" type="text" />
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">Find chess tournaments worldwide</p>
          </div>
          <div className="text-sm text-stone-400">
            <span className="text-amber-400 font-semibold">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </DynamicWrapper>

      {/* Filter Panel */}
      <DynamicWrapper>
        <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-4 mb-5">
          {/* Row 1: Search + Country */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search tournament name or location..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-9 rounded-lg bg-white/[0.06] border border-stone-700/50 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-stone-500 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={countryFilter} onValueChange={(v) => handleFilter("country", v)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/[0.06] border-stone-700/50 text-zinc-300 h-10 text-sm">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1917] border-stone-700/50">
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {getCountryFlag(c.code)} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Game type toggles + Status + Dates + Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Game type toggle buttons */}
            <div className="flex rounded-lg border border-stone-700/50 overflow-hidden">
              <button
                onClick={() => handleFilter("gameType", typeFilter === "all" ? "all" : "all")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === "all"
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-white/[0.03] text-stone-500 hover:text-stone-300"
                }`}
              >
                All
              </button>
              {GAME_TYPES.map((type) => {
                const colors: Record<string, string> = {
                  Classical: "bg-green-500/15 text-green-400",
                  Rapid: "bg-blue-500/15 text-blue-400",
                  Blitz: "bg-amber-500/15 text-amber-400",
                };
                return (
                  <button
                    key={type}
                    onClick={() => handleFilter("gameType", typeFilter === type ? "all" : type)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 border-l border-stone-700/50 ${
                      typeFilter === type
                        ? colors[type]
                        : "bg-white/[0.03] text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    {gameTypeIcon(type)}
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Status */}
            <Select value={statusFilter} onValueChange={(v) => handleFilter("status", v)}>
              <SelectTrigger className="w-[130px] bg-white/[0.06] border-stone-700/50 text-zinc-300 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1917] border-stone-700/50">
                <SelectItem value="all">All Statuses</SelectItem>
                {TOURNAMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-stone-500 flex-shrink-0" />
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg bg-white/[0.06] border border-stone-700/50 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-[130px]"
              />
              <span className="text-stone-600 text-xs">–</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg bg-white/[0.06] border border-stone-700/50 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-[130px]"
              />
            </div>

            {/* Sort */}
            <Select
              value={`${sortField}-${sortDir}`}
              onValueChange={(v) => {
                const [f, d] = v.split("-") as [SortField, SortDir];
                setSortField(f);
                setSortDir(d);
              }}
            >
              <SelectTrigger className="w-[140px] bg-white/[0.06] border-stone-700/50 text-zinc-300 h-8 text-xs">
                <ArrowUpDown className="h-3 w-3 mr-1 flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1917] border-stone-700/50">
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="players-desc">Most Players</SelectItem>
                <SelectItem value="elo-desc">Highest ELO</SelectItem>
              </SelectContent>
            </Select>

            {/* List / Map view toggle */}
            <div className="flex rounded-lg border border-stone-700/50 overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`h-8 px-3 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-white/[0.03] text-stone-500 hover:text-stone-300"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`h-8 px-3 text-xs font-medium transition-colors flex items-center gap-1.5 border-l border-stone-700/50 ${
                  viewMode === "map"
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-white/[0.03] text-stone-500 hover:text-stone-300"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Map
              </button>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="h-8 px-3 text-xs text-stone-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors border border-stone-700/50"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone-800/60">
              {search && <FilterPill label={`"${search}"`} onRemove={() => setSearch("")} />}
              {countryFilter !== "all" && (
                <FilterPill
                  label={`${getCountryFlag(countryFilter)} ${getCountryName(countryFilter)}`}
                  onRemove={() => setCountryFilter("all")}
                />
              )}
              {typeFilter !== "all" && <FilterPill label={typeFilter} onRemove={() => setTypeFilter("all")} />}
              {statusFilter !== "all" && (
                <FilterPill label={statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} onRemove={() => setStatusFilter("all")} />
              )}
              {startDateFilter && <FilterPill label={`From ${startDateFilter}`} onRemove={() => setStartDateFilter("")} />}
              {endDateFilter && <FilterPill label={`To ${endDateFilter}`} onRemove={() => setEndDateFilter("")} />}
            </div>
          )}
        </div>
      </DynamicWrapper>

      {/* View: Map or List */}
      {filtered.length === 0 ? (
        <DynamicWrapper>
          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-12 text-center">
            <Search className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No tournaments found</h3>
            <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">
              No tournaments match your current filters. Try adjusting your search or removing some filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </DynamicWrapper>
      ) : viewMode === "map" ? (
        <DynamicWrapper>
          <TournamentMapLoader
            tournaments={filtered}
            height={560}
            onTournamentClick={(id) => router.push(`/tournaments/${id}`)}
          />
        </DynamicWrapper>
      ) : (
        <DynamicWrapper>
          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-stone-800/60 hover:bg-transparent">
                  <TableHead className="w-10" />
                  <TableHead>
                    <button className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors text-xs" onClick={() => handleSort("name")}>
                      Tournament
                      {sortField === "name" && <ArrowUpDown className="h-3 w-3" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-stone-400 hidden md:table-cell text-xs">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <button className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors text-xs" onClick={() => handleSort("date")}>
                      Dates
                      {sortField === "date" && <ArrowUpDown className="h-3 w-3" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-stone-400 text-xs">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    <button className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors ml-auto text-xs" onClick={() => handleSort("players")}>
                      Players
                      {sortField === "players" && <ArrowUpDown className="h-3 w-3" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-stone-400 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-stone-800/40 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    onClick={() => router.push(`/tournaments/${t.id}`)}
                  >
                    <TableCell className="pr-0 text-center">
                      <span className="text-base">{getCountryFlag(t.countryCode)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-white font-medium text-sm group-hover:text-amber-400 transition-colors">
                        {t.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-stone-400 hidden md:table-cell text-sm">
                      {t.location}
                    </TableCell>
                    <TableCell className="text-stone-400 hidden lg:table-cell text-sm">
                      {formatDateRange(t.startDate, t.endDate)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getGameTypeBadgeClass(t.gameType)}`}>
                        {t.gameType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-stone-400 hidden md:table-cell text-sm">{t.playerCount}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DynamicWrapper>
      )}
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors ml-0.5" aria-label={`Remove filter: ${label}`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
