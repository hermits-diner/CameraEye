// Orval's zod client emits zod v4 API calls (e.g. `zod.email()`) but always
// imports from the package root, which resolves to the v3 API in zod 3.25.x.
// Rewrite generated imports to the "zod/v4" subpath (same convention as
// lib/db). Run right after `orval` in the codegen script.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const generatedDir = fileURLToPath(
  new URL("../api-zod/src/generated", import.meta.url),
);

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".ts")) {
      const source = readFileSync(full, "utf8");
      const fixed = source.replace(/from (["'])zod\1/g, "from $1zod/v4$1");
      if (fixed !== source) writeFileSync(full, fixed);
    }
  }
}

walk(generatedDir);
console.log("fixed zod imports to zod/v4 in", generatedDir);
