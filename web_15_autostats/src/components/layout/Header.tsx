'use client';

import React from 'react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { DynamicWrapper } from '@/dynamic/v1/DynamicWrapper';
import { DynamicText } from '@/dynamic/v3/DynamicText';
import { Search } from 'lucide-react';

export function Header() {
  const router = useSeedRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <DynamicWrapper>
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a
            href="/"
            onClick={handleLogoClick}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-4 py-2 text-lg font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/40"
          >
            <DynamicText value="AutoStats" type="text" />
          </a>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-6">
              <NavLink href="/subnets" label="Subnets" />
              <NavLink href="/validators" label="Validators" />
              <NavLink href="/transfers" label="Transfers" />
              <NavLink href="/accounts" label="Accounts" />
            </nav>

            <button className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </DynamicWrapper>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const router = useSeedRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
    >
      <DynamicText value={label} type="text" />
    </a>
  );
}
