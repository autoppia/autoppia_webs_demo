"use client";

import { useSearchParams } from "next/navigation";
import { getSeedLayout } from "@/library/layouts";
import Link from "next/link";
import { SeedLink } from "@/components/ui/SeedLink";
import { Suspense } from "react";

function LayoutTestContent() {
  const searchParams = useSearchParams();
  const seedParam = searchParams.get('seed');
  const seed = seedParam ? parseInt(seedParam, 10) : undefined;
  
  const layout = getSeedLayout(seed);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Layout Test Page</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Layout: {layout.name}</h2>
          <p className="text-gray-600 mb-4">{layout.description}</p>
          <p className="text-sm text-gray-500">
            Seed: {seed || 'default'} | Class: {layout.className}
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Test Different Layouts:</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seedNum) => (
              <Link
                key={seedNum}
                href={`/layout-test?seed=${seedNum}`}
                className={`p-3 rounded-lg text-center font-medium transition ${
                  seed === seedNum
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                Seed {seedNum}
              </Link>
            ))}
            <Link
              href="/layout-test"
              className={`p-3 rounded-lg text-center font-medium transition ${
                !seed
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              Default
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Layout Structure:</h3>
          <div className="bg-white p-4 rounded-lg border">
            <pre className="text-sm text-gray-600 overflow-x-auto">
              {JSON.stringify(layout.structure, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Navigation:</h3>
          <div className="flex gap-4">
            <SeedLink
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Home Page
            </SeedLink>
            <SeedLink
              href="/ride/trip"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Trip Page
            </SeedLink>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Note:</h4>
          <p className="text-yellow-700 text-sm">
            This page demonstrates the layout system. The actual site layouts will be applied to the main pages 
            (Home and Trip pages) when you add the seed parameter to their URLs.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LayoutTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">Loading...</div>}>
      <LayoutTestContent />
    </Suspense>
  );
}
