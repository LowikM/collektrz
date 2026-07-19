type EventIntelligenceLogContext = Record<string, unknown>;

export type EventIntelligenceViewerMode = "authenticated" | "anonymous";

function truncateId(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.length > 8 ? `${value.slice(0, 8)}…` : value;
}

export function logEventIntelligencePhase(
  phase: string,
  outcome: "success" | "failure" | "skipped",
  context?: EventIntelligenceLogContext,
) {
  const payload = { phase, outcome, ...context };

  if (outcome === "failure") {
    console.error("[event-intelligence]", payload);
    return;
  }

  console.info("[event-intelligence]", payload);
}

export function serializeIntelError(error: unknown) {
  if (error instanceof Error) {
    return {
      failureCategory: "exception",
      errorName: error.name,
      errorMessage: error.message,
    };
  }

  if (error && typeof error === "object" && "message" in error) {
    const pg = error as { message?: unknown; code?: unknown };
    return {
      failureCategory: "supabase",
      errorName: "PostgrestError",
      errorMessage: String(pg.message ?? "Unknown error"),
      supabaseCode: typeof pg.code === "string" ? pg.code : undefined,
    };
  }

  return {
    failureCategory: "unknown",
    errorName: "UnknownError",
    errorMessage: String(error),
  };
}

export function buildIntelLogContext(input: {
  eventId: string;
  viewerUserId: string | null;
  phase: string;
  durationMs: number;
  inputRows?: Record<string, number>;
  sectionCounts?: Record<string, number>;
  failureCategory?: string;
  supabaseCode?: string;
}) {
  return {
    eventId: truncateId(input.eventId),
    viewerMode: input.viewerUserId ? "authenticated" : "anonymous",
    viewerRef: truncateId(input.viewerUserId),
    phase: input.phase,
    durationMs: input.durationMs,
    inputRows: input.inputRows,
    sectionCounts: input.sectionCounts,
    failureCategory: input.failureCategory,
    supabaseCode: input.supabaseCode,
  };
}
