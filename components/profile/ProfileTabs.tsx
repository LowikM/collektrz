"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { profileTabLinkClassName } from "@/components/profile/profile-styles";
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

export function ProfileTabs({ activeTab }: ProfileTabsProps) {
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
      className="sticky top-0 z-20 -mx-4 border-b border-zinc-200/80 bg-background/90 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 dark:border-zinc-800"
    >
      <ul className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <li key={tab.id} className="shrink-0">
              <Link
                href={buildHref(tab.id)}
                className={`${profileTabLinkClassName} ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
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
