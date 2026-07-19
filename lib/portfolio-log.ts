type PortfolioLogContext = Record<string, unknown>;

export function logPortfolioPhase(
  phase: string,
  outcome: "success" | "failure" | "skipped",
  context?: PortfolioLogContext,
) {
  const payload = {
    phase,
    outcome,
    ...context,
  };

  if (outcome === "failure") {
    console.error("[portfolio:load]", payload);
    return;
  }

  console.info("[portfolio:load]", payload);
}

export function serializeLoadError(error: unknown) {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
    };
  }

  if (error && typeof error === "object" && "message" in error) {
    const pgError = error as { message?: unknown; code?: unknown };
    return {
      errorName: "PostgrestError",
      errorMessage: String(pgError.message ?? "Unknown error"),
      supabaseCode:
        typeof pgError.code === "string" ? pgError.code : undefined,
    };
  }

  return {
    errorName: "UnknownError",
    errorMessage: String(error),
  };
}
