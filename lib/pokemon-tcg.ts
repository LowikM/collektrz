const API_BASE_URL = "https://api.pokemontcg.io/v2";
const REQUEST_TIMEOUT_MS = 10_000;
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

const SEARCH_SELECT = "id,name,number,set,images";
const CARD_SELECT = "id,name,number,set,images";

export type PokemonTcgCardSet = {
  id: string;
  name: string;
};

export type PokemonTcgCardImages = {
  small: string;
  large?: string;
};

export type PokemonTcgCardSearchResult = {
  id: string;
  name: string;
  number: string;
  set: PokemonTcgCardSet;
  images: PokemonTcgCardImages;
};

export type PokemonTcgCard = PokemonTcgCardSearchResult & {
  images: PokemonTcgCardImages & {
    large: string;
  };
};

type PokemonTcgApiCard = {
  id: string;
  name: string;
  number: string;
  set?: {
    id?: string;
    name?: string;
  };
  images?: {
    small?: string;
    large?: string;
  };
};

export class PokemonTcgApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PokemonTcgApiError";
    this.status = status;
  }
}

type SearchCacheEntry = {
  expiresAt: number;
  results: PokemonTcgCardSearchResult[];
};

const searchCache = new Map<string, SearchCacheEntry>();

function escapeLuceneTerm(value: string) {
  return value.replace(/([+\-!():^[\]{}~*?\\/"|&])/g, "\\$1");
}

export function buildCardNameSearchQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.includes(" ")) {
    const escapedPhrase = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `name:"${escapedPhrase}"`;
  }

  return `name:${escapeLuceneTerm(trimmed)}*`;
}

function getApiHeaders() {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const apiKey = process.env.POKEMON_TCG_API_KEY?.trim();
  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  return headers;
}

function normalizeSearchResult(card: PokemonTcgApiCard): PokemonTcgCardSearchResult {
  return {
    id: card.id,
    name: card.name,
    number: card.number,
    set: {
      id: card.set?.id ?? "",
      name: card.set?.name ?? "",
    },
    images: {
      small: card.images?.small ?? "",
    },
  };
}

function normalizeCard(card: PokemonTcgApiCard): PokemonTcgCard {
  const normalized = normalizeSearchResult(card);

  return {
    ...normalized,
    images: {
      small: normalized.images.small,
      large: card.images?.large ?? normalized.images.small,
    },
  };
}

async function fetchPokemonTcg<T>(
  path: string,
  searchParams?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: getApiHeaders(),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[pokemon-tcg] upstream error", {
        status: response.status,
        url: url.toString(),
        body: body.slice(0, 500),
      });
      throw new PokemonTcgApiError(
        response.status,
        body || `Pokémon TCG API request failed with status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof PokemonTcgApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      console.error("[pokemon-tcg] request timed out", url.toString());
      throw new PokemonTcgApiError(504, "Pokémon TCG API request timed out");
    }

    console.error(
      "[pokemon-tcg] unexpected fetch error",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchCards(
  query: string,
  pageSize = 10,
): Promise<PokemonTcgCardSearchResult[]> {
  const q = buildCardNameSearchQuery(query);
  if (!q) {
    return [];
  }

  const normalizedPageSize = Math.min(Math.max(pageSize, 1), 250);
  const cacheKey = `${q}:${normalizedPageSize}`;
  const cached = searchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const response = await fetchPokemonTcg<{ data: PokemonTcgApiCard[] }>(
    "/cards",
    {
      q,
      pageSize: String(normalizedPageSize),
      orderBy: "-set.releaseDate,name",
      select: SEARCH_SELECT,
    },
  );

  const results = (response.data ?? []).map(normalizeSearchResult);

  searchCache.set(cacheKey, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    results,
  });

  return results;
}

export async function getCardById(
  tcgApiCardId: string,
): Promise<PokemonTcgCard | null> {
  const trimmedId = tcgApiCardId.trim();
  if (!trimmedId) {
    return null;
  }

  try {
    const response = await fetchPokemonTcg<{ data: PokemonTcgApiCard }>(
      `/cards/${encodeURIComponent(trimmedId)}`,
      {
        select: CARD_SELECT,
      },
    );

    if (!response.data) {
      return null;
    }

    return normalizeCard(response.data);
  } catch (error) {
    if (error instanceof PokemonTcgApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getCardImagesById(tcgApiCardId: string) {
  const card = await getCardById(tcgApiCardId);
  if (!card?.images?.small) {
    return null;
  }

  return {
    small: card.images.small,
    large: card.images.large ?? card.images.small,
  };
}
