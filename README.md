# GramaSeva

GramaSeva is a multilingual citizen-services guide for rural residents. It helps people discover sample government-scheme information, compare basic details, get initial eligibility guidance, and find local application support.

## Features

- Scheme search by name, category, description, or keywords
- Category browsing and scheme details
- English, Telugu, and Hindi interface with translated scheme summaries for seeded records
- Multi-step eligibility guidance that ranks potentially relevant schemes
- Database-backed assistant search in English, Telugu, and Hindi
- Browser speech-to-text and text-to-speech when supported
- Accessible text-size and contrast controls
- Report-outdated-information form
- Demo admin login and scheme create, update, and deactivate actions
- SQLite storage with parameterized statements
- REST API documented in `lib/api-spec/openapi.yaml`

All seeded scheme records are marked as demo information. They do not include application URLs. Eligibility results are guidance only; confirm current rules and services with the responsible government department.

## Tech stack

- React, Vite, TypeScript, Tailwind CSS
- Wouter routing, TanStack Query, Lucide icons
- Node.js 24, Express 5, Helmet
- SQLite using Node's built-in `node:sqlite` module
- OpenAPI contract with generated TypeScript and Zod clients

## Folder structure

```text
artifacts/
  gramaseva/             React web application
  api-server/            Express REST API
lib/
  api-spec/               OpenAPI source contract
  api-client-react/       Generated React Query API hooks
  api-zod/                Generated request/response validation schemas
attached_assets/          Original project brief
```

## Requirements

- Node.js 24 or newer
- pnpm 10+

Install workspace dependencies from the project root:

```bash
pnpm install
```

## Environment variables

Copy `.env.example` for reference. Replit workflows provide `PORT` and the web app's `BASE_PATH` automatically. For local API runs, provide:

- `PORT` — API listen port (typically `5000`)
- `SESSION_SECRET` — random value used to sign the demo admin session cookie
- `GRAMASEVA_ADMIN_PASSWORD` — optional demo admin password. In development only, the default is `seva-demo`; set your own value before publishing.
- `GRAMASEVA_DATA_DIR` — optional path for the SQLite database directory. Defaults to `artifacts/api-server/.data`.
- `CORS_ORIGIN` — optional comma-separated allowlist for cross-origin API callers. Same-origin requests need no CORS entry.
- `OPENAI_API_KEY` — optional and unused by this database-backed MVP.

The admin password is stored in SQLite as a salted scrypt hash. Admin access is explicitly a demo feature, not a production identity system. Do not publish using the development password.

Example for a local API process:

```bash
export PORT=5000
export SESSION_SECRET="$(node -e \"process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))\")"
export GRAMASEVA_ADMIN_PASSWORD="choose-a-local-demo-password"
pnpm --filter @workspace/api-server run dev
```

The API creates and seeds the SQLite database on first start. No manual database setup is required.

## Running the app

In Replit, start the configured **API Server** and **GramaSeva web** workflows.

To run each process manually in separate terminals:

```bash
# Terminal 1: API server and SQLite database
PORT=5000 SESSION_SECRET="your-random-local-session-secret" \
GRAMASEVA_ADMIN_PASSWORD="your-local-demo-password" \
pnpm --filter @workspace/api-server run dev

# Terminal 2: Vite frontend
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/gramaseva run dev
```

The browser app calls the API at `/api`. The SQLite file is stored in the API server's `.data/` folder by default.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/healthz` | Health status |
| GET | `/api/schemes` | List active schemes with optional `q`, `category`, and `sort` filters |
| GET | `/api/schemes/search?q=` | Search schemes |
| GET | `/api/schemes/:id` | Scheme details |
| GET | `/api/categories` | Categories and active scheme counts |
| GET | `/api/schemes/category/:category` | Schemes in a category |
| POST | `/api/eligibility/check` | Rank potentially relevant schemes |
| POST | `/api/assistant/query` | Search scheme records using a natural-language question |
| POST | `/api/reports` | Submit an outdated-information report |
| GET | `/api/admin/auth/session` | Check demo admin session |
| POST | `/api/admin/auth/session` | Sign in to demo admin |
| DELETE | `/api/admin/auth/session` | Sign out |
| GET | `/api/admin/summary` | Admin totals |
| GET | `/api/admin/schemes` | List active and inactive scheme records |
| POST | `/api/admin/schemes` | Add a scheme |
| PUT | `/api/admin/schemes/:id` | Update a scheme |
| DELETE | `/api/admin/schemes/:id` | Deactivate a scheme |

Admin endpoints use a short-lived, signed, HttpOnly cookie. Only HTTPS `.gov.in` and `india.gov.in` links can be saved as official links.

## Validation and code generation

```bash
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/gramaseva run typecheck
pnpm run typecheck
```

Update `lib/api-spec/openapi.yaml` first, then regenerate the client and validation schemas.

## Limitations and future improvements

- Seeded scheme descriptions are demonstration data, not authoritative or current government notices.
- Scheme detail text beyond the translated names, summaries, and descriptions falls back to English.
- The assistant uses local database search rather than an LLM, so it cannot answer questions outside the scheme records.
- Voice features depend on browser and device support.
- Admin authentication is for a demo and should be replaced with managed identity and role-based access before real public administration.
- Before production use, curate and review official sources, assign an update owner, add auditable content review, and validate scheme details state by state.
