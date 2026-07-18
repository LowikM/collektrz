/** Profile & Collection 2.0 — shared design tokens */

export const PROFILE_RADIUS = "rounded-2xl";
export const PROFILE_RADIUS_LG = "rounded-3xl";

export const profilePanelClassName =
  `${PROFILE_RADIUS} border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950`;

export const profileSectionClassName =
  `${PROFILE_RADIUS} border border-zinc-200/60 bg-zinc-50/50 p-6 sm:p-8 dark:border-zinc-800/80 dark:bg-zinc-900/30`;

export const profileSectionAltClassName =
  `${PROFILE_RADIUS} border border-transparent bg-white p-6 sm:p-8 dark:bg-zinc-950`;

export const profileCardClassName =
  `${PROFILE_RADIUS} border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950`;

export const profileCardInteractiveClassName =
  `${profileCardClassName} transition-all duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg dark:hover:border-zinc-700 dark:hover:shadow-zinc-950/50`;

export const profileShowcaseCardClassName =
  `${PROFILE_RADIUS_LG} border border-zinc-200/70 bg-white shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:hover:shadow-black/40`;

export const profilePrimaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.98]";

export const profileSecondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800";

export const profileGhostButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100";

export const profileStatCardClassName =
  `${PROFILE_RADIUS} border border-zinc-200/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/80`;

export const profileBadgeClassName =
  "inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

export const profileTradeBadgeClassName =
  "inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400";

export const profileQtyBadgeClassName =
  "inline-flex items-center rounded-full bg-zinc-900/5 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300";

export const profileHeroGradientClassName =
  `relative overflow-hidden ${PROFILE_RADIUS_LG} border border-zinc-200/80 bg-gradient-to-br from-zinc-50 via-white to-zinc-100/80 px-6 py-8 shadow-sm sm:px-10 sm:py-10 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950`;

export const profileImageGradientClassName =
  "bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/80 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900";

export const profileSkeletonClassName =
  "animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70";

export const profileTabLinkClassName =
  "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200";

export const profileSectionTitleClassName =
  "text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50";

export const profileSectionDescriptionClassName =
  "mt-1.5 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400";

export const OVERVIEW_FEATURED_VISIBLE_LIMIT = 4;
