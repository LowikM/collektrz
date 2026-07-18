import { profileSkeletonClassName } from "@/components/profile/profile-styles";

export function FastAddSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading fast add">
      <div className={`h-8 w-48 ${profileSkeletonClassName}`} />
      <div className={`h-4 w-full max-w-xl ${profileSkeletonClassName}`} />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`h-32 rounded-2xl ${profileSkeletonClassName}`} />
        ))}
      </div>
    </div>
  );
}
