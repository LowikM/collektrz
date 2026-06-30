function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

export default function SetsLoading() {
  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-3">
          <SkeletonBlock className="h-8 w-44" />
          <SkeletonBlock className="h-4 w-full max-w-lg" />
        </div>

        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-24" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <SkeletonBlock className="h-10 flex-1" />
            <SkeletonBlock className="h-10 w-24" />
          </div>
        </div>

        <div className="space-y-4">
          <SkeletonBlock className="h-6 w-56" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
