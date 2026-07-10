# Repository Guidelines

## Project Structure & Module Organization

This is an Astro portfolio site with React islands. Application code is in `src/`: routes in `src/pages/`, reusable UI in `src/components/`, layouts in `src/layouts/`, data and utilities in `src/lib/`, and styles in `src/styles/`.

Put public images and video in `public/assets/`. Playwright tests live in `tests/`. `project/` holds reference prototypes and source media; change it only when a task explicitly targets it. Never hand-edit generated `dist/` or `.astro/` files.

## Build, Test, and Development Commands

- `npm install` installs the lockfile-pinned dependencies.
- `npm run dev` starts Astro’s local development server.
- `npm run build` produces the production site in `dist/`.
- `npm run preview` serves the built site for a production check.
- `npm run test:e2e` runs the Playwright browser suite.

Run `npm run build` for every change. Also run `npm run test:e2e` after changes to routes, navigation, visible content, scrolling, or animation.

## Coding Style & Naming Conventions

Follow the existing Astro, TypeScript, React, and CSS patterns in `src/`, with two-space indentation. Use `PascalCase` filenames for components and layouts (for example, `HeroClip.tsx` and `Base.astro`) and `camelCase` for functions, variables, hooks, and utilities.

Keep components focused and place behavior close to its feature. Prefer package-managed dependencies to pasted third-party scripts. No formatter or lint command is configured; match nearby code.

## Testing Guidelines

Playwright is the configured test framework. Add browser tests in `tests/` with the `*.spec.ts` suffix. The existing suite covers the homepage title, navigation, headings, and contact link.

For UI, animation, or scroll changes, verify both desktop and mobile widths and ensure media resolves from `public/assets/`. Add or update a test for critical user-visible behavior. No coverage threshold is configured.

## Commit & Pull Request Guidelines

Use Conventional Commit-style subjects, such as `feat: add case deck` or `fix: correct hero reveal`. Prefer `feat:`, `fix:`, `chore:`, `docs:`, or `test:` followed by a concise imperative summary.

Pull requests need a concise summary and verification steps. Include screenshots or a recording for visible changes, and call out affected routes and any new large media assets.

## Security & Configuration Tips

Do not commit secrets, local environment files, or private credentials. Only place files in `public/assets/` when they are intended to be public. Review third-party analytics, embeds, or scripts carefully before adding them.
