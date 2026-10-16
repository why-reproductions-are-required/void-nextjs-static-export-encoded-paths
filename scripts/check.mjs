import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const base = process.argv[2];
assert(base, "Usage: npm run check -- https://your-site.example");

const directory = "out/_next/static/chunks/pages/package";
const file = (await readdir(directory)).find((name) =>
  name.startsWith("[...slug]-"),
);
assert(file, "Run npm run build first.");
const expected = await readFile(`${directory}/${file}`, "utf8");
let failed = false;

for (const name of [file, encodeURIComponent(file)]) {
  const path = `/_next/static/chunks/pages/package/${name}`;
  const response = await fetch(new URL(path, base));
  const body = await response.text();
  const matches = body === expected;
  console.log(
    JSON.stringify(
      {
        path,
        status: response.status,
        contentType: response.headers.get("content-type"),
        matchesExportedJavaScript: matches,
        bodyStart: body.slice(0, 100),
      },
      null,
      2,
    ),
  );
  if (response.status !== 200 || !matches) failed = true;
}

process.exitCode = failed ? 1 : 0;
