"use client";
import { useState, useEffect } from "react";
import { useSeedLayout } from "@/library/useSeedLayout";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";

export default function LayoutDemoPage() {
  const [currentSeed, setCurrentSeed] = useState(1);
  const { getLayoutInfo, getElementXPath } = useSeedLayout();

  useEffect(() => {
    // Get seed from URL
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    if (seedParam) {
      setCurrentSeed(parseInt(seedParam));
    }
  }, []);

  const layoutInfo = getLayoutInfo();

  const demoMatters = [
    { id: "MAT-001", name: "Contract Review", client: "Tech Corp", status: "Active" },
    { id: "MAT-002", name: "Patent Filing", client: "Innovate Inc", status: "On Hold" },
    { id: "MAT-003", name: "Merger Agreement", client: "Global Ltd", status: "Active" },
    { id: "MAT-004", name: "Trademark Dispute", client: "Brand Co", status: "Archived" },
  ];

  const changeSeed = (newSeed: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', newSeed.toString());
    window.history.pushState({}, '', url.toString());
    setCurrentSeed(newSeed);
    window.location.reload(); // Reload to apply new layout
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <DynamicElement elementType="header" index={0} className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Layout Demo - Seed {currentSeed}</h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates how the layout changes based on the seed parameter.
          Each seed value (1-10) produces a completely different layout structure and X-path selectors.
        </p>
        
        {/* Seed Selector */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seed) => (
            <button
              key={seed}
              onClick={() => changeSeed(seed)}
              className={`px-4 py-2 rounded-lg border ${
                currentSeed === seed 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Seed {seed}
            </button>
          ))}
        </div>

        {/* Layout Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Current Layout Configuration:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Layout Type:</strong> {layoutInfo.layoutType}
            </div>
            <div>
              <strong>Button Layout:</strong> {layoutInfo.buttonLayout}
            </div>
            <div>
              <strong>Label Style:</strong> {layoutInfo.labelStyle}
            </div>
            <div>
              <strong>Spacing:</strong> {layoutInfo.spacing}
            </div>
          </div>
        </div>
      </DynamicElement>

      {/* Demo Content */}
      <DynamicContainer index={0} className="space-y-6">
        {/* Action Buttons */}
        <DynamicElement elementType="section" index={0} className="space-y-4">
          <h2 className="text-2xl font-semibold">Action Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <DynamicButton
              eventType="ADD_NEW_MATTER"
              index={0}
              onClick={() => console.log('Add Matter clicked')}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Add New Matter
            </DynamicButton>
            <DynamicButton
              eventType="VIEW_MATTER_DETAILS"
              index={1}
              onClick={() => console.log('View Details clicked')}
              variant="outline"
            >
              View Details
            </DynamicButton>
            <DynamicButton
              eventType="DELETE_MATTER"
              index={2}
              onClick={() => console.log('Delete clicked')}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete Matter
            </DynamicButton>
          </div>
        </DynamicElement>

        {/* Matters List */}
        <DynamicElement elementType="section" index={1} className="space-y-4">
          <h2 className="text-2xl font-semibold">Matters List</h2>
          <div className="space-y-4">
            {demoMatters.map((matter, index) => (
              <DynamicItem key={matter.id} index={index} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{matter.name}</h3>
                    <p className="text-gray-600">{matter.client}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      matter.status === 'Active' ? 'bg-green-100 text-green-800' :
                      matter.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {matter.status}
                    </span>
                    <DynamicButton
                      eventType="VIEW_MATTER_DETAILS"
                      index={index + 10}
                      onClick={() => console.log(`View ${matter.name}`)}
                      variant="ghost"
                      className="text-blue-600"
                    >
                      View
                    </DynamicButton>
                  </div>
                </div>
              </DynamicItem>
            ))}
          </div>
        </DynamicElement>

        {/* X-Path Examples */}
        <DynamicElement elementType="section" index={2} className="space-y-4">
          <h2 className="text-2xl font-semibold">X-Path Selectors</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-2">
            <div><strong>Button X-Path:</strong> {getElementXPath('button')}</div>
            <div><strong>Container X-Path:</strong> {getElementXPath('div')}</div>
            <div><strong>Link X-Path:</strong> {getElementXPath('a')}</div>
            <div><strong>Section X-Path:</strong> {getElementXPath('section')}</div>
          </div>
        </DynamicElement>

        {/* CSS Variables */}
        <DynamicElement elementType="section" index={3} className="space-y-4">
          <h2 className="text-2xl font-semibold">CSS Variables</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(layoutInfo.cssVariables).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded">
                <div className="font-mono text-sm text-gray-600">{key}</div>
                <div className="font-mono text-sm">{value}</div>
              </div>
            ))}
          </div>
        </DynamicElement>
      </DynamicContainer>
    </div>
  );
} 
