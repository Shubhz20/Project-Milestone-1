import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * Sanity check that verifies the custom test runner (scripts/test.ts) can
 * load a TypeScript test file, execute an assertion, and surface results
 * through the TAP reporter.
 */
test("test runner smoke check", () => {
  assert.equal(1 + 1, 2);
  assert.ok("typescript tests run".length > 0);
});
