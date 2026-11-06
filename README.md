# Harini & Kevin — Wedding Invitation

Static React + Vite site. Requires Node.js `>=22.12.0`.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
npm run preview  # serve the built dist/ locally
```

Page content lives in `app/page.tsx`, styles in `app/globals.css`, images in `public/assets/`.

## Deploying

`npm run build` produces a plain static `dist/` folder. Upload it to any static
host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, etc.) with build
command `npm run build` and output directory `dist`.

## Guest links

Six Vercel projects, all building this repo, each with two environment variables:

| Link | `VITE_SIDE` | `VITE_INVITE` | Shows |
|---|---|---|---|
| Bride · pre-wedding + wedding + reception | `bride` | `prewedding-wedding-reception` | Bash, wedding, reception |
| Bride · wedding + reception | `bride` | `wedding-reception` | Wedding, reception |
| Bride · reception | `bride` | `reception` | Reception |
| Groom · pre-wedding + wedding + reception | `groom` | `prewedding-wedding-reception` | Bash, wedding, reception |
| Groom · wedding + reception | `groom` | `wedding-reception` | Wedding, reception |
| Groom · reception | `groom` | `reception` | Reception |

The side sets whose name and parents come first and the side-specific details
(bash hosts, baraat time, calendar files). Events a link isn't invited to are
left out of its build entirely, along with their calendar files and media.

With neither variable set (local dev, the test deployment) every version is
reachable from one build: `?side=bride|groom` and `?invite=prewedding-wedding-reception|wedding-reception|reception`.
