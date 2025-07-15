import SearchPage from "@/components/SearchPage";
import { Suspense } from "react";

export default function SearchWrapper() {
  return (
    <Suspense fallback={<div className="p-4">Loading search...</div>}>
      <SearchPage />
    </Suspense>
  );
}
