# Thanarak Portfolio

Astro portfolio site with React islands, GSAP scroll choreography, and video-driven sections.

## Stack

- Astro 4
- React 18
- GSAP + ScrollTrigger
- Lenis
- Playwright for smoke testing

## Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4321` when running the Playwright setup below, or use the URL printed by Astro in normal development.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test:e2e
```

## Project Structure

- `src/pages/` page entrypoints
- `src/components/` React motion and UI components
- `src/layouts/` shared Astro layouts
- `src/lib/` utilities and scroll helpers
- `public/assets/` static media served directly
- `project/` prototypes and source material

## Testing

Playwright runs a local smoke test against the portfolio homepage:

```bash
npm run test:e2e
```

The test boots the Astro dev server automatically and verifies core navigation and contact links.
