"use client";

import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SeedLink } from "./ui/SeedLink";

type Props = {
  preserveSeed?: boolean;
};

export default function GlobalHeader({ preserveSeed = true }: Props) {
  const router = useSeedRouter();

  const LinkItem = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => (
    <SeedLink
      href={href}
      className="text-sm font-medium text-slate-800 hover:text-[#207fc2] transition"
      preserveSeed={preserveSeed}
    >
      {label}
    </SeedLink>
  );

  return (
    <header className="bg-white border-b border-[#b7d2ec] shadow-sm w-full sticky top-0 z-30">
      <div className="w-full mx-auto flex items-center px-4 py-2 gap-4" style={{ maxWidth: "140rem" }}>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 bg-[#1f80c3] text-white font-extrabold text-lg leading-none px-4 py-2 rounded-md shadow hover:bg-[#166699] transition"
            onClick={() => router.push("/")}
          >
            AutoDriver
          </button>
        </div>

        <nav className="flex items-center gap-4 justify-center flex-1">
          <LinkItem href="/ride/trip" label="Ride" />
          <LinkItem href="/about" label="About" />
          <LinkItem href="/help" label="Help" />
          <LinkItem href="/contact" label="Contact" />
          <LinkItem href="/ride/trip/trips" label="My trips" />
        </nav>

        <div className="flex justify-end">
          <button
            className="flex items-center gap-2 bg-[#1f80c3] text-white text-sm font-semibold px-3 py-1.5 rounded-md shadow hover:bg-[#166699] transition"
            onClick={() => router.push("/ride/trip/trips")}
          >
            <img
              src="/images/person1.jpg"
              alt="Emma Reyes"
              className="h-8 w-8 rounded-full object-cover border border-white/40"
            />
            <div className="text-left leading-tight">
              <div>Emma Reyes</div>
              <div className="text-[11px] font-normal text-white/90">★ 4.89 • Uber One</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
