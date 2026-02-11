"use client";

import { useEffect, useState } from "react";
import HireFormClient from "./HireFormClient";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useDynamicSystem } from "@/dynamic/shared";

interface Expert {
  slug: string;
  name: string;
  country: string;
  role: string;
  avatar: string;
}

export default function HireFormWrapperClient({ slug }: { slug: string }) {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dyn = useDynamicSystem();

  // Function to find expert by slug or name
  const findExpert = (searchSlug: string): Expert | null => {
    // First try to find by slug using dynamicDataProvider
    let found = dynamicDataProvider.getExpertBySlug(searchSlug);
    
    if (found) {
      return found as Expert;
    }
    
    // If not found, try to find by matching name
    const allExperts = dynamicDataProvider.getExperts();
    const normalizedSearch = searchSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    found = allExperts.find((e) => {
      const expertSlug = (e.slug || "").toLowerCase();
      const expertName = (e.name || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return expertSlug === normalizedSearch || expertName === normalizedSearch;
    });
    
    if (found) {
      return found as Expert;
    }
    
    // Fallback: try localStorage
    try {
      const raw = window.localStorage.getItem("autowork_experts");
      if (raw) {
        const arr = JSON.parse(raw) as Expert[];
        const localStorageFound = Array.isArray(arr)
          ? arr.find((e) => {
              const eSlug = (e.slug || "").toLowerCase();
              const eName = (e.name || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return eSlug === normalizedSearch || eName === normalizedSearch;
            })
          : null;
        if (localStorageFound) {
          return localStorageFound;
        }
      }
    } catch {}
    
    return null;
  };

  useEffect(() => {
    let mounted = true;
    
    const loadExpert = async () => {
      setIsLoading(true);
      
      // Wait for data to be ready
      await dyn.v2.whenReady();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!mounted) return;
      
      const found = findExpert(slug);
      
      if (found && mounted) {
        setExpert(found);
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    };
    
    loadExpert();
    
    // Subscribe to experts updates
    const unsubscribe = dynamicDataProvider.subscribeExperts(() => {
      if (mounted) {
        const found = findExpert(slug);
        if (found) {
          setExpert(found);
        }
      }
    });
    
    // Listen for seed changes
    const handleSeedChange = () => {
      if (mounted) {
        loadExpert();
      }
    };
    
    if (typeof window !== "undefined") {
      window.addEventListener("autowork:v2SeedChange", handleSeedChange);
    }
    
    return () => {
      mounted = false;
      unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("autowork:v2SeedChange", handleSeedChange);
      }
    };
  }, [slug, dyn.v2]);

  if (isLoading || !expert) {
    return (
      <main className="max-w-6xl mx-auto px-5 py-5">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 flex items-center justify-center text-gray-500">
          {isLoading ? "Loading expert..." : "Expert not found"}
        </div>
      </main>
    );
  }

  return <HireFormClient expert={expert} />;
}
