'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { AccountDetailPageContent } from '@/components/pages/AccountDetailPageContent';
import { dynamicDataProvider } from '@/dynamic/v2';
import { accountToAccountWithDetails } from '@/data/derive-trends';
import type { AccountWithDetails } from '@/shared/types';
import { useParams } from 'next/navigation';

export default function AccountDetailPage() {
  const { seed } = useSeed();
  const params = useParams();
  const address = params.address as string;

  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<AccountWithDetails | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNotFound(false);
    setAccount(null);
    let cancelled = false;
    dynamicDataProvider.whenReady().then(() => {
      if (cancelled) return;
      return dynamicDataProvider.reload(seed);
    }).then(() => {
      if (cancelled) return;
      const raw = dynamicDataProvider.getAccounts();
      const accounts = raw.map((a, i) => accountToAccountWithDetails(a, i));
      const found = accounts.find((a) => a.address === address);
      if (found) setAccount(found);
      else setNotFound(true);
    });
    return () => { cancelled = true; };
  }, [seed, address]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading account...</div>
      </div>
    );
  }

  if (notFound || !account) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Account Not Found</h1>
          <p className="text-zinc-400">The account you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <AccountDetailPageContent account={account} />;
}
