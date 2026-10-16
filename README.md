# Void: encoded Next.js static asset paths

Minimal reproduction of a static asset lookup failure on Void Cloud. A Next.js dynamic page emits a JavaScript filename containing brackets. Requesting that file with literal brackets returns JavaScript; requesting the equivalent URL with `%5B` and `%5D` returns the HTML fallback.

**[Live reproduction](https://void-nextjs-encoded-paths.void.app/package/demo)**

The page should show `Package: demo`. It remains at `Package: loading`, and the browser console reports `SyntaxError: Unexpected token '<'` for the page's JavaScript chunk.

## Versions

- Node.js: `24.22.0`
- Next.js: `13.5.11` (Pages Router, `output: 'export'`)
- React: `18.3.1`
- Void CLI: `1.1.11`
- Target: Void Cloud, `https://api.void.cloud`
- Reproduced on October 17, 2026 (Asia/Singapore)

The Next.js version matches the application where the issue first occurred. This repository contains two pages, no application dependencies beyond Next.js and React, and no backend.

## Reproduce

Use Node.js `24.22.0` and its bundled npm, then run:

```sh
npm ci
npm run build
npm run void -- connect https://api.void.cloud
npm run void -- deploy --platform void --project your-unique-project --dir out
npm run check -- https://your-unique-project.void.app
```

`check` finds the generated dynamic-page chunk in `out/`. It requests both the literal and encoded URLs and compares each response with the exported JavaScript. It exits with status `1` when either response differs.

Open `/package/demo` on the deployed site to see the browser failure. The home page also includes a `next/link` navigation to that route.

## Expected and actual results

Both URLs identify the same exported file and should return its JavaScript bytes with status `200`.

Observed on Void Cloud:

| Request                                                                | Status | Content type      | Matches exported JavaScript |
| ---------------------------------------------------------------------- | ------ | ----------------- | --------------------------- |
| `/_next/static/chunks/pages/package/[...slug]-4f0619cf32290712.js`     | `200`  | `text/javascript` | Yes                         |
| `/_next/static/chunks/pages/package/%5B...slug%5D-4f0619cf32290712.js` | `200`  | `text/html`       | No                          |

The encoded request returns a body starting with `<!DOCTYPE html>`. The chunk hash can change between builds; the check script discovers it automatically. See [the captured Void responses](evidence/void.txt).

The configured `/package/*` rewrite successfully serves `package/[...slug].html`. Loading the page's JavaScript fails afterward. These results point to encoded static asset path handling; they do not identify the exact internal cause.

## Local control

Serve the same exported files with Python's static server:

```sh
python3 -m http.server 4317 --bind 127.0.0.1 --directory out
```

In another terminal:

```sh
npm run check -- http://127.0.0.1:4317
```

Both asset requests return the expected JavaScript, and the command exits with status `0`. See [the captured local responses](evidence/local.txt). This control checks the asset URLs directly; Python's server does not apply the HTML route rewrite.

## Workaround

Add this rule before the page rewrite in `void.config.ts`:

```ts
routing: {
  rewrites: {
    '/_next/static/chunks/pages/package/%5B...slug%5D-*':
      '/_next/static/chunks/pages/package/[...slug]-:splat',
    '/package/*': '/package/[...slug].html',
  },
  fallbacks: {
    '/*': '/index.html',
  },
}
```

The repository deliberately omits this workaround so the failure remains reproducible. The same workaround restores dynamic-page loading in [cnpm/cnpmweb#136](https://github.com/cnpm/cnpmweb/pull/136).

The configuration follows Void's [static site deployment](https://void.cloud/guide/app-types#pre-built-static-sites) and [routing configuration](https://void.cloud/reference/config) documentation. The fallback makes the asset miss return HTML.
