# Coffee Rater

Multi-user coffee rating app: you log the coffees you drink with a guided flavor profile and a photo, keep your own collection, browse what other people rated in a shared feed, and compare one of theirs side by side with yours. The UI started in Spanish and has had an English toggle since 2026-11-16.

## Tech stack
- **Frontend:** React 19, Vite 7, Tailwind 3 (`tailwind.config.js`), React Router 6, React Query v5, port **5173**. Vite proxies `/api` to the server.
- **Backend:** Express 4 + TypeScript run with `tsx` (no compile step, in dev or production), port **3000** (`PORT`).
- **Database:** Postgres via `pg` + drizzle-orm 0.45, with Zod schemas from drizzle-zod 0.5. Sessions use express-session + connect-pg-simple and live in the same database.
- **Auth:** the login route checks the bcrypt hash itself, and Passport only handles the session (`req.login`, serialize and deserialize). The session cookie lasts 30 days.

## Running
```bash
set -a; . ./.env; set +a   # nothing loads .env for you (no dotenv), so export it first
npm run dev                # server (tsx watch, :3000) + Vite (:5173) via concurrently
npm run check              # tsc --noEmit over client, server and shared
npm run build              # vite build → dist/client (client only)
npm run start              # NODE_ENV=production tsx server/index.ts: API + built client on one port
npm run db:push            # drizzle-kit push of shared/schema.ts to DATABASE_URL
```
Open the app on http://localhost:5173. Port 3000 only serves the API in development and returns 404 on `/`.

Environment (see `.env.example`):
- `DATABASE_URL`: required. The server tests the connection at boot and exits if it can't connect.
- `SESSION_SECRET`: required, no fallback. In production it must be at least 32 characters or the server refuses to start.
- `CLIENT_URL`: optional. It's added to the allowed origins for CORS and the Origin check. Development always allows `http://localhost:5173`, and production serves the client from the same origin, so it only matters for a client on another host.
- `PORT`: defaults to 3000. Railway injects its own.
- `VITE_API_URL` sits in `.env` but no code reads it. The client calls relative `/api` paths.

### Local database
No Postgres runs on this Mac for coffee-rater (checked 2026-11-16), so `npm run dev` stops at "Database connection failed" until you start one. The quickest way is a Docker container on 5432 whose user, password and database match `DATABASE_URL` in `.env`, followed by `npm run db:push`:
```bash
docker run -d --name coffee-rater-postgres -p 5432:5432 -e POSTGRES_USER=<user> -e POSTGRES_PASSWORD=<password> -e POSTGRES_DB=coffee_rater postgres:16-alpine
```
The `vcrater-postgres` container that's already running belongs to `~/Projects/vcrater` and listens on 5433. Leave it alone.

## Deployment (Railway)
Live at **coffee.kjellv.com** since 2026-11-16. Railway project `friendly-caring`, service `coffee-ratings`, plus a Postgres service with no public TCP proxy. Every push to `main` of `Kjellvdv/coffee-ratings` deploys. The Railway CLI is linked from this folder (`railway status` shows `friendly-caring / production / coffee-ratings`).

- There's no `railway.json`, so Railpack builds with `npm run build` and starts with `npm start`. Railway ignores config files anyway (see `~/.claude/memory/reference/railway.md`), so change build or start settings through the API, not a file.
- One service runs everything. Express serves `dist/client` with immutable caching on `assets/`, sends `index.html` for every other non-API GET (the React Router fallback) and handles `/api`.
- On Railway, `DATABASE_URL` comes from the Postgres service and `SESSION_SECRET` has to be at least 32 characters.
- `DEPLOYMENT.md`, `DEPLOYMENT-CHECKLIST.md` and `README.md` are the original Spanish guides from before the relaunch. They still cover Render and tell you to set `NODE_ENV` as a variable. Treat them as history, not instructions.
- Railway holds the only real data, and nothing local mirrors production.

## Architecture
- `shared/schema.ts`: the single source of truth. It defines the Drizzle tables `users`, `coffees` and `flavor_profiles` plus the Zod insert and update schemas the routes validate against. `MAX_IMAGE_LENGTH` (15 MB of base64) lives here too.
- `server/index.ts`: boots in a fixed order. It checks the env, tests the database, adds helmet, CORS and the Origin check, applies a 15 MB JSON body limit, serves the static client (production only), mounts the session store and Passport, then the routes, the SPA fallback and the error handler.
- `server/storage.ts`: all database access goes through here, and so do the visibility rules (soft deletes, private coffees, ownership).
- `server/routes/`: `auth` (register, login, logout, me, with rate limits on login and register), `coffees` (your collection: CRUD, duplicate, search and filters), `feed` (other users' public coffees, a user's public list, and `my-matches` for the side-by-side compare), `flavor-profiles` and `stats`.
- `server/utils/flavorProfile.ts`: `calculateFlavorProfile` turns the wizard answers into the profile label.
- `server/i18n.ts`: server messages in `es` and `en`. The client sends the toggled language as `Accept-Language`, and anything that isn't English falls back to Spanish.
- `client/src/`: pages (`MyCollection` on `/`, `/add-coffee`, `/feed`, `/feed/:id`, `/compare/:theirsId/:mineId`, `/login`), React Query hooks in `hooks/`, the fetch wrapper in `lib/api.ts`, and `i18n/`. The language choice persists in `localStorage` and defaults to the browser language.

## Key invariants
- Deletes are soft. `users.deleted_at` and `coffees.deleted_at` get set and rows stay, so every read has to filter on `isNull(deletedAt)`.
- A private coffee (`is_private`) is visible to its owner only. It never shows up in the feed or in another user's list, and `my-matches` refuses a private source coffee that isn't yours. The 2026-11-16 security pass fixed a search and filter path that leaked other users' private and deleted coffees, so keep new queries in `storage.ts` and scope them by `userId`.
- CSRF protection has two layers. Cookies are `SameSite=Lax`, and every POST, PUT, PATCH and DELETE under `/api` that carries an `Origin` header must come from the server's own origin or an allowed origin, or it gets a 403.
- There's no urlencoded body parser on purpose: a cross-site HTML form can't post a body.
- Images are base64 strings in `coffees.image` (a `text` column). The client caps uploads at 10 MB, which fits in the 15 MB body limit after encoding.
- Logs show the user id and never passwords, cookies or session contents.
- `trust proxy` is set to 1 because Railway terminates TLS. That's what gives the rate limiters real client IPs.

## Gotchas
- Port 5173 clashes with hexking (Product Studio `launch.json`), so don't run both dev servers at once. Neither root's `launch.json` has a coffee-rater entry yet.
- `npm start` runs `tsx`, which is a devDependency, and `npm run build` needs `vite`, also a devDependency. An install that skips devDependencies (for example with `NODE_ENV=production` set at build time) breaks the build. tempo hit exactly this on Railway.
- `drizzle/` is gitignored and holds a single migration from February 2026, so schema changes go through `npm run db:push`. With no public TCP proxy on the Railway Postgres, `db:push` can't reach production from this Mac, and nobody has written down how production schema changes get applied.
- Remaining npm advisories after the security pass: zod 3 (the fix needs zod 4 + drizzle-zod 0.8), react-router 6 (the fix needs v7, not exploitable here) and esbuild via drizzle-kit (dev only).
- The repo lived in iCloud as `Product Studio/coffee-rater 2` until 2026-11-16 and picked up 21 " 2" conflict copies there. Kjell sent that copy to the Trash the same day, so this folder is the only checkout.
