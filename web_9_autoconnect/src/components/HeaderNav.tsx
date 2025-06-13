"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import UserSearchBar from "./UserSearchBar";
import { logEvent, EVENT_TYPES } from "@/library/events";

export default function HeaderNav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-2 text-sm font-medium rounded ${
      pathname === href
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "hover:bg-blue-50"
    }`;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-white px-4 shadow-sm">
      <div className="flex items-center gap-4 w-full max-w-6xl mx-auto">
        <div className="text-white bg-blue-600 px-2 py-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">
              AutoConnect
            </span>
          </Link>
        </div>
        <UserSearchBar />
        <nav className="flex gap-2 ml-4">
          <Link
            href="/"
            className={linkClass("/")}
            onClick={() =>
              logEvent(EVENT_TYPES.HOME_NAVBAR, {
                label: "Home",
              })
            }
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className={linkClass("/jobs")}
            onClick={() =>
              logEvent(EVENT_TYPES.JOBS_NAVBAR, {
                label: "Jobs",
              })
            }
          >
            Jobs
          </Link>
          <Link
            href="/profile/alexsmith"
            className={linkClass("/profile/alexsmith")}
            onClick={() =>
              logEvent(EVENT_TYPES.PROFILE_NAVBAR, {
                label: "Profile",
                username: "alexsmith",
              })
            }
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
