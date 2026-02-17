// Core type definitions for AutoStats blockchain explorer

export interface Block {
  number: number;
  hash: string;
  timestamp: Date;
  parentHash: string;
  stateRoot: string;
  extrinsicsCount: number;
  eventsCount: number;
  validator: string;
  extrinsics: Extrinsic[];
}

export interface Extrinsic {
  hash: string;
  method: string;
  section: string;
  args: Record<string, unknown>;
  signer: string;
  nonce: number;
  success: boolean;
}

export interface Subnet {
  id: number;
  name: string;
  description: string;
  emission: number;
  validatorCount: number;
  minerCount: number;
  registrationCost: number;
  tempo: number;
  difficulty: number;
}

export interface Validator {
  hotkey: string;
  coldkey: string;
  stake: number;
  returnPercentage: number;
  nominatorCount: number;
  totalDelegated: number;
  commission: number;
  subnet: number;
  rank: number;
}

export interface Account {
  address: string;
  balance: number;
  stakedAmount: number;
  delegations: Delegation[];
  transactions: Transfer[];
}

export interface Delegation {
  validator: string;
  amount: number;
  timestamp: Date;
}

export interface Transfer {
  hash: string;
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  blockNumber: number;
  fee: number;
  success: boolean;
}

export interface NetworkStats {
  totalIssuance: number;
  circulatingSupply: number;
  stakedTAO: number;
  taoPrice: number;
  totalValidators: number;
  totalSubnets: number;
  totalAccounts: number;
  blockTime: number;
}

export interface SeedContextType {
  seed: string;
  setSeed: (seed: string) => void;
}

export interface PriceDataPoint {
  timestamp: Date;
  price: number;
}

export interface CandleDataPoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeDataPoint {
  timestamp: Date;
  volume: number;
}

export interface SubnetWithTrend extends Subnet {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange1w: number;
  priceChange1m: number;
  trendData: number[];
}

export interface ValidatorWithTrend extends Validator {
  performanceTrend: number[];
}

export interface TransactionWithMethod extends Transfer {
  method: string;
  section: string;
}
