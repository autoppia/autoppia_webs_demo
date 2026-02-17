'use client';

import React from 'react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { DynamicWrapper } from '@/dynamic/v1/DynamicWrapper';
import { DynamicText } from '@/dynamic/v3/DynamicText';

export function Footer() {
  const router = useSeedRouter();

  const handleLinkClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <DynamicWrapper>
      <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">
                <DynamicText value="AutoStats" type="text" />
              </h3>
              <p className="text-sm text-zinc-400">
                <DynamicText
                  value="Blockchain explorer and analytics platform for the Bittensor network"
                  type="text"
                />
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                <DynamicText value="Explorer" type="text" />
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
                <DynamicText value="Resources" type="text" />
              </h4>
              <ul className="space-y-2">
                <FooterLink href="/api-docs" label="API Documentation" onClick={handleLinkClick('/api-docs')} />
                <FooterLink href="/blocks" label="Blocks" onClick={handleLinkClick('/blocks')} />
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                <DynamicText value="Network" type="text" />
              </h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <div>
                  <DynamicText value="Status: Online" type="text" />
                </div>
                <div>
                  <DynamicText value="Block Time: ~12s" type="text" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
            <DynamicText
              value="© 2024 AutoStats. All rights reserved."
              type="text"
            />
          </div>
        </div>
      </footer>
    </DynamicWrapper>
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
        <DynamicText value={label} type="text" />
      </a>
    </li>
  );
}
