'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { generateAccountsWithDetails } from '@/data/generators';
import { AccountsPageContent } from '@/components/pages/AccountsPageContent';
import type { AccountWithDetails } from '@/shared/types';

export default function AccountsPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allAccounts, setAllAccounts] = useState<AccountWithDetails[]>([]);

  useEffect(() => {
    setMounted(true);
    const accounts = generateAccountsWithDetails(200, seed);
    setAllAccounts(accounts);
  }, [seed]);

  if (!mounted || allAccounts.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading accounts...</div>
      </div>
    );
  }

  return <AccountsPageContent accounts={allAccounts} />;
}
