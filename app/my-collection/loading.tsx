import { PortfolioSkeleton } from "@/components/portfolio/PortfolioSkeleton";

export default function MyCollectionLoading() {
  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-6xl space-y-8">
        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <PortfolioSkeleton />
      </div>
    </div>
  );
}
