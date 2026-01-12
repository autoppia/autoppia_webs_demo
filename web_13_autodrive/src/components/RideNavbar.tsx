"use client";

import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useState } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface RideNavbarProps {
  activeTab: "ride" | "mytrips";
}

export default function RideNavbar({ activeTab }: RideNavbarProps) {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-white shadow-md w-full">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4">
        <div
          className="font-bold text-xl tracking-tight text-[#2095d2] cursor-pointer"
          onClick={() => router.push("/")}
        >
          AutoDriver
        </div>
        <ul className="hidden md:flex space-x-6">
          <li>
            <button
              className={dyn.v3.getVariant("navbar-ride-button-class", CLASS_VARIANTS_MAP, "transition font-bold border-b-2 " +
                (activeTab === "ride"
                  ? "border-[#2095d2] text-[#2095d2]"
                  : "border-transparent text-black hover:text-[#2095d2]"))}
              onClick={() => router.push("/ride/trip")}
            >
              {dyn.v3.getVariant("navbar-ride-button-text", TEXT_VARIANTS_MAP, "Ride")}
            </button>
          </li>
          <li>
            <button
              className={dyn.v3.getVariant("navbar-about-button-class", CLASS_VARIANTS_MAP, "transition font-bold border-b-2 border-transparent text-black hover:text-[#2095d2]")}
              onClick={() => router.push("/about")}
            >
              {dyn.v3.getVariant("navbar-about-button-text", TEXT_VARIANTS_MAP, "About")}
            </button>
          </li>
          <li>
            <button
              className={dyn.v3.getVariant("navbar-help-button-class", CLASS_VARIANTS_MAP, "transition font-bold border-b-2 border-transparent text-black hover:text-[#2095d2]")}
              onClick={() => router.push("/help")}
            >
              {dyn.v3.getVariant("navbar-help-button-text", TEXT_VARIANTS_MAP, "Help")}
            </button>
          </li>
        </ul>
        <div className="flex items-center space-x-4">
          <button
            className={`relative flex items-center text-base pb-1 cursor-pointer font-normal ${
              activeTab === "mytrips"
                ? "text-[#2095d2] font-bold border-b-2 border-[#2095d2]"
                : "text-gray-500 font-normal border-b-2 border-transparent hover:text-[#2095d2]"
            }`}
            onClick={() => router.push("/ride/trip/trips")}
            style={activeTab === "mytrips" ? {} : { fontWeight: 400 }}
          >
            <span className="flex items-center gap-1">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 20 20"
                className="mr-0.5"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#2095d2"
                  strokeWidth="1.5"
                  fill="#e6f6fc"
                />
                <path
                  d="M10 11c-2.5 0-4 1.2-4 2.5V15h8v-1.5C14 12.2 12.5 11 10 11Z"
                  stroke="#2095d2"
                  strokeWidth="1.2"
                  fill="#fff"
                />
                <circle
                  cx="10"
                  cy="8"
                  r="2.5"
                  stroke="#2095d2"
                  strokeWidth="1.2"
                  fill="#fff"
                />
              </svg>
              My trips
            </span>
          </button>
          {/* Profile avatar icon */}
          <div className="relative group">
            <button
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-[#2095d2] focus:outline-none hover:shadow-md transition"
              tabIndex={0}
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Open profile menu"
            >
              <svg width="26" height="26" fill="none" viewBox="0 0 26 26">
                <circle
                  cx="13"
                  cy="13"
                  r="12"
                  stroke="#2095d2"
                  strokeWidth="2"
                  fill="#fff"
                />
                <path
                  d="M13 15c-3.5 0-6 1.7-6 3.5V21h12v-2.5C19 16.7 16.5 15 13 15Z"
                  fill="#e6f6fc"
                  stroke="#2095d2"
                  strokeWidth="1.2"
                />
                <circle
                  cx="13"
                  cy="10"
                  r="3.2"
                  fill="#e6f6fc"
                  stroke="#2095d2"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
            {/* Dropdown menu */}
            <div
              className={`absolute right-0 top-12 min-w-[240px] bg-white shadow-2xl rounded-lg py-3 z-40 border border-gray-100 transition-all duration-200 ${
                profileOpen ? "block" : "hidden"
              }`}
              style={{ boxShadow: "0 6px 32px rgba(0,0,0,.12)" }}
            >
              <button
                onClick={() => router.push("#")}
                className="flex items-center gap-3 px-5 py-2.5 w-full hover:bg-[#e6f6fc] text-base text-black"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
                  <rect
                    width="20"
                    height="14"
                    x="2"
                    y="5"
                    rx="4"
                    fill="#2095d2"
                  />
                  <rect width="5" height="8" x="5" y="8" rx="2.5" fill="#fff" />
                </svg>
                Wallet
              </button>
              <button
                onClick={() => router.push("#")}
                className="flex items-center gap-3 px-5 py-2.5 w-full hover:bg-[#e6f6fc] text-base text-black"
              >
                <svg width="21" height="21" fill="none" viewBox="0 0 20 20">
                  <path d="M2 14L9 7l6 6-7 7z" fill="#2095d2" />
                </svg>
                Promotions
              </button>
              <button
                onClick={() => router.push("/help")}
                className="flex items-center gap-3 px-5 py-2.5 w-full hover:bg-[#e6f6fc] text-base text-black"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <circle
                    cx="11"
                    cy="11"
                    r="10"
                    stroke="#2095d2"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M11 8v3l2.3 2.3"
                    stroke="#2095d2"
                    strokeWidth="1.5"
                  />
                </svg>
                Support
              </button>
              <button
                onClick={() => router.push("#")}
                className="flex items-center gap-3 px-5 py-2.5 w-full hover:bg-[#e6f6fc] text-base text-black"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="#2095d2"
                    strokeWidth="1.7"
                  />
                  <ellipse cx="11" cy="9" rx="3" ry="3" fill="#2095d2" />
                  <rect
                    x="8"
                    y="13"
                    width="6"
                    height="2"
                    rx="1"
                    fill="#2095d2"
                  />
                </svg>
                Manage Account
              </button>
              <button
                onClick={() => router.push("#")}
                className="flex items-center gap-3 px-5 py-2.5 w-full hover:bg-[#e6f6fc] text-base text-black"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <circle
                    cx="11"
                    cy="11"
                    r="10"
                    stroke="#2095d2"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M14 14l-6 0M9 8v4"
                    stroke="#2095d2"
                    strokeWidth="1.5"
                  />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu: show only profile icon and hamburger (optional) */}
        <div className="md:hidden flex items-center">
          <button
            className="w-8 h-8 rounded-full bg-[#e6f6fc] flex items-center justify-center border border-[#2095d2] focus:outline-none"
            tabIndex={0}
            onClick={() => setProfileOpen((v) => !v)}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="9" stroke="#2095d2" strokeWidth="2" />
              <ellipse cx="11" cy="10" rx="4" ry="4" fill="#e6f6fc" />
              <ellipse cx="11" cy="17" rx="7" ry="5" fill="#e6f6fc" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
