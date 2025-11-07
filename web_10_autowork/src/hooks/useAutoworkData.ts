import { useEffect, useMemo, useState } from "react";
import { generateProjectData, getCachedData } from "@/shared/data-generator";
import { writeJson } from "@/shared/storage";

// Local copy of the cache key builder to detect cache presence before kicking off generation
function buildCacheKey(projectKey: string): string {
	const short = projectKey
		.replace("web_10_", "")
		.replace("autowork_", "")
		.replace(/[^a-z0-9_]/gi, "");
	return `autowork_${short || projectKey}_v1`;
}

function getMirrorKey(projectKey: string): string | null {
	if (projectKey.includes("jobs")) return "autowork_jobs";
	if (projectKey.includes("hires")) return "autowork_hires";
	if (projectKey.includes("experts")) return "autowork_experts";
	if (projectKey.includes("skills")) return "autowork_skills";
	return null;
}

export type UseAutoworkDataResult<T> = {
	data: T[];
	isLoading: boolean;
	statusMessage: string | null;
	error: string | null;
	reload: () => void;
};

export function useAutoworkData<T = any>(projectKey: string, count: number = 12): UseAutoworkDataResult<T> {
	const [data, setData] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [nonce, setNonce] = useState(0);

	const cacheKey = useMemo(() => buildCacheKey(projectKey), [projectKey]);
	const mirrorKey = useMemo(() => getMirrorKey(projectKey), [projectKey]);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			setError(null);
			setIsLoading(true);

			// Check cache synchronously to decide messaging
			const cached = getCachedData(cacheKey);
			if (!cached || cached.length === 0) {
				setStatusMessage("AI is generating the data. This may take some time...");
			} else {
				setStatusMessage(null);
				setData(cached as T[]);
				if (mirrorKey) writeJson(mirrorKey, cached as T[]);
			}

			try {
				const result = await generateProjectData(projectKey, count);
				if (cancelled) return;
				if (result.success) {
					const next = (result.data as T[]) || [];
					setData(next);
					setStatusMessage(null);
					setError(null);
					if (mirrorKey) writeJson(mirrorKey, next);
				} else {
					setError(result.error || "Failed to generate data");
					if (!cached || cached.length === 0) setStatusMessage(null);
				}
			} catch (e: any) {
				if (cancelled) return;
				setError(e?.message || "Unknown error during data generation");
				if (!cached || cached.length === 0) setStatusMessage(null);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		run();
		return () => {
			cancelled = true;
		};
	}, [cacheKey, mirrorKey, projectKey, count, nonce]);

	const reload = () => setNonce((n) => n + 1);

	return { data, isLoading, statusMessage, error, reload };
}
