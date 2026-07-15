export type PokemonTcgErrorCode =
  | "timeout"
  | "rate_limit"
  | "authentication"
  | "upstream"
  | "network"
  | "configuration";

export type CardSearchErrorResponse = {
  error: string;
  code: PokemonTcgErrorCode;
};

export function hasPokemonTcgApiKey() {
  return Boolean(process.env.POKEMON_TCG_API_KEY?.trim());
}

export function getCardSearchUserMessage(code: PokemonTcgErrorCode | string) {
  switch (code) {
    case "timeout":
      return "Card search timed out. Please try again.";
    case "rate_limit":
      return "Card search is busy. Please try again shortly.";
    case "authentication":
    case "configuration":
    case "upstream":
    case "network":
    default:
      return "Card search is temporarily unavailable.";
  }
}

export function classifyPokemonTcgStatus(status: number): PokemonTcgErrorCode {
  if (status === 408 || status === 504) {
    return "timeout";
  }

  if (status === 429) {
    return "rate_limit";
  }

  if (status === 401 || status === 403) {
    return "authentication";
  }

  if (status >= 500) {
    return "upstream";
  }

  return "upstream";
}

export function logPokemonTcgFailure(
  scope: string,
  error: {
    code: PokemonTcgErrorCode;
    status: number;
    message: string;
  },
  context: Record<string, unknown>,
) {
  console.error(`[${scope}] upstream failure`, {
    code: error.code,
    status: error.status,
    hasApiKey: hasPokemonTcgApiKey(),
    message: error.message.slice(0, 200),
    ...context,
  });

  if (error.code === "authentication" && hasPokemonTcgApiKey()) {
    console.error(
      `[${scope}] POKEMON_TCG_API_KEY appears invalid — check the value in Vercel environment variables`,
    );
  }

  if (error.code === "rate_limit" && !hasPokemonTcgApiKey()) {
    console.warn(
      `[${scope}] no POKEMON_TCG_API_KEY configured; unauthenticated requests have much lower rate limits`,
    );
  }

  if (error.code === "timeout") {
    console.error(
      `[${scope}] api.pokemontcg.io timed out — upstream slowness is a known issue; API key and retries may help`,
    );
  }
}

export function pokemonTcgErrorToResponse(
  error: {
    code: PokemonTcgErrorCode;
    status: number;
  },
  userMessage = "Card search is temporarily unavailable.",
): CardSearchErrorResponse & { status: number } {
  const httpStatus =
    error.code === "rate_limit"
      ? 429
      : error.code === "timeout"
        ? 504
        : error.code === "authentication"
          ? 502
          : 502;

  return {
    status: httpStatus,
    error: userMessage,
    code: error.code,
  };
}
