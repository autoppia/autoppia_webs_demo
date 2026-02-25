"use client";

import React, { useMemo, useState, useCallback } from "react";
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
import { Search, X, ArrowUpDown, SlidersHorizontal } from "lucide-react";

type SortField = "name" | "date" | "players" | "elo";
type SortDir = "asc" | "desc";

export default function TournamentsPage() {
  const { seed } = useSeed();
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();
  const tournaments = useMemo(() => generateTournaments(50, seed), [seed]);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const hasActiveFilters = search || countryFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setCountryFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  }, []);

  const filtered = useMemo(() => {
    let result = tournaments.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (countryFilter !== "all" && t.countryCode !== countryFilter) return false;
      if (typeFilter !== "all" && t.gameType !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
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
  }, [tournaments, search, countryFilter, typeFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getCountryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name || code;

  return (
    <div className="py-6">
      <DynamicWrapper>
        <h1 className="text-3xl font-bold text-white mb-6">
          <DynamicText value="Tournaments" type="text" />
        </h1>
      </DynamicWrapper>

      {/* Search bar */}
      <DynamicWrapper>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by tournament name or location..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </DynamicWrapper>

      {/* Filter bar */}
      <DynamicWrapper>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-zinc-500 hidden sm:block" />
            <Select value={countryFilter} onValueChange={(v) => handleFilter("country", v)}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white/10 border-white/20 text-zinc-300 h-10">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-[#111a11] border-emerald-900/30">
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {getCountryFlag(c.code)} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => handleFilter("gameType", v)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-white/10 border-white/20 text-zinc-300 h-10">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#111a11] border-emerald-900/30">
                <SelectItem value="all">All Types</SelectItem>
                {GAME_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => handleFilter("status", v)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-white/10 border-white/20 text-zinc-300 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#111a11] border-emerald-900/30">
                <SelectItem value="all">All Statuses</SelectItem>
                {TOURNAMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-zinc-500" />
            <select
              value={`${sortField}-${sortDir}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split("-") as [SortField, SortDir];
                setSortField(f);
                setSortDir(d);
              }}
              className="bg-white/10 border border-white/20 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="date-desc">Date (Newest)</option>
              <option value="players-desc">Most Players</option>
              <option value="players-asc">Fewest Players</option>
              <option value="elo-desc">Highest ELO</option>
              <option value="elo-asc">Lowest ELO</option>
            </select>
          </div>
        </div>
      </DynamicWrapper>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <DynamicWrapper>
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <FilterPill label={`Search: "${search}"`} onRemove={() => setSearch("")} />
            )}
            {countryFilter !== "all" && (
              <FilterPill
                label={`${getCountryFlag(countryFilter)} ${getCountryName(countryFilter)}`}
                onRemove={() => setCountryFilter("all")}
              />
            )}
            {typeFilter !== "all" && (
              <FilterPill label={typeFilter} onRemove={() => setTypeFilter("all")} />
            )}
            {statusFilter !== "all" && (
              <FilterPill
                label={statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                onRemove={() => setStatusFilter("all")}
              />
            )}
          </div>
        </DynamicWrapper>
      )}

      {/* Results count */}
      <DynamicWrapper>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-zinc-300">
            <span className="text-emerald-400 font-semibold">{filtered.length}</span> tournament{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>
      </DynamicWrapper>

      {/* Results or Empty State */}
      <DynamicWrapper>
        {filtered.length === 0 ? (
          <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl p-12 text-center">
            <Search className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No tournaments found</h3>
            <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">
              No tournaments match your current filters. Try adjusting your search terms or removing some filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="bg-[#111a11] border border-emerald-900/30 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-emerald-900/30 hover:bg-transparent">
                  <TableHead>
                    <button className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors" onClick={() => handleSort("name")}>
                      Tournament
                      {sortField === "name" && <ArrowUpDown className="h-3 w-3" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-zinc-400 hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <button className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors" onClick={() => handleSort("date")}>
                      Dates
                      {sortField === "date" && <ArrowUpDown className="h-3 w-3" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    <button className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors ml-auto" onClick={() => handleSort("players")}>
                      Players
                      {sortField === "players" && <ArrowUpDown className="h-3 w-3" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-emerald-900/20 hover:bg-emerald-900/10 cursor-pointer transition-colors"
                    onClick={() => router.push(`/tournaments/${t.id}`)}
                  >
                    <TableCell className="text-white font-medium">{t.name}</TableCell>
                    <TableCell className="text-zinc-300 hidden md:table-cell">
                      {getCountryFlag(t.countryCode)} {t.location}
                    </TableCell>
                    <TableCell className="text-zinc-300 hidden lg:table-cell text-sm">
                      {formatDateRange(t.startDate, t.endDate)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getGameTypeBadgeClass(t.gameType)}`}>
                        {t.gameType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-zinc-300 hidden md:table-cell">{t.playerCount}</TableCell>
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
        )}
      </DynamicWrapper>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
