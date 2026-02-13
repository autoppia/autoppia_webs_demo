'use client'
import { useEffect, useState } from 'react'
import { isDbLoadModeEnabled, getSeedValueFromEnv, fetchSeededSelection } from './seeded-loader'

export async function loadDataOrGenerate<T>({ projectKey, entityType, generateCount = 50, categories, version = 'v1', ttlMs, fallback, seedValue }: { projectKey: string; entityType: string; generateCount?: number; categories?: string[]; version?: string; ttlMs?: number; fallback?: () => Promise<T[]>|T[]; seedValue?: number | null }) : Promise<T[]> {
  if (isDbLoadModeEnabled()) {
    const seed = typeof seedValue === 'number' ? seedValue : getSeedValueFromEnv(1)
    console.log("[universal-loader] DB mode enabled → fetching seeded selection", {
      projectKey,
      entityType,
      seed,
    })
    return await fetchSeededSelection<T>({ projectKey, entityType, seedValue: seed })
  }

  if (fallback) return await Promise.resolve(fallback())
  return []
}

export function useProjectData<T>(params: Parameters<typeof loadDataOrGenerate<T>>[0]) {
  const [state, setState] = useState<{ data: T[]; isLoading: boolean; error: string|null }>({ data: [], isLoading: true, error: null })
  useEffect(() => {
    let cancelled = false
    console.log("[useProjectData] loading", { projectKey: params.projectKey, entityType: params.entityType, seedValue: params.seedValue ?? null })
    loadDataOrGenerate<T>(params).then(
      data => {
        console.log("[useProjectData] loaded data", { projectKey: params.projectKey, entityType: params.entityType, count: data.length, sample: (data as unknown as any[]).slice?.(0, 3) ?? [] })
        if (!cancelled) setState({ data, isLoading: false, error: null })
      },
      err => { if (!cancelled) setState({ data: [], isLoading: false, error: err?.message || 'Failed to load data' }) },
    )
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({
    projectKey: params.projectKey,
    entityType: params.entityType,
    generateCount: params.generateCount,
    categories: params.categories,
    version: params.version,
    ttlMs: params.ttlMs,
    seedValue: params.seedValue ?? null,
    flags: { db: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 },
  })])
  return state
}
