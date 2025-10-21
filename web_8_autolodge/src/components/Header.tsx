"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const seed = searchParams.get('seed');
  
  const navItems = [
    { name: "Stays", href: seed ? `/?seed=${seed}` : "/" },
    { name: "Experiences", href: "#" },
  ];
  return (
    <header className="w-full flex flex-col items-center border-b bg-white sticky top-0 z-20">
      <nav className="w-full max-w-7xl flex items-center justify-between py-2 px-3 md:px-0">
        <div className="flex items-center gap-2 min-w-[130px]">
          <Link href={seed ? `/?seed=${seed}` : "/"} className="flex items-center gap-1 select-none">
            <span className="font-logo font-bold text-2xl text-[#18181b] tracking-tight">
              Auto
            </span>
            <span
              className="bg-[#616882] rounded-full text-white text-2xl font-bold py-1 px-3"
              style={{ lineHeight: 1.1, letterSpacing: "-0.5px" }}
            >
              Lodge
            </span>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
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
              </Link>
            );
          })}
        </div>
        {/* Empty flex spacer for right align if needed */}
        <div className="min-w-[130px]" />
      </nav>
    </header>
  );
}
