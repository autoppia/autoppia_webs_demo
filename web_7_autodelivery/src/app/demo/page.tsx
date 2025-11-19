"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLayout } from '@/contexts/LayoutProvider';
import { useSeedRouter } from '@/hooks/useSeedRouter';
import { useSeed } from '@/context/SeedContext';

function DemoPageContent() {
  const router = useSeedRouter();
  const searchParams = useSearchParams();
  const currentSeed = parseInt(searchParams.get('seed') || '1', 10);
  const layout = useLayout();
  const { setSeed } = useSeed();

  const handleSeedChange = (seed: number) => {
    setSeed(seed);
    router.push('/demo');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dynamic Layout Demo</h1>
        <p className="text-zinc-600 mb-6">
          This page demonstrates how the UI layout changes based on the seed parameter in the URL.
          Each seed value (1-10) produces a different layout configuration to confuse scrapers.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seed) => (
            <Button
              key={seed}
              variant={currentSeed === seed ? "default" : "outline"}
              onClick={() => handleSeedChange(seed)}
              className="w-12 h-12 rounded-full"
            >
              {seed}
            </Button>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">
            <strong>Current Seed:</strong> {currentSeed}
          </p>
          <p className="text-green-700 text-sm mt-1">
            URL: <code>/demo?seed={currentSeed}</code>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 font-semibold text-lg">
            Search Bar Layout
          </div>
          <div className="px-5 py-4 text-sm space-y-2">
            <p><strong>Position:</strong> {layout.searchBar.position}</p>
            <p><strong>Container Class:</strong> <code>{layout.searchBar.containerClass}</code></p>
            <p><strong>Input Class:</strong> <code>{layout.searchBar.inputClass}</code></p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 font-semibold text-lg">
            Navbar Layout
          </div>
          <div className="px-5 py-4 text-sm space-y-2">
            <p><strong>Logo Position:</strong> {layout.navigation.logoPosition}</p>
            <p><strong>Cart Position:</strong> {layout.navigation.cartPosition}</p>
            <p><strong>Menu Position:</strong> {layout.navigation.menuPosition}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 font-semibold text-lg">
            Restaurant Cards
          </div>
          <div className="px-5 py-4 text-sm space-y-2">
            <p><strong>Grid Class:</strong> <code>{layout.grid.containerClass}</code></p>
            <p><strong>Card Class:</strong> <code>{layout.restaurantCard.containerClass}</code></p>
            <p><strong>Title Class:</strong> <code>{layout.restaurantCard.titleClass}</code></p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 font-semibold text-lg">
            Hero Section
          </div>
          <div className="px-5 py-4 text-sm space-y-2">
            <p><strong>Button Position:</strong> {layout.hero.buttonPosition}</p>
            <p><strong>Container Class:</strong> <code>{layout.hero.containerClass}</code></p>
            <p><strong>Button Class:</strong> <code>{layout.hero.buttonClass}</code></p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 font-semibold text-lg">
            Cart Components
          </div>
          <div className="px-5 py-4 text-sm space-y-2">
            <p><strong>Icon Class:</strong> <code>{layout.cart.iconClass}</code></p>
            <p><strong>Badge Class:</strong> <code>{layout.cart.badgeClass}</code></p>
            <p><strong>Page Class:</strong> <code>{layout.cart.pageContainerClass}</code></p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 font-semibold text-lg">
            Modal Layout
          </div>
          <div className="px-5 py-4 text-sm space-y-2">
            <p><strong>Container Class:</strong> <code>{layout.modal.containerClass}</code></p>
            <p><strong>Content Class:</strong> <code>{layout.modal.contentClass}</code></p>
            <p><strong>Header Class:</strong> <code>{layout.modal.headerClass}</code></p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="bg-zinc-50 rounded-lg p-6">
          <ul className="list-disc list-inside space-y-2 text-zinc-700">
            <li>The <code>useSeedLayout()</code> hook extracts the seed from URL parameters</li>
            <li>Each seed value (1-10) generates a different layout configuration</li>
            <li>Layout includes positioning, CSS classes, and DOM structure variations</li>
            <li>Components use these configurations to render different layouts</li>
            <li>This makes it difficult for scrapers to build reliable selectors</li>
            <li>Event tracking still works regardless of layout changes</li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Test the Layouts</h2>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/')}>
            Go to Homepage
          </Button>
          <Button onClick={() => router.push('/cart')}>
            Go to Cart
          </Button>
          <Button onClick={() => router.push('/restaurants')}>
            Go to Restaurants
          </Button>
        </div>
        <p className="text-sm text-zinc-600 mt-2">
          Navigate to different pages to see how the layouts change based on the seed parameter.
        </p>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-200 rounded mb-4"></div>
          <div className="h-4 bg-zinc-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <DemoPageContent />
    </Suspense>
  );
} 
