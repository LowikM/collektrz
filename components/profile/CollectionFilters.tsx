"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  profilePanelClassName,
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

type CollectionFiltersProps = {
  userId: string;
  initialQuery?: string;
  initialKind?: string;
  initialSort?: string;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "recently_added", label: "Recently added" },
  { value: "quantity", label: "Quantity" },
] as const;

function FilterFields({
  query,
  kind,
  sort,
  onQueryChange,
  onKindChange,
  onSortChange,
}: {
  query: string;
  kind: string;
  sort: string;
  onQueryChange: (value: string) => void;
  onKindChange: (value: string) => void;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="collection-search" className="text-sm font-medium">
          Search
        </label>
        <input
          id="collection-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search collection…"
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Type</legend>
        <div className="mt-2 space-y-2 text-sm">
          {[
            { value: "all", label: "All items" },
            { value: "card", label: "Cards" },
            { value: "sealed", label: "Sealed" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                value={option.value}
                checked={kind === option.value}
                onChange={() => onKindChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Filters</legend>
        <div className="mt-2 space-y-2 text-sm text-zinc-500">
          <p>Graded — coming soon</p>
          <p>Tradeable — use listings</p>
          <p>Public only / Hidden — privacy settings coming soon</p>
          <p>Series / Sets / Rarity — coming soon</p>
        </div>
      </fieldset>

      <div>
        <label htmlFor="collection-sort" className="text-sm font-medium">
          Sort
        </label>
        <select
          id="collection-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CollectionFilters({
  initialQuery = "",
  initialKind = "all",
  initialSort = "newest",
}: CollectionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState(initialKind);
  const [sort, setSort] = useState(initialSort);

  function applyFilters(next: { q?: string; kind?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "collection");

    const q = next.q ?? query;
    const k = next.kind ?? kind;
    const s = next.sort ?? sort;

    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }

    if (k !== "all") {
      params.set("kind", k);
    } else {
      params.delete("kind");
    }

    params.set("sort", s);
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }

  const sidebar = (
    <FilterFields
      query={query}
      kind={kind}
      sort={sort}
      onQueryChange={setQuery}
      onKindChange={setKind}
      onSortChange={setSort}
    />
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={profileSecondaryButtonClassName}
        >
          Filters & sort
        </button>
      </div>

      <aside className={`hidden lg:block lg:sticky lg:top-24 ${profilePanelClassName} h-fit`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Filters
        </h2>
        {sidebar}
        <button
          type="button"
          onClick={() => applyFilters({})}
          className={`${profilePrimaryButtonClassName} mt-5 w-full`}
        >
          Apply
        </button>
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-zinc-500"
              >
                Close
              </button>
            </div>
            {sidebar}
            <button
              type="button"
              onClick={() => applyFilters({})}
              className={`${profilePrimaryButtonClassName} mt-5 w-full`}
            >
              Apply filters
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CollectionPagination({
  page,
  totalPages,
  userId,
}: {
  page: number;
  totalPages: number;
  userId: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  function pageHref(nextPage: number) {
    return `/users/${userId}?tab=collection&page=${nextPage}`;
  }

  return (
    <nav
      aria-label="Collection pagination"
      className="flex items-center justify-center gap-3 pt-4"
    >
      {page > 1 ? (
        <Link href={pageHref(page - 1)} className={profileSecondaryButtonClassName}>
          Previous
        </Link>
      ) : null}
      <span className="text-sm text-zinc-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageHref(page + 1)} className={profileSecondaryButtonClassName}>
          Next
        </Link>
      ) : null}
    </nav>
  );
}
