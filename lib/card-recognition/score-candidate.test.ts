import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deduplicateCandidates,
  normalizeCardNameForMatch,
  scoreCandidate,
  tokenOverlapScore,
} from "./score-candidate.ts";

describe("score-candidate", () => {
  const card = {
    id: "base1-4",
    name: "Charizard",
    number: "4/102",
    set: { id: "base1", name: "Base Set" },
    images: { small: "https://example.com/charizard.png" },
  };

  it("ranks exact number and name strongly", () => {
    const scored = scoreCandidate(
      card,
      {
        extractedName: "Charizard",
        extractedNumber: "4/102",
        extractedSetHint: "Base Set",
      },
      { cardName: "Charizard", setName: "Base Set", cardNumber: null },
    );

    assert.ok(scored.confidence >= 0.75);
    assert.ok(scored.reasons.some((reason) => reason.includes("number")));
  });

  it("penalizes same number in a different set when set hint conflicts", () => {
    const wrongSet = scoreCandidate(
      {
        ...card,
        set: { id: "swsh", name: "Evolving Skies" },
      },
      {
        extractedName: "Charizard",
        extractedNumber: "4/102",
        extractedSetHint: "Base Set",
      },
      { cardName: "Charizard", setName: "Base Set", cardNumber: null },
    );

    const rightSet = scoreCandidate(
      card,
      {
        extractedName: "Charizard",
        extractedNumber: "4/102",
        extractedSetHint: "Base Set",
      },
      { cardName: "Charizard", setName: "Base Set", cardNumber: null },
    );

    assert.ok(rightSet.confidence > wrongSet.confidence);
  });

  it("caps weak name-only matches", () => {
    const scored = scoreCandidate(
      card,
      { extractedName: "Char" },
      { cardName: "Char", setName: null, cardNumber: null },
    );

    assert.ok(scored.confidence <= 0.55);
  });

  it("deduplicates candidates by card id", () => {
    const deduped = deduplicateCandidates([
      {
        cardId: "x",
        name: "A",
        setName: "Set",
        number: "1/100",
        imageUrl: "",
        confidence: 0.5,
        reasons: [],
      },
      {
        cardId: "x",
        name: "A",
        setName: "Set",
        number: "1/100",
        imageUrl: "",
        confidence: 0.8,
        reasons: [],
      },
    ]);

    assert.equal(deduped.length, 1);
    assert.equal(deduped[0]?.confidence, 0.8);
  });

  it("scores token overlap sensibly", () => {
    assert.ok(
      tokenOverlapScore("Umbreon VMAX", "Umbreon VMAX Alternate Art") >= 0.5,
    );
    assert.ok(normalizeCardNameForMatch("Pikachu V") === "pikachu v");
  });
});
