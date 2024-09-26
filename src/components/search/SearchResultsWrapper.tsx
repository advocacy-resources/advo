import { Suspense } from "react";
import SearchResultsClient from "./SearchResultClient";

export default function SearchResultsWrapper() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResultsClient />
    </Suspense>
  );
}
