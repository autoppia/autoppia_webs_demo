"use client";

import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import type { BlockWithDetails } from "@/shared/types";
import { cn } from "@/utils/cn";
import { ArrowUpDown, Check, Copy, Search } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

interface BlocksPageContentProps {
  blocks: BlockWithDetails[];
}

type SortField =
  | "number"
  | "specVersion"
  | "hash"
  | "eventsCount"
  | "extrinsicsCount"
  | "timestamp";
type SortDirection = "asc" | "desc";

export function BlocksPageContent({ blocks }: BlocksPageContentProps) {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // V3 text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    search_placeholder: [
      "Search by Height, Hash",
      "Search by Height, Hash",
      "Search by Height, Hash",
      "Search by Height, Hash",
      "Search by Height, Hash",
    ],
  };

  const latestBlockNumber = blocks[0]?.number ?? 0;

  // Filter and sort
  const filteredAndSortedBlocks = useMemo(() => {
    let filtered = blocks;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.number.toString().includes(query) ||
          b.hash.toLowerCase().includes(query),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === "asc"
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [blocks, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBlocks.length / rowsPerPage);
  const paginatedBlocks = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedBlocks.slice(start, start + rowsPerPage);
  }, [filteredAndSortedBlocks, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleBlockClick = (blockNumber: number) => {
    router.push(`/blocks/${blockNumber}`);
  };

  const handleCopyHash = (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatHash = (hash: string): string => {
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} secs`;
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? "min" : "mins"}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  // Sort icon — only shown on active column (matches Subnets/Validators/Accounts)
  const SortArrow = ({ field }: { field: SortField }) =>
    sortField === field ? (
      <ArrowUpDown className="w-3 h-3 ml-1 inline-block align-middle" />
    ) : null;

  // Block finalized icon (small rounded box with checkmark)
  const BlockIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="flex-shrink-0"
    >
      <rect
        x="2"
        y="2"
        width="14"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-teal-700"
      />
      <path
        d="M6 9L8 11L12 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-teal-500"
      />
    </svg>
  );

  // Shared header cell styling
  const thClass =
    "py-3.5 text-left cursor-pointer select-none hover:text-zinc-300 transition-colors";
  const thLabelClass = "text-[13px] font-normal text-zinc-500";

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 md:px-10 lg:px-20">
      {/* Controls row: search + rows + csv */}
      {dyn.v1.addWrapDecoy(
        "blocks-controls",
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={dyn.v3.getVariant(
                "search_placeholder",
                dynamicV3TextVariants,
              )}
              id={dyn.v3.getVariant("blocks-search-input", ID_VARIANTS_MAP)}
              className={cn(
                "w-full pl-9 pr-3 py-2.5 bg-[#111] border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors",
                dyn.v3.getVariant("search-input", CLASS_VARIANTS_MAP),
              )}
            />
          </div>

          <div className="flex items-center gap-5">
            {/* Auto Refresh indicator */}
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Auto Refresh
            </div>

            {/* Rows selector */}
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <span className="mr-1">Rows</span>
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setRowsPerPage(n);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "min-w-[36px] px-2 py-1 rounded text-sm tabular-nums transition-colors",
                    rowsPerPage === n
                      ? "border border-teal-500 text-white"
                      : "text-zinc-500 hover:text-white",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>,
      )}

      {/* Table */}
      {dyn.v1.addWrapDecoy(
        "blocks-table-container",
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-zinc-800/60">
                <th
                  className={cn(thClass, "pl-5")}
                  onClick={() => handleSort("number")}
                >
                  <span className={thLabelClass}>
                    Height
                    <SortArrow field="number" />
                  </span>
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort("specVersion")}
                >
                  <span className={thLabelClass}>
                    Spec V.
                    <SortArrow field="specVersion" />
                  </span>
                </th>
                <th className={thClass} onClick={() => handleSort("hash")}>
                  <span className={thLabelClass}>
                    Hash
                    <SortArrow field="hash" />
                  </span>
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort("eventsCount")}
                >
                  <span className={thLabelClass}>
                    Events
                    <SortArrow field="eventsCount" />
                  </span>
                </th>
                <th
                  className={thClass}
                  onClick={() => handleSort("extrinsicsCount")}
                >
                  <span className={thLabelClass}>
                    Extrinsics
                    <SortArrow field="extrinsicsCount" />
                  </span>
                </th>
                <th
                  className={cn(thClass, "text-right pr-5")}
                  onClick={() => handleSort("timestamp")}
                >
                  <span className={thLabelClass}>
                    Time
                    <SortArrow field="timestamp" />
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedBlocks.map((block, idx) => {
                const isLatest =
                  idx === 0 &&
                  currentPage === 1 &&
                  block.number === latestBlockNumber;
                return (
                  <tr
                    key={block.number}
                    onClick={() => handleBlockClick(block.number)}
                    className={cn(
                      "border-b border-zinc-800/40 cursor-pointer transition-colors group",
                      isLatest
                        ? "bg-teal-950/30 hover:bg-teal-950/40"
                        : "hover:bg-white/[0.02]",
                    )}
                  >
                    <td className="pl-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <BlockIcon />
                        <span className="text-white font-semibold text-[14px] tabular-nums">
                          {block.number}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 whitespace-nowrap">
                      <span className="text-white font-semibold text-[14px]">
                        {block.specVersion}
                      </span>
                    </td>

                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-mono text-[14px]",
                            isLatest
                              ? "text-teal-400"
                              : "text-teal-600 group-hover:text-teal-500",
                          )}
                        >
                          {formatHash(block.hash)}
                        </span>
                        <button
                          onClick={(e) => handleCopyHash(e, block.hash)}
                          className="text-zinc-700 hover:text-zinc-400 transition-colors"
                        >
                          {copiedHash === block.hash ? (
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "text-[14px] tabular-nums",
                          isLatest ? "text-teal-400" : "text-zinc-300",
                        )}
                      >
                        {block.eventsCount}
                      </span>
                    </td>

                    <td className="py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "text-[14px] tabular-nums",
                          isLatest ? "text-teal-400" : "text-zinc-300",
                        )}
                      >
                        {block.extrinsicsCount}
                      </span>
                    </td>

                    <td className="py-4 pr-5 whitespace-nowrap text-right">
                      <span
                        className={cn(
                          "text-[14px]",
                          isLatest ? "text-teal-400" : "text-zinc-400",
                        )}
                      >
                        {formatTime(block.timestamp)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAndSortedBlocks.length === 0 && (
            <div className="text-center py-16 text-zinc-600">
              <div className="text-sm">No blocks found</div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800/40">
              <div className="text-xs text-zinc-600">
                Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * rowsPerPage,
                  filteredAndSortedBlocks.length,
                )}{" "}
                of {filteredAndSortedBlocks.length} entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                    currentPage === 1
                      ? "text-zinc-700 cursor-not-allowed"
                      : "text-zinc-400 hover:text-white",
                  )}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded text-xs font-medium transition-colors",
                        currentPage === page
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-600 hover:text-white",
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                    currentPage === totalPages
                      ? "text-zinc-700 cursor-not-allowed"
                      : "text-zinc-400 hover:text-white",
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>,
      )}
    </div>
  );
}
