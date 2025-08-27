"use client";

import { useSeed } from "@/library/useSeed";

export default function TestSeedPage() {
  const { seed, layout } = useSeed();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Seed Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Seed Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Seed Value:</strong> {seed || 'Default (no seed)'}
          </div>
          <div>
            <strong>Main Layout:</strong> {layout.mainLayout}
          </div>
          <div>
            <strong>Header Position:</strong> {layout.headerPosition}
          </div>
          <div>
            <strong>Sidebar Position:</strong> {layout.sidebarPosition}
          </div>
          <div>
            <strong>Search Position:</strong> {layout.searchPosition}
          </div>
          <div>
            <strong>Feed Order:</strong> {layout.feedOrder}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Test Instructions</h3>
        <p className="text-gray-700 mb-4">
          Try adding different seed values to the URL to see the layout change:
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <code>?seed=1</code> - Reverse layout</li>
          <li>• <code>?seed=2</code> - Vertical layout</li>
          <li>• <code>?seed=3</code> - Horizontal layout</li>
          <li>• <code>?seed=4</code> - Grid layout</li>
          <li>• <code>?seed=5</code> - Sidebar-top layout</li>
          <li>• <code>?seed=6</code> - Sidebar-bottom layout</li>
          <li>• <code>?seed=7</code> - Center-focus layout</li>
          <li>• <code>?seed=8</code> - Split-view layout</li>
          <li>• <code>?seed=9</code> - Masonry layout</li>
          <li>• <code>?seed=10</code> - Complete reverse layout</li>
        </ul>
      </div>
    </div>
  );
} 