# Repository Guidelines

## Project Structure & Module Organization

This is an Astro portfolio site with React islands. Primary source lives in `src/`: pages in `src/pages/`, UI in `src/components/`, layouts in `src/layouts/`, utilities in `src/lib/`, and global styling in `src/styles/global.css`. Static media belongs in `public/assets/`. `project/` contains prototypes, legacy HTML, and source media; treat it as reference unless a task targets it. `dist/` is generated output; do not edit it by hand.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the local Astro development server.
- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the built site.

No `npm test`, lint, or format script is configured. Use `npm run build` as baseline verification.

## Coding Style & Naming Conventions

Use the TypeScript, Astro, and React patterns already present in `src/`. Name React components and Astro layouts with `PascalCase` filenames, such as `HeroClip.tsx` and `Base.astro`. Use `camelCase` for functions, variables, and utility exports. Keep components focused and use two-space indentation in Astro, TSX, CSS, and config files.

## Testing Guidelines

For functional changes, run `npm run build` and inspect the affected route in `npm run dev` or `npm run preview`. For animation or scroll behavior, test desktop and mobile widths and confirm media loads from `public/assets/`. If tests are added later, place them near the component or under `tests/`, and add `npm test`.

## Commit & Pull Request Guidelines

This checkout does not expose Git history, so use Conventional Commit-style messages: `feat: add portfolio section`, `fix: correct scroll trigger`, or `chore: update assets`. PRs should include a summary, verification steps, and screenshots or recordings for visible UI changes. Mention new large media files.

## Agent & Model Routing

Use sidecar agents for non-trivial UI, motion, build, security, or review work. Keep ownership narrow and avoid duplicate work.

| Task | Model |
| --- | --- |
| Easy bounded checks | `gpt-5.4-mini` |
| Normal multi-file work | `gpt-5.4` |
| Complex or high-risk work | strongest available |

Do not delegate the blocking step; review diffs and verification locally before finalizing.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep public media in `public/assets/` only when it is intended to be web-accessible. Validate third-party scripts or analytics additions, and prefer package-managed dependencies over pasted external code.
