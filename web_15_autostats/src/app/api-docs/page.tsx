'use client';

import React from 'react';
import { useEventLogger } from '@/hooks/useEventLogger';
import { useDynamicSystem } from '@/dynamic/shared';
import { useEffect } from 'react';

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm text-zinc-300 font-mono">
      {children}
    </pre>
  );
}

function EndpointCard({
  method,
  path,
  description,
  responseExample,
  responseDescription,
}: {
  method: string;
  path: string;
  description: string;
  responseExample: string;
  responseDescription: string;
}) {
  return (
    <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {method}
        </span>
        <code className="text-white font-mono text-sm">{path}</code>
      </div>
      <p className="text-zinc-400 text-sm mb-4">{description}</p>

      <div className="mb-3">
        <h4 className="text-zinc-300 text-sm font-semibold mb-2">Example Request</h4>
        <CodeBlock>{`curl -X GET ${path}`}</CodeBlock>
      </div>

      <div className="mb-3">
        <h4 className="text-zinc-300 text-sm font-semibold mb-2">Response</h4>
        <CodeBlock>{responseExample}</CodeBlock>
      </div>

      <p className="text-zinc-500 text-xs mt-2">{responseDescription}</p>
    </div>
  );
}

export default function ApiDocsPage() {
  const { logInteraction } = useEventLogger();
  const dyn = useDynamicSystem();

  useEffect(() => {
    logInteraction('page_view', { page: 'api-docs' });
  }, [logInteraction]);

  return (
    <>
      {dyn.v1.addWrapDecoy('api-docs-content', (
        <div className="min-h-screen bg-zinc-950 py-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">API Documentation</h1>
            <p className="text-zinc-400">
              Reference documentation for the AutoStats API. Use these endpoints to programmatically
              access network data and application metadata.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Base URL</h2>
            <p className="text-zinc-400 text-sm mb-3">
              All API endpoints are relative to the application host.
            </p>
            <CodeBlock>{`https://<your-host>/api`}</CodeBlock>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
            <p className="text-zinc-400 text-sm">
              The API is currently open and does not require authentication. All endpoints accept
              unauthenticated GET requests.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Endpoints</h2>
            <div className="space-y-6">
              <EndpointCard
                method="GET"
                path="/api/version"
                description="Returns the current application version. The version is resolved from environment variables (NEXT_PUBLIC_WEB_VERSION or WEB_VERSION) with a fallback to the package.json version."
                responseExample={`{
  "version": "0.1.0"
}`}
                responseDescription="Returns a JSON object with a single 'version' field containing the semantic version string."
              />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Data Query Patterns</h2>
            <p className="text-zinc-400 text-sm mb-4">
              AutoStats uses a seed-based dynamic data system for deterministic data generation.
              Client-side data is loaded through the dynamic data provider and includes the
              following categories:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Subnets', description: 'Network subnet information including emission rates, registration costs, and activity trends.' },
                { title: 'Validators', description: 'Validator details with stake amounts, APY calculations, and performance metrics.' },
                { title: 'Blocks', description: 'Block data with timestamps, extrinsic counts, and event details.' },
                { title: 'Transfers', description: 'Transaction records including sender, receiver, amounts, and transfer methods.' },
                { title: 'Accounts', description: 'Account information with balances, staking data, and transaction history.' },
                { title: 'Price History', description: 'Historical price data points for charting and trend analysis.' },
              ].map((item) => (
                <div key={item.title} className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-zinc-400 text-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Response Format</h2>
            <p className="text-zinc-400 text-sm mb-3">
              All API responses are returned as JSON with appropriate HTTP status codes.
            </p>
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="text-left px-4 py-3 text-zinc-300 font-semibold">Status Code</th>
                    <th className="text-left px-4 py-3 text-zinc-300 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-800">
                    <td className="px-4 py-3 text-emerald-400 font-mono">200</td>
                    <td className="px-4 py-3 text-zinc-400">Successful request</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="px-4 py-3 text-yellow-400 font-mono">404</td>
                    <td className="px-4 py-3 text-zinc-400">Resource not found</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-red-400 font-mono">500</td>
                    <td className="px-4 py-3 text-zinc-400">Internal server error</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ))}
    </>
  );
}
