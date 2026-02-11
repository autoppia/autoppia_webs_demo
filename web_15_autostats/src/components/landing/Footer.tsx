'use client';

import React from 'react';
import { DynamicText } from '@/dynamic/v3/DynamicText';
import { useSeedRouter } from '@/hooks/useSeedRouter';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  linkGroups?: FooterLinkGroup[];
}

const defaultLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Blockchain',
    links: [
      { label: 'Blocks', href: '/blocks' },
      { label: 'Transactions', href: '/transfers' },
      { label: 'Accounts', href: '/accounts' },
      { label: 'Validators', href: '/validators' },
    ],
  },
  {
    title: 'Network Info',
    links: [
      { label: 'Subnets', href: '/subnets' },
      { label: 'Statistics', href: '/' },
      { label: 'Charts', href: '/' },
      { label: 'API', href: '/api-docs' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '/api-docs' },
      { label: 'API Docs', href: '/api-docs' },
      { label: 'GitHub', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'About', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

export function Footer({ linkGroups = defaultLinkGroups }: FooterProps) {
  const router = useSeedRouter();

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    // Only navigate if not a placeholder link
    if (href !== '#') {
      router.push(href);
    }
  };

  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {linkGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-white font-semibold mb-4">
                <DynamicText value={group.title} type="text" />
              </h3>
              <ul className="space-y-2">
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                      <DynamicText value={link.label} type="text" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-zinc-400 text-sm">
              <DynamicText value="© 2024 AutoStats. All rights reserved." type="text" />
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-zinc-400 hover:text-white transition-colors text-sm"
              >
                <DynamicText value="Privacy Policy" type="text" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-zinc-400 hover:text-white transition-colors text-sm"
              >
                <DynamicText value="Terms of Service" type="text" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
