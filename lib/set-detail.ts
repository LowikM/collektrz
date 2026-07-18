import {
  getSetUserMessage,
  hasPokemonTcgApiKey,
  logPokemonTcgFailure,
  type PokemonTcgErrorCode,
} from "@/lib/pokemon-tcg-errors";
import {
  getCardsForSet,
  getSet,
  PokemonTcgApiError,
  type PokemonTcgSetCard,
  type PokemonTcgSetSummary,
} from "@/lib/pokemon-tcg";

export type SetDetailErrorCategory =
  | "not_found"
  | "timeout"
  | "rate_limit"
  | "configuration"
  | "upstream"
  | "network";

export type SetDetailLoadResult =
  | {
      status: "ok";
      set: PokemonTcgSetSummary;
      cards: PokemonTcgSetCard[];
      cardsPartialFailure: SetDetailErrorCategory | null;
    }
  | {
      status: "not_found";
      requestedId: string;
    }
  | {
      status: "error";
      category: SetDetailErrorCategory;
      message: string;
      retryable: boolean;
      requestedId: string;
      resolvedId?: string;
    };

function categorizePokemonTcgError(
  error: PokemonTcgApiError,
): SetDetailErrorCategory {
  if (error.status === 404) {
    return "not_found";
  }

  if (error.code === "authentication") {
    return "configuration";
  }

  return error.code;
}

export async function loadSetDetail(setId: string): Promise<SetDetailLoadResult> {
  const requestedId = setId.trim();

  if (!requestedId) {
    return {
      status: "not_found",
      requestedId: setId,
    };
  }

  if (!hasPokemonTcgApiKey()) {
    console.warn("[set-detail] POKEMON_TCG_API_KEY is not configured in this environment");
  }

  let set: PokemonTcgSetSummary | null;

  try {
    set = await getSet(requestedId);
  } catch (error) {
    if (error instanceof PokemonTcgApiError) {
      logPokemonTcgFailure("set-detail", error, {
        requestedId,
        phase: "getSet",
      });

      if (error.status === 404) {
        return { status: "not_found", requestedId };
      }

      const category = categorizePokemonTcgError(error);
      return {
        status: "error",
        category,
        message: getSetUserMessage(category),
        retryable: category !== "configuration",
        requestedId,
      };
    }

    throw error;
  }

  if (!set) {
    return { status: "not_found", requestedId };
  }

  try {
    const cards = await getCardsForSet(set.id);
    return {
      status: "ok",
      set,
      cards,
      cardsPartialFailure: null,
    };
  } catch (error) {
    if (error instanceof PokemonTcgApiError) {
      logPokemonTcgFailure("set-detail", error, {
        requestedId,
        resolvedId: set.id,
        phase: "getCardsForSet",
      });

      const category = categorizePokemonTcgError(error);
      return {
        status: "ok",
        set,
        cards: [],
        cardsPartialFailure: category,
      };
    }

    throw error;
  }
}

export function getSetCardsErrorMessage(category: SetDetailErrorCategory): string {
  return getSetUserMessage(category);
}

export type { PokemonTcgErrorCode };
