"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { readJson, writeJson } from "@/shared/storage";
import { useSeed } from "@/context/SeedContext";
import { generateWalletAddress, generateWalletBalance } from "@/data/generators";
import { logEvent, EVENT_TYPES } from "@/library/events";

interface WalletContextType {
  connected: boolean;
  address: string | null;
  walletName: string | null;
  balance: number | null;
  connecting: boolean;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  walletName: null,
  balance: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

const STORAGE_KEY = "autostats_wallet";

interface StoredWallet {
  address: string;
  walletName: string;
  balance: number;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { seed } = useSeed();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = readJson<StoredWallet>(STORAGE_KEY);
    if (stored) {
      setConnected(true);
      setAddress(stored.address);
      setWalletName(stored.walletName);
      setBalance(stored.balance);
    }
  }, []);

  const connect = useCallback(
    async (name: string) => {
      setConnecting(true);
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const addr = generateWalletAddress(seed, name);
      const bal = generateWalletBalance(seed);

      setConnected(true);
      setAddress(addr);
      setWalletName(name);
      setBalance(bal);
      setConnecting(false);

      writeJson<StoredWallet>(STORAGE_KEY, { address: addr, walletName: name, balance: bal });

      logEvent(EVENT_TYPES.CONNECT_WALLET, { wallet_name: name, address: addr });
    },
    [seed],
  );

  const disconnect = useCallback(() => {
    const prevName = walletName;
    const prevAddr = address;

    setConnected(false);
    setAddress(null);
    setWalletName(null);
    setBalance(null);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }

    logEvent(EVENT_TYPES.DISCONNECT_WALLET, { wallet_name: prevName, address: prevAddr });
  }, [walletName, address]);

  return (
    <WalletContext.Provider
      value={{ connected, address, walletName, balance, connecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
