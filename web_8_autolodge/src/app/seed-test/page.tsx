"use client";

import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useSeedStructureNavigation } from "@/hooks/useSeedStructureNavigation";
import { SeedLink } from "@/components/ui/SeedLink";

export default function SeedTestPage() {
  const { seedStructure, setSeedStructure, currentVariation } = useDynamicStructure();
  const { navigateWithSeedStructure } = useSeedStructureNavigation();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Seed Structure Persistence Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        <p><strong>Current Seed Structure:</strong> {seedStructure}</p>
        <p><strong>Current Variation:</strong> {currentVariation.name}</p>
        <p><strong>Sample Text:</strong> {currentVariation.texts.nav_stays || "Stays"}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Seed Structure</h2>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((value) => (
            <button
              key={value}
              onClick={() => setSeedStructure(value)}
              className={`px-4 py-2 rounded ${
                seedStructure === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
        <p className="mb-4">These links should maintain the seed-structure parameter:</p>
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
            onClick={() => navigateWithSeedStructure("/")}
            className="text-blue-600 hover:underline"
          >
            Navigate to Home (Programmatic)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Change the seed structure using the buttons above</li>
          <li>Navigate to different pages using the links</li>
          <li>Notice that the seed-structure parameter persists in the URL</li>
          <li>Refresh the page - the seed-structure should be maintained</li>
          <li>Open a new tab and navigate to the site - it should remember your last seed-structure</li>
        </ol>
      </div>
    </div>
  );
}
