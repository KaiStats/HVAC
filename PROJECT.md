# Compliance Copilot — PROJECT.md

> Source of truth for the product. Read this fully before writing code.
> (Reconstructed from the founding brief because the original `PROJECT.md`
> shipped in `compliance-copilot.zip`, which was not retrievable in the build
> environment. Treat this file as canonical until told otherwise.)

## North star

> "Your compliance manual is useless if nobody reads it. This is the AI that
> gives the right answer in seconds — and proves your team is actually ready."

## The 5 pains → features map

| # | The pain (field research) | The cure (feature) | Phase |
| - | --- | --- | --- |
| 1 | No just-in-time help — nobody reads the 200-page manual mid-task | AI Policy Q&A over their docs, cited, voice-enabled | **1 (wedge)** |
| 2 | "Cram and forget" — passes the quiz, can't handle a real incident | Inspection Simulator + Incident Response Trainer (active practice) | 2 |
| 3 | "Checkbox / CYA" — generic, irrelevant | Role-specific micro-learning + personalized refreshers | 3 |
| 4 | Audit stress — gaps surface too late, no visibility | Audit Prep Assistant + Knowledge-Gap Dashboard | 4 |
| 5 | Update burden — regs change, content rots | Versioned knowledge base + update alerts | 5 |

Ordering is deliberate: Pain #1 is the most relatable and ownable — the free
"Manual-to-AI" pilot that closes the client. Win on Phase 1, expand into the
rest.

## What we are building

Compliance Copilot is a **multi-tenant SaaS web app**. It ingests a company's
safety/compliance manuals and SOPs and turns them into an always-on AI
assistant that:

1. Gives workers the **exact answer in seconds**.
2. Lets them **practice** (not just read). _(later phase)_
3. Gives managers **audit-readiness visibility**. _(later phase)_

Target industries: healthcare, construction, finance, manufacturing — anywhere
regulated SOPs and mandatory training exist.

## Stack (do not deviate without asking)

- **Next.js 14 (App Router) + TypeScript**
- **Tailwind CSS + shadcn/ui**
- **Supabase** — Postgres + Auth + Storage + `pgvector`
- **Anthropic Claude API** — Haiku for high-volume Q&A, Sonnet for grading/simulation
- **Voyage AI** for embeddings
- Deploy to **Vercel + Supabase**

## Non-negotiable product laws

1. **Every AI answer cites the exact source** (document + section + page).
   **No citation = not shown.** This is a compliance tool; trust comes from
   traceability.
2. **A 5th grader can use it.** One primary action per screen. Plain language.
   Big tap targets. **Mobile-first** — workers use phones on the floor,
   sometimes with gloves, sometimes by voice.
3. **Multi-tenant from line one.** Every row carries `org_id`. Row-Level
   Security enforced. A worker at Company A can **never** see Company B's data.
4. **Ship the wedge first.** Phase 1 only. Nothing else until it is demo-perfect.

## The 5th-grader doctrine (hard UX rules)

These are hard rules, not suggestions:

1. **One job per screen.** The home screen is a single big "Ask anything about
   your procedures" box. Everything else is one tap away, not on the front page.
2. **No jargon.** Never say "RAG," "vector," "embedding," "module,"
   "remediation." Say "Ask a question," "Practice," "Check your team's readiness."
3. **Answer first, detail second.** Plain answer in 1–3 sentences at top, then a
   "Where this comes from" expandable with the exact manual page.
4. **Mobile-first, glove-friendly.** Minimum 48px tap targets. Big fonts. High
   contrast. Works one-handed.
5. **Voice in, voice out.** Tap the mic, ask out loud, hear the answer read back.
   Web Speech API for input + speech synthesis for output (zero added cost).
6. **Never a blank screen.** Empty states show tappable example questions
   ("What PPE do I need for confined space entry?").
7. **Speed is a feature.** Stream the answer token-by-token so it feels instant.
   Show a "Reading your manuals…" state, never a frozen spinner.

## Phased plan

### Phase 1 — THE WEDGE (this phase)

**Upload docs → ask questions → get cited answers.** Nothing else.

In scope:

- Auth + org membership (multi-tenant, RLS enforced).
- Upload a compliance document (PDF) to private per-org storage.
- Ingest: extract text per page, detect sections, chunk, embed (Voyage),
  store in `pgvector`.
- Ask a question: embed query → retrieve org-scoped chunks → answer with
  Claude Haiku → **every claim cited (document + section + page)**.
- If the assistant cannot cite a source, it says it doesn't know. No
  uncited answers are ever shown.
- **Voice-enabled**: workers can ask by voice (tap-to-dictate) and have the
  cited answer read back to them hands-free. Voice degrades gracefully where
  the browser doesn't support it.
- Mobile-first UI: login, dashboard, documents/upload, ask.

Out of scope (do NOT build yet): practice/simulation, grading, manager
dashboards, analytics, billing, team management UI, multi-file batch flows,
non-PDF formats.

#### Phase 1 acceptance criteria

- [ ] A new user can sign in and is bound to exactly one org.
- [ ] User can upload a PDF; it shows `processing` then `ready`.
- [ ] Asking a question returns an answer where **every** factual statement
      carries a citation chip linking to document + section + page.
- [ ] Clicking a citation reveals the exact source snippet.
- [ ] When the docs don't contain the answer, the assistant clearly says so
      and shows **no** uncited claims.
- [ ] A worker can ask by voice and have the answer read aloud (where the
      browser supports it); the feature is hidden cleanly where it isn't.
- [ ] Two orgs cannot see each other's documents, chunks, or answers
      (verified by RLS — a direct query as Org A returns zero Org B rows).
- [ ] Works well on a phone screen (375px wide), large tap targets, plain words.

### Phase 2+ (NOT NOW — for context only)

Practice mode & simulations (Claude Sonnet), grading, manager audit-readiness
dashboard, analytics, notifications, billing.

## Data model (canonical)

Phase 1 tables (in `supabase/migrations/0001_init.sql`):

- `organizations(id, name, vertical, created_at)`
- `profiles(id = auth.users.id, org_id, full_name, role['admin'|'manager'|'worker'], job_title, created_at)`
- `documents(id, org_id, title, file_path, file_type, status['processing'|'ready'|'error'], version, uploaded_by→profiles, created_at)`
  - plus additive operational columns `page_count`, `error` that power Phase 1
    UX (showing page count and the failure reason).
- `document_chunks(id, document_id, org_id, content, section_title, page_number, chunk_index, embedding vector(1024), created_at)`
- `conversations(id, org_id, user_id→profiles, title, created_at)`
- `messages(id, conversation_id→conversations, role['user'|'assistant'], content, citations jsonb, created_at)`
  — every Q&A turn is saved (user + assistant message); the assistant message
  carries the citation JSON as audit evidence.

Deferred to their phases ("ship the wedge first", added when built):
`scenarios`, `scenario_sessions` (Phase 2); `training_modules`,
`module_completions` (Phase 3); `document_versions` (Phase 5).

Every org-scoped table is protected by RLS keyed to the caller's org via
`current_org_id()` — the safe form of
`org_id = (select org_id from profiles where id = auth.uid())`.
`messages` is scoped through its conversation's org.

## RAG pipeline (the engine)

**Ingestion (on upload):** file lands in Storage → `documents` row set to
`processing` → extract text preserving page numbers + detected section
headings → **recursive splitter (~800 tokens/chunk, ~120 token overlap)** with
`document_id`, `section`, `page`, `chunk_index` on every chunk → embed each
chunk with Voyage → store the vector in `document_chunks.embedding` → set
`ready` and tell the user "✅ Your manual is ready — ask it anything."

**Query (on a question):** embed the question with Voyage → pgvector cosine
search for the top 8 chunks scoped to `org_id` (`embedding <=> query_embedding`,
enforced by RLS) → **Voyage rerank to the best 4** (Phase 1.5; graceful
fallback to cosine order) → build the prompt (system rules + the 4 tagged
sources + question) → **stream** Claude Haiku → parse citations and render them
as tappable "Where this comes from → Manual X, p.42, §3.1" → save the turn to
`messages` with the citation JSON.

## Retrieval & answer contract

- Retrieve top-K chunks within the caller's org only.
- Prompt Claude with numbered sources; require inline `[n]` citations.
- Post-process: map `[n]` → document + section + page. Strip any sentence with
  no citation is not allowed; instead the model is instructed to only state
  facts it can cite, and we refuse to render an answer that lacks citations.
- If retrieval is empty or the model cannot cite, return the explicit
  "I couldn't find this in your documents" response.

## Working agreement

- Build only the current phase. After each phase, **stop** and let the product
  owner test against the acceptance criteria before continuing.
