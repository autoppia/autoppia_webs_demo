// Application constants for AutoStats

export const APP_NAME = 'AutoStats';
export const APP_DESCRIPTION = 'Bittensor Network Explorer and Analytics';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
export const WEBS_SERVER_URL = process.env.NEXT_PUBLIC_WEBS_SERVER_URL || 'http://localhost:3000';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Network Constants
export const BLOCK_TIME_SECONDS = 12;
export const BLOCKS_PER_DAY = (24 * 60 * 60) / BLOCK_TIME_SECONDS;

// Formatting
export const TAO_DECIMALS = 9;
export const ADDRESS_SHORT_LENGTH = 8;
export const HASH_SHORT_LENGTH = 10;

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

// Theme
export const THEME = {
  background: '#0a0a0a',
  foreground: '#ffffff',
  card: '#1a1a1a',
  cardForeground: '#ffffff',
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  secondary: '#8b5cf6',
  secondaryForeground: '#ffffff',
  muted: '#2a2a2a',
  mutedForeground: '#a1a1aa',
  accent: '#3b82f6',
  accentForeground: '#ffffff',
  border: '#27272a',
};

// Default Values
export const DEFAULT_NETWORK_STATS = {
  totalIssuance: 21000000,
  circulatingSupply: 15000000,
  stakedTAO: 10000000,
  taoPrice: 450.25,
  totalValidators: 256,
  totalSubnets: 32,
  totalAccounts: 50000,
  blockTime: BLOCK_TIME_SECONDS,
};

// Subnet Names
export const SUBNET_NAMES = [
  'Text Prompting',
  'Image Generation',
  'Data Scraping',
  'Compute',
  'Storage',
  'Prediction Markets',
  'Audio Generation',
  'Video Generation',
  'Translation',
  'Code Generation',
  'Social Media',
  'Gaming',
  'DeFi',
  'NFT Marketplace',
  'Identity',
  'Governance',
];
