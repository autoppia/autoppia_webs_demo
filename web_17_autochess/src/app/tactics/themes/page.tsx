"use client";

import React, { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { useAuth } from "@/context/AuthContext";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { PUZZLE_THEME_CATEGORIES } from "@/shared/constants";
import { generatePuzzleThemeCounts } from "@/data/generators";
import { Swords, Target, Crown as CrownIcon, Brain, ChevronRight } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Phases: <Swords className="h-5 w-5 text-amber-400" />,
  Motifs: <Target className="h-5 w-5 text-amber-400" />,
  Mates: <CrownIcon className="h-5 w-5 text-amber-400" />,
  Advanced: <Brain className="h-5 w-5 text-amber-400" />,
};

export default function ThemesPage() {
  const { seed } = useSeed();
  const { currentUser, isAuthenticated } = useAuth();
  const router = useSeedRouter();
  const themeCounts = useMemo(() => generatePuzzleThemeCounts(seed), [seed]);

  const handleThemeClick = (themeKey: string) => {
    router.push(`/tactics?theme=${encodeURIComponent(themeKey)}`);
  };

  return (
    <div className="py-6">
      <DynamicWrapper>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              <DynamicText value="Puzzle Themes" type="text" />
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              <DynamicText value="Choose a tactical theme to practice" type="text" />
            </p>
          </div>
          {isAuthenticated && currentUser && (
            <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl px-5 py-3 text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Your Rating</div>
              <div className="text-2xl font-bold text-amber-400">{currentUser.puzzleRating}</div>
            </div>
          )}
        </div>
      </DynamicWrapper>

      {!isAuthenticated && (
        <DynamicWrapper>
          <div className="mb-6 bg-amber-600/10 border border-amber-600/30 rounded-xl px-5 py-3 flex items-center justify-between">
            <span className="text-amber-400 text-sm">Login to track your puzzle rating and progress</span>
            <a
              href="/login"
              onClick={(e) => { e.preventDefault(); router.push("/login"); }}
              className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Login
            </a>
          </div>
        </DynamicWrapper>
      )}

      <div className="space-y-10">
        {PUZZLE_THEME_CATEGORIES.map((category) => (
          <DynamicWrapper key={category.name}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                {CATEGORY_ICONS[category.name]}
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    <DynamicText value={category.name} type="text" />
                  </h2>
                  <p className="text-zinc-500 text-sm">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {category.themes.map((theme) => {
                  const count = themeCounts[theme.key] ?? 0;
                  return (
                    <button
                      key={theme.key}
                      onClick={() => handleThemeClick(theme.key)}
                      className="group bg-[#1c1917] border border-stone-800/80 rounded-xl p-4 text-left hover:border-amber-600/50 hover:bg-amber-600/5 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium group-hover:text-amber-400 transition-colors">
                          {theme.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-stone-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-zinc-500 text-xs mb-3 line-clamp-2">{theme.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-600">{count} puzzles</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((dot) => (
                            <div
                              key={dot}
                              className={`w-1.5 h-1.5 rounded-full ${
                                dot <= (count > 100 ? 3 : count > 40 ? 2 : 1)
                                  ? "bg-amber-500"
                                  : "bg-stone-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </DynamicWrapper>
        ))}
      </div>
    </div>
  );
}
