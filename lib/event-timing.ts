export type EventTimingState = "upcoming" | "live" | "ended" | "unknown";

export type EventTimingInput = {
  start_date: string;
  end_date: string;
};

export function getEventTimingState(
  event: EventTimingInput,
  now: Date = new Date(),
): EventTimingState {
  const start = Date.parse(event.start_date);
  const end = Date.parse(event.end_date);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return "unknown";
  }

  const nowMs = now.getTime();

  if (nowMs < start) {
    return "upcoming";
  }

  if (nowMs > end) {
    return "ended";
  }

  return "live";
}

export function shouldEmphasizeCheckIn(state: EventTimingState): boolean {
  return state === "live";
}

export function getMomentumSubtitle(
  state: EventTimingState,
  recentCount: number,
): string {
  if (state === "ended") {
    return recentCount > 0
      ? `${recentCount} listing${recentCount === 1 ? "" : "s"} were added during this event`
      : "Final counts from this event";
  }

  if (state === "upcoming") {
    return recentCount > 0
      ? `${recentCount} listing${recentCount === 1 ? "" : "s"} posted ahead of the event`
      : "Early activity before the event starts";
  }

  if (state === "live") {
    return recentCount > 0
      ? `${recentCount} new listing${recentCount === 1 ? "" : "s"} recently`
      : "Live counts from this event";
  }

  return recentCount > 0
    ? `${recentCount} new listing${recentCount === 1 ? "" : "s"} recently`
    : "Counts from this event";
}

export function getRecentActivityDescription(state: EventTimingState): string {
  if (state === "ended") {
    return "Listings added before this event ended.";
  }

  if (state === "upcoming") {
    return "Early listings posted ahead of the event.";
  }

  if (state === "live") {
    return "Recently added active listings from collectors and vendors.";
  }

  return "Recently added active listings from collectors and vendors.";
}
