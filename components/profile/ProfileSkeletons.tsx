import {
  profileHeroGradientClassName,
  profileSkeletonClassName,
} from "@/components/profile/profile-styles";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`${profileSkeletonClassName} ${className}`} aria-hidden="true" />;
}

export function ProfileHeroSkeleton() {
  return (
    <section className={profileHeroGradientClassName} aria-label="Loading profile">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <SkeletonBlock className="h-28 w-28 shrink-0 rounded-3xl sm:h-32 sm:w-32" />
          <div className="flex-1 space-y-4">
            <SkeletonBlock className="h-8 w-48 max-w-full" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-16 w-full max-w-xl" />
            <SkeletonBlock className="h-3 w-56" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-11 w-28 rounded-xl" />
          <SkeletonBlock className="h-11 w-16 rounded-xl" />
          <SkeletonBlock className="h-11 w-16 rounded-xl" />
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

export function ProfileTabsSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden py-1" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-11 w-24 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

export function FeaturedCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800">
          <SkeletonBlock className="aspect-[3/4] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollectionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
          <SkeletonBlock className="aspect-[3/4] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <SkeletonBlock className="h-4 w-4/5" />
            <SkeletonBlock className="h-3 w-1/2" />
            <div className="flex gap-2 pt-1">
              <SkeletonBlock className="h-5 w-12 rounded-full" />
              <SkeletonBlock className="h-5 w-10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListingCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-2xl border border-zinc-200/70 p-4 dark:border-zinc-800"
        >
          <SkeletonBlock className="h-20 w-14 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-16 rounded-full" />
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileOverviewSkeleton() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <SkeletonBlock className="h-7 w-48" />
        <FeaturedCardsSkeleton />
      </section>
      <section className="space-y-6">
        <SkeletonBlock className="h-7 w-40" />
        <ListingCardsSkeleton count={2} />
      </section>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:space-y-10 sm:py-10">
      <ProfileHeroSkeleton />
      <ProfileTabsSkeleton />
      <ProfileOverviewSkeleton />
    </div>
  );
}
