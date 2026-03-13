'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { useDynamicSystem } from '@/dynamic/shared';
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from '@/dynamic/v3';
import { Search } from 'lucide-react';
import { WalletButton } from '@/components/wallet/WalletButton';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { href: '/subnets', labelKey: 'nav_subnets' as const },
  { href: '/validators', labelKey: 'nav_validators' as const },
  { href: '/blocks', labelKey: 'nav_blocks' as const },
  { href: '/transfers', labelKey: 'nav_transfers' as const },
  { href: '/accounts', labelKey: 'nav_accounts' as const },
] as const;

export function Header() {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  const orderedNavLinks = useMemo(() => {
    const order = dyn.v1.changeOrderElements('header-nav-links', NAV_LINKS.length);
    return order.map((i) => NAV_LINKS[i]);
  }, [dyn.v1]);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a
            id={dyn.v3.getVariant('header-logo-link', ID_VARIANTS_MAP)}
            href="/"
            onClick={handleLogoClick}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-4 py-2 text-lg font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/40"
          >
            {dyn.v3.getVariant('app_name', undefined, 'AutoStats')}
          </a>

          <div className="flex items-center gap-4">
            {dyn.v1.addWrapDecoy('header-nav', (
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                {orderedNavLinks.map(({ href, labelKey }) =>
                  dyn.v1.addWrapDecoy(`header-nav-link-${labelKey}`, (
                    <NavLink key={href} href={href} labelKey={labelKey} dyn={dyn} />
                  ))
                )}
              </nav>
            ))}

            {dyn.v1.addWrapDecoy('header-connect-button', (
              <WalletButton />
            ))}

            {dyn.v1.addWrapDecoy('header-search-button', (
              <button
                id={dyn.v3.getVariant('header-search-btn', ID_VARIANTS_MAP)}
                type="button"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10",
                  dyn.v3.getVariant('search-button', CLASS_VARIANTS_MAP)
                )}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">{dyn.v3.getVariant('search_button', undefined, 'Search')}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </>
  );
}

function NavLink({ href, labelKey, dyn }: { href: string; labelKey: (typeof NAV_LINKS)[number]['labelKey']; dyn: ReturnType<typeof useDynamicSystem> }) {
  const router = useSeedRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "text-sm font-medium text-zinc-400 hover:text-white transition-colors",
        dyn.v3.getVariant('nav-link', CLASS_VARIANTS_MAP)
      )}
    >
      {dyn.v3.getVariant(labelKey, undefined, labelKey)}
    </a>
  );
}
