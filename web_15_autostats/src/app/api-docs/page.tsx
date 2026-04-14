'use client';

import React from 'react';
import { useDynamicSystem } from '@/dynamic/shared';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useEventLogger } from '@/hooks/useEventLogger';

const setupSteps = [
  {
    title: 'Sign in to AutoStats Pro',
    body: 'Use your preferred sign-in method to access the AutoStats Pro workspace and manage API access for your team.',
  },
  {
    title: 'Create an organization',
    body: 'Set up an organization to group projects, keys, and usage controls under a single workspace.',
  },
  {
    title: 'Add a project',
    body: 'Each API key is attached to a project so requests, quotas, and ownership are easy to track.',
  },
  {
    title: 'Generate an API key',
    body: 'Create a key for your project, store it securely, and use it when calling AutoStats endpoints.',
  },
] as const;

const referenceItems = [
  {
    method: 'GET',
    path: '/api/version',
    description: 'Check service version information for your current deployment.',
  },
  {
    method: 'GET',
    path: '/reference',
    description: 'Browse the full API reference for endpoints, parameters, and sample responses.',
  },
] as const;

export default function ApiDocsPage() {
  const dyn = useDynamicSystem();
  const { logInteraction } = useEventLogger();

  return (
    <div className="py-8 space-y-10">
      {dyn.v1.addWrapDecoy('api-docs-hero', (
        <section className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Documentation
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">The AutoStats API</h1>
            <p className="max-w-4xl text-lg text-zinc-400">
              Build your own tooling and products using data from AutoStats. The API surfaces structured
              Bittensor explorer data so you do not need to extract it manually from the interface.
            </p>
          </div>
        </section>
      ))}

      {dyn.v1.addWrapDecoy('api-docs-getting-started', (
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-white">Getting Started</h2>
          <div className="space-y-4 text-sm text-zinc-400">
            <p>
              To use the API, you&apos;ll need an API key.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                title="Base URL"
                value="https://api.autostats.local"
                detail="Mock base URL used for this documentation demo."
              />
              <InfoCard
                title="Authentication"
                value="Bearer API Key"
                detail="Send your key in the Authorization header."
              />
              <InfoCard
                title="Format"
                value="JSON"
                detail="All responses return application/json payloads."
              />
            </div>
          </div>
        </section>
      ))}

      {dyn.v1.addWrapDecoy('api-docs-api-key', (
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-bold text-white">Get an API key</h2>
            <p className="max-w-3xl text-sm text-zinc-400">
              Visit <span className="font-medium text-zinc-200">autostats.io/pro</span> to create and manage API access.
              This page mocks the TaoStats onboarding flow, so the steps below are intentionally documentation-first.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {setupSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-bold text-cyan-300">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                </div>
                <p className="mb-4 text-sm text-zinc-400">{step.body}</p>
                <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/80 p-4">
                  <div className="mb-3 h-2 w-24 rounded bg-zinc-700" />
                  <div className="mb-2 h-2 w-full rounded bg-zinc-800" />
                  <div className="mb-2 h-2 w-5/6 rounded bg-zinc-800" />
                  <div className="h-24 rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800/60" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {dyn.v1.addWrapDecoy('api-docs-auth-example', (
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-white">Authentication Example</h2>
          <p className="mb-4 max-w-3xl text-sm text-zinc-400">
            After generating a key, include it in the request header. This keeps the page aligned with the TaoStats
            doc style, where onboarding comes before endpoint-level detail.
          </p>
          <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
{`curl -X GET https://api.autostats.local/api/version \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          </pre>
        </section>
      ))}

      {dyn.v1.addWrapDecoy('api-docs-reference', (
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="mb-5 space-y-2">
            <h2 className="text-2xl font-bold text-white">API Reference</h2>
            <p className="max-w-3xl text-sm text-zinc-400">
              Endpoint-level details belong in the reference section. For this mock, the items below act as the handoff
              from onboarding into the reference surface.
            </p>
          </div>

          <div className="space-y-4">
            {referenceItems.map((item) => (
              <div
                key={item.path}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-green-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-green-400">
                    {item.method}
                  </span>
                  <code className="text-sm text-white">{item.path}</code>
                </div>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {dyn.v1.addWrapDecoy('api-docs-feedback', (
        <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-center">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Was this page helpful?</h2>
            <p className="text-sm text-zinc-400">
              Share quick feedback on the documentation experience.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Helpful"
              onClick={() => logInteraction('docs_feedback', { page: 'api-docs', value: 'up' })}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-cyan-500/40 hover:text-white"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Yes</span>
            </button>
            <button
              type="button"
              aria-label="Not helpful"
              onClick={() => logInteraction('docs_feedback', { page: 'api-docs', value: 'down' })}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-cyan-500/40 hover:text-white"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>No</span>
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}

function InfoCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
      <div className="mb-2 font-mono text-sm text-cyan-300">{value}</div>
      <p className="text-xs text-zinc-500">{detail}</p>
    </div>
  );
}
