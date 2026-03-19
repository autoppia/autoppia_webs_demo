"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import type { MoveHistoryEntry } from "@/shared/types";
import { CheckCircle, XCircle, Info, Trophy, Lightbulb, ArrowRight } from "lucide-react";

interface MoveHistoryPanelProps {
  entries: MoveHistoryEntry[];
}

const ENTRY_STYLES: Record<MoveHistoryEntry["type"], { bg: string; border: string; icon: React.ReactNode; textColor: string }> = {
  info: {
    bg: "bg-stone-800/50",
    border: "border-stone-700/50",
    icon: <Info className="h-4 w-4 text-stone-400 flex-shrink-0" />,
    textColor: "text-zinc-400",
  },
  correct: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />,
    textColor: "text-green-400",
  },
  incorrect: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />,
    textColor: "text-red-400",
  },
  opponent: {
    bg: "bg-stone-800/30",
    border: "border-stone-700/30",
    icon: <ArrowRight className="h-4 w-4 text-stone-500 flex-shrink-0" />,
    textColor: "text-zinc-500",
  },
  solved: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: <Trophy className="h-4 w-4 text-amber-400 flex-shrink-0" />,
    textColor: "text-amber-400",
  },
  hint: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: <Lightbulb className="h-4 w-4 text-yellow-400 flex-shrink-0" />,
    textColor: "text-yellow-400",
  },
};

export function MoveHistoryPanel({ entries }: MoveHistoryPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when entries change (ref not a dep)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-stone-800/80">
        <h3 className="text-white font-semibold text-sm">Move History</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 sm:space-y-2 min-h-[150px] max-h-[280px] xl:max-h-[480px]">
        {entries.length === 0 ? (
          <div className="text-zinc-600 text-sm text-center py-8">
            Moves will appear here
          </div>
        ) : (
          entries.map((entry, i) => {
            const style = ENTRY_STYLES[entry.type];
            return (
              <div
                key={`${entry.type}-${entry.message}-${entry.move ?? ""}-${i}`}
                className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border ${style.bg} ${style.border}`}
              >
                {style.icon}
                <div className="min-w-0">
                  <span className={`text-sm ${style.textColor}`}>{entry.message}</span>
                  {entry.move && (
                    <span className="ml-1.5 text-xs text-zinc-600 font-mono">{entry.move}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
