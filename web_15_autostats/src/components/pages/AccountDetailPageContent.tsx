"use client";

import React, { useState, useMemo } from "react";
import type { AccountWithDetails } from "@/shared/types";
import { formatNumber } from "@/library/formatters";
import { cn } from "@/utils/cn";
import { ArrowLeft } from "lucide-react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { generatePriceHistory } from "@/data/generators";
import { PriceChart } from "@/components/charts/PriceChart";

interface AccountDetailPageContentProps {
  account: AccountWithDetails;
}

type TimeRange = "24h" | "7d" | "30d" | "1y";

// SVG Donut chart for Balance Breakdown card
function DonutChart({
  freePercent,
  stakedPercent,
  centerLabel,
  size = 120,
  strokeWidth = 14,
}: {
  freePercent: number;
  stakedPercent: number;
  centerLabel: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const stakedOffset = circumference - (stakedPercent / 100) * circumference;
  const freeArcLength = (freePercent / 100) * circumference;
  const freeOffset = circumference - freeArcLength;
  // Rotate so free segment starts where staked segment ends
  const freeRotation = -90 + (stakedPercent / 100) * 360;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        {/* Staked segment (blue) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={stakedOffset}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-700 ease-out"
        />
        {/* Free segment (green) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={freeOffset}
          transform={`rotate(${freeRotation} ${center} ${center})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-white leading-none">{centerLabel}</span>
      </div>
    </div>
  );
}

export function AccountDetailPageContent({ account }: AccountDetailPageContentProps) {
  const router = useSeedRouter();

  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const priceData = useMemo(() => {
    return generatePriceHistory(timeRange, account.rank);
  }, [timeRange, account.rank]);

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

  const handleBack = () => {
    router.push("/accounts");
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 14) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secs`;
    }
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? "min" : "mins"}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const typeBadgeColor = (type: string): string => {
    switch (type) {
      case "validator":
        return "bg-blue-500/20 text-blue-400";
      case "nominator":
        return "bg-green-500/20 text-green-400";
      case "miner":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  const freeBalance = account.balance;
  const freePercent = account.totalValue > 0 ? (freeBalance / account.totalValue) * 100 : 0;
  const stakedPercent = account.totalValue > 0 ? (account.stakedAmount / account.totalValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="px-6 max-w-[1400px] mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Accounts</span>
        </button>

        {/* Account Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg bg-gradient-to-br from-purple-500 to-pink-500">
              A
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">Account #{account.rank}</h1>
                <span
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md capitalize",
                    typeBadgeColor(account.accountType)
                  )}
                >
                  {account.accountType}
                </span>
                <span
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1",
                    account.balanceChange24h >= 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  )}
                >
                  {account.balanceChange24h >= 0 ? "+" : ""}
                  {formatNumber(account.balanceChange24h, 2)}% (24h)
                </span>
              </div>
              <div className="text-sm text-zinc-500 mt-1 font-mono break-all">
                {account.address}
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm text-zinc-500 mb-1">Rank</div>
            <div className="text-2xl font-bold text-zinc-400">#{account.rank}</div>
          </div>
        </div>

        {/* Top-Level Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Total Value</div>
            <div className="text-xl font-bold text-white">τ{formatLargeNumber(account.totalValue)}</div>
            <div className="text-xs text-zinc-500">${formatLargeNumber(account.totalValue * 450)}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Free Balance</div>
            <div className="text-xl font-bold text-green-400">τ{formatLargeNumber(freeBalance)}</div>
            <div className="text-xs text-zinc-500">${formatLargeNumber(freeBalance * 450)}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Staked Amount</div>
            <div className="text-xl font-bold text-blue-400">τ{formatLargeNumber(account.stakedAmount)}</div>
            <div className="text-xs text-zinc-500">${formatLargeNumber(account.stakedAmount * 450)}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Delegations</div>
            <div className="text-xl font-bold text-white">{account.delegationCount}</div>
            <div className="text-xs text-zinc-500">validators</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4">
            <div className="text-xs text-zinc-400 mb-1">Transactions</div>
            <div className="text-xl font-bold text-white">{account.transactionCount}</div>
            <div className="text-xs text-zinc-500">total</div>
          </div>
        </div>

        {/* Full-Width Area Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Balance History</h2>
            <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
              {(["24h", "7d", "30d", "1y"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                    timeRange === range
                      ? "bg-blue-500 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  )}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            <PriceChart key={timeRange} data={priceData} height={400} />
          </div>
        </div>

        {/* Two-Column Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Card: Balance Breakdown with Donut */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-6">
              Balance Breakdown
            </div>
            <div className="flex items-center justify-center mb-6">
              <DonutChart
                freePercent={freePercent}
                stakedPercent={stakedPercent}
                centerLabel={`τ${formatLargeNumber(account.totalValue)}`}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-zinc-400">Free Balance</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">τ{formatLargeNumber(freeBalance)}</span>
                  <span className="text-xs text-zinc-500 ml-2">{formatNumber(freePercent, 1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-zinc-400">Staked Amount</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">
                    τ{formatLargeNumber(account.stakedAmount)}
                  </span>
                  <span className="text-xs text-zinc-500 ml-2">{formatNumber(stakedPercent, 1)}%</span>
                </div>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                <span className="text-sm text-zinc-400">Total Value</span>
                <span className="text-sm font-bold text-blue-400">
                  τ{formatLargeNumber(account.totalValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Card: Account Info */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-6">
              Account Info
            </div>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                <span className="text-sm text-zinc-400">Type</span>
                <span
                  className={cn(
                    "text-xs px-2.5 py-1 rounded font-semibold capitalize",
                    typeBadgeColor(account.accountType)
                  )}
                >
                  {account.accountType}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                <span className="text-sm text-zinc-400">First Seen</span>
                <span className="text-sm font-bold text-white">{formatDate(account.firstSeen)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                <span className="text-sm text-zinc-400">Last Active</span>
                <span className="text-sm font-bold text-white">{formatTimeAgo(account.lastActive)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                <span className="text-sm text-zinc-400">Staking Ratio</span>
                <span className="text-sm font-bold text-white">
                  {formatNumber(account.stakingRatio, 1)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                <span className="text-sm text-zinc-400">24h Change</span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    account.balanceChange24h >= 0 ? "text-green-400" : "text-red-400"
                  )}
                >
                  {account.balanceChange24h >= 0 ? "+" : ""}
                  {formatNumber(account.balanceChange24h, 2)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                <span className="text-sm text-zinc-400">Rank</span>
                <span className="text-sm font-bold text-white">#{account.rank}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
                <span className="text-sm text-zinc-400">Delegations</span>
                <span className="text-sm font-bold text-white">{account.delegationCount}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-zinc-400">Transactions</span>
                <span className="text-sm font-bold text-white">{account.transactionCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delegations Table */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden w-full">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Delegations</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Staked across {account.delegationCount} validators
            </p>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50">
            <table className="w-full min-w-[600px]">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Validator</span>
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Amount</span>
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Share</span>
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Date</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {account.delegations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 text-sm">
                      No delegations found
                    </td>
                  </tr>
                ) : (
                  account.delegations.map((delegation, idx) => {
                    const sharePercent = account.stakedAmount > 0
                      ? (delegation.amount / account.stakedAmount) * 100
                      : 0;
                    return (
                      <tr
                        key={`${delegation.validator}-${idx}`}
                        className="hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-zinc-300 font-mono text-sm">
                            {formatAddress(delegation.validator)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className="text-white font-medium text-sm">
                            τ{formatLargeNumber(delegation.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${Math.min(sharePercent, 100)}%` }}
                              />
                            </div>
                            <span className="text-zinc-400 text-sm tabular-nums">
                              {formatNumber(sharePercent, 1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className="text-zinc-400 text-sm">
                            {formatTimeAgo(delegation.timestamp)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 overflow-hidden w-full">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50">
            <table className="w-full min-w-[900px]">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-sm font-medium text-zinc-300">Time</span>
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-sm font-medium text-zinc-300">Type</span>
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-sm font-medium text-zinc-300">From</span>
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-sm font-medium text-zinc-300">To</span>
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-medium text-zinc-300">Amount</span>
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-medium text-zinc-300">Fee</span>
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-medium text-zinc-300">Status</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {account.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 text-sm">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  account.transactions.slice(0, 15).map((tx) => {
                    const isSend = tx.from === account.address;
                    const typeBadge = isSend
                      ? "bg-red-900/30 text-red-400"
                      : "bg-green-900/30 text-green-400";

                    return (
                      <tr key={tx.hash} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-zinc-300 text-sm">{formatTimeAgo(tx.timestamp)}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs px-2 py-1 rounded uppercase font-semibold ${typeBadge}`}
                          >
                            {isSend ? "send" : "receive"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "font-mono text-sm",
                              tx.from === account.address
                                ? "text-white font-semibold"
                                : "text-zinc-400"
                            )}
                          >
                            {tx.from === account.address ? "You" : formatAddress(tx.from)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "font-mono text-sm",
                              tx.to === account.address
                                ? "text-white font-semibold"
                                : "text-zinc-400"
                            )}
                          >
                            {tx.to === account.address ? "You" : formatAddress(tx.to)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSend ? "text-red-400" : "text-green-400"
                            )}
                          >
                            {isSend ? "-" : "+"}τ{formatLargeNumber(tx.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span className="text-zinc-400 text-sm">τ{formatNumber(tx.fee, 4)}</span>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded font-semibold",
                              tx.success
                                ? "bg-green-900/30 text-green-400"
                                : "bg-red-900/30 text-red-400"
                            )}
                          >
                            {tx.success ? "Success" : "Failed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
