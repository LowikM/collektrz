"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { profileTabLinkClassName } from "@/components/profile/profile-styles";

type CollectionView = "portfolio" | "collection";

type CollectionViewNavProps = {
  activeView: CollectionView;
};

export function CollectionViewNav({ activeView }: CollectionViewNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(view: CollectionView) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    params.delete("kind");
    params.delete("set");
    params.delete("visibility");
    params.delete("graded");
    params.delete("raw");
    params.delete("sets");

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <nav aria-label="Collection views" className="flex gap-2">
      {(
        [
          { id: "portfolio" as const, label: "Portfolio" },
          { id: "collection" as const, label: "Collection" },
        ] as const
      ).map((tab) => {
        const isActive = tab.id === activeView;

        return (
          <Link
            key={tab.id}
            href={buildHref(tab.id)}
            className={`${profileTabLinkClassName} ${
              isActive
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function buildCollectionFilterHref(filters: {
  kind?: "card" | "sealed";
  set?: string;
  visibility?: "public" | "private";
  graded?: boolean;
  raw?: boolean;
}): string {
  const params = new URLSearchParams();
  params.set("view", "collection");

  if (filters.kind) {
    params.set("kind", filters.kind);
  }

  if (filters.set) {
    params.set("set", filters.set);
  }

  if (filters.visibility) {
    params.set("visibility", filters.visibility);
  }

  if (filters.graded) {
    params.set("graded", "1");
  }

  if (filters.raw) {
    params.set("raw", "1");
  }

  return `/my-collection?${params.toString()}`;
}
