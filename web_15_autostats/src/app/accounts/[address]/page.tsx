'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { AccountDetailPageContent } from '@/components/pages/AccountDetailPageContent';
import { generateAccountsWithDetails } from '@/data/generators';
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
    const accounts = generateAccountsWithDetails(200, seed);
    const found = accounts.find(a => a.address === address);

    if (found) {
      setAccount(found);
    } else {
      setNotFound(true);
    }
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
