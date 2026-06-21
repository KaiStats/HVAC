# AGENTS.md

## Cursor Cloud specific instructions

### Repository layout (important)

`main` is intentionally near-empty — it contains only `README.md` and `LICENSE`. **All application code lives on unmerged feature branches.** Pick the branch for the product you want to work on and check it out (or use a `git worktree`) before installing/running anything:

| Branch | Product | External deps | Runnable with available secrets? |
| --- | --- | --- | --- |
| `cursor/maya-intake-route-df7d` | "Maya" AI front-desk intake agent for Desert Air HVAC (Next.js 16 + React 19). Chat API that books jobs via Claude tool-calling. | `ANTHROPIC_API_KEY` only | Yes — works end-to-end |
| `cursor/osha-compliance-app-f906` | OSHA Compliance Assistant chat UI (Next.js 14). Self-contained, no DB. | `ANTHROPIC_API_KEY` only | UI yes; chat API broken (see caveat below) |
| `cursor/phase1-upload-ask-cited-answers-4823` | "Compliance Copilot" — full RAG product (upload → embed → cited answers). | Supabase (Postgres+pgvector+Auth+Storage), Anthropic, **Voyage AI** | No — requires Supabase + Voyage keys not present here |
| `cursor/desert-air-hvac-homepage-b4e6` | Desert Air HVAC marketing site + chat widget (Next.js 16, Tailwind 4). | none for static pages | Static site yes |
| `cursor/desert-air-nextjs-setup-0b6f` | Desert Air scaffold; app lives in the `desert-air/` **subdirectory**. | none | Static site yes |
| `cursor/file-based-booking-store-7345` | File-based booking store helper lib. | none | Library only |

### Secret / env mapping (non-obvious)

- The only secret injected into this environment is the Anthropic key, but it is exposed under the malformed env var name **`1. CLAUDE_API_KEY`** (literal `1. ` prefix and a space — not a valid shell identifier). Read it with `printenv "1. CLAUDE_API_KEY"`.
- All apps expect it as **`ANTHROPIC_API_KEY`**. The agent's `~/.bashrc` already maps the malformed secret to `ANTHROPIC_API_KEY` for new interactive shells, so apps (and the `@anthropic-ai/sdk`) generally pick it up from the environment automatically — no `.env.local` needed.
- If a fresh VM ever lacks that mapping, re-create it or write the app's `.env.local` directly:
  ```bash
  export ANTHROPIC_API_KEY="$(printenv "1. CLAUDE_API_KEY")"
  # or:
  printf 'ANTHROPIC_API_KEY=%s\n' "$(printenv "1. CLAUDE_API_KEY")" > .env.local
  ```

### Running an app (general)

Each branch is a standard Next.js app. From the checked-out branch (or its subdir for `desert-air-nextjs-setup`):
- Install: `npm install` (each branch has its own `package-lock.json`).
- Dev: `npm run dev` (defaults to port 3000; set `PORT=<n>` to avoid clashes).
- Build: `npm run build`.

Toolchain: Node 22 / npm 10 (preinstalled) work for every branch.

### Per-product caveats

- **Maya (`maya-intake-route`)** — fully working. `app/page.tsx` is only a stub (`<main>Desert Air HVAC Intake</main>`); the real product is the `POST /api/intake` endpoint. It takes `{ "messages": [...] }` and returns `{ reply }`, or `{ reply, booking }` once Claude calls the `book_job` tool. Bookings are kept in-memory and logged server-side as `[bookings] saved: ...` (no DB/file in this branch). Model used: `claude-sonnet-4-6`. `npm run build` passes (incl. TypeScript). `npm run lint` is broken on this branch because Next 16 removed the `next lint` subcommand the script calls.
- **OSHA app (`osha-compliance-app`)** — the chat UI renders, but `POST /api/chat` fails at runtime (`Unhandled chunk type: stream-start`) because `package.json` pins incompatible versions of `ai@^3` and `@ai-sdk/anthropic@^3`. This is a pre-existing dependency-version conflict in the branch, not an environment problem; aligning those two package versions is required before the chat works. `npm run lint` also prompts interactively (no ESLint config committed).
- **phase1 Compliance Copilot** — needs a hosted Supabase project (run `db/schema.sql` then `db/policies.sql`) plus `ANTHROPIC_API_KEY` and `VOYAGE_API_KEY`. Voyage + Supabase credentials are not available in this environment, so it cannot run end-to-end here.
