# NeuraLearn — 1-Page Viva Cheat Sheet

**Pitch:** A multi-tenant SaaS school management dashboard. One app + one database serves many schools; each is isolated by `schoolId`. Roles: Super Admin, Admin, Teacher, Student, Parent. Schools pay via Stripe (FREE/PLUS/PRO); higher plans unlock exams, finance charts, notifications, and AI quiz generation.

**Stack:** Next.js 14 (App Router) · TypeScript · PostgreSQL + Prisma · Clerk (auth) · Stripe (billing) · OpenAI gpt-4o-mini (AI quizzes) · Tailwind · React Hook Form + Zod · Recharts.

---

### The 3 ways the app talks to the server
1. **Server Components** → render on server, query DB with Prisma (read path).
2. **Server Actions** (`lib/actions.ts`, `"use server"`) → create/update/delete from forms (write path).
3. **API Routes** (`app/api/...`) → quiz, Stripe, AI, webhooks, public sign-up.

### Multi-tenancy (the #1 concept)
Every record has a **`schoolId`**. The logged-in user's `schoolId` lives in **Clerk's signed session metadata** (server-trusted). Every query is filtered `where: { schoolId }` → schools can't see each other's data. Super Admin = no filter.

### Auth & access control (2 layers)
- **Middleware** (`middleware.ts`) reads `role` from session, checks the **route-access map** (`lib/settings.ts`), redirects if not allowed — *before the page loads*.
- **Server actions / API routes re-verify** identity via Clerk. UI hiding buttons ≠ security; the backend is the real gate.

### Plans & feature gating (`lib/plans.ts`)
| | Admins | Teachers | Students | Quizzes | AI Quiz | Exams |
|--|--|--|--|--|--|--|
| FREE | 1 | 5 | 50 | ✗ | ✗ | ✗ |
| PLUS | 1 | 15 | 250 | ✓ | ✗ | ✓ |
| PRO | ∞ | ∞ | ∞ | ✓ | ✓ | ✓ |

`assertFeature(schoolId, "aiQuiz")` → throws → route returns **402**. `assertWithinLimit()` blocks over-limit creation. All **server-enforced**.

---

### Key workflows (be ready to trace these)
**School signup:** Onboarding form → `POST /api/stripe/checkout` (validates, saves **PendingSignup**, makes Stripe session) → user pays → **webhook** `checkout.session.completed` verifies signature → creates Clerk admin + (in one **DB transaction**) School + Admin + Subscription → sets Clerk `schoolId`. *Why pending+webhook? School must only exist after payment confirms (async).*

**AI quiz:** Teacher uploads PDF/DOCX/PPTX/TXT → auth + `assertFeature("aiQuiz")` → extract text (pdf-parse / mammoth / jszip) → OpenAI (`json_object` mode, text capped 40k chars) → return MCQs → temp file deleted in `finally`.

**Quiz submit (`/api/quiz/submit`):** `studentId` from **auth, not body** · one attempt (`@@unique`) · time-window check (start/end) · **grading server-side** (answers fetched from DB, key never sent to client).

**Notifications:** Actions bulk-insert (`createMany`) `Notification` rows for the right audience; bell reads unread (indexed on `[userId, read]`).

---

### Data model (24 models) — the chains
- **Tenant:** `School` 1—* everything; holds `plan`.
- **People:** `Admin/Teacher/Student/Parent` — `id` = **Clerk user ID** (auth = DB key).
- **Academic:** `Grade` → `Class` → `Student`; `Subject` ↔ `Teacher`; `Lesson` = Subject+Class+Teacher+time.
- **Assessment:** `Exam`/`Assignment` → `Result` (per student). `Attendance` = 1 row/student/lesson.
- **Quiz chain:** `Quiz → QuizQuestion` then `QuizAssignment → QuizSubmission → QuizAnswer`.
- **Billing:** `Subscription` (mirrors Stripe), `PendingSignup`, `PendingStudentSignup` (admin approval).

---

### Rapid-fire answers
- **Server vs Client Component?** Server runs on server (DB, secrets); Client (`"use client"`) runs in browser for interactivity. Default = server.
- **Action vs API route?** Action = typed server fn from forms; API = REST endpoint for webhooks/external/complex requests.
- **Passwords?** Not stored — Clerk manages them; we keep only `{role, schoolId}` in session.
- **Why Prisma?** Type-safe queries + migrations; schema is single source of truth.
- **Why Student id is a String?** It's the Clerk ID → auth identity *is* the primary key.
- **Plan upgrade instant?** Webhook updates `Subscription` + `School.plan`; gating reads `School.plan`.
- **`(dashboard)` folder?** Next.js route group → shared layout without `/dashboard` in URL.
- **Prisma singleton?** Stops hot-reload from exhausting DB connections in dev.
- **Core security rule?** Never trust the client: identity from Clerk, every query scoped by `schoolId`, every mutation re-validated server-side.

**Run:** `npm install` → `npx prisma migrate deploy` → `npm run dev` (or `docker-compose up`). Needs `.env`: DATABASE_URL, Clerk, Stripe (keys + price IDs), OPENAI_API_KEY, Cloudinary.
