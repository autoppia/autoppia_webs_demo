import { generateAccounts } from './generators';

// Generate 100 mock accounts
export const mockAccounts = generateAccounts(100);

export function getAccountByAddress(address: string) {
  return mockAccounts.find(account => account.address === address);
}

export function searchAccounts(query: string) {
  const lowerQuery = query.toLowerCase();
  return mockAccounts.filter(account => 
    account.address.toLowerCase().includes(lowerQuery)
  );
}
