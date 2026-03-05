"use client";

import React, { useState, useRef, useEffect } from "react";
import { Settings, RotateCcw, PenTool, Cpu } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";

interface AnalysisToolsMenuProps {
  onFlipBoard: () => void;
  showEngine: boolean;
  onToggleEngine: () => void;
}

export function AnalysisToolsMenu({ onFlipBoard, showEngine, onToggleEngine }: AnalysisToolsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 rounded-lg transition-colors bg-[#1c1917] border border-stone-800/80 text-zinc-400 hover:text-white hover:bg-white/5"
        onClick={() => setOpen((o) => !o)}
        title="Tools"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 right-0 w-52 bg-[#1c1917] border border-stone-700/80 rounded-lg shadow-xl z-50 py-1">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
            onClick={() => { onFlipBoard(); setOpen(false); }}
          >
            <RotateCcw className="h-4 w-4 text-zinc-500" />
            <span className="flex-1 text-left">Flip Board</span>
            <kbd className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">F</kbd>
          </button>

          <SeedLink
            href="/editor"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
            onClick={() => setOpen(false)}
          >
            <PenTool className="h-4 w-4 text-zinc-500" />
            <span className="flex-1 text-left">Board Editor</span>
          </SeedLink>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
            onClick={() => { onToggleEngine(); setOpen(false); }}
          >
            <Cpu className="h-4 w-4 text-zinc-500" />
            <span className="flex-1 text-left">Computer Analysis</span>
            <span className={`h-2 w-2 rounded-full ${showEngine ? "bg-green-500" : "bg-zinc-600"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
