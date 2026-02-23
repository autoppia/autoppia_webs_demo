"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { X, Loader2 } from "lucide-react";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const WALLET_OPTIONS = [
  {
    name: "Polkadot.js",
    description: "Browser extension for Substrate-based chains",
    iconBg: "bg-pink-500/20",
    iconText: "text-pink-400",
    letter: "P",
  },
  {
    name: "Talisman",
    description: "Multi-chain wallet for Polkadot & Ethereum",
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-400",
    letter: "T",
  },
  {
    name: "SubWallet",
    description: "Comprehensive Substrate wallet extension",
    iconBg: "bg-cyan-500/20",
    iconText: "text-cyan-400",
    letter: "S",
  },
];

export function WalletModal({ open, onClose }: WalletModalProps) {
  const { connecting, connect } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !connecting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, connecting]);

  // Reset tracking when modal closes or connection finishes
  useEffect(() => {
    if (!connecting) setConnectingWallet(null);
  }, [connecting]);

  if (!open) return null;

  const handleConnect = async (walletName: string) => {
    setConnectingWallet(walletName);
    await connect(walletName);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !connecting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            disabled={connecting}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wallet Options */}
        <div className="p-6 space-y-3">
          {WALLET_OPTIONS.map((wallet) => {
            const isThis = connectingWallet === wallet.name;

            return (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                disabled={connecting}
                className="flex w-full items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-800/50 p-4 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-wait"
              >
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${wallet.iconBg}`}
                >
                  <span className={`text-xl font-bold ${wallet.iconText}`}>{wallet.letter}</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{wallet.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{wallet.description}</div>
                </div>

                {/* Loading indicator -- only on the clicked wallet */}
                {isThis && connecting && (
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-zinc-500 text-center">
            By connecting, you agree to the Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
