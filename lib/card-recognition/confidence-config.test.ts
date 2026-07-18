import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  limitCandidatesForConfidence,
  resolveConfidenceLevel,
} from "./confidence-config.ts";

describe("confidence-config", () => {
  it("returns none when there are no candidates", () => {
    assert.equal(
      resolveConfidenceLevel({ topConfidence: 0.9, candidateCount: 0 }),
      "none",
    );
  });

  it("returns high for strong isolated matches", () => {
    assert.equal(
      resolveConfidenceLevel({
        topConfidence: 0.82,
        candidateCount: 2,
        secondConfidence: 0.55,
      }),
      "high",
    );
  });

  it("returns medium for plausible but ambiguous matches", () => {
    assert.equal(
      resolveConfidenceLevel({
        topConfidence: 0.62,
        candidateCount: 3,
        secondConfidence: 0.58,
      }),
      "medium",
    );
  });

  it("returns low for weak matches", () => {
    assert.equal(
      resolveConfidenceLevel({
        topConfidence: 0.48,
        candidateCount: 2,
        secondConfidence: 0.44,
      }),
      "low",
    );
  });

  it("limits candidate counts by confidence level", () => {
    const candidates = [{ id: 1 }, { id: 2 }, { id: 3 }];
    assert.equal(limitCandidatesForConfidence(candidates, "high").length, 1);
    assert.equal(limitCandidatesForConfidence(candidates, "medium").length, 3);
    assert.equal(limitCandidatesForConfidence(candidates, "none").length, 0);
  });
});
