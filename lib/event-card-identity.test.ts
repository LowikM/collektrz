import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cardsShareIdentity,
  getEventCardIdentityKey,
  isExactTcgIdentityMatch,
  normalizeCardRef,
} from "./event-card-identity.ts";

describe("event card identity", () => {
  it("matches identical tcg_api_card_id", () => {
    assert.equal(
      cardsShareIdentity(
        { tcg_api_card_id: "base1-58", card_ref: "pika-a" },
        { tcg_api_card_id: "base1-58", card_ref: "pika-b" },
      ),
      true,
    );
  });

  it("does not match same card name across different sets", () => {
    assert.equal(
      cardsShareIdentity(
        { tcg_api_card_id: null, card_ref: "set-a:pikachu-58" },
        { tcg_api_card_id: null, card_ref: "set-b:pikachu-58" },
      ),
      false,
    );
  });

  it("does not match on card name alone", () => {
    assert.equal(
      cardsShareIdentity(
        { tcg_api_card_id: null, card_ref: null },
        { tcg_api_card_id: null, card_ref: null },
      ),
      false,
    );
  });

  it("normalizes card_ref for fallback matching", () => {
    assert.equal(
      cardsShareIdentity(
        { tcg_api_card_id: null, card_ref: " Set-A:Pikachu " },
        { tcg_api_card_id: null, card_ref: "set-a:pikachu" },
      ),
      true,
    );
  });

  it("prefers tcg identity key over card_ref", () => {
    assert.equal(getEventCardIdentityKey({ tcg_api_card_id: "xy1-42", card_ref: "x" }), "tcg:xy1-42");
  });

  it("detects exact tcg matches only when both sides have ids", () => {
    assert.equal(
      isExactTcgIdentityMatch(
        { tcg_api_card_id: "a", card_ref: "ref-a" },
        { tcg_api_card_id: null, card_ref: "ref-a" },
      ),
      false,
    );
  });

  it("normalizeCardRef returns null for empty values", () => {
    assert.equal(normalizeCardRef("   "), null);
    assert.equal(normalizeCardRef(undefined), null);
  });
});
