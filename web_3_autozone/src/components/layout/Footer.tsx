"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SeedLink } from "@/components/ui/SeedLink";

const FOOTER_LINK_COLUMNS = [
  {
    title: "Shop",
    links: [
      { text: "All Products", href: "/search", clickable: true },
      { text: "Wishlist", href: "/wishlist", clickable: true },
      { text: "Shopping Cart", href: "/cart", clickable: true },
    ],
  },
  {
    title: "Your Account",
    links: [
      { text: "Orders", href: "/cart", clickable: true },
      { text: "Checkout", href: "/checkout", clickable: true },
      { text: "Saved Items", href: "/wishlist", clickable: true },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { text: "Help Center", href: "/", clickable: false },
      { text: "Shipping Info", href: "/", clickable: false },
      { text: "Returns Policy", href: "/", clickable: false },
    ],
  },
] as const;

export function Footer() {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dynamic ordering for footer link columns
  const changeOrderElements = dyn.v1.changeOrderElements;
  const orderedLinkColumns = useMemo(() => {
    const order = changeOrderElements("footer-link-columns", FOOTER_LINK_COLUMNS.length);
    return order.map((idx) => FOOTER_LINK_COLUMNS[idx]);
  }, [changeOrderElements]);

  // Local text variants
  const dynamicV3TextVariants: Record<string, string[]> = {
    back_to_top: ["Back to top", "Return to top", "Scroll to top"],
    about_autozone: ["About Autozone", "About Us", "Our Story"],
    footer_tagline: [
      "Everything you need, shipped with care",
      "Your trusted marketplace",
      "Quality products, fast delivery"
    ],
    footer_description: [
      "Autozone is your one-stop marketplace for electronics, home upgrades, fitness gear, and daily essentials. Reliable delivery, clear support, and trusted sellers keep every order simple.",
      "Find everything you need from trusted sellers. Fast shipping and reliable service.",
      "Your marketplace for quality products with fast, reliable delivery."
    ],
    browse_deals: ["Browse deals", "Shop now", "View products"],
    talk_to_support: ["Talk to support", "Contact us", "Get help"]
  };

  return (
    dyn.v1.addWrapDecoy("footer-container", (
      <footer 
        id={dyn.v3.getVariant("footer", ID_VARIANTS_MAP, "footer")}
        className={dyn.v3.getVariant("footer", CLASS_VARIANTS_MAP, "mt-20 text-white")}
      >
        {dyn.v1.addWrapDecoy("footer-back-to-top", (
          <button
            onClick={scrollToTop}
            id={dyn.v3.getVariant("back-to-top-btn", ID_VARIANTS_MAP)}
            className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "w-full bg-gradient-to-r from-indigo-700 to-sky-500 py-5 text-xs font-semibold uppercase tracking-[0.4em]")}
          >
            {dyn.v3.getVariant("back_to_top", dynamicV3TextVariants, "Back to top")}
          </button>
        ))}

        {dyn.v1.addWrapDecoy("footer-content", (
          <div className="relative overflow-hidden bg-slate-950">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute -left-10 top-0 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
            </div>

            {dyn.v1.addWrapDecoy("footer-main-content", (
              <div className="omnizon-container relative z-10 space-y-12 py-16">
                {dyn.v1.addWrapDecoy("footer-about-section", (
                  <div className="grid gap-10 lg:grid-cols-[1.8fr,1fr]">
                    <div className="space-y-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
                        {dyn.v3.getVariant("about_autozone", dynamicV3TextVariants, "About Autozone")}
                      </p>
                      <h2 className="text-3xl font-semibold leading-tight">
                        {dyn.v3.getVariant("footer_tagline", dynamicV3TextVariants, "Everything you need, shipped with care")}
                      </h2>
                      <p className="max-w-2xl text-base text-white/70">
                        {dyn.v3.getVariant("footer_description", dynamicV3TextVariants, "Autozone is your one-stop marketplace for electronics, home upgrades, fitness gear, and daily essentials. Reliable delivery, clear support, and trusted sellers keep every order simple.")}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {dyn.v1.addWrapDecoy("footer-browse-deals-btn", (
                          <button
                            type="button"
                            onClick={() => router.push("/search")}
                            id={dyn.v3.getVariant("browse-all-btn", ID_VARIANTS_MAP)}
                            className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg")}
                          >
                            {dyn.v3.getVariant("browse_deals", dynamicV3TextVariants, "Browse deals")}
                          </button>
                        ))}
                        {dyn.v1.addWrapDecoy("footer-support-link", (
                          <a
                            href="mailto:support@autozone.example"
                            id={dyn.v3.getVariant("contact-link", ID_VARIANTS_MAP)}
                            className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white/80 hover:border-white")}
                          >
                            {dyn.v3.getVariant("talk_to_support", dynamicV3TextVariants, "Talk to support")}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {dyn.v1.addWrapDecoy("footer-link-columns", (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {orderedLinkColumns.map((column) => (
                      dyn.v1.addWrapDecoy(`footer-column-${column.title}`, (
                        <div key={column.title} className="space-y-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                            {column.title}
                          </p>
                          <ul className="space-y-2 text-sm text-white/70">
                            {column.links.map((link) => (
                              <li key={link.text}>
                                {link.clickable ? (
                                  dyn.v1.addWrapDecoy(`footer-link-${link.text}`, (
                                    <button
                                      type="button"
                                      onClick={() => router.push(link.href)}
                                      id={dyn.v3.getVariant("footer-links", ID_VARIANTS_MAP, `footer-link-${link.text.toLowerCase().replace(/\s+/g, '-')}`)}
                                      className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "text-left hover:text-white transition-colors")}
                                    >
                                      {link.text}
                                    </button>
                                  ), link.text)
                                ) : (
                                  <span className="text-white/50 cursor-default">
                                    {link.text}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ), column.title)
                    ))}
                  </div>
                ))}

                {dyn.v1.addWrapDecoy("footer-bottom", (
                  <div className="border-t border-white/10 pt-6 text-sm text-white/70">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      {dyn.v1.addWrapDecoy("footer-brand", (
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-white">
                            Autozone
                          </span>
                          <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.4em]">
                            WEB3
                          </span>
                        </div>
                      ))}
                      {dyn.v1.addWrapDecoy("footer-locale", (
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-white/30 px-3 py-1 text-xs text-white/60 cursor-default">
                            English
                          </span>
                          <span className="rounded-full border border-white/30 px-3 py-1 text-xs text-white/60 cursor-default">
                            USD - U.S. Dollar
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs text-white/60 cursor-default">
                            <span className="relative h-3 w-5">
                              <Image
                                src="/images/others/us_flag.png"
                                alt="United States"
                                fill
                                className="object-cover"
                              />
                            </span>
                            United States
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-white/60">
                      © {new Date().getFullYear()} Autozone. Marketplace for trusted sellers,
                      fast delivery, and everyday essentials.
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </footer>
    ))
  );
}
