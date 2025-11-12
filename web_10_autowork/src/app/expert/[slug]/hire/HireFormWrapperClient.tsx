"use client";

import { useEffect, useState } from "react";
import HireFormClient from "./HireFormClient";

interface Expert {
  slug: string;
  name: string;
  country: string;
  role: string;
  avatar: string;
}

export default function HireFormWrapperClient({ slug }: { slug: string }) {
  const [expert, setExpert] = useState<Expert | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("autowork_experts");
      if (raw) {
        const arr = JSON.parse(raw) as Expert[];
        const found = Array.isArray(arr) ? arr.find((e) => e.slug === slug) : null;
        if (found) setExpert(found);
      }
    } catch {}
  }, [slug]);

  if (!expert) {
    return (
      <main className="max-w-6xl mx-auto px-5 py-5">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 flex items-center justify-center text-gray-500">
          Loading expert...
        </div>
      </main>
    );
  }

  return <HireFormClient expert={expert} />;
}
