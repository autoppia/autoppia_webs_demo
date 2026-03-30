/**
 * Derive display data (trends, details) from server-loaded base entities.
 * Used when data is loaded from server (V2); adds only client-side display fields.
 */

import type {
  Account,
  AccountWithDetails,
  Block,
  BlockWithDetails,
  Subnet,
  SubnetWithTrend,
  Transfer,
  TransactionWithMethod,
  Validator,
  ValidatorSubnetPerformance,
  ValidatorWithTrend,
} from "@/shared/types";

function seedRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function generateTrendData(
  length: number,
  seed: number,
  trend: "up" | "down" | "neutral" = "neutral",
): number[] {
  const rng = seedRandom(seed);
  const data: number[] = [];
  let value = 50;
  const trendBias = { up: 0.6, down: -0.6, neutral: 0 }[trend];
  for (let i = 0; i < length; i++) {
    const change = (rng() - 0.5) * 10 + trendBias;
    value = Math.max(0, Math.min(100, value + change));
    data.push(value);
  }
  return data;
}

const SUBNET_NAMES = [
  "Text Prompting", "Image Generation", "Data Scraping", "Compute", "Storage",
  "Prediction Markets", "Audio Generation", "Video Generation", "Translation", "Code Generation",
  "Social Media", "Gaming", "DeFi", "NFT Marketplace", "Identity", "Governance",
  "Text Prompting 2", "Image Generation 2", "Data Scraping 2", "Compute 2", "Storage 2",
  "Prediction Markets 2", "Audio Generation 2", "Video Generation 2", "Translation 2", "Code Generation 2",
  "Social Media 2", "Gaming 2", "DeFi 2", "NFT Marketplace 2", "Identity 2", "Governance 2",
  "Federated Learning", "Edge Inference", "Reinforcement Learning", "Multimodal Fusion", "Knowledge Graph", "Semantic Search", "Recommendation Engine", "Anomaly Detection",
  "Time Series", "Speech Synthesis", "Document AI", "Code Completion", "Question Answering", "Summarization", "Sentiment Analysis", "Named Entity",
  "Object Detection", "Segmentation", "Pose Estimation", "OCR", "Handwriting", "Face Recognition", "Action Recognition", "3D Reconstruction",
  "Drug Discovery", "Protein Folding", "Genomics", "Clinical NLP", "Medical Imaging", "EHR Analysis", "Radiology", "Pathology",
  "Supply Chain", "Fraud Detection", "Credit Scoring", "Trading Signals", "Risk Analytics", "Compliance", "KYC", "Insurance",
  "Autonomous Driving", "Robotics Control", "Sensor Fusion", "SLAM", "Path Planning", "Fleet Management", "Predictive Maintenance", "Digital Twin",
  "Content Moderation", "Fact Checking", "Disinformation", "Bias Detection", "Explainability", "Adversarial Robustness", "Privacy Preserving", "Federated Analytics",
  "Energy Forecasting", "Grid Optimization", "Climate Modeling", "Carbon Tracking", "Renewable", "Demand Response", "Battery", "Smart Meter",
  "Legal NLP", "Contract Analysis", "Patent Search", "Regulatory",
  // Subnets 100–199 (aligned with server subnets.json)
  "Model Serving", "Transfer Learning", "Few-Shot Learning", "Neural Architecture", "RAG Pipeline", "Multimodal Embedding",
  "Diffusion Models", "Agent Orchestration", "Tool Use", "Contrastive Learning", "Self-Supervised", "Causal Inference",
  "Uncertainty Quantification", "Data Labeling", "Feature Store", "Model Registry", "Experiment Tracking", "Real-Time Inference",
  "Batch Inference", "Model Compression", "Quantization", "Pruning", "Distillation", "Zero-Knowledge",
  "Homomorphic", "Secure Aggregation", "Watermarking", "Provenance", "Threat Detection", "Precision Agriculture",
  "Geospatial", "Satellite", "Remote Sensing", "Logistics", "Inventory", "Retail Demand",
  "Customer Churn", "Personalization", "Search Ranking", "Ad Targeting", "Creative Assist", "Music Generation",
  "Art Generation", "Synthetic Data", "Data Marketplace", "Human-in-the-Loop", "Continual Learning", "Streaming ML",
  "Edge Training", "Distributed Training", "Hyperparameter Tuning", "AutoML", "Neural Search", "Graph Neural",
  "Sequence Model", "Survival Analysis", "Causal Discovery", "Fairness", "Recourse", "Deepfake Detection",
  "Citation Checking", "Scientific Discovery", "Materials Science", "Molecular Design", "Clinical Trial", "Triage",
  "Wearables", "Behavioral", "Engagement", "Moderation Pipeline", "Safety Classifier", "Red Teaming",
  "Alignment", "Reward Model", "Preference Learning", "Document Understanding", "Table Extraction", "Form Processing",
  "Entity Resolution", "Knowledge Extraction", "Dialogue System", "Virtual Assistant", "Intent Recognition", "Slot Filling",
  "Multi-Turn", "Voice Cloning", "Sound Event", "Acoustic Scene", "Noise Suppression", "Speech Enhancement",
  "Video Understanding", "Action Localization", "Temporal Segmentation", "Motion Prediction", "Scene Graph", "Visual QA",
  "Image Captioning", "Referring Expression", "Visual Reasoning", "Embodied AI",
];
const SUBNET_COUNT = 200;

function generateSubnetPerformance(
  rng: () => number,
  activeSubnets: number,
  hotkey: string,
): ValidatorSubnetPerformance[] {
  const performances: ValidatorSubnetPerformance[] = [];
  const usedNetuids = new Set<number>();
  for (let i = 0; i < activeSubnets; i++) {
    let netuid: number;
    do {
      netuid = Math.floor(rng() * SUBNET_COUNT);
    } while (usedNetuids.has(netuid));
    usedNetuids.add(netuid);
    performances.push({
      netuid,
      subnetName: SUBNET_NAMES[netuid] ?? `Subnet ${netuid}`,
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

export function addTrendsToValidators(
  validators: Validator[],
  seed: number,
): ValidatorWithTrend[] {
  return validators.map((v, i) => {
    const trendSeed = seed + i;
    const subnetRng = seedRandom(seed + 7000 + i);
    const activeSubnets = Math.min(v.activeSubnets ?? 1, 8);
    return {
      ...v,
      performanceTrend: generateTrendData(30, trendSeed, "up"),
      subnetPerformance: generateSubnetPerformance(subnetRng, activeSubnets, v.hotkey),
    };
  });
}

export function addTrendsToSubnets(
  subnets: Subnet[],
  seed: number,
): SubnetWithTrend[] {
  return subnets.map((subnet) => {
    const trendSeed = seed + subnet.id;
    const rng = seedRandom(trendSeed);
    const isRoot = subnet.id === 0;
    const price = isRoot ? 1.0 : rng() * 1.99 + 0.01;
    const marketCap = isRoot ? rng() * 50000000 + 50000000 : rng() * 10000000 + 1000000;
    const volume24h = isRoot ? rng() * 5000000 + 5000000 : rng() * 1000000 + 100000;
    const priceChange24h = (rng() - 0.5) * 20;
    const trend = priceChange24h > 2 ? "up" : priceChange24h < -2 ? "down" : "neutral";
    return {
      ...subnet,
      price,
      marketCap,
      volume24h,
      priceChange1h: (rng() - 0.5) * 5,
      priceChange24h,
      priceChange1w: (rng() - 0.5) * 30,
      priceChange1m: (rng() - 0.5) * 50,
      trendData: generateTrendData(7, trendSeed, trend),
    };
  });
}

const METHODS = [
  { name: "transfer", section: "balances" },
  { name: "stake", section: "staking" },
  { name: "unstake", section: "staking" },
  { name: "delegate", section: "staking" },
  { name: "setWeights", section: "subtensorModule" },
];

export function addMethodsToTransfers(
  transfers: Transfer[],
  seed: number,
): TransactionWithMethod[] {
  const rng = seedRandom(seed);
  return transfers.map((t) => {
    const idx = Math.floor(rng() * METHODS.length);
    const method = METHODS[idx] ?? METHODS[0];
    const { name, section } = method;
    return { ...t, method: name, section };
  });
}

export function blockToBlockWithDetails(b: Block): BlockWithDetails {
  const extrinsics = b.extrinsics ?? [];
  const successCount = extrinsics.filter((e) => e.success).length;
  const breakdown = { balances: 0, staking: 0, subtensorModule: 0, system: 0 };
  for (const e of extrinsics) {
    const k = e.section as keyof typeof breakdown;
    if (k in breakdown) breakdown[k]++;
  }
  return {
    ...b,
    successRate: extrinsics.length ? (successCount / extrinsics.length) * 100 : 100,
    totalFees: extrinsics.length * 0.01,
    sizeKB: 2 + extrinsics.length * 2,
    epoch: Math.floor(b.number / 360),
    specVersion: 377,
    extrinsicsRoot: `0x${"0".repeat(64)}`,
    extrinsicBreakdown: breakdown,
    timeSinceLastBlock: 12,
  };
}

export function accountToAccountWithDetails(a: Account, index: number): AccountWithDetails {
  const totalValue = a.balance + a.stakedAmount;
  const stakingRatio = totalValue > 0 ? (a.stakedAmount / totalValue) * 100 : 0;
  return {
    ...a,
    rank: index + 1,
    totalValue,
    stakingRatio,
    delegationCount: a.delegations?.length ?? 0,
    transactionCount: a.transactions?.length ?? 0,
    balanceChange24h: 0,
    firstSeen: a.transactions?.[0]?.timestamp ?? new Date(),
    lastActive: a.transactions?.[0]?.timestamp ?? new Date(),
    accountType: a.stakedAmount > 100000 ? "validator" : a.stakedAmount > 10000 ? "nominator" : "regular",
    balanceTrend: generateTrendData(30, index + 9000, "neutral"),
  };
}
