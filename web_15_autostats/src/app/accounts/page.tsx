'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { dynamicDataProvider } from '@/dynamic/v2';
import { accountToAccountWithDetails } from '@/data/derive-trends';
import { AccountsPageContent } from '@/components/pages/AccountsPageContent';
import type { AccountWithDetails } from '@/shared/types';

export default function AccountsPage() {
  const { seed } = useSeed();
  const [mounted, setMounted] = useState(false);
  const [allAccounts, setAllAccounts] = useState<AccountWithDetails[]>([]);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      dynamicDataProvider.reload(seed).then(() => {
        if (cancelled) return;
        const raw = dynamicDataProvider.getAccounts();
        setAllAccounts(raw.map((a, i) => accountToAccountWithDetails(a, i)));
      });
    });
    return () => {
      cancelled = true;
    };
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
