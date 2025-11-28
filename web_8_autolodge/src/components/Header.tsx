"use client";
import { usePathname } from "next/navigation";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { SeedLink } from "./ui/SeedLink";

export default function Header() {
  const pathname = usePathname();
  const { getText, getId } = useV3Attributes();
  const navItems = [
    { name: getText("nav_stays", "Stays"), href: "/", id: getId("nav_stays_link") },
  ];
  return (
    <header className="w-full flex flex-col items-center border-b bg-white sticky top-0 z-20">
      <nav className="w-full max-w-7xl flex items-center justify-between py-2 px-3 md:px-0">
        <div className="flex items-center gap-2 min-w-[130px]">
          <SeedLink id={getId("logo_link")} href="/" className="flex items-center gap-1 select-none">
            <span className="font-logo font-bold text-2xl text-[#18181b] tracking-tight">
              Auto
            </span>
            <span
              className="bg-[#616882] rounded-full text-white text-2xl font-bold py-1 px-3"
              style={{ lineHeight: 1.1, letterSpacing: "-0.5px" }}
            >
              Lodge
            </span>
          </SeedLink>
        </div>
        <div className="flex-1 flex justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
            return (
              <SeedLink
                key={item.name}
                href={item.href}
                id={item.id}
                className={`mx-2 px-3 py-2 font-medium text-lg ${
                  isActive ? "text-neutral-800" : "text-neutral-500"
                }`}
                style={
                  isActive
                    ? { borderBottom: "2px solid #222", fontWeight: 600 }
                    : {}
                }
              >
                {item.name}
              </SeedLink>
            );
          })}
        </div>
        {/* Empty flex spacer for right align if needed */}
        <div className="min-w-[130px]" />
      </nav>
    </header>
  );
}
