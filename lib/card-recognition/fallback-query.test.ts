import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildFallbackSearchQuery, splitFallbackHints } from "./fallback-query.ts";

describe("fallback-query", () => {
  it("prefers structured hints over raw OCR text", () => {
    const query = buildFallbackSearchQuery({
      extractedName: "Pikachu",
      extractedNumber: "58/102",
      extractedSetHint: "Base Set",
      rawText: "noise line noise",
    });

    assert.equal(query, "Pikachu 58/102 Base Set");
  });

  it("splits fallback hints for manual search", () => {
    const hints = splitFallbackHints({
      extractedName: "Umbreon VMAX",
      extractedNumber: "215/203",
      extractedSetHint: "Evolving Skies",
    });

    assert.equal(hints.name, "Umbreon VMAX");
    assert.equal(hints.number, "215/203");
    assert.equal(hints.setHint, "Evolving Skies");
    assert.match(hints.query, /Umbreon VMAX/);
  });
});
