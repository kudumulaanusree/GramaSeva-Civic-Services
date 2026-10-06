# GramaSeva

Multilingual citizen-services guide for discovering sample government schemes, checking initial eligibility, and finding application guidance.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/gramaseva run dev` — run the web app (workflow supplies `PORT` and `BASE_PATH`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- API state is stored in SQLite under `artifacts/api-server/.data/` by default.
- API environment: `SESSION_SECRET`; optional `GRAMASEVA_ADMIN_PASSWORD`, `GRAMASEVA_DATA_DIR`, and `CORS_ORIGIN`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: SQLite through Node.js `node:sqlite`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/gramaseva` — React/Vite citizen-facing application.
- `artifacts/api-server` — Express API and SQLite-backed scheme data.
- `lib/api-spec/openapi.yaml` — source-of-truth API contract.
- `lib/api-client-react` and `lib/api-zod` — generated client hooks and validation.

## Architecture decisions

- Demo scheme records intentionally have no application URLs; only HTTPS Indian government domains are accepted as official links in admin edits.
- Admin sign-in is a demo-only password login with a salted scrypt hash and a short-lived signed cookie.

## Product

- The app supports scheme discovery, translated scheme summaries, eligibility guidance, database-backed assistant search, accessibility controls, and demo admin CRUD.

## User preferences

- Keep scheme data clearly identified as sample/demo content unless it has been verified against a current official source.

## Gotchas

- Node 24 includes `node:sqlite`; the API creates and seeds its database at startup, and generated API types must be refreshed after OpenAPI changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
