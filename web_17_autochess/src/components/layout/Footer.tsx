"use client";

import React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";

export function Footer() {
  const router = useSeedRouter();

  const handleLinkClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <DynamicWrapper>
      <footer className="border-t border-stone-800/80 bg-[#0c0a09] mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">
                <DynamicText value="AutoChess" type="text" />
              </h3>
              <p className="text-sm text-zinc-400">
                <DynamicText
                  value="Chess tournament platform with player profiles, tactical puzzles, and game analysis tools."
                  type="text"
                />
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                <DynamicText value="Explore" type="text" />
              </h4>
              <ul className="space-y-2">
                <FooterLink href="/tournaments" label="Tournaments" onClick={handleLinkClick("/tournaments")} />
                <FooterLink href="/players" label="Players" onClick={handleLinkClick("/players")} />
                <FooterLink href="/tactics" label="Tactics" onClick={handleLinkClick("/tactics")} />
                <FooterLink href="/analysis" label="Analysis" onClick={handleLinkClick("/analysis")} />
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                <DynamicText value="Resources" type="text" />
              </h4>
              <ul className="space-y-2">
                <FooterLink href="/tournaments" label="Find Tournaments" onClick={handleLinkClick("/tournaments")} />
                <FooterLink href="/players" label="Top Players" onClick={handleLinkClick("/players")} />
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">
                <DynamicText value="Platform" type="text" />
              </h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <div>
                  <DynamicText value="Status: Online" type="text" />
                </div>
                <div>
                  <DynamicText value="200+ Players" type="text" />
                </div>
                <div>
                  <DynamicText value="50+ Tournaments" type="text" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-stone-800/80 text-center text-sm text-zinc-500">
            <DynamicText
              value="2024 AutoChess. All rights reserved."
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
        className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
      >
        <DynamicText value={label} type="text" />
      </a>
    </li>
  );
}
