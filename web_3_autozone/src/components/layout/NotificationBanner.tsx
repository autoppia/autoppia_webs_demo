"use client";

import { X } from "lucide-react";
import { useState } from "react";


export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amazon-blue text-white py-3 px-4 relative">
      <div className="text-center text-sm max-w-3xl mx-auto">
        <p>
          This website is a non-commercial clone created solely for educational
          and testing purposes and is not affiliated with, endorsed by, or
          associated with any companies it may resemble.
        </p>
        <p className="mt-1">
          All trademarks, logos, and content are the property of their
          respective owners and are used here for academic purposes only, with no
          intent to infringe on intellectual property rights.
        </p>
      </div>
      <button
         onClick={() => {
          setIsVisible(false);
        }}
        className="absolute top-3 right-4 text-white hover:text-gray-200"
        aria-label="Close notification"
      >
        <X size={20} />
      </button>
    </div>
  );
}
