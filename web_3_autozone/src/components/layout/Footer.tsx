"use client";

import Image from "next/image";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/dynamic/v2-data";
import { getLayoutClasses } from "@/dynamic/v1-layouts";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeedRouter } from "@/hooks/useSeedRouter";

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
      title: getText("get_to_know_us"),
      links: [
        { label: "Careers", query: "careers" },
        { label: "Blog", query: "blog" },
        { label: "About Autozone", query: "about" },
        { label: "Investor Relations", query: "investor relations" },
        { label: "Autozone Devices", query: "devices" },
        { label: "Autozone Science", query: "science" },
      ],
    },
    {
      title: getText("make_money_with_us"),
      links: [
        { label: "Sell products on Autozone", query: "sell products" },
        { label: "Sell on Autozone Business", query: "business marketplace" },
        { label: "Sell apps on Autozone", query: "sell apps" },
        { label: "Become an Affiliate", query: "affiliate" },
        { label: "Advertise Your Products", query: "advertising" },
        { label: "Self-Publish with Us", query: "self publish" },
      ],
    },
    {
      title: getText("payment_products"),
      links: [
        { label: "Autozone Business Card", query: "business card" },
        { label: "Shop with Points", query: "points" },
        { label: "Reload Your Balance", query: "balance" },
        { label: "Autozone Currency Converter", query: "currency" },
      ],
    },
    {
      title: getText("let_us_help_you"),
      links: [
        { label: "Autozone and COVID-19", query: "policy" },
        { label: "Your Account", query: "account" },
        { label: "Your Orders", query: "orders" },
        { label: "Shipping Rates & Policies", query: "shipping" },
        { label: "Returns & Replacements", query: "returns" },
        { label: "Help", query: "customer service" },
      ],
    },
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
                  onClick={() => router.push("/search?q=deals")}
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg"
                >
                  Browse deals
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/search?q=customer%20service")}
                  className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white/80 hover:border-white"
                >
                  Talk to support
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">
                  On-time delivery
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">99.2%</p>
                <p className="text-sm text-white/70">
                  Average across the last 30 days with real-time tracking.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">
                  Verified items
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  240k+
                </p>
                <p className="text-sm text-white/70">
                  Products rated 4 stars and above by Autozone shoppers.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {linkColumns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                  {column.title}
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/search?q=${encodeURIComponent(item.query || item.label)}`
                          )
                        }
                        className="text-left text-white/70 hover:text-white"
                      >
                        {item.label}
                      </button>
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
