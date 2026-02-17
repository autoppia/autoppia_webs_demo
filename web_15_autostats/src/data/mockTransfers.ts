import { generateTransfers } from './generators';

// Generate 200 mock transfers
export const mockTransfers = generateTransfers(200);

export function getTransferByHash(hash: string) {
  return mockTransfers.find(transfer => transfer.hash === hash);
}

export function getRecentTransfers(count: number = 20) {
  return mockTransfers.slice(0, count);
}

export function filterTransfers(filters: {
  address?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  return mockTransfers.filter(transfer => {
    if (filters.address) {
      const lowerAddress = filters.address.toLowerCase();
      if (!transfer.from.toLowerCase().includes(lowerAddress) && 
          !transfer.to.toLowerCase().includes(lowerAddress)) {
        return false;
      }
    }
    
    if (filters.minAmount !== undefined && transfer.amount < filters.minAmount) {
      return false;
    }
    
    if (filters.maxAmount !== undefined && transfer.amount > filters.maxAmount) {
      return false;
    }
    
    if (filters.startDate && transfer.timestamp < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && transfer.timestamp > filters.endDate) {
      return false;
    }
    
    return true;
  });
}
