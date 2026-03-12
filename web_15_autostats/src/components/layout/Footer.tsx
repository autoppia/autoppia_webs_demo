'use client';

import React from 'react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { useDynamicSystem } from '@/dynamic/shared';

export function Footer() {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();

  const handleLinkClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <>
      {dyn.v1.addWrapDecoy('footer', (
        <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">
                {dyn.v3.getVariant('app_name', undefined, 'AutoStats')}
              </h3>
              <p className="text-sm text-zinc-400">
                {dyn.v3.getVariant('footer_tagline', undefined, 'Blockchain explorer and analytics platform for the Bittensor network')}
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {dyn.v3.getVariant('nav_explorer', undefined, 'Explorer')}
              </h4>
              <ul className="space-y-2">
                <FooterLink href="/subnets" label="Subnets" onClick={handleLinkClick('/subnets')} />
                <FooterLink href="/validators" label="Validators" onClick={handleLinkClick('/validators')} />
                <FooterLink href="/transfers" label="Transfers" onClick={handleLinkClick('/transfers')} />
                <FooterLink href="/accounts" label="Accounts" onClick={handleLinkClick('/accounts')} />
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {dyn.v3.getVariant('nav_resources', undefined, 'Resources')}
              </h4>
              <ul className="space-y-2">
                <FooterLink href="/api-docs" label="API Documentation" onClick={handleLinkClick('/api-docs')} />
                <FooterLink href="/blocks" label="Blocks" onClick={handleLinkClick('/blocks')} />
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                {dyn.v3.getVariant('nav_network', undefined, 'Network')}
              </h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <div>
                  {dyn.v3.getVariant('status_online', undefined, 'Status: Online')}
                </div>
                <div>
                  {dyn.v3.getVariant('block_time', undefined, 'Block Time: ~12s')}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
            {dyn.v3.getVariant('footer_copyright', undefined, '© 2024 AutoStats. All rights reserved.')}
          </div>
        </div>
      </footer>
      ))}
    </>
  );
}

function FooterLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        className="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        {label}
      </a>
    </li>
  );
}
