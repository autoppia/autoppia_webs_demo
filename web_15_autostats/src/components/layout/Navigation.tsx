'use client';

import React, { useState } from 'react';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { DynamicWrapper } from '@/dynamic/v1/DynamicWrapper';
import { DynamicText } from '@/dynamic/v3/DynamicText';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useSeedRouter();

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <DynamicWrapper>
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-zinc-950 border-b border-zinc-800 shadow-lg">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <NavItem
                label="Dashboard"
                onClick={() => handleNavClick('/')}
              />
              <NavItem
                label="Blocks"
                onClick={() => handleNavClick('/blocks')}
              />
              <NavItem
                label="Subnets"
                onClick={() => handleNavClick('/subnets')}
              />
              <NavItem
                label="Validators"
                onClick={() => handleNavClick('/validators')}
              />
              <NavItem
                label="Transfers"
                onClick={() => handleNavClick('/transfers')}
              />
              <NavItem
                label="Accounts"
                onClick={() => handleNavClick('/accounts')}
              />
              <NavItem
                label="API Docs"
                onClick={() => handleNavClick('/api-docs')}
              />
            </nav>
          </div>
        )}
      </div>
    </DynamicWrapper>
  );
}

function NavItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
    >
      <DynamicText value={label} type="text" />
    </button>
  );
}
