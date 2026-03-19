"use client";

import type React from "react";
import { useState } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, GAME_TYPES } from "@/shared/constants";
import { EVENT_TYPES } from "@/library/events";
import { getCountryFlag } from "@/library/formatters";
import { Search, Users, Puzzle, BarChart3, Trophy, Crown, Zap } from "lucide-react";

export function HeroSection() {
  const router = useSeedRouter();
  const { logInteraction } = useEventLogger();

  const [country, setCountry] = useState("all");
  const [gameTypes, setGameTypes] = useState<Record<string, boolean>>({
    Classical: true,
    Rapid: true,
    Blitz: true,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleGameType = (type: string) => {
    setGameTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (country !== "all") params.set("country", country);
    const selectedTypes = Object.entries(gameTypes)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (selectedTypes.length < 3 && selectedTypes.length > 0) {
      params.set("gameType", selectedTypes.join(","));
    }
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    logInteraction(EVENT_TYPES.SEARCH_TOURNAMENT, {
      country,
      gameTypes: selectedTypes,
      startDate,
      endDate,
    });

    const qs = params.toString();
    router.push(`/tournaments${qs ? `?${qs}` : ""}`);
  };

  return (
    <DynamicWrapper>
      <section className="relative overflow-hidden rounded-2xl border border-stone-800/80 my-4 sm:my-8">
        {/* Gradient background with chess pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1412] via-[#1c1410] to-[#0c0a09]" />
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={`square-${Math.floor(i / 8)}-${i % 8}`}
                className={`${(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? "bg-white" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative amber glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            {/* Left: Title + tagline + quick actions */}
            <div className="flex-1 min-w-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-5">
                <Crown className="h-3.5 w-3.5" />
                Chess Tournament Platform
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                <DynamicText value="Master the" type="text" />{" "}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                  <DynamicText value="Game" type="text" />
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-stone-400 mb-6 sm:mb-8 max-w-xl leading-relaxed">
                <DynamicText
                  value="Explore tournaments worldwide, analyze grandmaster games, solve tactical puzzles, and track live player rankings."
                  type="text"
                />
              </p>

              {/* Quick action cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  className="group flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-stone-800/60 hover:border-amber-700/40 transition-all text-center sm:text-left"
                  onClick={() => router.push("/players")}
                >
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-white">Players</div>
                    <div className="text-[10px] sm:text-xs text-stone-500 hidden sm:block">200+ ranked</div>
                  </div>
                </button>
                <button
                  className="group flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-stone-800/60 hover:border-amber-700/40 transition-all text-center sm:text-left"
                  onClick={() => router.push("/tactics")}
                >
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                    <Puzzle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-white">Tactics</div>
                    <div className="text-[10px] sm:text-xs text-stone-500 hidden sm:block">100+ puzzles</div>
                  </div>
                </button>
                <button
                  className="group flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-stone-800/60 hover:border-amber-700/40 transition-all text-center sm:text-left"
                  onClick={() => router.push("/analysis")}
                >
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-white">Analysis</div>
                    <div className="text-[10px] sm:text-xs text-stone-500 hidden sm:block">500+ games</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right: Search form card */}
            <div className="w-full lg:w-[380px] bg-[#1c1917]/80 backdrop-blur-md border border-stone-700/60 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-2xl shadow-black/30">
              <h2 className="text-white font-semibold text-base flex items-center gap-2">
                <Search className="h-4 w-4 text-amber-400" />
                Find Tournaments
              </h2>

              {/* Country */}
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block font-medium uppercase tracking-wide">Country</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full bg-white/[0.06] border-stone-700/50 text-zinc-300 h-10 text-sm">
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

              {/* Game Types */}
              <div>
                <label className="text-xs text-stone-500 mb-1.5 block font-medium uppercase tracking-wide">Game Type</label>
                <div className="flex gap-2">
                  {GAME_TYPES.map((type) => {
                    const icons: Record<string, React.ReactNode> = {
                      Classical: <Trophy className="h-3 w-3" />,
                      Rapid: <Zap className="h-3 w-3" />,
                      Blitz: <Zap className="h-3 w-3" />,
                    };
                    return (
                      <button
                        key={type}
                        onClick={() => toggleGameType(type)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          gameTypes[type]
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10"
                            : "bg-white/[0.03] border-stone-700/40 text-stone-500 hover:text-stone-300 hover:border-stone-600/60"
                        }`}
                      >
                        {icons[type]}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 block font-medium uppercase tracking-wide">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-white/[0.06] border border-stone-700/50 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1.5 block font-medium uppercase tracking-wide">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-white/[0.06] border border-stone-700/50 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-amber-600/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search Tournaments
              </button>
            </div>
          </div>
        </div>

        {/* Decorative chess piece */}
        <div className="absolute right-8 bottom-6 text-amber-900/10 text-[140px] md:text-[200px] leading-none select-none pointer-events-none hidden lg:block font-serif">
          &#9812;
        </div>
      </section>
    </DynamicWrapper>
  );
}
