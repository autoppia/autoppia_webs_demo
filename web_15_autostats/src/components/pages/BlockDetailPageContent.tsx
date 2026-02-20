"use client";

import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { formatNumber } from "@/library/formatters";
import type { BlockWithDetails } from "@/shared/types";
import { cn } from "@/utils/cn";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

interface BlockDetailPageContentProps {
  block: BlockWithDetails;
}

type ActiveTab = "extrinsics" | "events";

export function BlockDetailPageContent({ block }: BlockDetailPageContentProps) {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const [activeTab, setActiveTab] = useState<ActiveTab>("extrinsics");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [extRowsPerPage, setExtRowsPerPage] = useState(25);
  const [extPage, setExtPage] = useState(1);
  const [evtRowsPerPage, setEvtRowsPerPage] = useState(25);
  const [evtPage, setEvtPage] = useState(1);

  // V3 text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    detail_title: [
      "Block Details",
      "Block Information",
      "Block Data",
      "Block Overview",
      "Block Inspector",
    ],
    extrinsics_tab: [
      "Extrinsics",
      "Block Extrinsics",
      "Transactions",
      "Extrinsic List",
      "Block Transactions",
    ],
    events_tab: [
      "Events",
      "Block Events",
      "Event Log",
      "Event List",
      "Block Activity",
    ],
  };

  const handleBack = () => {
    router.push("/blocks");
  };

  const handlePrevBlock = () => {
    router.push(`/blocks/${block.number - 1}`);
  };

  const handleNextBlock = () => {
    router.push(`/blocks/${block.number + 1}`);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - timestamp.getTime()) / 1000,
    );
    if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? "min" : "mins"} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 14) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  // Copyable hash/value inline
  const CopyableValue = ({
    value,
    field,
    mono = true,
  }: {
    value: string;
    field: string;
    mono?: boolean;
  }) => (
    <div className="flex items-center gap-2">
      <span className={cn("text-sm text-white break-all", mono && "font-mono")}>
        {value}
      </span>
      <button
        onClick={() => handleCopy(value, field)}
        className="flex-shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
      >
        {copiedField === field ? (
          <Check className="w-3.5 h-3.5 text-teal-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );

  // Key-value info row
  const InfoRow = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start py-3 border-b border-zinc-800/50 last:border-b-0 gap-4">
      <span className="text-sm text-zinc-500 w-44 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );

  // Generate synthetic events from extrinsics for the events tab
  const syntheticEvents = useMemo(() => {
    return block.extrinsics.flatMap((ext, extIdx) => {
      const events = [
        {
          id: `${extIdx}-0`,
          section: ext.section,
          method: ext.success ? "ExtrinsicSuccess" : "ExtrinsicFailed",
          phase: `ApplyExtrinsic(${extIdx})`,
        },
      ];
      if (ext.section === "balances") {
        events.push({
          id: `${extIdx}-1`,
          section: "balances",
          method: "Transfer",
          phase: `ApplyExtrinsic(${extIdx})`,
        });
      }
      if (ext.section === "staking") {
        events.push({
          id: `${extIdx}-1`,
          section: "staking",
          method: ext.method === "stake" ? "Bonded" : "Unbonded",
          phase: `ApplyExtrinsic(${extIdx})`,
        });
      }
      return events;
    });
  }, [block.extrinsics]);

  // Extrinsics pagination
  const extTotalPages = Math.ceil(block.extrinsics.length / extRowsPerPage);
  const paginatedExtrinsics = useMemo(() => {
    const start = (extPage - 1) * extRowsPerPage;
    return block.extrinsics.slice(start, start + extRowsPerPage);
  }, [block.extrinsics, extPage, extRowsPerPage]);

  // Events pagination
  const evtTotalPages = Math.ceil(syntheticEvents.length / evtRowsPerPage);
  const paginatedEvents = useMemo(() => {
    const start = (evtPage - 1) * evtRowsPerPage;
    return syntheticEvents.slice(start, start + evtRowsPerPage);
  }, [syntheticEvents, evtPage, evtRowsPerPage]);

  // Rows per page selector component
  const RowsPerPageSelector = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (n: number) => void;
  }) => (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      <span>Show</span>
      {[10, 25, 50, 100].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            "px-2 py-0.5 rounded text-xs transition-colors",
            value === n
              ? "bg-zinc-700 text-white"
              : "text-zinc-500 hover:text-white",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );

  // Pagination component
  const PaginationControls = ({
    currentPage,
    totalPages: tp,
    totalItems,
    perPage,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    onPageChange: (p: number) => void;
  }) => {
    if (tp <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
        <div className="text-xs text-zinc-500">
          Showing {(currentPage - 1) * perPage + 1} to{" "}
          {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              currentPage === 1
                ? "text-zinc-700 cursor-not-allowed"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800",
            )}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, tp) }, (_, i) => {
            let page: number;
            if (tp <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= tp - 2) {
              page = tp - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "w-8 h-8 rounded text-xs font-medium transition-colors",
                  currentPage === page
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800",
                )}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(Math.min(tp, currentPage + 1))}
            disabled={currentPage === tp}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              currentPage === tp
                ? "text-zinc-700 cursor-not-allowed"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800",
            )}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 md:px-10 lg:px-20">
      {/* Back + Navigation */}
      {dyn.v1.addWrapDecoy(
        "block-detail-nav",
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Blocks
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevBlock}
              className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextBlock}
              className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>,
      )}

      {/* Block title */}
      {dyn.v1.addWrapDecoy(
        "block-detail-header",
        <div className="mb-2">
          <div className="flex items-center gap-3">
            <h1
              id={dyn.v3.getVariant("block-detail-title", ID_VARIANTS_MAP)}
              className={cn(
                "text-3xl font-bold text-white",
                dyn.v3.getVariant("detail-title", CLASS_VARIANTS_MAP),
              )}
            >
              {block.number.toLocaleString()}
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-green-500/15 text-green-400 border border-green-500/20">
              Finalized
            </span>
          </div>
          <div className="mt-1 text-sm text-zinc-500">
            {block.eventsCount} events &middot; {block.extrinsicsCount}{" "}
            extrinsics
          </div>
        </div>,
      )}

      {/* Divider */}
      <div className="h-px w-full bg-zinc-800 mb-6" />

      {/* Block Info Card */}
      {dyn.v1.addWrapDecoy(
        "block-detail-info",
        <div
          id={dyn.v3.getVariant("block-info-card", ID_VARIANTS_MAP)}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 mb-6"
        >
          <InfoRow label="Block Height">
            <span className="text-sm text-white font-mono">
              {block.number.toLocaleString()}
            </span>
          </InfoRow>
          <InfoRow label="Timestamp">
            <span className="text-sm text-white">
              {block.timestamp.toISOString()}
            </span>
            <span className="text-xs text-zinc-500 ml-2">
              ({formatTimeAgo(block.timestamp)})
            </span>
          </InfoRow>
          <InfoRow label="Hash">
            <CopyableValue value={block.hash} field="hash" />
          </InfoRow>
          <InfoRow label="Parent Hash">
            <CopyableValue value={block.parentHash} field="parent" />
          </InfoRow>
          <InfoRow label="State Root">
            <CopyableValue value={block.stateRoot} field="state" />
          </InfoRow>
          <InfoRow label="Extrinsics Root">
            <CopyableValue
              value={block.extrinsicsRoot}
              field="extrinsicsRoot"
            />
          </InfoRow>
          <InfoRow label="Spec Version">
            <span className="text-sm text-white">{block.specVersion}</span>
          </InfoRow>
          <InfoRow label="Validator">
            <CopyableValue value={block.validator} field="validator" />
          </InfoRow>
          <InfoRow label="Block Time">
            <span className="text-sm text-white">
              {formatNumber(block.timeSinceLastBlock, 1)}s
            </span>
          </InfoRow>
          <InfoRow label="Epoch">
            <span className="text-sm text-white">
              {block.epoch.toLocaleString()}
            </span>
          </InfoRow>
          <InfoRow label="Extrinsics">
            <span className="text-sm text-white">{block.extrinsicsCount}</span>
          </InfoRow>
          <InfoRow label="Events">
            <span className="text-sm text-white">{block.eventsCount}</span>
          </InfoRow>
        </div>,
      )}

      {/* Tabs: Extrinsics / Events */}
      {dyn.v1.addWrapDecoy(
        "block-detail-tabs",
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("extrinsics")}
              className={cn(
                "px-5 py-3 text-sm font-medium transition-colors relative",
                activeTab === "extrinsics"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {dyn.v3.getVariant("extrinsics_tab", dynamicV3TextVariants)}
              <span className="ml-1.5 text-xs text-zinc-500">
                ({block.extrinsicsCount})
              </span>
              {activeTab === "extrinsics" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={cn(
                "px-5 py-3 text-sm font-medium transition-colors relative",
                activeTab === "events"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {dyn.v3.getVariant("events_tab", dynamicV3TextVariants)}
              <span className="ml-1.5 text-xs text-zinc-500">
                ({syntheticEvents.length})
              </span>
              {activeTab === "events" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
          </div>

          {/* Extrinsics tab */}
          {activeTab === "extrinsics" && (
            <>
              {/* Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="text-xs text-zinc-500">
                  {block.extrinsics.length} extrinsic
                  {block.extrinsics.length !== 1 ? "s" : ""}
                </div>
                <RowsPerPageSelector
                  value={extRowsPerPage}
                  onChange={(n) => {
                    setExtRowsPerPage(n);
                    setExtPage(1);
                  }}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Extrinsic ID
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Name
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Account
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-right">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Height
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-right">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Result
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-right">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Time
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {paginatedExtrinsics.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-zinc-600 text-sm"
                        >
                          No extrinsics in this block
                        </td>
                      </tr>
                    ) : (
                      paginatedExtrinsics.map((ext, idx) => {
                        const globalIdx = (extPage - 1) * extRowsPerPage + idx;
                        return (
                          <tr
                            key={`${ext.hash}-${globalIdx}`}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-teal-400 font-mono text-sm">
                                {block.number}-{globalIdx}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-zinc-300 text-sm">
                                <span className="text-zinc-500">
                                  {ext.section}.
                                </span>
                                {ext.method}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-zinc-500 font-mono text-sm">
                                {formatAddress(ext.signer)}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                              <span className="text-teal-400 font-mono text-sm">
                                {block.number.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                              {ext.success ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                  Success
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-red-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  Failed
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                              <span className="text-zinc-400 text-sm">
                                {formatTimeAgo(block.timestamp)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={extPage}
                totalPages={extTotalPages}
                totalItems={block.extrinsics.length}
                perPage={extRowsPerPage}
                onPageChange={setExtPage}
              />
            </>
          )}

          {/* Events tab */}
          {activeTab === "events" && (
            <>
              {/* Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="text-xs text-zinc-500">
                  {syntheticEvents.length} event
                  {syntheticEvents.length !== 1 ? "s" : ""}
                </div>
                <RowsPerPageSelector
                  value={evtRowsPerPage}
                  onChange={(n) => {
                    setEvtRowsPerPage(n);
                    setEvtPage(1);
                  }}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Event ID
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Event
                        </span>
                      </th>
                      <th className="px-4 py-2.5 text-left">
                        <span className="text-[13px] font-normal text-zinc-500">
                          Phase
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {paginatedEvents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-zinc-600 text-sm"
                        >
                          No events in this block
                        </td>
                      </tr>
                    ) : (
                      paginatedEvents.map((evt, idx) => {
                        const globalIdx = (evtPage - 1) * evtRowsPerPage + idx;
                        return (
                          <tr
                            key={`${evt.id}-${globalIdx}`}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-teal-400 font-mono text-sm">
                                {block.number}-{globalIdx}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-zinc-300 text-sm">
                                <span className="text-zinc-500">
                                  {evt.section}.
                                </span>
                                {evt.method}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="text-zinc-500 font-mono text-sm">
                                {evt.phase}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={evtPage}
                totalPages={evtTotalPages}
                totalItems={syntheticEvents.length}
                perPage={evtRowsPerPage}
                onPageChange={setEvtPage}
              />
            </>
          )}
        </div>,
      )}
    </div>
  );
}
