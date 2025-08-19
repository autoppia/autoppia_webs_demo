"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSeedLayout } from '@/hooks/use-seed-layout';

function DemoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSeed = parseInt(searchParams.get('seed') || '1', 10);
  const layout = useSeedLayout();

  const handleSeedChange = (seed: number) => {
    router.push(`/demo?seed=${seed}`);
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
        <Card>
          <CardHeader>
            <CardTitle>Search Bar Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Position:</strong> {layout.searchBar.position}</p>
            <p><strong>Container Class:</strong> <code>{layout.searchBar.containerClass}</code></p>
            <p><strong>Input Class:</strong> <code>{layout.searchBar.inputClass}</code></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navbar Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Logo Position:</strong> {layout.navbar.logoPosition}</p>
            <p><strong>Cart Position:</strong> {layout.navbar.cartPosition}</p>
            <p><strong>Menu Position:</strong> {layout.navbar.menuPosition}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Grid Class:</strong> <code>{layout.restaurantCards.gridClass}</code></p>
            <p><strong>Card Class:</strong> <code>{layout.restaurantCards.cardClass}</code></p>
            <p><strong>Title Class:</strong> <code>{layout.restaurantCards.titleClass}</code></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Button Position:</strong> {layout.hero.buttonPosition}</p>
            <p><strong>Container Class:</strong> <code>{layout.hero.containerClass}</code></p>
            <p><strong>Button Class:</strong> <code>{layout.hero.buttonClass}</code></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cart Components</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Icon Class:</strong> <code>{layout.cart.iconClass}</code></p>
            <p><strong>Badge Class:</strong> <code>{layout.cart.badgeClass}</code></p>
            <p><strong>Page Class:</strong> <code>{layout.cart.pageClass}</code></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modal Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Container Class:</strong> <code>{layout.modal.containerClass}</code></p>
            <p><strong>Content Class:</strong> <code>{layout.modal.contentClass}</code></p>
            <p><strong>Header Class:</strong> <code>{layout.modal.headerClass}</code></p>
          </CardContent>
        </Card>
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