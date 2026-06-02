# Compliance Copilot

Turn a company's safety/compliance manuals and SOPs into an always-on AI
assistant that gives workers the exact answer in seconds — **with the source,
every time.**

> **Phase 1 (the wedge):** upload docs → ask questions → get cited answers.
> See [`PROJECT.md`](./PROJECT.md) for the product laws and full plan.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase — Postgres + Auth + Storage + `pgvector`
- Anthropic Claude (Haiku) for cited Q&A
- Voyage AI for embeddings

## Product laws (non-negotiable)

1. **Every answer cites its source** (document + section + page). No citation =
   not shown. Enforced in code (`src/lib/anthropic.ts`).
2. **A 5th grader can use it.** The home screen is one big "Ask anything" box;
   plain language, ≥48px tap targets, mobile-first. The answer comes first
   (1–3 sentences), with a collapsible "Where this comes from" showing the exact
   manual page. Answers stream token-by-token ("Reading your manuals…", never a
   frozen spinner). Empty states show tappable example questions. Voice in
   (mic) and voice out (Listen).
3. **Multi-tenant from line one.** Every row carries `org_id`; RLS enforced.

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migrations in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_storage.sql`
   These create the schema, `pgvector` index, RLS policies, the new-user
   bootstrap trigger (each signup gets its own org), and the private
   `documents` storage bucket.
3. **Auth → URL Configuration:** set **Site URL** to your app origin (e.g.
   `http://localhost:3000`) and add `<origin>/auth/callback` to **Redirect
   URLs**. Sign-in is a passwordless **email magic link**, so make sure the
   Email provider is enabled (Supabase's built-in email works for the demo).

### 2. API keys

- **Anthropic:** create a key at [console.anthropic.com](https://console.anthropic.com).
- **Voyage AI:** create a key at [voyageai.com](https://www.voyageai.com).

### 3. Environment

```bash
cp .env.example .env.local
# fill in the values
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (server only) |
| `ANTHROPIC_API_KEY` | Anthropic console |
| `VOYAGE_API_KEY` | Voyage AI console |

The embedding model defaults to `voyage-3.5-lite` (1024 dims, matching the DB).
If you change it, keep the output dimension at **1024** or update the schema.

### 4. Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run typecheck`,
`npm run lint`.

## How it works

- **Upload** (`/documents`) → drag-drop or pick a **PDF, Word (.docx), or text
  (.txt)** file. It's stored under `documents/<org_id>/<doc_id>.<ext>`, text is
  extracted (PDFs keep exact page numbers), split into section/page-aware
  chunks, embedded with Voyage, and stored in `document_chunks` with `org_id`.
- **Ask** (`/ask`) → the question is embedded, the top matching chunks **from
  your org only** are retrieved (RLS-enforced via `match_chunks`), and Claude
  Haiku answers using only those sources. Every claim carries a `[n]` citation
  that maps to document + section + page. If nothing can be cited, the
  assistant says it couldn't find the answer — it never shows uncited claims.
- **Voice** → tap the mic to dictate a question, and tap **Listen** to hear the
  answer read aloud (Web Speech API; hidden where the browser doesn't support
  it). No extra keys or services required.

## Phase 1 acceptance test

1. Create an account → you land in your own workspace (org).
2. Upload a compliance PDF → it shows **Processing** then **Ready**.
3. Ask a question answered by the doc → you get an answer with citation chips;
   tap a chip to reveal the exact source snippet (document, section, page).
4. Ask something not in the docs → the assistant says it couldn't find it, with
   no uncited claims.
5. Create a **second** account, upload a different doc, and confirm you cannot
   see the first org's documents or get answers from them (RLS isolation).

## Multi-tenancy & security notes

- RLS is enabled on every table; policies key off `current_org_id()`.
- Storage objects are namespaced per org and protected by storage RLS.
- The service-role key is used **only** server-side for ingestion and always
  writes an explicit `org_id`.
