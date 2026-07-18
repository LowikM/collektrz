import { FastAddSkeleton } from "@/components/fast-add/FastAddSkeleton";

export default function FastAddLoading() {
  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-3xl">
        <FastAddSkeleton />
      </div>
    </div>
  );
}
