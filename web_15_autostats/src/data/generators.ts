import { SUBNET_NAMES } from "@/shared/constants";
import type {
  Account,
  AccountWithDetails,
  Block,
  BlockWithDetails,
  CandleDataPoint,
  Delegation,
  Extrinsic,
  PriceDataPoint,
  Subnet,
  SubnetWithTrend,
  TransactionWithMethod,
  Transfer,
  Validator,
  ValidatorSubnetPerformance,
  ValidatorWithTrend,
  VolumeDataPoint,
} from "@/shared/types";

// Seeded random number generator using Linear Congruential Generator (LCG)
function seedRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

export function generateAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "5"; // Substrate address prefix
  for (let i = 0; i < 47; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

export function generateHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

export function generateBlocks(count: number, startBlock = 1000000): Block[] {
  const blocks: Block[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const blockNumber = startBlock - i;
    const extrinsicsCount = Math.floor(Math.random() * 10) + 1;

    blocks.push({
      number: blockNumber,
      hash: generateHash(),
      timestamp: new Date(now - i * 12000), // 12 second block time
      parentHash: generateHash(),
      stateRoot: generateHash(),
      extrinsicsCount,
      eventsCount: Math.floor(Math.random() * 20) + 5,
      validator: generateAddress(),
      extrinsics: generateExtrinsics(extrinsicsCount),
    });
  }

  return blocks;
}

function generateExtrinsics(count: number): Extrinsic[] {
  const methods = ["transfer", "stake", "unstake", "delegate", "setWeights"];
  const sections = ["balances", "staking", "subtensorModule"];
  const extrinsics: Extrinsic[] = [];

  for (let i = 0; i < count; i++) {
    extrinsics.push({
      hash: generateHash(),
      method: methods[Math.floor(Math.random() * methods.length)],
      section: sections[Math.floor(Math.random() * sections.length)],
      args: {},
      signer: generateAddress(),
      nonce: Math.floor(Math.random() * 1000),
      success: Math.random() > 0.05,
    });
  }

  return extrinsics;
}

export function generateSubnets(count: number): Subnet[] {
  const subnets: Subnet[] = [];

  for (let i = 0; i < count; i++) {
    subnets.push({
      id: i,
      name:
        SUBNET_NAMES[i % SUBNET_NAMES.length] +
        (i >= SUBNET_NAMES.length
          ? ` ${Math.floor(i / SUBNET_NAMES.length) + 1}`
          : ""),
      description: `Subnet ${i} for ${SUBNET_NAMES[i % SUBNET_NAMES.length].toLowerCase()}`,
      emission: Math.random() * 1000000,
      validatorCount: Math.floor(Math.random() * 100) + 10,
      minerCount: Math.floor(Math.random() * 1000) + 100,
      registrationCost: Math.random() * 100,
      tempo: Math.floor(Math.random() * 1000) + 100,
      difficulty: Math.random() * 1000000,
    });
  }

  return subnets;
}

export function generateValidators(count: number): Validator[] {
  const validators: Validator[] = [];

  for (let i = 0; i < count; i++) {
    const stake = Math.random() * 1000000;
    validators.push({
      hotkey: generateAddress(),
      coldkey: generateAddress(),
      stake,
      returnPercentage: Math.random() * 20,
      nominatorCount: Math.floor(Math.random() * 100),
      totalDelegated: stake * (Math.random() * 2 + 1),
      commission: Math.random() * 20,
      subnet: Math.floor(Math.random() * 32),
      rank: i + 1,
    });
  }

  return validators.sort((a, b) => b.stake - a.stake);
}

export function generateTransfers(count: number): Transfer[] {
  const transfers: Transfer[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    transfers.push({
      hash: generateHash(),
      from: generateAddress(),
      to: generateAddress(),
      amount: Math.random() * 10000,
      timestamp: new Date(now - i * 30000),
      blockNumber: 1000000 - Math.floor(i / 5),
      fee: Math.random() * 0.1,
      success: Math.random() > 0.05,
    });
  }

  return transfers;
}

export function generateAccounts(count: number): Account[] {
  const accounts: Account[] = [];

  for (let i = 0; i < count; i++) {
    accounts.push({
      address: generateAddress(),
      balance: Math.random() * 100000,
      stakedAmount: Math.random() * 50000,
      delegations: [],
      transactions: [],
    });
  }

  return accounts;
}

/**
 * Generate price history data for different time ranges
 * @param timeRange - Time range for the price history ('1h', '24h', '7d', '30d', '1y', 'all')
 * @param seed - Seed for deterministic random generation
 * @returns Array of PriceDataPoint objects with timestamp and price
 */
export function generatePriceHistory(
  timeRange: "1h" | "24h" | "7d" | "30d" | "1y" | "all",
  seed: number,
): PriceDataPoint[] {
  const now = Date.now();

  // Define intervals for each time range
  const intervals = {
    "1h": { count: 60, interval: 60000 }, // every minute for 1 hour
    "24h": { count: 24, interval: 3600000 }, // hourly for 24 hours
    "7d": { count: 168, interval: 3600000 }, // hourly for 7 days
    "30d": { count: 30, interval: 86400000 }, // daily for 30 days
    "1y": { count: 365, interval: 86400000 }, // daily for 1 year
    all: { count: 730, interval: 86400000 }, // daily for 2 years
  };

  const { count, interval } = intervals[timeRange];
  const rng = seedRandom(seed);

  // Starting price around $450 (realistic for TAO token)
  let basePrice = 450;
  const data: PriceDataPoint[] = [];

  // Generate price data with realistic volatility
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * interval);

    // Add volatility: ±10 price change per interval
    const volatility = rng() * 20 - 10;
    basePrice = Math.max(100, basePrice + volatility); // Keep price above $100

    data.push({
      timestamp,
      price: basePrice,
    });
  }

  return data;
}

/**
 * Generate candlestick data for different candle sizes
 * Fixed number of candles (~168) but different time periods based on candle size
 * @param candleSize - Candle size ('1h', '4h', '1d')
 * @param seed - Seed for deterministic random generation
 * @returns Array of CandleDataPoint objects with OHLC data
 */
export function generateCandleHistory(
  candleSize: "1h" | "4h" | "1d",
  seed: number,
): CandleDataPoint[] {
  const now = Date.now();

  // Fixed number of candles, but different time periods
  const candleConfigs = {
    "1h": { count: 168, interval: 3600000 }, // 168 candles = 7 days
    "4h": { count: 168, interval: 14400000 }, // 168 candles = 28 days
    "1d": { count: 168, interval: 86400000 }, // 168 candles = 168 days
  };

  const { count, interval } = candleConfigs[candleSize];
  const rng = seedRandom(seed);

  // Starting price around $450 (realistic for TAO token)
  let basePrice = 450;
  const data: CandleDataPoint[] = [];

  // Generate candlestick data with realistic OHLC values
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * interval);

    // Open price is the previous close (or base price for first candle)
    const open = basePrice;

    // Generate realistic price movement for this candle
    const volatility = (rng() * 0.04 - 0.02) * basePrice; // ±2% volatility
    const direction = rng() > 0.5 ? 1 : -1;

    // Close price
    const close = Math.max(100, open + volatility * direction);

    // High and low based on open and close
    const high = Math.max(open, close) * (1 + rng() * 0.01); // Up to 1% higher
    const low = Math.min(open, close) * (1 - rng() * 0.01); // Up to 1% lower

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
    });

    // Update base price for next candle
    basePrice = close;
  }

  return data;
}

/**
 * Generate volume data corresponding to price data
 * @param priceData - Array of price data points for timestamp alignment
 * @param seed - Seed for deterministic random generation
 * @returns Array of VolumeDataPoint objects with timestamp and volume
 */
export function generateVolumeData(
  priceData: PriceDataPoint[],
  seed: number,
): VolumeDataPoint[] {
  const rng = seedRandom(seed + 1000); // Offset seed to ensure different values from price

  return priceData.map((point) => ({
    timestamp: point.timestamp,
    volume: Math.floor(rng() * 5000000) + 1000000, // Volume between 1M and 6M
  }));
}

/**
 * Generate mini-chart trend data for sparkline visualizations
 * @param length - Number of data points to generate
 * @param seed - Seed for deterministic random generation
 * @param trend - Trend direction: 'up', 'down', or 'neutral'
 * @returns Array of numeric values representing the trend
 */
export function generateTrendData(
  length: number,
  seed: number,
  trend: "up" | "down" | "neutral" = "neutral",
): number[] {
  const rng = seedRandom(seed);
  const data: number[] = [];

  // Start at middle value (50)
  let value = 50;

  // Define trend bias for each direction
  const trendBias = {
    up: 0.6, // Positive bias for upward trend
    down: -0.6, // Negative bias for downward trend
    neutral: 0, // No bias for neutral trend
  }[trend];

  // Generate data points with volatility and trend
  for (let i = 0; i < length; i++) {
    // Random change with trend bias: (rng() - 0.5) gives range [-0.5, 0.5]
    // Multiply by 10 for volatility, add trend bias
    const change = (rng() - 0.5) * 10 + trendBias;

    // Update value and clamp to [0, 100] range
    value = Math.max(0, Math.min(100, value + change));

    data.push(value);
  }

  return data;
}

/**
 * Generate subnets with trend data for landing page display
 * @param count - Number of subnets to generate
 * @param seed - Seed for deterministic random generation
 * @returns Array of SubnetWithTrend objects with price, market cap, volume, and trend data
 */
export function generateSubnetsWithTrends(
  count: number,
  seed: number,
): SubnetWithTrend[] {
  // Generate base subnet data
  const subnets = generateSubnets(count);

  // Extend each subnet with trend data
  return subnets.map((subnet) => {
    // Use subnet ID to create unique but deterministic seed for each subnet
    const trendSeed = seed + subnet.id;
    const rng = seedRandom(trendSeed);

    // Special handling for Root subnet (ID 0)
    // Root subnet always has a price of 1.0 TAO
    let price: number;
    let marketCap: number;
    let volume24h: number;

    if (subnet.id === 0) {
      // Root subnet (ID 0) - fixed price of 1.0 TAO
      price = 1.0;
      // Root has higher market cap (between $50M and $100M)
      marketCap = rng() * 50000000 + 50000000;
      // Root has higher volume (between $5M and $10M)
      volume24h = rng() * 5000000 + 5000000;
    } else {
      // Alpha subnets - variable prices
      // Generate price between 0.01 and 2.0 TAO
      price = rng() * 1.99 + 0.01;
      // Generate market cap between $1M and $11M
      marketCap = rng() * 10000000 + 1000000;
      // Generate 24h volume between $100K and $1.1M
      volume24h = rng() * 1000000 + 100000;
    }

    // Generate 24h price change between -10% and +10%
    const priceChange24h = (rng() - 0.5) * 20;

    // Generate other time period changes
    const priceChange1h = (rng() - 0.5) * 5; // 1h: -2.5% to +2.5%
    const priceChange1w = (rng() - 0.5) * 30; // 1w: -15% to +15%
    const priceChange1m = (rng() - 0.5) * 50; // 1m: -25% to +25%

    // Determine trend direction based on price change
    const trend =
      priceChange24h > 2 ? "up" : priceChange24h < -2 ? "down" : "neutral";

    // Generate 7-day trend data (7 data points for sparkline)
    const trendData = generateTrendData(7, trendSeed, trend);

    return {
      ...subnet,
      price,
      marketCap,
      volume24h,
      priceChange1h,
      priceChange24h,
      priceChange1w,
      priceChange1m,
      trendData,
    };
  });
}

/**
 * Generate validators with performance trend data for landing page display
 * @param count - Number of validators to generate
 * @param seed - Seed for deterministic random generation
 * @returns Array of ValidatorWithTrend objects with performance trend data
 */
function generateSeededAddress(rng: () => number): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "5"; // Substrate address prefix
  for (let i = 0; i < 47; i++) {
    address += chars.charAt(Math.floor(rng() * chars.length));
  }
  return address;
}

function generateSubnetPerformance(
  rng: () => number,
  activeSubnets: number,
  hotkey: string,
): ValidatorSubnetPerformance[] {
  const subnetNames = [
    "Root",
    "Text Prompting",
    "Image Generation",
    "Data Scraping",
    "Compute",
    "Storage",
    "Prediction Markets",
    "Audio Generation",
    "Video Generation",
    "Translation",
    "Code Generation",
    "Social Media",
    "Gaming",
    "DeFi",
    "NFT Marketplace",
    "Identity",
    "Governance",
    "Search",
    "Inference",
    "Fine Tuning",
    "Map Reduce",
    "Cortex",
    "NAS",
    "Multi-Modal",
    "BitAgent",
    "Chunking",
    "Pharma",
    "Vision",
    "Dippy",
    "Sturdy",
    "Wombo",
    "MyShell",
  ];

  const performances: ValidatorSubnetPerformance[] = [];
  const usedNetuids = new Set<number>();

  for (let i = 0; i < activeSubnets; i++) {
    let netuid: number;
    do {
      netuid = Math.floor(rng() * 32);
    } while (usedNetuids.has(netuid));
    usedNetuids.add(netuid);

    performances.push({
      netuid,
      subnetName: subnetNames[netuid] || `Subnet ${netuid}`,
      type: rng() > 0.3 ? "Key" : "Server",
      hotkey,
      take: rng() * 20,
      proportion: rng() * 100,
      subnetWeight: rng() * 50000,
      subnetBalance: rng() * 2,
      noms: Math.floor(rng() * 50),
      familyWeight: rng() * 80000,
      familyBalance: rng() * 3,
      dominance: rng() * 15,
      divs: rng() * 100,
      uid: Math.floor(rng() * 256),
      vtrust: rng(),
      updated: Math.floor(rng() * 500),
    });
  }

  return performances.sort((a, b) => b.subnetWeight - a.subnetWeight);
}

export function generateValidatorsWithTrends(
  count: number,
  seed: number,
): ValidatorWithTrend[] {
  // Use seeded RNG so hotkeys are deterministic for a given seed
  const rng = seedRandom(seed + 5000);

  const validators: Validator[] = [];
  for (let i = 0; i < count; i++) {
    const stake = rng() * 1000000;
    const rootStake = stake * (0.1 + rng() * 0.5);
    const alphaStake = stake - rootStake;
    const totalWeight = rootStake * 0.18 + alphaStake;
    const activeSubnets = 1 + Math.floor(rng() * 8);
    const nominatorCount = Math.floor(rng() * 100);
    const nominatorChange24h = Math.floor(rng() * 20) - 5;

    validators.push({
      hotkey: generateSeededAddress(rng),
      coldkey: generateSeededAddress(rng),
      stake,
      returnPercentage: rng() * 20,
      nominatorCount,
      nominatorChange24h,
      totalDelegated: stake * (rng() * 2 + 1),
      commission: rng() * 20,
      subnet: Math.floor(rng() * 32),
      rank: i + 1,
      dominance: 0, // computed after sorting
      activeSubnets,
      totalWeight,
      rootStake,
      alphaStake,
      weightChange24h: (rng() - 0.4) * totalWeight * 0.05,
    });
  }
  validators.sort((a, b) => b.totalWeight - a.totalWeight);
  // Reassign ranks and compute dominance after sorting
  const totalNetworkWeight = validators.reduce(
    (sum, v) => sum + v.totalWeight,
    0,
  );
  validators.forEach((v, i) => {
    v.rank = i + 1;
    v.dominance =
      totalNetworkWeight > 0 ? (v.totalWeight / totalNetworkWeight) * 100 : 0;
  });

  // Extend each validator with performance trend data and subnet performance
  return validators.map((validator, index) => {
    const trendSeed = seed + index;
    const performanceTrend = generateTrendData(30, trendSeed, "up");
    const subnetRng = seedRandom(seed + 7000 + index);
    const subnetPerformance = generateSubnetPerformance(
      subnetRng,
      validator.activeSubnets,
      validator.hotkey,
    );

    return {
      ...validator,
      performanceTrend,
      subnetPerformance,
    };
  });
}

function generateSeededHash(rng: () => number): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(rng() * chars.length));
  }
  return hash;
}

/**
 * Generate accounts with detailed analytics data
 * @param count - Number of accounts to generate
 * @param seed - Seed for deterministic random generation
 * @returns Array of AccountWithDetails sorted by totalValue descending
 */
export function generateAccountsWithDetails(
  count: number,
  seed: number,
): AccountWithDetails[] {
  const rng = seedRandom(seed + 9000);
  const now = Date.now();

  const accounts: AccountWithDetails[] = [];

  for (let i = 0; i < count; i++) {
    const address = generateSeededAddress(rng);

    // Exponential distribution: few whales, many small accounts
    const totalHoldings = Math.max(
      0.01,
      Math.pow(rng(), 3) * 500000 + rng() * 1000,
    );
    const stakingRatio = rng() * 0.9 + 0.05; // 5% to 95% staked
    const stakedAmount = totalHoldings * stakingRatio;
    const balance = totalHoldings - stakedAmount; // free balance

    const delegationCount = 2 + Math.floor(rng() * 7); // 2-8
    const transactionCount = 5 + Math.floor(rng() * 16); // 5-20
    const balanceChange24h = (rng() - 0.45) * 20; // slight positive bias, -9% to +11%

    // Account type based on stake level + rng
    const typeRoll = rng();
    let accountType: AccountWithDetails["accountType"];
    if (stakedAmount > 100000 && typeRoll < 0.6) {
      accountType = "validator";
    } else if (stakedAmount > 10000 && typeRoll < 0.7) {
      accountType = "nominator";
    } else if (typeRoll < 0.15) {
      accountType = "miner";
    } else {
      accountType = "regular";
    }

    // Time values
    const firstSeenDaysAgo = 30 + Math.floor(rng() * 700); // 30-730 days ago
    const lastActiveDaysAgo = Math.floor(rng() * 30); // 0-30 days ago

    // Generate delegations
    const delegations: Delegation[] = [];
    for (let d = 0; d < delegationCount; d++) {
      delegations.push({
        validator: generateSeededAddress(rng),
        amount: (stakedAmount / delegationCount) * (0.5 + rng()),
        timestamp: new Date(now - Math.floor(rng() * 86400000 * 90)),
      });
    }

    // Generate transactions
    const transactions: Transfer[] = [];
    for (let t = 0; t < transactionCount; t++) {
      transactions.push({
        hash: generateSeededHash(rng),
        from: rng() > 0.5 ? address : generateSeededAddress(rng),
        to: rng() > 0.5 ? generateSeededAddress(rng) : address,
        amount: rng() * balance * 0.1,
        timestamp: new Date(now - Math.floor(rng() * 86400000 * 30)),
        blockNumber: 1000000 - Math.floor(rng() * 10000),
        fee: rng() * 0.05,
        success: rng() > 0.03,
      });
    }

    // Sort delegations by amount desc, transactions by timestamp desc
    delegations.sort((a, b) => b.amount - a.amount);
    transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const trendSeed = seed + 9000 + i;
    const trend =
      balanceChange24h > 2 ? "up" : balanceChange24h < -2 ? "down" : "neutral";
    const balanceTrend = generateTrendData(30, trendSeed, trend);

    accounts.push({
      address,
      balance,
      stakedAmount,
      delegations,
      transactions,
      rank: 0,
      totalValue: totalHoldings,
      stakingRatio: stakingRatio * 100,
      delegationCount,
      transactionCount,
      balanceChange24h,
      firstSeen: new Date(now - firstSeenDaysAgo * 86400000),
      lastActive: new Date(now - lastActiveDaysAgo * 86400000),
      accountType,
      balanceTrend,
    });
  }

  // Sort by totalValue descending, assign ranks
  accounts.sort((a, b) => b.totalValue - a.totalValue);
  accounts.forEach((acc, i) => {
    acc.rank = i + 1;
  });

  return accounts;
}

/**
 * Generate transactions with method information for landing page display
 * @param count - Number of transactions to generate
 * @param seed - Seed for deterministic random generation
 * @returns Array of TransactionWithMethod objects with method name and section
 */
export function generateTransactionsWithMethods(
  count: number,
  seed: number,
): TransactionWithMethod[] {
  // Generate base transfer data
  const transfers = generateTransfers(count);

  // Define available methods with their sections
  const methods = [
    { name: "transfer", section: "balances" },
    { name: "stake", section: "staking" },
    { name: "unstake", section: "staking" },
    { name: "delegate", section: "staking" },
    { name: "setWeights", section: "subtensorModule" },
  ];

  const rng = seedRandom(seed);

  // Extend each transfer with method information
  return transfers.map((transfer) => {
    // Use seeded random to select a method
    const methodIndex = Math.floor(rng() * methods.length);
    const method = methods[methodIndex];

    return {
      ...transfer,
      method: method.name,
      section: method.section,
    };
  });
}

/**
 * Generate blocks with detailed analytics data
 * @param count - Number of blocks to generate
 * @param seed - Seed for deterministic random generation
 * @param startBlock - Starting block number (defaults to 1000000)
 * @returns Array of BlockWithDetails sorted by block number descending
 */
export function generateBlocksWithDetails(
  count: number,
  seed: number,
  startBlock = 1000000,
): BlockWithDetails[] {
  const rng = seedRandom(seed + 11000);
  const now = Date.now();

  const methods = [
    { name: "transfer", section: "balances" },
    { name: "transferKeepAlive", section: "balances" },
    { name: "stake", section: "staking" },
    { name: "unstake", section: "staking" },
    { name: "delegate", section: "staking" },
    { name: "setWeights", section: "subtensorModule" },
    { name: "register", section: "subtensorModule" },
    { name: "dissolve", section: "subtensorModule" },
    { name: "remark", section: "system" },
    { name: "setCode", section: "system" },
  ];

  const blocks: BlockWithDetails[] = [];

  for (let i = 0; i < count; i++) {
    const blockNumber = startBlock - i;

    // 1-12 extrinsics per block
    const extrinsicsCount = 1 + Math.floor(rng() * 12);

    // Generate seeded extrinsics
    const extrinsics: Extrinsic[] = [];
    const breakdown = {
      balances: 0,
      staking: 0,
      subtensorModule: 0,
      system: 0,
    };

    for (let e = 0; e < extrinsicsCount; e++) {
      const methodIdx = Math.floor(rng() * methods.length);
      const method = methods[methodIdx];
      const success = rng() > 0.05; // 95% success rate

      breakdown[method.section as keyof typeof breakdown]++;

      extrinsics.push({
        hash: generateSeededHash(rng),
        method: method.name,
        section: method.section,
        args: {},
        signer: generateSeededAddress(rng),
        nonce: Math.floor(rng() * 1000),
        success,
      });
    }

    const successCount = extrinsics.filter((ex) => ex.success).length;
    const successRate =
      extrinsicsCount > 0 ? (successCount / extrinsicsCount) * 100 : 100;

    // Block time: 12s ± variance (9-15s)
    const timeSinceLastBlock = 9 + rng() * 6;

    // Block size: 2-50 KB, scales with extrinsic count
    const sizeKB = Math.round(2 + extrinsicsCount * (1.5 + rng() * 2.5));

    // Fees: 0.001-0.05 per extrinsic
    const totalFees = extrinsics.reduce(
      (sum) => sum + 0.001 + rng() * 0.049,
      0,
    );

    // Events roughly 2-3x extrinsics
    const eventsCount =
      extrinsicsCount * 2 + Math.floor(rng() * extrinsicsCount);

    // Epoch: block / 360
    const epoch = Math.floor(blockNumber / 360);

    // Spec version: realistic Bittensor spec versions
    const specVersion = 377;

    blocks.push({
      number: blockNumber,
      hash: generateSeededHash(rng),
      timestamp: new Date(now - i * 12000),
      parentHash: generateSeededHash(rng),
      stateRoot: generateSeededHash(rng),
      extrinsicsCount,
      eventsCount,
      validator: generateSeededAddress(rng),
      extrinsics,
      successRate,
      totalFees,
      sizeKB,
      epoch,
      specVersion,
      extrinsicsRoot: generateSeededHash(rng),
      extrinsicBreakdown: breakdown,
      timeSinceLastBlock,
    });
  }

  return blocks;
}
