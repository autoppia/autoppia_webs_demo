"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useV3Attributes } from "@/dynamic/v3-dynamic";


export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { getText } = useV3Attributes();

  if (!isVisible) return null;

  return (
    <div className="bg-amazon-blue text-white py-3 px-4 relative">
      <div className="text-center text-sm max-w-3xl mx-auto">
        <p>
          {getText("notification_text_1")}
        </p>
        <p className="mt-1">
          {getText("notification_text_2")}
        </p>
      </div>
      <button
         onClick={() => {
          setIsVisible(false);
        }}
        className="absolute top-3 right-4 text-white hover:text-gray-200"
        aria-label={getText("close_notification")}
      >
        <X size={20} />
      </button>
    </div>
  );
}
