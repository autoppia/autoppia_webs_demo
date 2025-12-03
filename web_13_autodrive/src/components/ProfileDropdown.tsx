"use client";

import { useState, useEffect, useRef } from "react";
import type React from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";

export default function ProfileDropdown({
  open,
  setOpen,
  router,
  buttonRef,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  router: ReturnType<typeof useSeedRouter>;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
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
  }, [open, buttonRef]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
      <div
        className="absolute min-w-[340px] max-w-[98vw] bg-white rounded-2xl shadow-2xl py-4 px-1 z-50 flex flex-col select-none"
        style={{
          boxShadow: "0 6px 32px rgba(0,0,0,.22)",
          top: position ? `${position.top}px` : 'auto',
          right: position ? `${position.right}px` : 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pb-3 flex items-center border-b">
          <div className="flex-1">
            <div className="text-xl font-bold">Federico Lopez</div>
            <div className="flex items-center text-sm text-gray-600 gap-1 mt-1">
              <span className="text-[#FBBF24] text-[16px] mr-0.5">★</span>4.89 •
              Uber One
            </div>
          </div>
          <span className="rounded-full bg-gray-100 w-[44px] h-[44px] flex items-center justify-center ml-1">
            <svg width="26" height="26" fill="none" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" stroke="#bbb" strokeWidth="2" />
              <ellipse cx="10" cy="8" rx="3.1" ry="3.2" fill="#ececec" />
              <ellipse cx="10" cy="18" rx="5" ry="4" fill="#ececec" />
            </svg>
          </span>
        </div>
        <div className="flex gap-3 px-4 py-4">
          <button
            className="flex flex-col items-center justify-center w-20 cursor-pointer"
            onClick={() => {
              setOpen(false);
              router.push("/help");
            }}
          >
            <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="#444" strokeWidth="2" />
                <path d="M12 8v4l2.3 2.3" stroke="#444" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="text-xs font-medium text-black">Help</span>
          </button>
          <button
            className="flex flex-col items-center justify-center w-20 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="4" fill="#111" />
                <rect width="5" height="8" x="5" y="8" rx="2.5" fill="#fff" />
              </svg>
            </span>
            <span className="text-xs font-medium text-black">Wallet</span>
          </button>
          <button
            className="flex flex-col items-center justify-center w-20 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect
                  width="18"
                  height="18"
                  x="3"
                  y="3"
                  rx="4"
                  fill="#f3f3f3"
                />
                <rect width="10" height="4" x="7" y="8" rx="2" fill="#333" />
              </svg>
            </span>
            <span className="text-xs font-medium text-black">Activity</span>
          </button>
          <button
            className="flex flex-col items-center justify-center w-20 cursor-pointer"
            onClick={() => {
              setOpen(false);
              router.push("/ride/trip/trips");
            }}
          >
            <span className="rounded bg-gray-100 w-[38px] h-[38px] shadow flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M4 8h16v8H4z" fill="#e8f4fb" stroke="#2095d2" strokeWidth="1.4" />
                <path d="M6 10h5M6 12h3M6 14h4" stroke="#2095d2" strokeWidth="1.3" />
                <circle cx="17" cy="12.5" r="1.5" fill="#2095d2" />
              </svg>
            </span>
            <span className="text-xs font-medium text-black">My trips</span>
          </button>
        </div>
        <div className="flex flex-col divide-y">
          <button
            className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
            onClick={() => {
              setOpen(false);
              router.push("/ride/trip/trips");
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
              <rect x="3" y="5" width="14" height="10" rx="3" fill="#e8f4fb" stroke="#2095d2" strokeWidth="1.3" />
              <path d="M6.5 9h4M6.5 11h3" stroke="#2095d2" strokeWidth="1.2" />
              <circle cx="14" cy="10" r="1.3" fill="#2095d2" />
            </svg>{" "}
            My trips
          </button>
          <button
            className="flex items-center px-5 py-3 gap-3 hover:bg-gray-100 text-[16px] font-medium"
            onClick={() => {
              setOpen(false);
              router.push("/ride/trip");
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
              <rect x="4" y="4" width="12" height="12" rx="6" fill="#222" />
              <path
                d="M10 7v3l2 2"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{" "}
            Ride
          </button>
        </div>
        <div className="mt-3 px-5">
          <button className="w-full bg-gray-100 rounded-lg py-3 text-base font-semibold text-red-600 hover:bg-gray-200 mt-2 mb-1">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
