import SearchPage from "@/components/SearchPage";
import { Suspense } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function SearchWrapper() {
  return (
    <Suspense fallback={<div className="p-4">Loading search...</div>}>
      <SearchPage />
    </Suspense>
  );
}
