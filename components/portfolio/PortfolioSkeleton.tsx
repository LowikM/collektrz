import {
  profileHeroGradientClassName,
  profilePanelClassName,
  profileSkeletonClassName,
} from "@/components/profile/profile-styles";

function Block({ className }: { className: string }) {
  return <div className={`${profileSkeletonClassName} ${className}`} aria-hidden="true" />;
}

export function PortfolioSkeleton() {
  return (
    <div className="space-y-10" aria-label="Loading portfolio">
      <section className={profileHeroGradientClassName}>
        <Block className="h-8 w-56" />
        <Block className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Block key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Block key={i} className={`h-28 ${profilePanelClassName}`} />
        ))}
      </div>
      <Block className="h-64 rounded-2xl" />
    </div>
  );
}
