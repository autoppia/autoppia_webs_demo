"use client";

import React, { useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "@/components/ui/button";

export function SeedTestPanel() {
  const { currentVariant, seed, setSeed } = useLayout();
  const [testValue, setTestValue] = useState(seed);

  const handleDirectSet = () => {
    console.log('SeedTestPanel: Direct set to:', testValue);
    setSeed(testValue);
  };

  const handleForceUpdate = () => {
    console.log('SeedTestPanel: Force update to:', testValue);
    // Force URL update
    const url = new URL(window.location.href);
    url.searchParams.set('seed', testValue.toString());
    window.location.href = url.toString();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-sm font-semibold mb-3">Seed Test Panel</h3>
      
      <div className="space-y-2 mb-3">
        <div className="text-xs">
          <strong>Current Seed:</strong> {seed} {seed === 1 && '(default)'}
        </div>
        <div className="text-xs">
          <strong>Current Variant:</strong> {currentVariant.name}
        </div>
        <div className="text-xs">
          <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
        </div>
        <div className="text-xs">
          <strong>URL Status:</strong> {typeof window !== 'undefined' && window.location.search.includes('seed=') ? 'Has seed parameter' : 'Clean URL (default)'}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="10"
            value={testValue}
            onChange={(e) => setTestValue(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 text-xs border rounded"
          />
          <Button size="sm" onClick={handleDirectSet} className="text-xs">
            Set Seed
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={handleForceUpdate} className="text-xs w-full">
          Force URL Update
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('seed', '3');
            window.history.pushState({}, '', url.toString());
            console.log('Manual URL update to:', url.toString());
          }} 
          className="text-xs w-full"
        >
          Manual URL Test
        </Button>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium">Quick Test:</div>
        <div className="flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
            <button
              key={s}
              onClick={() => {
                console.log('SeedTestPanel: Quick test button clicked for seed:', s);
                setSeed(s);
              }}
              className={`px-2 py-1 text-xs rounded border ${
                seed === s 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 