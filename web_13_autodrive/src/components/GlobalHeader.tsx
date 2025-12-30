"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { SeedLink } from "./ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";

type Props = {
  preserveSeed?: boolean;
};

export default function GlobalHeader({ preserveSeed = true }: Props) {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const dynamicHeaderTextVariants: Record<string, string[]> = useMemo(() => ({
    nav_ride: ["Ride", "Trips", "Go", "Book", "Drive"],
    nav_about: ["About", "About us", "Company", "Why AutoDriver", "Story"],
    nav_help: ["Help", "Support", "Assistance", "Guide", "Help Center"],
    nav_contact: ["Contact", "Contact us", "Reach out", "Talk to us", "Get in touch"],
    nav_trips: ["My trips", "Trips", "History", "Your rides", "Bookings"],
    brand: ["AutoDriver", "RideSmart", "DriveNow", "UrbanDrive", "TripWave"],
    profile_name: ["Emma Reyes", "E. Reyes", "Emma R.", "E. R.", "Driver Emma"],
  }), []);

  const navItems = useMemo(() => ([
    { key: "ride", href: "/ride/trip", textKey: "nav_ride", label: "Ride" },
    { key: "about", href: "/about", textKey: "nav_about", label: "About" },
    { key: "help", href: "/help", textKey: "nav_help", label: "Help" },
    { key: "contact", href: "/contact", textKey: "nav_contact", label: "Contact" },
    { key: "trips", href: "/ride/trip/trips", textKey: "nav_trips", label: "My trips" },
  ]), []);

  const orderedNavItems = useMemo(() => {
    const order = dyn.v1.changeOrderElements("global-nav-items", navItems.length);
    return order.map((idx) => navItems[idx]);
  }, [dyn.seed, navItems]);

  useEffect(() => {
    if (!profileOpen) return;

    const updatePosition = () => {
      if (profileButtonRef.current) {
        const rect = profileButtonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [profileOpen]);

  const LinkItem = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => (
    dyn.v1.addWrapDecoy(
      `nav-link-${label.toLowerCase()}`,
      <SeedLink
        href={href}
        preserveSeed={preserveSeed}
        id={dyn.v3.getVariant(`nav-${label.toLowerCase()}`, ID_VARIANTS_MAP, `nav-${label.toLowerCase()}`)}
        className={`text-sm font-medium text-slate-800 hover:text-[#207fc2] transition ${dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "")}`}
      >
        {dyn.v3.getVariant(label.toLowerCase().replace(" ", "_"), dynamicHeaderTextVariants, label)}
      </SeedLink>
    )
  );

  return (
    dyn.v1.addWrapDecoy(
      "global-header",
      <header
        id={dyn.v3.getVariant("global-header", ID_VARIANTS_MAP, "global-header")}
        className={`bg-white border-b border-[#b7d2ec] shadow-sm w-full sticky top-0 z-30 ${dyn.v3.getVariant("grid-container", CLASS_VARIANTS_MAP, "")}`}
      >
        <div className="w-full mx-auto flex items-center px-4 py-2 gap-4" style={{ maxWidth: "140rem" }}>
          <div className="flex items-center gap-3">
            {dyn.v1.addWrapDecoy(
              "header-logo",
              <button
                id={dyn.v3.getVariant("header-logo", ID_VARIANTS_MAP, "header-logo")}
                className={`flex items-center gap-2 bg-[#1f80c3] text-white font-extrabold text-lg leading-none px-4 py-2 rounded-md shadow hover:bg-[#166699] transition ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
                onClick={() => router.push("/")}
              >
                {dyn.v3.getVariant("brand", dynamicHeaderTextVariants, "AutoDriver")}
              </button>
            )}
          </div>

          <nav className="flex items-center gap-4 justify-center flex-1">
            {orderedNavItems.map((item) => (
              <LinkItem key={item.key} href={item.href} label={item.label} />
            ))}
          </nav>

          <div className="flex justify-end relative">
            {dyn.v1.addWrapDecoy(
              "profile-button",
              <button
                ref={profileButtonRef}
                id={dyn.v3.getVariant("profile-button", ID_VARIANTS_MAP, "profile-button")}
                className={`flex items-center gap-2 bg-[#1f80c3] text-white text-sm font-semibold px-3 py-1.5 rounded-md shadow hover:bg-[#166699] transition relative ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <img
                  src="/images/person1.jpg"
                  alt="Emma Reyes"
                  className="h-8 w-8 rounded-full object-cover border border-white/40"
                />
                <div className="text-left leading-tight">
                  <div>{dyn.v3.getVariant("profile_name", dynamicHeaderTextVariants, "Emma Reyes")}</div>
                  <div className="text-[11px] font-normal text-white/90">
                    {dyn.v3.getVariant("profile_status", dynamicHeaderTextVariants, "★ 4.89 • Uber One")}
                  </div>
                </div>
                <svg
                  width={dyn.v3.getVariant("chevron-width", ID_VARIANTS_MAP, "16")}
                  height="16"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="ml-1"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}

            {/* Dropdown */}
            {profileOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}>
                <div
                  className="absolute min-w-[340px] max-w-[98vw] bg-white rounded-2xl shadow-2xl py-4 px-1 z-50 flex flex-col select-none"
                  style={{
                    boxShadow: "0 6px 32px rgba(0,0,0,.22)",
                    top: position ? `${position.top}px` : "auto",
                    right: position ? `${position.right}px` : "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 pb-3 flex items-center border-b">
                    <img
                      src="/images/person1.jpg"
                      alt="Emma Reyes"
                      className="h-11 w-11 rounded-full object-cover mr-3 border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <div className="text-xl font-bold">{dyn.v3.getVariant("profile_name", dynamicHeaderTextVariants, "Emma Reyes")}</div>
                      <div className="flex items-center text-sm text-gray-600 gap-1 mt-1">
                        <span className="text-[#FBBF24] text-[16px] mr-0.5">★</span>4.89 • Uber One
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 px-4 py-4">
                    <button
                      className="flex flex-col items-center justify-center w-20 cursor-pointer"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/help");
                      }}
                    >
                      <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" stroke="#444" strokeWidth="2" />
                          <path d="M12 8v4l2.3 2.3" stroke="#444" strokeWidth="1.4" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-black">
                        {dyn.v3.getVariant("nav_help", dynamicHeaderTextVariants, "Help")}
                      </span>
                    </button>
                    <button
                      className="flex flex-col items-center justify-center w-20 cursor-pointer"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/contact");
                      }}
                    >
                      <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                          <rect x="3" y="5" width="18" height="14" rx="2" stroke="#444" strokeWidth="1.8" fill="none" />
                          <path d="M3 7l9 5 9-5" stroke="#444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-black">
                        {dyn.v3.getVariant("nav_contact", dynamicHeaderTextVariants, "Contact")}
                      </span>
                    </button>
                    <button
                      className="flex flex-col items-center justify-center w-20 cursor-pointer"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/ride/trip");
                      }}
                    >
                      <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                          <path d="M5 17h14v2H5v-2zm2.5-7L6 7h12l-1.5 3H7.5z" stroke="#444" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="8.5" cy="13" r="1.5" stroke="#444" strokeWidth="1.8" fill="none" />
                          <circle cx="15.5" cy="13" r="1.5" stroke="#444" strokeWidth="1.8" fill="none" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-black">{dyn.v3.getVariant("nav_ride", dynamicHeaderTextVariants, "Ride")}</span>
                    </button>
                  </div>
                  <div className="flex flex-col divide-y">
                    <button
                      className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/ride/trip/trips");
                      }}
                    >
                      <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                        <rect x="3" y="5" width="14" height="10" rx="3" fill="#e8f4fb" stroke="#2095d2" strokeWidth="1.3" />
                        <path d="M6.5 9h4M6.5 11h3" stroke="#2095d2" strokeWidth="1.2" />
                        <circle cx="14" cy="10" r="1.3" fill="#2095d2" />
                      </svg>{" "}
                      {dyn.v3.getVariant("nav_trips", dynamicHeaderTextVariants, "My trips")}
                    </button>
                    <button
                      className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/ride/trip");
                      }}
                    >
                      <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                        <rect x="4" y="4" width="12" height="12" rx="6" fill="#222" />
                        <path d="M10 7v3l2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>{" "}
                      {dyn.v3.getVariant("nav_ride", dynamicHeaderTextVariants, "Ride")}
                    </button>
                  </div>
                  <div className="mt-3 px-5">
                    <button className="w-full bg-gray-100 rounded-lg py-3 text-base font-semibold text-red-600 hover:bg-gray-200 mt-2 mb-1">
                      {dyn.v3.getVariant("logout", dynamicHeaderTextVariants, "Sign Out")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    )
  );
}
