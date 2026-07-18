"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCardSearchUserMessage,
  type PokemonTcgErrorCode,
} from "@/lib/pokemon-tcg-errors";
import type { PokemonTcgCardSearchResult } from "@/lib/pokemon-tcg";
import { trackFastAddEvent } from "@/lib/fast-add-analytics";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const SEARCH_PAGE_SIZE = 20;
const RECENT_SEARCHES_KEY = "collektrz.fastAdd.recentSearches";
const MAX_RECENT_SEARCHES = 8;

type FastCardSearchProps = {
  onSelect: (card: PokemonTcgCardSearchResult) => void;
  autoFocus?: boolean;
  initialQuery?: string;
};

type CardSearchErrorPayload = {
  error?: string;
  code?: PokemonTcgErrorCode;
};

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return;
  }

  const next = [trimmed, ...loadRecentSearches().filter((item) => item !== trimmed)].slice(
    0,
    MAX_RECENT_SEARCHES,
  );

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

export function FastCardSearch({
  onSelect,
  autoFocus = false,
  initialQuery = "",
}: FastCardSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PokemonTcgCardSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const trimmedQuery = query.trim();

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setSearchError(null);
      setHasSearched(false);
      setHighlightIndex(-1);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setSearchError(null);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/card-search?q=${encodeURIComponent(trimmedQuery)}&pageSize=${SEARCH_PAGE_SIZE}`,
          { signal: controller.signal },
        );

        const data = (await response.json().catch(() => null)) as
          | ({ results?: PokemonTcgCardSearchResult[] } & CardSearchErrorPayload)
          | null;

        if (!response.ok) {
          setResults([]);
          setHasSearched(true);
          setSearchError(
            data?.code
              ? getCardSearchUserMessage(data.code)
              : data?.error ?? getCardSearchUserMessage("upstream"),
          );
          return;
        }

        setResults(data?.results ?? []);
        setHasSearched(true);
        setHighlightIndex(data?.results?.length ? 0 : -1);
        trackFastAddEvent("search_used", { queryLength: trimmedQuery.length });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setResults([]);
        setHasSearched(true);
        setSearchError(getCardSearchUserMessage("network"));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmedQuery]);

  const selectCard = useCallback(
    (card: PokemonTcgCardSearchResult) => {
      saveRecentSearch(trimmedQuery || card.name);
      setRecentSearches(loadRecentSearches());
      onSelect(card);
    },
    [onSelect, trimmedQuery],
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) {
      if (event.key === "Enter" && trimmedQuery.length >= MIN_QUERY_LENGTH) {
        event.preventDefault();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) => Math.min(current + 1, results.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && highlightIndex >= 0) {
      event.preventDefault();
      selectCard(results[highlightIndex]);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fast-card-search" className="text-sm font-medium">
          Search cards
        </label>
        <input
          ref={inputRef}
          id="fast-card-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pikachu, 58/102, Umbreon VMAX Evolving Skies…"
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="fast-card-search-results"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Use arrow keys to navigate results, Enter to select. Press{" "}
          <kbd className="rounded border px-1">/</kbd> or{" "}
          <kbd className="rounded border px-1">Ctrl+K</kbd> to focus search.
        </p>
      </div>

      {recentSearches.length > 0 && trimmedQuery.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((recent) => (
            <button
              key={recent}
              type="button"
              onClick={() => setQuery(recent)}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              {recent}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-zinc-500" role="status" aria-live="polite">
          Searching…
        </p>
      ) : null}

      {searchError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {searchError}
        </p>
      ) : null}

      {hasSearched &&
      !isLoading &&
      !searchError &&
      trimmedQuery.length >= MIN_QUERY_LENGTH &&
      results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No cards found. Try a shorter name, card number, or set name.
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul id="fast-card-search-results" className="max-h-[28rem] space-y-2 overflow-y-auto">
          {results.map((card, index) => {
            const isHighlighted = index === highlightIndex;

            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => selectCard(card)}
                  aria-selected={isHighlighted}
                  className={`flex w-full min-h-11 gap-3 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100 ${
                    isHighlighted
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  {card.images.small ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.images.small}
                      alt=""
                      className="h-16 w-11 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800">
                      ?
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{card.name}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {card.set.name || "Unknown set"}
                      {card.number ? ` · #${card.number}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
