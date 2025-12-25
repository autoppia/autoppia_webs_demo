"use client";

import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export default function DemoPage() {
  const seeds = Array.from({ length: 10 }, (_, i) => i + 1);
  const dyn = useDynamicSystem();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        {dyn.v3.getVariant("demo_title", TEXT_VARIANTS_MAP, "Dynamic Layout Demo")}
      </h1>
      <p className="text-gray-600 mb-8">
        {dyn.v3.getVariant(
          "demo_intro",
          TEXT_VARIANTS_MAP,
          "This page demonstrates the different layout variations based on seed values. Each seed (1-10) creates a unique layout arrangement to confuse scraper agents."
        )}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seeds.map((seed) => (
          <SeedLink
            key={seed}
            href={`/?seed=${seed}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2">
              {dyn.v3.getVariant("demo_seed_heading", TEXT_VARIANTS_MAP, "Seed")} {seed}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {dyn.v3.getVariant(
                "demo_seed_subtext",
                TEXT_VARIANTS_MAP,
                "Click to view the layout with this seed"
              )}
            </p>
            <div className="text-xs text-gray-500">
              <div>• {dyn.v3.getVariant("demo_feat_positioning", TEXT_VARIANTS_MAP, "Dynamic element positioning")}</div>
              <div>• {dyn.v3.getVariant("demo_feat_nav", TEXT_VARIANTS_MAP, "Shuffled navigation order")}</div>
              <div>• {dyn.v3.getVariant("demo_feat_feed", TEXT_VARIANTS_MAP, "Reordered content feed")}</div>
              <div>• {dyn.v3.getVariant("demo_feat_sidebar", TEXT_VARIANTS_MAP, "Varied sidebar placement")}</div>
            </div>
          </SeedLink>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {dyn.v3.getVariant("demo_how_title", TEXT_VARIANTS_MAP, "How it works:")}
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Seed 1:</strong> Reverse layout with sidebar on right</li>
          <li>• <strong>Seed 2:</strong> Vertical layout with header on left</li>
          <li>• <strong>Seed 3:</strong> Horizontal layout with sidebar on bottom</li>
          <li>• <strong>Seed 4:</strong> Grid layout with floating search</li>
          <li>• <strong>Seed 5:</strong> Sidebar-top layout</li>
          <li>• <strong>Seed 6:</strong> Sidebar-bottom layout</li>
          <li>• <strong>Seed 7:</strong> Center-focus layout</li>
          <li>• <strong>Seed 8:</strong> Split-view layout</li>
          <li>• <strong>Seed 9:</strong> Masonry layout</li>
          <li>• <strong>Seed 10:</strong> Complete reverse layout</li>
        </ul>
      </div>
      
      <div className="mt-8 p-6 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          {dyn.v3.getVariant("demo_features_title", TEXT_VARIANTS_MAP, "Anti-Scraping Features:")}
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• DOM structure changes with each seed</li>
          <li>• XPath selectors become unreliable</li>
          <li>• Element order is randomized</li>
          <li>• Layout positioning varies</li>
          <li>• All event triggers remain functional</li>
        </ul>
      </div>
    </div>
  );
} 
