import { isGradedCondition } from "@/lib/portfolio-normalize";

export type CollectionListFilters = {
  kind?: "card" | "sealed";
  set?: string;
  visibility?: "public" | "private";
  graded?: boolean;
  excludeGraded?: boolean;
};

export type FilterableCollectionItem = {
  item_kind: "card" | "sealed";
  set_name: string | null;
  condition: string | null;
  visibility: "public" | "private";
};

export function filterCollectionItems<T extends FilterableCollectionItem>(
  items: T[],
  filters: CollectionListFilters,
): T[] {
  return items.filter((item) => {
    if (filters.kind && item.item_kind !== filters.kind) {
      return false;
    }

    if (filters.visibility && item.visibility !== filters.visibility) {
      return false;
    }

    if (filters.set) {
      const normalized = item.set_name?.trim() ?? "";
      if (normalized !== filters.set) {
        return false;
      }
    }

    const graded = isGradedCondition(item.condition);

    if (filters.graded && !graded) {
      return false;
    }

    if (filters.excludeGraded && graded) {
      return false;
    }

    return true;
  });
}

export function parseCollectionListFilters(searchParams: {
  kind?: string;
  set?: string;
  visibility?: string;
  graded?: string;
  raw?: string;
}): CollectionListFilters {
  const filters: CollectionListFilters = {};

  if (searchParams.kind === "card" || searchParams.kind === "sealed") {
    filters.kind = searchParams.kind;
  }

  if (searchParams.set?.trim()) {
    filters.set = searchParams.set.trim();
  }

  if (searchParams.visibility === "public" || searchParams.visibility === "private") {
    filters.visibility = searchParams.visibility;
  }

  if (searchParams.graded === "1") {
    filters.graded = true;
  }

  if (searchParams.raw === "1") {
    filters.excludeGraded = true;
    filters.kind = filters.kind ?? "card";
  }

  return filters;
}

export function hasActiveCollectionFilters(filters: CollectionListFilters): boolean {
  return Boolean(
    filters.kind ||
      filters.set ||
      filters.visibility ||
      filters.graded ||
      filters.excludeGraded,
  );
}

export function describeCollectionFilters(filters: CollectionListFilters): string {
  const parts: string[] = [];

  if (filters.graded) {
    parts.push("graded");
  } else if (filters.excludeGraded) {
    parts.push("raw cards");
  } else if (filters.kind === "card") {
    parts.push("cards");
  } else if (filters.kind === "sealed") {
    parts.push("sealed");
  }

  if (filters.set) {
    parts.push(`set: ${filters.set}`);
  }

  if (filters.visibility) {
    parts.push(filters.visibility);
  }

  return parts.join(" · ");
}

export function buildCollectionFilterHref(filters: {
  kind?: "card" | "sealed";
  set?: string;
  visibility?: "public" | "private";
  graded?: boolean;
  raw?: boolean;
}): string {
  const params = new URLSearchParams();
  params.set("view", "collection");

  if (filters.kind) {
    params.set("kind", filters.kind);
  }

  if (filters.set) {
    params.set("set", filters.set);
  }

  if (filters.visibility) {
    params.set("visibility", filters.visibility);
  }

  if (filters.graded) {
    params.set("graded", "1");
  }

  if (filters.raw) {
    params.set("raw", "1");
  }

  return `/my-collection?${params.toString()}`;
}
