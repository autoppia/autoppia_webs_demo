"use client";

import { useSeedLayout } from "@/library/useSeedLayout";
import Link from "next/link";

export default function TestLayoutPage() {
  const { seed, layout } = useSeedLayout();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dynamic Layout Test
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Seed:</strong> {seed || 'None (default)'}</p>
              <p><strong>Main Sections:</strong> {layout.mainSections.join(' → ')}</p>
              <p><strong>Post Job Steps:</strong> {layout.postJobSections.join(' → ')}</p>
            </div>
            <div>
              <p><strong>Expert Sections:</strong> {layout.expertSections.join(' → ')}</p>
              <p><strong>Hire Form Sections:</strong> {layout.hireFormSections.join(' → ')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Different Seeds</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((testSeed) => (
              <Link
                key={testSeed}
                href={`/?seed=${testSeed}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="text-lg font-semibold">Seed {testSeed}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {testSeed === seed ? 'Current' : 'Test'}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-lg font-semibold">Home Page</div>
              <div className="text-sm text-gray-600 mt-1">
                Test main page layout
              </div>
            </Link>
            <Link
              href="/expert/john-doe"
              className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-lg font-semibold">Expert Page</div>
              <div className="text-sm text-gray-600 mt-1">
                Test expert profile layout
              </div>
            </Link>
            <Link
              href="/expert/john-doe/hire"
              className="block p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-lg font-semibold">Hire Form</div>
              <div className="text-sm text-gray-600 mt-1">
                Test hire form layout
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Button Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Main Page</h3>
              <p><strong>Post Job Button:</strong> {layout.buttonPositions.postJob}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Post Job Wizard</h3>
              <p><strong>Back Button:</strong> {layout.buttonPositions.back}</p>
              <p><strong>Submit Button:</strong> {layout.buttonPositions.submit}</p>
              <p><strong>Close Button:</strong> {layout.buttonPositions.close}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Hire Form</h3>
              <p><strong>Cancel Button:</strong> {layout.buttonPositions.cancel}</p>
              <p><strong>Hire Button:</strong> {layout.buttonPositions.hire}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 