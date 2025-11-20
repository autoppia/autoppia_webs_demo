"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeed } from "@/context/SeedContext";
import { getSeedLayout as getPageSeedLayout } from "@/library/utils";

function DemoPageContent() {
  const { seed } = useSeed();
<<<<<<< HEAD
  const layout = getPageSeedLayout(seed);
=======
  const layout = getSeedLayout(seed ?? 1);
  const searchBar = layout?.searchBar ?? {
    position: "top",
    wrapper: "div",
  };
  const propertyDetail = layout?.propertyDetail ?? {
    layout: "vertical",
    wrapper: "div",
  };
  const eventElements = layout?.eventElements ?? {
    order: [],
    wrapper: "div",
  };
>>>>>>> 31e453b2a7fff6f13b2d82852e125958cc9babd2

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
            <a
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
                  {seedValue === seed ? "Current" : "Click to change"}
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Layout Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Bar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Position: {searchBar.position}</p>
                <p className="text-sm text-gray-600">Wrapper: {searchBar.wrapper}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Layout: {propertyDetail.layout}</p>
                <p className="text-sm text-gray-600">Wrapper: {propertyDetail.wrapper}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Order: {eventElements.order.length ? eventElements.order.join(", ") : "N/A"}
                </p>
                <p className="text-sm text-gray-600">Wrapper: {eventElements.wrapper}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Seed: {seed}</p>
                <p className="text-sm text-gray-600">Type: Dynamic</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
          <p className="text-sm text-blue-800">
            Each seed value creates a completely different DOM structure and element ordering.
            This makes it harder for web scrapers to extract content, as the structure changes
            based on the seed parameter in the URL.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <DemoPageContent />
  );
}
