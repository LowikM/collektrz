import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  collectorNumbersMatch,
  extractCardNumberFromText,
  parseCollectorNumber,
} from "./card-number.ts";

describe("card-number", () => {
  it("normalizes padded and unpadded collector numbers", () => {
    assert.equal(parseCollectorNumber("058/102")?.primary, "58");
    assert.equal(parseCollectorNumber("4/102")?.primary, "4");
  });

  it("matches numbers across padding differences", () => {
    assert.equal(collectorNumbersMatch("058/102", "58/102"), true);
    assert.equal(collectorNumbersMatch("4/102", "004/102"), true);
  });

  it("rejects different set totals when both are present", () => {
    assert.equal(collectorNumbersMatch("58/102", "58/165"), false);
  });

  it("extracts embedded card numbers from OCR text", () => {
    assert.equal(extractCardNumberFromText("Pikachu 58 / 102"), "58/102");
  });
});
