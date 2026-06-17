# Repository Guidelines

## Project Structure & Module Organization

This is a React 18, TypeScript, and Vite web client for QLNVKHNew. Application code lives in `src/`. Key areas are `src/app` for pages, routing, shared components, and feature modules; `src/services` for API calls; `src/models` and `src/types` for domain and global types; `src/redux` for global state, sagas, and persistence; `src/hooks` for reusable hooks; `src/utils` for shared helpers such as `baseAPI`; and `src/_metronic` for the Metronic layout. Static public files belong in `public/`; imported assets belong in `src/assets/`. Build output in `dist/` is generated and should not be edited.

## Build, Test, and Development Commands

Use pnpm for dependency and script execution.

- `pnpm dev`: start the Vite development server on `http://localhost:3011`.
- `pnpm build`: run TypeScript checking, then create a production build.
- `pnpm build:haiphong`: build with the `haiphong` Vite mode.
- `pnpm lint`: run ESLint across TypeScript and TSX files with zero warnings allowed.
- `pnpm preview`: serve the latest production build locally.

## Coding Style & Naming Conventions

Prettier is configured for 2-space indentation, semicolons, single quotes, `arrowParens: avoid`, and a 150-character print width. ESLint uses `eslint:recommended`, `@typescript-eslint/recommended`, React Hooks rules, and React Refresh checks. Prefer the `@` alias for `src` imports, for example `import { requestGET } from '@/utils/baseAPI'`.

Use `PascalCase` for React components, `useCamelCase` for hooks, and descriptive feature-oriented names such as `useProjectActions`. Keep feature folders and route segments in kebab-case where practical.

## Testing Guidelines

No test script or test runner is currently configured in `package.json`. For now, validate changes with `pnpm lint` and `pnpm build`, and manually exercise the affected workflow through `pnpm dev`. If tests are added, place them near the feature they cover and use `*.test.ts` or `*.test.tsx` naming.

## Commit & Pull Request Guidelines

Recent history mostly uses Conventional Commit-style messages such as `feat: ...` and `feat(frontend): ...`. Keep commits concise and scoped, for example `fix(auth): handle expired token redirect`.

Pull requests should include a short summary, affected modules, validation performed, linked issue or task ID when available, and screenshots or screen recordings for UI changes.

## Security & Configuration Tips

Environment files such as `.env`, `.env.development`, `.env.development.local`, and `.env.haiphong` control runtime configuration. Do not commit secrets or machine-specific credentials. Prefer existing API helpers in `src/utils/baseAPI` and service files under `src/services` instead of duplicating request logic.
