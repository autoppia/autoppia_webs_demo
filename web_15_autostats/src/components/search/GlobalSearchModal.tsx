'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { searchSubnets } from '@/data/mockSubnets';
import { searchValidators } from '@/data/mockValidators';
import { searchBlocks } from '@/data/mockBlocks';
import { searchAccounts } from '@/data/mockAccounts';
import { Input } from '@/components/ui/input';
import { Network, Shield, Blocks, Wallet, Search, X } from 'lucide-react';

const MAX_PER_CATEGORY = 5;

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const router = useSeedRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return {
        subnets: searchSubnets('').slice(0, MAX_PER_CATEGORY),
        validators: searchValidators('').slice(0, MAX_PER_CATEGORY),
        blocks: searchBlocks('').slice(0, MAX_PER_CATEGORY),
        accounts: searchAccounts('').slice(0, MAX_PER_CATEGORY),
      };
    }
    return {
      subnets: searchSubnets(q).slice(0, MAX_PER_CATEGORY),
      validators: searchValidators(q).slice(0, MAX_PER_CATEGORY),
      blocks: searchBlocks(q).slice(0, MAX_PER_CATEGORY),
      accounts: searchAccounts(q).slice(0, MAX_PER_CATEGORY),
    };
  }, [query]);

  const hasAny =
    results.subnets.length > 0 ||
    results.validators.length > 0 ||
    results.blocks.length > 0 ||
    results.accounts.length > 0;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const navigateAndClose = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-24 px-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
          <Search className="h-5 w-5 text-zinc-500 shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search subnets, validators, blocks, accounts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() && !hasAny && (
            <p className="px-2 py-6 text-sm text-zinc-500 text-center">
              No results for &quot;{query}&quot;
            </p>
          )}
          {hasAny && (
            <div className="space-y-4">
              {results.subnets.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Network className="h-3.5 w-3.5" /> Subnets
                  </h3>
                  <ul className="space-y-0.5">
                    {results.subnets.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => navigateAndClose(`/subnets/${s.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-zinc-200 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-zinc-500">#{s.id}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={() => navigateAndClose('/subnets')}
                      className="w-full px-3 py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                    >
                      View all subnets →
                    </button>
                  )}
                </section>
              )}
              {results.validators.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Shield className="h-3.5 w-3.5" /> Validators
                  </h3>
                  <ul className="space-y-0.5">
                    {results.validators.map((v) => (
                      <li key={v.hotkey}>
                        <button
                          type="button"
                          onClick={() =>
                            navigateAndClose(`/validators/${encodeURIComponent(v.hotkey)}`)
                          }
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-zinc-200 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <span className="font-mono text-xs truncate max-w-[200px]">
                            {v.hotkey}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={() => navigateAndClose('/validators')}
                      className="w-full px-3 py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                    >
                      View all validators →
                    </button>
                  )}
                </section>
              )}
              {results.blocks.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Blocks className="h-3.5 w-3.5" /> Blocks
                  </h3>
                  <ul className="space-y-0.5">
                    {results.blocks.map((b) => (
                      <li key={b.number}>
                        <button
                          type="button"
                          onClick={() => navigateAndClose(`/blocks/${b.number}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-zinc-200 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <span className="font-medium">#{b.number}</span>
                          <span className="font-mono text-xs text-zinc-500 truncate max-w-[180px]">
                            {b.hash}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={() => navigateAndClose('/blocks')}
                      className="w-full px-3 py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                    >
                      View all blocks →
                    </button>
                  )}
                </section>
              )}
              {results.accounts.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Wallet className="h-3.5 w-3.5" /> Accounts
                  </h3>
                  <ul className="space-y-0.5">
                    {results.accounts.map((a) => (
                      <li key={a.address}>
                        <button
                          type="button"
                          onClick={() =>
                            navigateAndClose(
                              `/accounts/${encodeURIComponent(a.address)}`
                            )
                          }
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-zinc-200 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <span className="font-mono text-xs truncate max-w-[280px]">
                            {a.address}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={() => navigateAndClose('/accounts')}
                      className="w-full px-3 py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                    >
                      View all accounts →
                    </button>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
