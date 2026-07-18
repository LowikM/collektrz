import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeRecognitionText } from "./normalize-recognition.ts";

describe("normalize-recognition", () => {
  it("extracts name, number, and set from OCR-like text", () => {
    const normalized = normalizeRecognitionText(
      "Charizard\nBase Set\n4 / 102\nHP 120",
    );

    assert.equal(normalized.extractedNumber, "4/102");
    assert.ok(normalized.extractedName?.includes("Charizard"));
  });

  it("handles combined collector queries", () => {
    const normalized = normalizeRecognitionText("Pikachu 58/102 Base Set");

    assert.match(normalized.extractedName ?? "", /Pikachu/i);
    assert.equal(normalized.extractedNumber, "58/102");
  });
});
