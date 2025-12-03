"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SeedLink } from "@/components/ui/SeedLink";
import { Briefcase, Users, Sparkles, Heart, User, ChevronDown } from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  {
    label: "My Profile",
    href: "/profile/alexsmith",
    icon: User,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    label: "Hires",
    href: "/hires",
    icon: Users,
  },
  {
    label: "Experts",
    href: "/experts",
    icon: Sparkles,
  },
  {
    label: "Favorites",
    href: "/favorites",
    icon: Heart,
  },
];

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const user = {
    name: "Alex Smith",
    title: "Project Manager",
    avatar: "https://ext.same-assets.com/1836270417/1435009301.png",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-[#08b4ce]"
          />
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.title}</div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if current pathname matches or starts with the href
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <SeedLink
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </SeedLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

