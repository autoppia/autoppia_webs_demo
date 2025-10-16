"use client";
import Link from "next/link";
import { useSeedLayout } from "@/library/utils";
import { Suspense } from "react";

function DemoPageContent() {
  const { seed, layout } = useSeedLayout();

  const seeds = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dynamic Layout Demo
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Current Seed: <span className="font-bold text-blue-600">{seed}</span>
          </p>
          <p className="text-sm text-gray-500">
            Each seed value creates a different DOM structure and layout to confuse scrapers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {seeds.map((seedValue) => (
            <Link
              key={seedValue}
              href={`/?seed=${seedValue}`}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                seedValue === seed
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">Seed {seedValue}</div>
                <div className="text-xs text-gray-500">
                  {seedValue === 1 && "Center Layout"}
                  {seedValue === 2 && "Right Layout"}
                  {seedValue === 3 && "Top Layout"}
                  {seedValue === 4 && "Bottom Layout"}
                  {seedValue === 5 && "Left Layout"}
                  {seedValue === 6 && "Purple Theme"}
                  {seedValue === 7 && "Compact Layout"}
                  {seedValue === 8 && "Green Theme"}
                  {seedValue === 9 && "Orange Theme"}
                  {seedValue === 10 && "Indigo Theme"}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Current Layout Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Search Bar</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                Position: {layout.searchBar.position}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Property Detail</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                Layout: {layout.propertyDetail.layout}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">🎯 Anti-Scraping Features</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dynamic CSS class names based on seed value</li>
                <li>Variable DOM structure with different wrapper elements</li>
                <li>Random spacing and positioning variations</li>
                <li>Different HTML element types (div, section, article, etc.)</li>
                <li>Dynamic data attributes and ARIA labels</li>
                <li>Nested element structures that change per seed</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">🔧 Technical Implementation</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>URL parameter extraction: <code className="bg-gray-100 px-1 rounded">?seed=1-10</code></li>
                <li>Layout configuration system with 10 unique variations</li>
                <li>Dynamic wrapper components with unpredictable DOM structure</li>
                <li>Event tracking preserved across all layout variations</li>
                <li>Responsive design maintained in all configurations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">🚀 Testing</h3>
              <p className="ml-4">
                Click on different seed values above to see how the layout changes. 
                Each seed creates a completely different DOM structure while maintaining 
                the same functionality and user experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-2">Loading...</div>
        <div className="text-gray-600">Preparing dynamic layout demo</div>
      </div>
    </div>}>
      <DemoPageContent />
    </Suspense>
  );
} 