"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Home, Network, Shield, Blocks, ArrowLeftRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/subnets", label: "Subnets", icon: Network },
  { href: "/validators", label: "Validators", icon: Shield },
  { href: "/blocks", label: "Blocks", icon: Blocks },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useSeedRouter();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active
                  ? "text-cyan-400"
                  : "text-zinc-500"
              }`}
              style={active ? { filter: "drop-shadow(0 0 6px rgba(34,211,238,0.4))" } : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
