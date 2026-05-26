# Repository Guidelines

## Project Structure & Module Organization

This is an Astro portfolio site with React islands. Primary source lives in `src/`: pages in `src/pages/`, shared UI in `src/components/`, layouts in `src/layouts/`, utilities and content data in `src/lib/`, and global styles in `src/styles/global.css`.

Static media belongs in `public/assets/`. End-to-end tests live in `tests/`. `project/` contains reference prototypes and source media; avoid changing it unless the task targets those files. `dist/` and `.astro/` are generated output; do not edit them by hand.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the Astro development server for local work.
- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the built site locally.
- `npm run test:e2e` runs the Playwright end-to-end suite.

Use `npm run build` as baseline verification, and run `npm run test:e2e` when routes, navigation, content visibility, or user-facing behavior changes.

## Coding Style & Naming Conventions

Use the existing Astro, TypeScript, React, and CSS patterns in `src/`. Keep two-space indentation. Name Astro layouts and React components with `PascalCase` filenames, such as `Base.astro` and `HeroClip.tsx`. Use `camelCase` for functions, variables, hooks, and utilities.

Keep components focused and place behavior near the feature it supports. Prefer package-managed dependencies over pasted third-party scripts. No formatter or lint script is configured, so match the surrounding style.

## Testing Guidelines

Playwright is the configured test framework. Test files live in `tests/` and use the `*.spec.ts` naming pattern. Existing tests assert the homepage title, navigation, key headings, and contact link.

For UI, animation, or scroll changes, verify desktop and mobile widths and confirm media loads from `public/assets/`. Add or update Playwright tests for critical visible behavior. No coverage threshold is configured.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style messages, for example `feat: rebuild focus + books + contact sections` and `fix: separate head reveal`. Use `feat:`, `fix:`, `chore:`, `docs:`, or `test:` with a concise imperative summary.

Pull requests should include a short summary, verification steps, and screenshots or recordings for visible UI changes. Mention new large media assets and affected routes.

## Security & Configuration Tips

Do not commit secrets, local environment files, or private credentials. Only place files in `public/assets/` when they are intended to be public. Review third-party analytics, embeds, or scripts carefully before adding them.
