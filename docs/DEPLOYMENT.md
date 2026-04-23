# Deployment

mmmunchers is a pure static site. `npm run build` emits a `dist/public/` directory that you can host on any static host.

## Build

```bash
npm install
npm run build
```

Output: `dist/public/` (HTML, JS, CSS, textures, fonts, sounds, 3D geometries).

No environment variables. No backend. No database.

## Vercel

A `vercel.json` is included. Import the repo in Vercel and it will pick up the config — the build command is `vite build` and the output directory is `dist/public`.

The SPA rewrite (`/(.*)` → `/`) is already configured.

## Netlify

A `netlify.toml` is included. Connect the repo and Netlify will use it: `npm run build` → `dist/public`, with a catch-all redirect to `index.html`.

## GitHub Pages

```bash
npm run build
# push dist/public to a gh-pages branch, or use a GitHub Action
```

If you host at a sub-path (e.g. `username.github.io/mmmunchers`), set `base` in `vite.config.ts` accordingly:

```ts
export default defineConfig({
  base: '/mmmunchers/',
  // ...
})
```

## Cloudflare Pages / S3 / anywhere else

Anything that serves a directory works. Point the host at `dist/public` and add a catch-all rewrite to `index.html` so client routing works on refresh.

## Local preview

```bash
npm run preview
```

Serves the built `dist/public/` at http://localhost:4173.
