"use client";

import Image from "next/image";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SeedLink } from "@/components/ui/SeedLink";

export function Footer() {
  const { seed } = useSeed();
  const layoutConfig = getLayoutConfig(seed);
  const layoutClasses = getLayoutClasses(layoutConfig);
  const { getText } = useV3Attributes();
  const router = useSeedRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const linkColumns = [
    {
      title: "Shop",
      links: [
        { text: "All Products", href: "/" },
        { text: "Search", href: "/search" },
        { text: "Shopping Cart", href: "/cart" },
      ],
    },
    {
      title: "Your Account",
      links: [
        { text: "Your Orders", href: "/cart" },
        { text: "Checkout", href: "/checkout" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { text: "Help Center", href: "/" },
        { text: "Shipping Info", href: "/" },
        { text: "Returns", href: "/" },
      ],
    },
  ];

  const quickLinks = [
    { label: "Shop all products", href: "/search" },
    { label: "View cart", href: "/cart" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Checkout", href: "/checkout" },
  ];

  return (
    <footer className={`mt-20 text-white ${layoutClasses.footer}`}>
      <button
        onClick={scrollToTop}
        className="w-full bg-gradient-to-r from-indigo-700 to-sky-500 py-5 text-xs font-semibold uppercase tracking-[0.4em]"
      >
        {getText("back_to_top")}
      </button>

      <div className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-10 top-0 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        </div>

        <div className="omnizon-container relative z-10 space-y-12 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.8fr,1fr]">
            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
                About Autozone
              </p>
              <h2 className="text-3xl font-semibold leading-tight">
                Everything you need, shipped with care
              </h2>
              <p className="max-w-2xl text-base text-white/70">
                Autozone is your one-stop marketplace for electronics, home upgrades,
                fitness gear, and daily essentials. Reliable delivery, clear support,
                and trusted sellers keep every order simple.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/search")}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg"
                >
                  Browse deals
                </button>
                <a
                  href="mailto:support@autozone.example"
                  className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white/80 hover:border-white"
                >
                  Talk to support
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Shop & manage
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => router.push(link.href)}
                      className="text-left text-white/80 hover:text-white"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {infoColumns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                  {column.title}
                </p>
                <ul className="space-y-2 text-sm text-white/50">
                  {column.links.map((label) => (
                    <li key={label}>
                      <span className="cursor-not-allowed text-white/50">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 text-sm text-white/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-white">
                  Autozone
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.4em]">
                  WEB3
                </span>
              </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-white/30 px-3 py-1 text-xs">
                English
              </button>
              <button className="rounded-full border border-white/30 px-3 py-1 text-xs">
                  USD - U.S. Dollar
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs">
                  <span className="relative h-3 w-5">
                    <Image
                      src="/images/others/us_flag.png"
                      alt="United States"
                      fill
                      className="object-cover"
                    />
                  </span>
                  United States
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/60">
              © {new Date().getFullYear()} Autozone. Marketplace for trusted sellers,
              fast delivery, and everyday essentials.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
