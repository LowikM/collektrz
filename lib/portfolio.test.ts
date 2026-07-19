import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildPortfolioData,
  normalizePortfolioRow,
  type PortfolioCollectionRow,
} from "./portfolio.ts";
import {
  safeCardRef,
  safeCreatedAt,
  safeItemKind,
  safeQuantity,
} from "./portfolio-normalize.ts";

describe("portfolio normalization", () => {
  it("safeQuantity handles null and string values", () => {
    assert.equal(safeQuantity(null), 0);
    assert.equal(safeQuantity("3"), 3);
    assert.equal(safeQuantity("-1"), 0);
  });

  it("safeItemKind defaults unknown values to card", () => {
    assert.equal(safeItemKind(null), "card");
    assert.equal(safeItemKind("weird"), "card");
    assert.equal(safeItemKind("sealed"), "sealed");
  });

  it("safeCardRef never throws on null", () => {
    assert.equal(safeCardRef(null), "unknown-ref");
  });

  it("safeCreatedAt falls back to epoch for invalid dates", () => {
    assert.equal(typeof safeCreatedAt(null), "string");
    assert.equal(Number.isNaN(Date.parse(safeCreatedAt("not-a-date"))), false);
  });
});

describe("buildPortfolioData", () => {
  const base = normalizePortfolioRow({
    id: "item-1",
    item_kind: "card",
    card_name: "Pikachu",
    card_ref: "pika-001",
    set_name: null,
    condition: null,
    notes: null,
    quantity: 1,
    tcg_api_card_id: null,
    image_url: null,
    visibility: "private",
    is_featured: false,
    created_at: "2026-01-01T00:00:00.000Z",
  });

  it("handles empty collection", () => {
    const data = buildPortfolioData([], null, null);
    assert.equal(data.totals.totalItems, 0);
    assert.equal(data.totals.wishlistCount, null);
    assert.equal(data.totals.activeListingsCount, null);
  });

  it("handles null condition, notes, set_name, and string quantity", () => {
    const item = normalizePortfolioRow({
      ...base,
      set_name: null,
      condition: null,
      notes: null,
      quantity: "2",
      item_kind: "weird",
    });

    assert.doesNotThrow(() => buildPortfolioData([item], 0, 0));
    const data = buildPortfolioData([item], 0, 0);
    assert.equal(data.totals.totalQuantity, 2);
    assert.equal(data.totals.cards, 1);
  });

  it("keeps optional counts null when unavailable", () => {
    const data = buildPortfolioData([base], null, null);
    assert.equal(data.totals.wishlistCount, null);
    assert.equal(data.totals.activeListingsCount, null);
  });

  it("deduplicates by card_ref when tcg_api_card_id is null", () => {
    const duplicate = normalizePortfolioRow({
      ...base,
      id: "item-2",
    });

    const data = buildPortfolioData([base, duplicate], 0, 0);
    assert.equal(data.totals.totalItems, 2);
    assert.equal(data.totals.uniqueItems, 1);
  });
});

describe("normalizePortfolioRow", () => {
  it("never throws on sparse rows", () => {
    assert.doesNotThrow(() =>
      normalizePortfolioRow({
        card_name: null,
        card_ref: null,
        quantity: null,
        item_kind: null,
        created_at: null,
      } as Record<string, unknown>),
    );
  });
});
