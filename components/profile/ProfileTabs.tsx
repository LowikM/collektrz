"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { profileBadgeClassName } from "@/components/profile/profile-styles";
import type { ProfileTab } from "@/lib/profile";

const TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "collection", label: "Collection" },
  { id: "wishlist", label: "Wishlist" },
  { id: "listings", label: "Listings" },
  { id: "events", label: "Events" },
  { id: "about", label: "About" },
];

type ProfileTabsProps = {
  activeTab: ProfileTab;
  userId: string;
};

export function ProfileTabs({ activeTab, userId }: ProfileTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(tab: ProfileTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("view");
    params.delete("page");

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <nav
      aria-label="Profile sections"
      className="sticky top-0 z-20 -mx-4 border-b border-zinc-200 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:border-zinc-800"
    >
      <ul className="flex gap-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <li key={tab.id} className="shrink-0">
              <Link
                href={buildHref(tab.id)}
                className={`inline-flex items-center rounded-t-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ProfileTabCountBadge({ count }: { count: number | null }) {
  if (count === null) {
    return (
      <span className={`${profileBadgeClassName} ml-1.5 opacity-60`}>—</span>
    );
  }

  return <span className={`${profileBadgeClassName} ml-1.5`}>{count}</span>;
}
