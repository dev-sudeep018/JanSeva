import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSavedReferences,
  suggestCategory,
} from "../janseva-premium/features.js";

test("suggests the most relevant civic service from resident language", () => {
  assert.equal(
    suggestCategory("The street light and lamp near our road are both dark")
      .category,
    "Street Lighting",
  );
  assert.equal(
    suggestCategory("An overflowing garbage bin has not been collected")
      .category,
    "Sanitation & Waste",
  );
  assert.equal(suggestCategory("hello"), null);
});

test("normalizes, validates and deduplicates device-saved references", () => {
  assert.deepEqual(
    normalizeSavedReferences([
      "jsv-2026-ab12",
      "JSV-2026-AB12",
      "not-a-reference",
      42,
    ]),
    ["JSV-2026-AB12"],
  );
});
