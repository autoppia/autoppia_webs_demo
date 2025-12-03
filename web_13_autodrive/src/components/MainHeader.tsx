"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { useState, useRef } from "react";
import type React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { useSeedLayout } from "@/dynamic/v3-dynamic";
import ProfileDropdown from "./ProfileDropdown";

export default function MainHeader() {
  const router = useSeedRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { getText } = useSeedLayout();

  return (
    <header className="bg-white shadow-md w-full sticky top-0 z-20">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4">
        <div
          className="font-bold text-xl tracking-tight text-[#2095d2] cursor-pointer hover:opacity-80 transition"
          onClick={() => router.push("/")}
        >
          AutoDriver
        </div>
        <ul className="hidden md:flex space-x-6">
          <li>
            <button
              className="hover:text-[#2095d2] transition"
              onClick={() => router.push("/ride/trip")}
            >
              {getText('nav-ride', 'Ride')}
            </button>
          </li>
          <li>
            <SeedLink href="/about" className="hover:text-[#2095d2] transition">
              About
            </SeedLink>
          </li>
          <li>
            <SeedLink
              href="/help"
              className="hover:text-[#2095d2] transition"
            >
              {getText('nav-help', 'Help')}
            </SeedLink>
          </li>
          <li>
            <SeedLink
              href="/contact"
              className="hover:text-[#2095d2] transition"
            >
              Contact
            </SeedLink>
          </li>
          <li>
            <button
              className="hover:text-[#2095d2] transition"
              onClick={() => router.push("/ride/trip/trips")}
            >
              My trips
            </button>
          </li>
        </ul>
        <div className="flex items-center space-x-2">
          <button
            ref={profileButtonRef}
            className="bg-[#2095d2] text-white text-sm px-4 py-1 rounded-md font-semibold shadow hover:bg-[#1273a0] transition relative"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            Federico
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 18 18"
              className="inline-block ml-2"
            >
              <path d="M6 8l3 3 3-3" stroke="#fff" strokeWidth="2.1" />
            </svg>
          </button>
          <ProfileDropdown
            open={profileOpen}
            setOpen={setProfileOpen}
            router={router}
            buttonRef={profileButtonRef}
          />
        </div>
      </nav>
    </header>
  );
}
