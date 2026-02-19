"use client";

import React, { useState, useMemo } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import type { AccountWithDetails } from "@/shared/types";
import { formatNumber } from "@/library/formatters";
import { cn } from "@/utils/cn";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { MiniChart } from "@/components/charts/MiniChart";

interface AccountsPageContentProps {
  accounts: AccountWithDetails[];
}

type SortField =
  | "rank"
  | "address"
  | "balance"
  | "stakedAmount"
  | "stakingRatio"
  | "balanceTrend"
  | "balanceChange24h"
  | "accountType"
  | "lastActive";
type SortDirection = "asc" | "desc";
type AccountTypeFilter = "all" | "validator" | "nominator" | "miner" | "regular";

// SVG Ring Chart component for stats cards
function RingChart({
  percent,
  size = 64,
  strokeWidth = 8,
  primaryColor,
  trackColor = "#27272a",
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  primaryColor: string;
  trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

export function AccountsPageContent({ accounts }: AccountsPageContentProps) {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>("all");

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    page_title: ["Accounts", "Network Accounts", "Account Overview", "Accounts Dashboard", "Active Accounts"],
    page_description: [
      "Explore accounts on the Bittensor network",
      "View all Bittensor accounts and their balances",
      "Browse network accounts and analytics",
      "Discover Bittensor account ecosystem",
      "Analyze account balance metrics",
    ],
    total_value_label: ["Total Value Locked", "TVL", "Aggregate Value", "Combined Value", "Value Locked"],
    account_types_label: ["Account Types", "Account Distribution", "Type Breakdown", "Account Categories", "Type Overview"],
    network_activity_label: ["Network Activity", "Activity Overview", "Recent Activity", "Network Usage", "Activity Stats"],
    search_placeholder: ["Search accounts...", "Find account...", "Search by address...", "Filter accounts...", "Search..."],
    staked_label: ["Staked", "Staked TAO", "Total Staked", "Staked Value", "Delegated"],
    free_label: ["Free", "Free Balance", "Available", "Unstaked", "Liquid"],
    validators_label: ["Validators", "Validator Accounts", "Active Validators", "Validators Only", "Val Accounts"],
    others_label: ["Others", "Other Accounts", "Remaining", "Non-Validators", "The Rest"],
  };

  // Calculate overview stats
  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalStaked = accounts.reduce((sum, a) => sum + a.stakedAmount, 0);
    const totalValue = totalBalance + totalStaked;

    const validatorCount = accounts.filter((a) => a.accountType === "validator").length;
    const othersCount = accounts.length - validatorCount;

    const now = Date.now();
    const active24h = accounts.filter((a) => now - a.lastActive.getTime() < 86400000).length;
    const inactive = accounts.length - active24h;

    return {
      totalBalance,
      totalStaked,
      totalValue,
      stakedPercent: totalValue > 0 ? (totalStaked / totalValue) * 100 : 0,
      freePercent: totalValue > 0 ? (totalBalance / totalValue) * 100 : 0,
      validatorCount,
      othersCount,
      validatorPercent: accounts.length > 0 ? (validatorCount / accounts.length) * 100 : 0,
      othersPercent: accounts.length > 0 ? (othersCount / accounts.length) * 100 : 0,
      active24h,
      inactive,
      activePercent: accounts.length > 0 ? (active24h / accounts.length) * 100 : 0,
      inactivePercent: accounts.length > 0 ? (inactive / accounts.length) * 100 : 0,
    };
  }, [accounts]);

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts;

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.accountType === typeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) => a.address.toLowerCase().includes(query) || a.rank.toString().includes(query)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "balanceTrend") {
        // Sort by last trend value
        const aVal = a.balanceTrend[a.balanceTrend.length - 1] ?? 0;
        const bVal = b.balanceTrend[b.balanceTrend.length - 1] ?? 0;
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      let aVal: string | number | Date = a[sortField as Exclude<SortField, "balanceTrend">];
      let bVal: string | number | Date = b[sortField as Exclude<SortField, "balanceTrend">];

      if (aVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = (bVal as Date).getTime();
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [accounts, searchQuery, typeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAccounts.length / rowsPerPage);
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedAccounts.slice(start, start + rowsPerPage);
  }, [filteredAndSortedAccounts, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleAccountClick = (address: string) => {
    router.push(`/accounts/${address}`);
  };

  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `${formatNumber(value / 1000000000, 2)}B`;
    }
    if (value >= 1000000) {
      return `${formatNumber(value / 1000000, 2)}M`;
    }
    if (value >= 1000) {
      return `${formatNumber(value / 1000, 2)}K`;
    }
    return formatNumber(value, 2);
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 14) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const typeBadgeColor = (type: string): string => {
    switch (type) {
      case "validator":
        return "bg-blue-900/30 text-blue-400";
      case "nominator":
        return "bg-green-900/30 text-green-400";
      case "miner":
        return "bg-purple-900/30 text-purple-400";
      default:
        return "bg-zinc-800/50 text-zinc-400";
    }
  };

  const typeLeftBorderColor = (type: string): string => {
    switch (type) {
      case "validator":
        return "border-l-blue-500";
      case "nominator":
        return "border-l-green-500";
      case "miner":
        return "border-l-purple-500";
      default:
        return "border-l-zinc-600";
    }
  };

  const typeCounts = useMemo(() => {
    const counts: Record<AccountTypeFilter, number> = { all: accounts.length, validator: 0, nominator: 0, miner: 0, regular: 0 };
    for (const a of accounts) {
      counts[a.accountType]++;
    }
    return counts;
  }, [accounts]);

  const filterPillColor = (type: AccountTypeFilter, isActive: boolean): string => {
    if (!isActive) return "text-zinc-400 hover:text-white hover:bg-zinc-700";
    switch (type) {
      case "all":
        return "bg-blue-500 text-white";
      case "validator":
        return "bg-blue-500 text-white";
      case "nominator":
        return "bg-green-500 text-white";
      case "miner":
        return "bg-purple-500 text-white";
      case "regular":
        return "bg-zinc-600 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const gridCols = "50px 170px 100px 100px 100px 90px 80px 85px 110px";
  const minW = "950px";

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="space-y-8">
        {/* Header */}
        {dyn.v1.addWrapDecoy("accounts-header", (
          <div className="mb-8">
            <h1
              id={dyn.v3.getVariant("accounts-page-title", ID_VARIANTS_MAP)}
              className={cn(
                "text-4xl font-bold text-white mb-2",
                dyn.v3.getVariant("page-title", CLASS_VARIANTS_MAP)
              )}
            >
              {dyn.v3.getVariant("page_title", dynamicV3TextVariants)}
            </h1>
            <p className="text-zinc-400 text-lg">
              {dyn.v3.getVariant("page_description", dynamicV3TextVariants)}
            </p>
          </div>
        ))}

        {/* Stats Overview — SVG Ring Charts */}
        {dyn.v1.addWrapDecoy("accounts-stats-section", (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(() => {
              const statsCards = [
                {
                  key: "total-value-card",
                  label: dyn.v3.getVariant("total_value_label", dynamicV3TextVariants),
                  totalValue: `τ${formatLargeNumber(stats.totalValue)}`,
                  ringPercent: stats.stakedPercent,
                  ringColor: "#22c55e",
                  leftLabel: dyn.v3.getVariant("staked_label", dynamicV3TextVariants),
                  rightLabel: dyn.v3.getVariant("free_label", dynamicV3TextVariants),
                  leftValue: `τ${formatLargeNumber(stats.totalStaked)}`,
                  rightValue: `τ${formatLargeNumber(stats.totalBalance)}`,
                  leftPercent: stats.stakedPercent,
                  rightPercent: stats.freePercent,
                  leftColor: "#22c55e",
                  rightColor: "#3f3f46",
                },
                {
                  key: "account-types-card",
                  label: dyn.v3.getVariant("account_types_label", dynamicV3TextVariants),
                  totalValue: `${accounts.length}`,
                  ringPercent: stats.validatorPercent,
                  ringColor: "#3b82f6",
                  leftLabel: dyn.v3.getVariant("validators_label", dynamicV3TextVariants),
                  rightLabel: dyn.v3.getVariant("others_label", dynamicV3TextVariants),
                  leftValue: `${stats.validatorCount}`,
                  rightValue: `${stats.othersCount}`,
                  leftPercent: stats.validatorPercent,
                  rightPercent: stats.othersPercent,
                  leftColor: "#3b82f6",
                  rightColor: "#3f3f46",
                },
                {
                  key: "network-activity-card",
                  label: dyn.v3.getVariant("network_activity_label", dynamicV3TextVariants),
                  totalValue: `${accounts.length}`,
                  ringPercent: stats.activePercent,
                  ringColor: "#22c55e",
                  leftLabel: "Active 24h",
                  rightLabel: "Inactive",
                  leftValue: `${stats.active24h}`,
                  rightValue: `${stats.inactive}`,
                  leftPercent: stats.activePercent,
                  rightPercent: stats.inactivePercent,
                  leftColor: "#22c55e",
                  rightColor: "#3f3f46",
                },
              ];

              const order = dyn.v1.changeOrderElements("accounts-stats-cards", statsCards.length);
              const orderedCards = order.map((i) => statsCards[i]);

              return orderedCards.map((card, index) => {
                return dyn.v1.addWrapDecoy(card.key, (
                  <div
                    key={`${card.key}-${index}`}
                    id={dyn.v3.getVariant(`accounts-stats-card-${index}`, ID_VARIANTS_MAP)}
                    className={cn(
                      "rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 relative overflow-hidden backdrop-blur-sm hover:border-zinc-700 transition-all duration-300",
                      dyn.v3.getVariant("stats-card", CLASS_VARIANTS_MAP)
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        {/* SVG Ring Chart */}
                        <RingChart
                          percent={card.ringPercent}
                          primaryColor={card.ringColor}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">
                            {card.label}
                          </div>
                          <div className="text-2xl font-bold text-white tracking-tight">
                            {card.totalValue}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: card.leftColor }}
                            />
                            <span className="text-zinc-400">{card.leftLabel}</span>
                          </div>
                          <span className="text-white font-medium">
                            {card.leftValue}{" "}
                            <span className="text-zinc-500">({formatNumber(card.leftPercent, 1)}%)</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: card.rightColor }}
                            />
                            <span className="text-zinc-400">{card.rightLabel}</span>
                          </div>
                          <span className="text-white font-medium">
                            {card.rightValue}{" "}
                            <span className="text-zinc-500">({formatNumber(card.rightPercent, 1)}%)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              });
            })()}
          </div>
        ))}

        {/* Controls: Search + Type Filter Pills + Rows per page */}
        {dyn.v1.addWrapDecoy("accounts-controls", (
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
            {dyn.v1.addWrapDecoy("accounts-search", (
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={dyn.v3.getVariant("search_placeholder", dynamicV3TextVariants)}
                  id={dyn.v3.getVariant("accounts-search-input", ID_VARIANTS_MAP)}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-2 focus:ring-zinc-700/50 transition-all",
                    dyn.v3.getVariant("search-input", CLASS_VARIANTS_MAP)
                  )}
                />
              </div>
            ))}

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              {(["all", "validator", "nominator", "miner", "regular"] as AccountTypeFilter[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize",
                    filterPillColor(type, typeFilter === type)
                  )}
                >
                  {type}
                  <span className={cn("ml-1", typeFilter === type ? "opacity-70" : "opacity-50")}>
                    {typeCounts[type]}
                  </span>
                </button>
              ))}
            </div>

            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Show</span>
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                {[10, 25, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setRowsPerPage(n);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                      rowsPerPage === n
                        ? "bg-blue-500 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Accounts Table */}
        {dyn.v1.addWrapDecoy("accounts-table-container", (
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Table Header */}
                <div
                  className="grid gap-3 px-6 py-4 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  style={{ gridTemplateColumns: gridCols, minWidth: minW }}
                >
                  <div
                    onClick={() => handleSort("rank")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    #
                    {sortField === "rank" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("address")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  >
                    Address
                    {sortField === "address" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("balance")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Balance
                    {sortField === "balance" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("stakedAmount")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Staked
                    {sortField === "stakedAmount" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("stakingRatio")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Ratio
                    {sortField === "stakingRatio" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("balanceTrend")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Trend
                    {sortField === "balanceTrend" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("balanceChange24h")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    24h
                    {sortField === "balanceChange24h" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("accountType")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Type
                    {sortField === "accountType" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                  <div
                    onClick={() => handleSort("lastActive")}
                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-end gap-1"
                  >
                    Last Active
                    {sortField === "lastActive" && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-800/50">
                  {paginatedAccounts.map((account) =>
                    dyn.v1.addWrapDecoy(`account-row-${account.rank}`, (
                      <div
                        key={account.address}
                        onClick={() => handleAccountClick(account.address)}
                        className={cn(
                          "grid gap-3 px-6 py-4 hover:bg-zinc-800/30 cursor-pointer transition-all duration-200 group items-center border-l-[3px]",
                          typeLeftBorderColor(account.accountType)
                        )}
                        style={{ gridTemplateColumns: gridCols, minWidth: minW }}
                      >
                        {/* Rank */}
                        <div className="text-zinc-500 font-mono text-sm font-medium">
                          {account.rank}
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                            A
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-medium group-hover:text-blue-400 transition-colors truncate font-mono text-sm">
                              {formatAddress(account.address)}
                            </div>
                          </div>
                        </div>

                        {/* Balance */}
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">
                            τ{formatLargeNumber(account.balance)}
                          </span>
                        </div>

                        {/* Staked */}
                        <div className="text-right">
                          <span className="text-zinc-300 text-sm">
                            τ{formatLargeNumber(account.stakedAmount)}
                          </span>
                        </div>

                        {/* Ratio — inline bar + percentage */}
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(account.stakingRatio, 100)}%` }}
                            />
                          </div>
                          <span className="text-zinc-300 text-sm tabular-nums">
                            {formatNumber(account.stakingRatio, 1)}%
                          </span>
                        </div>

                        {/* Trend — MiniChart sparkline */}
                        <div className="flex items-center justify-end">
                          <MiniChart
                            data={account.balanceTrend}
                            width={80}
                            height={24}
                            trend={account.balanceChange24h > 2 ? "up" : account.balanceChange24h < -2 ? "down" : "neutral"}
                          />
                        </div>

                        {/* 24h Change */}
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              account.balanceChange24h > 0
                                ? "text-green-400"
                                : account.balanceChange24h < 0
                                  ? "text-red-400"
                                  : "text-zinc-500"
                            )}
                          >
                            {account.balanceChange24h > 0 ? "+" : ""}
                            {formatNumber(account.balanceChange24h, 2)}%
                          </span>
                        </div>

                        {/* Type */}
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded font-semibold capitalize",
                              typeBadgeColor(account.accountType)
                            )}
                          >
                            {account.accountType}
                          </span>
                        </div>

                        {/* Last Active */}
                        <div className="text-right">
                          <span className="text-zinc-400 text-sm">
                            {formatTimeAgo(account.lastActive)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals Row */}
                {filteredAndSortedAccounts.length > 0 && (
                  <div
                    className="grid gap-3 px-6 py-4 bg-zinc-800/30 border-t-2 border-zinc-700 items-center"
                    style={{ gridTemplateColumns: gridCols, minWidth: minW }}
                  >
                    <div />
                    <div className="flex items-center">
                      <span className="text-white font-bold text-sm">Total</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(filteredAndSortedAccounts.reduce((sum, a) => sum + a.balance, 0))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-sm">
                        τ{formatLargeNumber(filteredAndSortedAccounts.reduce((sum, a) => sum + a.stakedAmount, 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {(() => {
                        const avgRatio = filteredAndSortedAccounts.reduce((sum, a) => sum + a.stakingRatio, 0) / filteredAndSortedAccounts.length;
                        return (
                          <>
                            <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min(avgRatio, 100)}%` }}
                              />
                            </div>
                            <span className="text-white font-bold text-sm tabular-nums">
                              {formatNumber(avgRatio, 1)}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                )}

                {/* No results message */}
                {filteredAndSortedAccounts.length === 0 && (
                  <div className="text-center py-16 text-zinc-400">
                    <div className="text-lg font-medium mb-2">No accounts found</div>
                    <div className="text-sm text-zinc-500">Try adjusting your search criteria</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <div className="text-sm text-zinc-400">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(currentPage * rowsPerPage, filteredAndSortedAccounts.length)} of{" "}
                  {filteredAndSortedAccounts.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                      currentPage === 1
                        ? "text-zinc-600 cursor-not-allowed"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
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
                            "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                      currentPage === totalPages
                        ? "text-zinc-600 cursor-not-allowed"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
