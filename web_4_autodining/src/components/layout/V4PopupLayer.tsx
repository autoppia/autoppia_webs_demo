"use client";

import { usePathname } from "next/navigation";
import { useDynamicPopup, DynamicPopup } from "@/dynamic/v4";

function pathnameToPageKey(pathname: string): string {
  if (!pathname || pathname === "/") return "home";
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ?? "page";
}

export function V4PopupLayer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageKey = pathnameToPageKey(pathname ?? "");
  const popup = useDynamicPopup(pageKey);

  return (
    <>
      {children}
      {popup.shouldShow && popup.variant && (
        <DynamicPopup variant={popup.variant} onClose={popup.dismiss} />
      )}
    </>
  );
}
