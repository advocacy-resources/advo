import { Suspense } from "react";

import SearchResultsClient from "@/components/search/SearchResultClient";

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResultsClient />
    </Suspense>
  );
}
