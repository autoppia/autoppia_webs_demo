"use client";

import { useDynamicSystem } from "@/dynamic/shared";
import NavLinks from "./NavLinks";

export default function Sidebar() {
  const dyn = useDynamicSystem();

  return dyn.v1.addWrapDecoy("aside", (
    <aside className="hidden md:flex flex-col bg-white text-[#253037] py-6 px-6 gap-8 shadow-lg h-screen sticky top-0 overflow-y-auto w-72">
      {/* Logo - Centered */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-[#17A2B8] to-[#08b4ce] px-8 py-4 rounded-lg shadow-md">
          <span className="font-bold text-2xl tracking-wide text-white">
            AutoWork
          </span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 flex-1">
        <NavLinks />
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="text-xs font-semibold text-gray-700 mb-1">
            Need Help?
          </div>
          <div className="text-xs text-gray-600">
            Contact support
          </div>
        </div>
      </div>
    </aside>
  ), "aside-wrap");
}
