'use client'
import { useEffect, useState } from 'react'
import { readJson, writeJson } from './storage'
import { isDbLoadModeEnabled, getSeedValueFromEnv, fetchSeededSelection } from './seeded-loader'
import { generateProjectData } from './data-generator'

export function buildStorageKey({ projectKey, entityType, mode, seed, version }: { projectKey: string; entityType: string; mode: 'gen'|'db'|'static'; seed?: number; version?: string }) {
  return `cache:${projectKey}:${entityType}:${mode}:${seed ?? 'na'}:${version ?? 'v1'}`
}

export async function loadDataOrGenerate<T>({ projectKey, entityType, generateCount = 50, categories, version = 'v1', ttlMs, fallback }: { projectKey: string; entityType: string; generateCount?: number; categories?: string[]; version?: string; ttlMs?: number; fallback?: () => Promise<T[]>|T[] }) : Promise<T[]> {
  if (isDbLoadModeEnabled()) {
    const seed = getSeedValueFromEnv(1)
    return await fetchSeededSelection<T>({ projectKey, entityType, seedValue: seed })
  }

  const genFlag = (process.env.NEXT_PUBLIC_DATA_GENERATION || process.env.ENABLE_DATA_GENERATION || '').toString().toLowerCase()
  const isGen = genFlag === 'true' || genFlag === '1' || genFlag === 'yes' || genFlag === 'on'

  if (isGen) {
    const key = buildStorageKey({ projectKey, entityType, mode: 'gen', version })
    const cached = readJson<{ data: T[]; savedAt: number }>(key)
    if (cached && (!ttlMs || (Date.now() - cached.savedAt) < ttlMs)) return cached.data
    const resp = await generateProjectData(projectKey, generateCount, categories)
    const data = (resp.success ? resp.data : []) as T[]
    writeJson(key, { data, savedAt: Date.now() })
    return data
  }

  if (fallback) return await Promise.resolve(fallback())
  return []
}

export function useProjectData<T>(params: Parameters<typeof loadDataOrGenerate<T>>[0]) {
  const [state, setState] = useState<{ data: T[]; isLoading: boolean; error: string|null }>({ data: [], isLoading: true, error: null })
  useEffect(() => {
    let cancelled = false
    loadDataOrGenerate<T>(params).then(
      data => { if (!cancelled) setState({ data, isLoading: false, error: null }) },
      err => { if (!cancelled) setState({ data: [], isLoading: false, error: err?.message || 'Failed to load data' }) },
    )
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ ...params, flags: { gen: process.env.NEXT_PUBLIC_DATA_GENERATION, db: process.env.NEXT_PUBLIC_ENABLE_DB_MODE }, seed: getSeedValueFromEnv(1) })])
  return state
}

export async function loadManyDataOrGenerate(configs: Array<{ key: string } & Parameters<typeof loadDataOrGenerate<any>>[0]>): Promise<Record<string, any[]>> {
  const results = await Promise.all(
    configs.map(cfg => loadDataOrGenerate<any>({ ...cfg }).then(data => ({ key: cfg.key, data })).catch(() => ({ key: cfg.key, data: [] })))
  )
  return results.reduce<Record<string, any[]>>((acc, cur) => { acc[cur.key] = cur.data; return acc }, {})
}

export function useProjectDataMany(configs: Array<{ key: string } & Parameters<typeof loadDataOrGenerate<any>>[0]>) {
  const [state, setState] = useState<{ data: Record<string, any[]>; isLoading: boolean; error: string|null }>({ data: {}, isLoading: true, error: null })
  useEffect(() => {
    let cancelled = false
    loadManyDataOrGenerate(configs).then(
      data => { if (!cancelled) setState({ data, isLoading: false, error: null }) },
      err => { if (!cancelled) setState({ data: {}, isLoading: false, error: err?.message || 'Failed to load data' }) },
    )
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(configs)])
  return state
}


