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

## Build phases (the F1 race plan)

Each phase ends with acceptance criteria. Don't move on until they're green.

- **Phase 0 — Foundation.** Next.js + Tailwind + shadcn scaffold; Supabase
  project; env wired. Auth: **email magic link**. On signup, create
  `organizations` + `profiles` row, assign `admin`. RLS on every table.
  _Done when:_ a user can sign up, an org exists, and they land on an empty home
  screen. **(Built.)**
- **Phase 1 — The wedge: Manual-to-AI Q&A.** Drag-drop PDF/DOCX upload; ingest
  pipeline; big single ask box + voice; streamed plain-language answers with
  tappable citations (doc + page + section); conversation history per user.
  _Done when:_ an admin uploads a real manual, a worker on a phone asks by voice
  and gets a correct, cited answer in under 5 seconds. **(This phase.)**
- **Phase 2 — Active practice.** Inspection Simulator + Incident Response
  Trainer (Claude Sonnet); save sessions + scores + gaps. _Done when:_ a worker
  runs a 5-question drill and gets a score + "you missed X (manual p.Y)".
- **Phase 3 — Role-specific micro-learning.** Sonnet generates role-targeted
  lesson cards; 2-minute daily refreshers personalized to weak areas.
  _Done when:_ a `job_title='HVAC Tech'` worker sees only HVAC lessons.
- **Phase 4 — Audit prep + knowledge-gap dashboard.** Manager dashboard
  (completion, scores, top gaps) + Audit Prep Assistant. _Done when:_ a manager
  opens one screen and sees exactly where the team is unprepared.
- **Phase 5 — Versioned KB + update alerts.** Re-upload → new version; Claude
  summarizes changes and flags affected training; optional SMS alerts.
  _Done when:_ updating a manual notifies affected workers and re-flags stale
  training.

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

## AI prompts (the secret sauce)

Only **7a** is wired up in Phase 1. 7b–7e are recorded here verbatim as the
canonical reference and are implemented in their phases.

**Implementation note on 7a:** we follow 7a's rules and refusal text, but use
inline `[n]` citations (each excerpt is numbered; the server maps `[n]` back to
the excerpt's exact document/page/section) instead of trusting a model-emitted
JSON page number. This upholds "never invent a number" more strictly and still
persists the equivalent citation JSON to `messages.citations`.

### 7a — Policy Q&A system prompt (Haiku) — IMPLEMENTED

```
You are Compliance Copilot, a safety & compliance assistant for {{org_name}} ({{vertical}}).
Answer ONLY from the provided manual excerpts. If the answer isn't in them, say:
"I couldn't find that in your current documents — ask your safety manager," and stop.

Rules:
- Lead with a 1–3 sentence plain-language answer a new hire would understand. No jargon.
- Then list the exact steps if the question is procedural.
- EVERY factual claim must map to a source excerpt. Never invent a regulation, number, or step.
- Output the answer, then a JSON block of citations:
  {"citations":[{"document_title":"...","page":N,"section":"..."}]}
- If excerpts conflict, say so and cite both.

Excerpts:
{{retrieved_chunks_with_source_tags}}

Question: {{user_question}}
```

### 7b — Inspection Simulator (Sonnet) — Phase 2

```
You are running a realistic mock {{vertical}} safety inspection for a worker, based only on the
company's procedures below. Behave like a tough-but-fair inspector.

- Ask ONE question at a time. Wait for the answer before the next.
- Cover 5 of the highest-risk topics found in the procedures.
- After all 5, output JSON ONLY:
  {"score":0-100,"summary":"...","gaps":[{"topic":"...","missed":"...","correct_procedure":"...","source_page":N}]}
- Be specific in "correct_procedure" and cite the page so they can verify.

Company procedures:
{{retrieved_chunks}}
```

### 7c — Incident Response Trainer (Sonnet) — Phase 2

```
Present this incident: {{scenario}}.
Ask the worker what they would do, step by step.
Then grade their response against the SOP below. Reward correct sequencing and safety priorities.
Output JSON: {"score":0-100,"what_they_did_well":[...],"what_was_missing":[...],"correct_sequence":[...],"source_pages":[...]}

SOP:
{{retrieved_chunks}}
```

### 7d — Micro-learning generator (Sonnet, at module creation) — Phase 3

```
From the document below, create {{n}} micro-lessons for the role "{{target_role}}".
Each lesson: one real on-the-job situation as the prompt, a short correct answer, and the source page.
Output JSON array: [{"prompt":"...","answer":"...","source_page":N}]
Keep each answer under 40 words. Plain language only.
```

### 7e — Audit gap synthesis (Sonnet) — Phase 4

```
Given these team practice results (scores + gaps) and the company's procedures, produce:
1. A prioritized audit-readiness checklist.
2. The 3 weakest areas across the team.
3. Recommended targeted drills per weak area.
Output as structured JSON. Cite source pages for each checklist item.
```

## Retrieval & answer contract

- Retrieve top-K chunks within the caller's org only.
- Prompt Claude with numbered sources; require inline `[n]` citations.
- Post-process: map `[n]` → document + section + page. Strip any sentence with
  no citation is not allowed; instead the model is instructed to only state
  facts it can cite, and we refuse to render an answer that lacks citations.
- If retrieval is empty or the model cannot cite, return the explicit
  "I couldn't find this in your documents" response.

## File / folder structure

```
/app
  /(auth)/login             # magic-link sign in
  /(app)
    /page.tsx               # HOME = the big Ask box
    /ask/[conversationId]   # a saved conversation (cited answer)
    /documents              # upload + status list
    /history                # your saved questions
    # /practice (P2) /learn (P3) /dashboard (P4) — added in their phases
  /auth/callback, /auth/signout   # magic-link code exchange + sign out
  /api
    /ingest/route.ts        # POST: store → parse → chunk → embed → store
    /ask/route.ts           # POST: retrieve → rerank → Claude (stream)
    # /simulate (P2) — added in Phase 2
/lib
  supabase/{client,server,admin,middleware}.ts  # split for the RSC boundary
  voyage.ts                 # Voyage embeddings + rerank
  anthropic.ts              # Claude wrapper + prompt 7a + citation enforcement
  chunk.ts                  # recursive splitter w/ metadata
  extract.ts, pdf.ts        # text extraction (pdf/docx/txt)
  ingest.ts, retrieval (match_chunks RPC), auth.ts, env.ts, types.ts
/components
  AskBox VoiceButton AnswerCard CitationChip UploadDropzone DocStatusList
  app-nav app-header history-client  /ui (shadcn primitives)
/db
  schema.sql  policies.sql
PROJECT.md
```

Note: Supabase clients are split into `lib/supabase/*` (rather than a single
`lib/supabase.ts`) because the App Router forbids mixing server-only
(`next/headers`) and browser client code in one module. Retrieval lives in the
`match_chunks` Postgres function (`db/schema.sql`) called from the ask route.

## Working agreement

- Build only the current phase. After each phase, **stop** and let the product
  owner test against the acceptance criteria before continuing.
