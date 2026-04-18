/**
 * Tiny test bootstrapper.
 *
 * `node --test` + `ts-node/esm` is still flaky on Node 22, so we take the
 * simpler path: require ts-node's CJS loader, import each *.test.ts file so
 * its `test()` calls register with `node:test`, and then let the runner flush
 * results.
 */
import { run } from "node:test";
import { tap } from "node:test/reporters";
import * as fs from "node:fs";
import * as path from "node:path";

const TEST_DIR = path.resolve(__dirname, "..", "src");

const findTestFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findTestFiles(full));
    } else if (entry.isFile() && /\.test\.ts$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

const files = findTestFiles(TEST_DIR);

run({ files, concurrency: false })
  .on("test:fail", () => {
    process.exitCode = 1;
  })
  .compose(tap)
  .pipe(process.stdout);
