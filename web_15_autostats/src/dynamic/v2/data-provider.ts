/**
 * V2 Data Loading System for web_15_autostats
 *
 * Loads validators, subnets, blocks, accounts, transfers from server (/datasets/load).
 * When V2 is disabled, uses seed=1 (original data).
 */

import { fetchSeededSelection } from "@/shared/seeded-loader";
import { isV2Enabled } from "@/dynamic/shared/flags";
import type {
  Account,
  Block,
  Subnet,
  Transfer,
  Validator,
} from "@/shared/types";

const PROJECT_KEY = "web_15_autostats";
const DEFAULT_LIMIT = 50;

type ValidatorRaw = Validator;
type SubnetRaw = Subnet;
type BlockRaw = Omit<Block, "timestamp"> & { timestamp: string };
type AccountRaw = Omit<Account, "delegations" | "transactions"> & {
  delegations: Array<Omit<Account["delegations"][0], "timestamp"> & { timestamp: string }>;
  transactions: Array<Omit<Transfer, "timestamp"> & { timestamp: string }>;
};
type TransferRaw = Omit<Transfer, "timestamp"> & { timestamp: string };

function parseDate(s: string | undefined): Date {
  if (!s) return new Date();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function normalizeBlock(raw: BlockRaw): Block {
  return {
    ...raw,
    timestamp: parseDate(raw.timestamp),
    extrinsics: raw.extrinsics ?? [],
  };
}

function normalizeAccount(raw: AccountRaw): Account {
  return {
    address: raw.address,
    balance: raw.balance ?? 0,
    stakedAmount: raw.stakedAmount ?? 0,
    delegations: (raw.delegations ?? []).map((d) => ({
      ...d,
      timestamp: parseDate(d.timestamp),
    })),
    transactions: (raw.transactions ?? []).map((t) => ({
      ...t,
      timestamp: parseDate(t.timestamp),
    })),
  };
}

function normalizeTransfer(raw: TransferRaw): Transfer {
  return {
    ...raw,
    timestamp: parseDate(raw.timestamp),
  };
}

function getSeed(): number {
  if (typeof window === "undefined") return 1;
  const params = new URLSearchParams(window.location.search);
  const s = params.get("seed");
  if (s) {
    const n = Number.parseInt(s, 10);
    if (!Number.isNaN(n)) return Math.max(1, Math.min(999, n));
  }
  try {
    const saved = localStorage.getItem("autostats_seed");
    if (saved) {
      const n = Number.parseInt(saved, 10);
      if (!Number.isNaN(n)) return Math.max(1, Math.min(999, n));
    }
  } catch {
    // ignore
  }
  return 1;
}

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private validators: Validator[] = [];
  private subnets: Subnet[] = [];
  private blocks: Block[] = [];
  private accounts: Account[] = [];
  private transfers: Transfer[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private currentSeed = 1;

  private constructor() {
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadAll();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getEffectiveSeed(): number {
    return isV2Enabled() ? getSeed() : 1;
  }

  private async loadAll(): Promise<void> {
    const seed = this.getEffectiveSeed();
    this.currentSeed = seed;

    try {
      const [v, s, b, a, t] = await Promise.all([
        fetchSeededSelection<ValidatorRaw>({
          projectKey: PROJECT_KEY,
          entityType: "validators",
          seedValue: seed,
          limit: DEFAULT_LIMIT,
          method: "select",
        }),
        fetchSeededSelection<SubnetRaw>({
          projectKey: PROJECT_KEY,
          entityType: "subnets",
          seedValue: seed,
          limit: DEFAULT_LIMIT,
          method: "select",
        }),
        fetchSeededSelection<BlockRaw>({
          projectKey: PROJECT_KEY,
          entityType: "blocks",
          seedValue: seed,
          limit: DEFAULT_LIMIT,
          method: "select",
        }),
        fetchSeededSelection<AccountRaw>({
          projectKey: PROJECT_KEY,
          entityType: "accounts",
          seedValue: seed,
          limit: DEFAULT_LIMIT,
          method: "select",
        }),
        fetchSeededSelection<TransferRaw>({
          projectKey: PROJECT_KEY,
          entityType: "transfers",
          seedValue: seed,
          limit: DEFAULT_LIMIT,
          method: "select",
        }),
      ]);

      this.validators = v ?? [];
      this.subnets = s ?? [];
      this.blocks = (b ?? []).map(normalizeBlock);
      this.accounts = (a ?? []).map(normalizeAccount);
      this.transfers = (t ?? []).map(normalizeTransfer);
      this.ready = true;
    } catch (error) {
      console.error("[autostats V2] Failed to load data:", error);
      this.validators = [];
      this.subnets = [];
      this.blocks = [];
      this.accounts = [];
      this.transfers = [];
      this.ready = true;
    }
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public getValidators(): Validator[] {
    return this.validators;
  }

  public getSubnets(): Subnet[] {
    return this.subnets;
  }

  public getBlocks(): Block[] {
    return this.blocks;
  }

  public getAccounts(): Account[] {
    return this.accounts;
  }

  public getTransfers(): Transfer[] {
    return this.transfers;
  }

  public async reload(seed?: number): Promise<void> {
    if (typeof window === "undefined") return;
    this.ready = false;
    this.currentSeed = seed ?? this.getEffectiveSeed();
    this.readyPromise = this.loadAll();
    await this.readyPromise;
  }

  public isEnabled(): boolean {
    return isV2Enabled();
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();
export const isDynamicModeEnabled = () => dynamicDataProvider.isEnabled();
