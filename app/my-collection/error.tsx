"use client";

import { PortfolioLoadError } from "@/components/portfolio/PortfolioLoadError";

export default function MyCollectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[my-collection:error-boundary]", {
    errorName: error.name,
    errorMessage: error.message,
    digest: error.digest,
  });

  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-6xl space-y-6">
        <PortfolioLoadError />
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
