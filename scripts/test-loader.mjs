// Boots ts-node's ESM-compatible loader so `node --test` can execute .test.ts
// files directly without a separate build step. Keeps the test runner
// zero-dependency (node's built-in `node:test` + `node:assert`).
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("./"));
