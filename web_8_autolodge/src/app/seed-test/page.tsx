"use client";

import { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
import { useSeedStructureNavigation } from "@/hooks/useSeedStructureNavigation";
import { SeedLink } from "@/components/ui/SeedLink";

const AVAILABLE_SEEDS = Array.from({ length: 15 }, (_, index) => index + 1);

export default function SeedTestPage() {
  const { seed, setSeed, resolvedSeeds, getNavigationUrl } = useSeed();
  const { v3Seed, isActive, getText } = useV3Attributes();
  const { navigateWithSeedStructure } = useSeedStructureNavigation();

  const seedStructure = resolvedSeeds.v3 ?? resolvedSeeds.base ?? seed;
  const sampleText = getText("nav_stays", "Stays");

  const infoRows = useMemo(
    () => [
      { label: "Current Base Seed", value: seed },
      { label: "Resolved Structure Seed", value: seedStructure },
      { label: "Active V3 Seed", value: v3Seed },
      { label: "Dynamic Mode", value: isActive ? "Enabled" : "Disabled" },
      { label: "Sample Text Variant", value: sampleText },
    ],
    [seed, seedStructure, v3Seed, isActive, sampleText]
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Seed Structure Persistence Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-2">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        {infoRows.map((row) => (
          <p key={row.label}>
            <strong>{row.label}:</strong> {row.value}
          </p>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Seed</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Selecting a different seed updates the context value and persists to the query string.
        </p>
        <div className="flex gap-2 flex-wrap">
          {AVAILABLE_SEEDS.map((value) => (
            <button
              key={value}
              onClick={() => setSeed(value)}
              className={`px-4 py-2 rounded border ${
                seedStructure === value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
              }`}
            >
              Seed {value}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
        <p className="mb-4">SeedLink uses SeedContext helpers to automatically preserve the current seed.</p>
        <div className="flex gap-4 flex-wrap">
          <SeedLink href="/" className="text-blue-600 hover:underline">
            Go to Home
          </SeedLink>
          <SeedLink href="/stay/1" className="text-blue-600 hover:underline">
            Go to Stay Detail
          </SeedLink>
          <SeedLink href="/stay/1/confirm" className="text-blue-600 hover:underline">
            Go to Confirm Page
          </SeedLink>
          <button
            type="button"
            onClick={() => navigateWithSeedStructure("/")}
            className="text-blue-600 hover:underline"
          >
            Navigate to Home (Programmatic)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">What gets persisted?</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700">
          <li>The base seed is stored in SeedContext and localStorage.</li>
          <li>`getNavigationUrl` ensures all Next.js links keep the current seed in the query string.</li>
          <li>Programmatic navigation can reuse <code>navigateWithSeedStructure</code> to append the same data.</li>
          <li>Dynamic copy changes as the V3 seed changes, making each layout harder to fingerprint.</li>
        </ul>
        <p className="mt-4 text-sm text-neutral-500">
          Example URL with preserved seed: <code>{getNavigationUrl("/")}</code>
        </p>
      </div>
    </div>
  );
}
