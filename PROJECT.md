# Compliance Copilot — PROJECT.md

> Source of truth for the product. Read this fully before writing code.
> (Reconstructed from the founding brief because the original `PROJECT.md`
> shipped in `compliance-copilot.zip`, which was not retrievable in the build
> environment. Treat this file as canonical until told otherwise.)

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
- Mobile-first UI: login, dashboard, documents/upload, ask.

Out of scope (do NOT build yet): practice/simulation, grading, manager
dashboards, analytics, billing, team management UI, multi-file batch flows,
non-PDF formats, voice input.

#### Phase 1 acceptance criteria

- [ ] A new user can sign in and is bound to exactly one org.
- [ ] User can upload a PDF; it shows `processing` then `ready`.
- [ ] Asking a question returns an answer where **every** factual statement
      carries a citation chip linking to document + section + page.
- [ ] Clicking a citation reveals the exact source snippet.
- [ ] When the docs don't contain the answer, the assistant clearly says so
      and shows **no** uncited claims.
- [ ] Two orgs cannot see each other's documents, chunks, or answers
      (verified by RLS — a direct query as Org A returns zero Org B rows).
- [ ] Works well on a phone screen (375px wide), large tap targets, plain words.

### Phase 2+ (NOT NOW — for context only)

Practice mode & simulations (Claude Sonnet), grading, manager audit-readiness
dashboard, analytics, notifications, billing.

## Data model (Phase 1)

- `orgs(id, name, created_at)`
- `profiles(id = auth.users.id, org_id, email, full_name, role, created_at)`
- `documents(id, org_id, title, storage_path, status, page_count, uploaded_by, error, created_at)`
  - `status ∈ {processing, ready, error}`
- `document_chunks(id, org_id, document_id, content, section, page, chunk_index, embedding vector(1024), created_at)`

Every table carries `org_id` and is protected by RLS keyed to the caller's org.

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
