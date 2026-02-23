"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletModal } from "./WalletModal";
import { Wallet, ChevronDown, Copy, LogOut, Check } from "lucide-react";
import { formatAddress, formatNumber } from "@/library/formatters";

export function WalletButton() {
  const { connected, address, walletName, balance, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!connected) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect</span>
        </button>
        <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
      >
        <span className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0" />
        <span className="hidden sm:inline font-mono text-xs">
          {address ? formatAddress(address, 6) : ""}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl z-[55]">
          <div className="p-4 border-b border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">{walletName}</div>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 w-full text-left group"
            >
              <span className="font-mono text-xs text-zinc-300 truncate flex-1">
                {address}
              </span>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" />
              )}
            </button>
          </div>

          <div className="p-4 border-b border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">Balance</div>
            <div className="text-lg font-semibold text-white">
              {balance !== null ? formatNumber(balance, 4) : "0"} TAO
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
