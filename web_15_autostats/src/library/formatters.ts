// Data formatting utilities

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTAO(value: number): string {
  return `${formatNumber(value, 4)} τ`;
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value, 2)}%`;
}

export function formatAddress(address: string, shortLength: number = 8): string {
  if (address.length <= shortLength * 2) {
    return address;
  }
  return `${address.substring(0, shortLength)}...${address.substring(address.length - shortLength)}`;
}

export function formatHash(hash: string, shortLength: number = 10): string {
  if (hash.length <= shortLength + 6) {
    return hash;
  }
  return `${hash.substring(0, shortLength)}...${hash.substring(hash.length - 6)}`;
}

export function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
