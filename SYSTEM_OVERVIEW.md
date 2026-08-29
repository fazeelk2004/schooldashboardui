# NeuraLearn — How the System Works (Viva Guide)

> A complete, defence-ready walkthrough of the NeuraLearn School Management System: what it does, how it is built, how data flows through it, and the design decisions behind it.

---

## 1. One-Paragraph Summary

**NeuraLearn** is a **multi-tenant SaaS school management dashboard**. A single deployment serves many independent schools; each school is an isolated *tenant* with its own users, data, and subscription plan. It supports four in-school roles (**Admin, Teacher, Student, Parent**) plus a platform-level **Super Admin**, each with a tailored dashboard and permissions. Schools sign up and pay through **Stripe**; depending on their plan (FREE / PLUS / PRO) they unlock features such as exams, quizzes, finance analytics, notifications, and **AI-powered quiz generation** that turns uploaded documents into multiple-choice quizzes using the **OpenAI API**.

---

## 2. Technology Stack & Why

| Layer | Technology | Why it was chosen |
|-------|-----------|-------------------|
| Framework | **Next.js 14.2.5 (App Router)** | One framework for both frontend and backend (Server Components + API routes), file-based routing, server-side rendering for fast, SEO-friendly, secure pages. |
| Language | **TypeScript** | Compile-time type safety across the whole stack, fewer runtime bugs. |
| Database | **PostgreSQL** | Relational data (students→classes→schools) maps naturally to SQL with strong integrity (foreign keys). |
| ORM | **Prisma 7** | Type-safe database queries, schema-as-code, automatic migrations. The Prisma schema *is* the single source of truth for the data model. |
| Auth | **Clerk** | Managed authentication — handles passwords, sessions, sign-in UI. We store each user's **role** and **schoolId** in Clerk's session metadata. |
| Payments | **Stripe** | Subscriptions, checkout, billing portal, and webhooks for plan changes. |
| AI | **OpenAI API (gpt-4o-mini)** | Generates quiz questions from document text. |
| Styling | **Tailwind CSS** | Utility-first CSS with custom semantic design tokens + dark mode. |
| Forms | **React Hook Form + Zod** | Performant forms with schema-based validation shared between client and server. |
| Charts | **Recharts** | Attendance, student-count, and finance visualisations. |
| Calendar | **React Big Calendar** | Weekly lesson/event timetable. |
| File parsing | **pdf-parse, mammoth, jszip + fast-xml-parser** | Extract text from PDF, DOCX, and PPTX uploads for AI quiz generation. |
| Deployment | **Vercel** (or self-hosted via **Docker Compose**) | Vercel is built for Next.js; Docker gives a portable full-stack image. |

**Key architectural idea:** Next.js App Router lets us run code **on the server by default** (Server Components). Database queries and secrets never reach the browser. Only small interactive pieces are marked `"use client"`.

---

## 3. High-Level Architecture

```
                          ┌─────────────────────────────┐
        Browser  ───────► │   Next.js App (Vercel)      │
   (React UI, dark mode)  │                             │
                          │  ┌───────────────────────┐  │
                          │  │ Middleware (Clerk)    │  │  ← Auth + role-based route guard
                          │  └───────────────────────┘  │
                          │  ┌───────────────────────┐  │
                          │  │ Server Components      │  │  ← Fetch data directly (Prisma)
                          │  │ + Server Actions       │  │  ← Mutations (create/update/delete)
                          │  └───────────────────────┘  │
                          │  ┌───────────────────────┐  │
                          │  │ API Routes             │  │  ← Quiz, Stripe, AI, public endpoints
                          │  └───────────────────────┘  │
                          └──────┬────────┬────────┬────┘
                                 │        │        │
                    ┌────────────┘        │        └────────────┐
                    ▼                     ▼                     ▼
            ┌──────────────┐     ┌──────────────┐      ┌──────────────┐
            │ PostgreSQL   │     │   Clerk      │      │   Stripe     │
            │  (Prisma)    │     │  (Auth)      │      │  (Billing)   │
            └──────────────┘     └──────────────┘      └──────────────┘
                                         │                     ▲
                                         ▼                     │
                                  ┌──────────────┐      Webhooks (plan changes)
                                  │  OpenAI API  │
                                  └──────────────┘
```

**Three ways the app talks to the server:**
1. **Server Components** — render on the server and fetch data with Prisma directly (read path).
2. **Server Actions** (`src/lib/actions.ts`) — `"use server"` functions called from forms to create/update/delete (write path).
3. **API Routes** (`src/app/api/...`) — REST-style endpoints for things needing full request control: quiz submission, AI generation, Stripe checkout/webhooks, public sign-up.

---

## 4. Multi-Tenancy — The Core Design Decision

Every business record (Student, Teacher, Class, Lesson, Exam, etc.) carries a **`schoolId`** foreign key. This is how one database serves many schools while keeping them isolated.

- **Where the tenant comes from:** When a user logs in, Clerk's session contains `metadata = { role, schoolId }`. The helper `getCurrentUser()` (`src/lib/utils.ts`) reads it from the session claims — it is **trusted server-side data**, not something the browser can tamper with.
- **How isolation is enforced:** Every query is scoped with a `where: { schoolId }` filter (`schoolFilter()` helper). A teacher in School A literally cannot query School B's students because the filter is added on the server.
- **Super Admin exception:** `schoolFilter(undefined)` returns `{}` (no filter), so the platform-level super admin can see across all schools.

> **Likely viva question — "How do you stop one school seeing another's data?"**
> Answer: Each record has a `schoolId`. The logged-in user's `schoolId` comes from Clerk's signed session metadata (server-trusted). Every Prisma query is filtered by that `schoolId` on the server, so cross-tenant access is impossible from the client.

---

## 5. Authentication & Authorisation

### 5.1 Authentication (Who are you?) — Clerk
- Sign-in/sign-up handled by Clerk. On success, Clerk issues a session containing `publicMetadata: { role, schoolId }`.
- The role is set when the user is provisioned (e.g. the webhook sets an admin's role to `"admin"`).

### 5.2 Authorisation (What can you do?) — Two layers

**Layer 1 — Middleware route guard** (`src/middleware.ts`)
Runs on *every* request before the page loads:
```ts
const role = sessionClaims?.metadata?.role;
for (const { matcher, allowedRoles } of matchers) {
  if (matcher(req) && !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL(`/${role}`, req.url));  // bounce to own dashboard
  }
}
```
It reads the **route-access map** (`src/lib/settings.ts`) which declares which roles may visit which URLs:
```ts
"/list/subjects":  ["superadmin", "admin"],
"/list/quiz-generator": ["teacher"],       // only teachers
"/list/my-quizzes":     ["student"],        // only students
```
Public routes (home, pricing, onboarding, sign-in, Stripe webhook) bypass the guard entirely.

**Layer 2 — Server-side checks in actions/APIs**
Even if someone bypassed the UI, server actions and API routes re-check identity. Example: the quiz-submit endpoint takes the `studentId` **from Clerk auth, never from the request body**, so a student can't submit as someone else.

> **Likely viva question — "Where is access control enforced?"**
> Answer: Two layers. (1) Middleware blocks whole routes by role before the page renders. (2) Server actions and API routes independently re-verify the user via Clerk, so the security does not depend on the UI hiding buttons.

---

## 6. The Data Model (Prisma Schema)

The schema (`prisma/schema.prisma`) has **24 models**. Mental map:

**Tenant & people**
- `School` — the tenant root; owns everything and holds the `plan`.
- `Admin`, `Teacher`, `Student`, `Parent` — users. Their `id` is the **Clerk user ID** (string), linking auth identity to DB record.

**Academic structure**
- `Grade` (level 1–12) → `Class` (a section with a capacity & supervisor) → `Student`.
- `Subject` ↔ `Teacher` (many-to-many) and `Subject` → `Lesson`.
- `Lesson` ties a Subject + Class + Teacher to a day/time (the timetable).

**Assessment**
- `Exam` and `Assignment` belong to a Subject + Grade.
- `Result` records a student's `score` for an Exam **or** an Assignment.
- `Attendance` — one row per student per lesson (`@@unique([studentId, lessonId])`), with a `present` boolean and date.

**Quizzes** (the standout feature)
- `Quiz` — created by a teacher, has many `QuizQuestion`s (options stored as JSON, plus the correct `answer` and `difficulty`).
- `QuizAssignment` — assigns a quiz to a class within a `startTime`/`endTime` window.
- `QuizSubmission` — a student's attempt (`@@unique([quizAssignmentId, studentId])` → one attempt each), storing `score`/`totalMarks`.
- `QuizAnswer` — the individual answer the student gave per question.

**Communication**
- `Announcement`, `Event` — school-wide or class-specific (`classId` nullable).
- `Notification` — per-user alert with `type`, `read` flag, and optional `link`. Indexed on `[userId, read]` for fast unread lookups.

**Billing & onboarding**
- `Subscription` — mirrors the Stripe subscription (status, price, period end).
- `PendingSignup` — a school registration *parked* until payment succeeds.
- `PendingStudentSignup` — a student self-registration awaiting admin approval.

**Relationships to remember for the viva:**
- `School 1—* everything` (the tenant boundary).
- `Student *—1 Class`, `Class *—1 Grade`.
- `Result` is the join between a `Student` and an `Exam`/`Assignment`.
- `Quiz → QuizAssignment → QuizSubmission → QuizAnswer` is the quiz lifecycle chain.
- Cascade deletes (`onDelete: Cascade`) on quiz children so deleting a quiz cleans up its questions/submissions.

> **Likely viva question — "Why is a Student's id a String, not auto-increment?"**
> Answer: It's the Clerk user ID. Using it as the primary key means the auth identity and the database row are the same key — no extra mapping table needed.

---

## 7. Subscription Plans & Feature Gating

Plans are defined as plain data in `src/lib/plans-shared.ts`:

| Plan | Admins | Teachers | Students | Quizzes | AI Quiz | Exams | Finance | Notifications |
|------|--------|----------|----------|---------|---------|-------|---------|---------------|
| **FREE** ($0) | 1 | 5 | 50 | ✗ | ✗ | ✗ | ✗ | ✗ |
| **PLUS** ($29) | 1 | 15 | 250 | ✓ | ✗ | ✓ | ✓ | ✓ |
| **PRO** ($99) | ∞ | ∞ | ∞ | ✓ | ✓ | ✓ | ✓ | ✓ |

**How gating is enforced** (`src/lib/plans.ts`):
- `assertFeature(schoolId, "aiQuiz")` — looks up the school's plan, throws `PlanLimitError` if the feature is off. Used by the AI quiz route, which returns HTTP **402 Payment Required** when blocked.
- `assertWithinLimit(schoolId, "students")` — counts existing rows and refuses to create more than the plan allows.

This is **server-enforced**, so hiding a button in the UI is just convenience — the real gate is in the backend.

> **Likely viva question — "What happens if a FREE school tries to use AI quizzes?"**
> Answer: The `/api/generate-quiz` route calls `assertFeature(schoolId, "aiQuiz")`, which throws because FREE has `aiQuiz: false`. The route catches it and returns 402 with an "upgrade" message.

---

## 8. Key Workflows (Trace these end-to-end)

### 8.1 School Sign-up & Payment (Stripe)

```
1. Visitor fills onboarding form (school + admin details) and picks a plan
        │
2. POST /api/stripe/checkout
        │  - validates input with Zod
        │  - stores a PendingSignup row (school+admin draft, expires in 24h)
        │  - creates a Stripe Checkout Session (with pendingSignupId in metadata)
        ▼
3. User redirected to Stripe, pays
        │
4. Stripe → POST /api/stripe/webhook  (event: checkout.session.completed)
        │  - verifies signature with STRIPE_WEBHOOK_SECRET
        │  - reads the PendingSignup
        │  - creates the Clerk admin user (role: "admin")
        │  - in ONE Prisma transaction: create School + Admin + Subscription, delete PendingSignup
        │  - updates Clerk user metadata with the new schoolId
        ▼
5. Success page polls /api/stripe/provision-status until the account exists, then logs in
```

**Why a PendingSignup + webhook instead of creating the school immediately?**
Because the school must only exist *after payment is confirmed*. Stripe confirms payment asynchronously via webhook, so we park the data and finish provisioning when the webhook fires. The whole creation is wrapped in a **database transaction** — if any step fails, everything rolls back and the half-created Clerk user is deleted.

**Ongoing plan changes:** `customer.subscription.updated` / `.deleted` webhooks update the `Subscription` row *and* the `School.plan` field, so feature gating instantly reflects the new plan. A failed payment sets status to `PAST_DUE`.

### 8.2 AI Quiz Generation (`/api/generate-quiz`)

```
Teacher uploads PDF/DOCX/PPTX/TXT  +  question count (1–20)  +  difficulty
        │
1. Authenticate (Clerk) → resolve schoolId
2. assertFeature(schoolId, "aiQuiz")   ← PRO-only, else 402
3. Save upload to a temp file
4. Extract raw text:
     - PDF  → pdf-parse
     - DOCX → mammoth
     - PPTX → unzip with jszip, parse slide XML, collect text nodes
     - TXT  → read directly
   (reject if < 50 chars — likely image-only/scanned)
5. Build a strict prompt + JSON schema, call OpenAI gpt-4o-mini
        (response_format: json_object → guaranteed JSON back)
6. Return the quiz array to the teacher to review/save
7. finally: delete the temp file
```
Text is truncated to **40,000 chars** before sending to OpenAI (cost & context-window control).

### 8.3 Student Takes a Quiz (`/api/quiz/submit`)

Security highlights (good to mention in viva):
- `studentId` is taken from **Clerk auth, not the request body** → can't impersonate.
- **One attempt only** — enforced by the `@@unique([quizAssignmentId, studentId])` constraint *and* an explicit check (returns 409 if already submitted).
- **Time window** — rejects submissions before `startTime` or after `endTime` (403).
- **Grading is server-side** — correct answers are fetched fresh from the DB and compared; the client never sees or sends the answer key. Score = count of matches, percentage computed and returned.

### 8.4 Notifications

When a teacher creates an assignment/exam/quiz/announcement, server actions in `actions.ts` call helpers (`notifyStudentsOfGrade`, `notifyStudentsOfClass`, etc.) to bulk-insert `Notification` rows (`createMany`) for the right audience. The `NotificationBell` component reads unread counts (fast thanks to the `[userId, read]` index) and `markNotificationsRead` flips them to read.

---

## 9. Project Structure (Where things live)

```
src/
├── app/
│   ├── (dashboard)/          # Protected app — route group with shared sidebar+navbar layout
│   │   ├── admin/  teacher/  student/  parent/  superadmin/   # Role home pages
│   │   └── list/             # CRUD pages: students, teachers, classes, exams, quizzes…
│   ├── api/                  # Backend endpoints
│   │   ├── generate-quiz/    #   AI quiz generation (PRO)
│   │   ├── quiz/             #   quiz CRUD + submission + grading
│   │   ├── stripe/           #   checkout, webhook, portal, change-plan, sync
│   │   ├── student/          #   summary reports
│   │   └── public/           #   unauthenticated: school list, grades, student self-signup
│   ├── onboarding/  pricing/  sign-in/  sign-up/   # Public flows
│   └── page.tsx              # Public landing page
├── components/
│   ├── forms/                # 14 CRUD form components (React Hook Form + Zod)
│   ├── DashboardShell.tsx    # Sidebar + content responsive layout
│   ├── Navbar.tsx Menu.tsx   # Top nav (search, notifications) + sidebar nav
│   ├── BigCalendar.tsx       # Weekly timetable
│   ├── QuizGeneratorClient   # AI upload UI
│   └── *Chart.tsx            # Recharts visualisations
└── lib/
    ├── actions.ts            # Server actions (all mutations)
    ├── data.ts               # Shared data-fetching helpers
    ├── prisma.ts             # Prisma client singleton (avoids connection storms in dev)
    ├── plans.ts / plans-shared.ts  # Feature gating + plan definitions
    ├── settings.ts           # ITEM_PER_PAGE + route-access map
    ├── stripe.ts / stripe-provisioning.ts  # Billing helpers
    ├── formValidationSchemas.ts  # Zod schemas (validation shared client+server)
    └── utils.ts              # getCurrentUser, schoolFilter, date helpers
```

**Why the `(dashboard)` parentheses?** It's a Next.js **route group** — it shares a layout (sidebar + navbar) across all dashboard pages **without** adding `/dashboard` to the URL.

---

## 10. Notable Implementation Details (Bonus marks)

- **Prisma singleton** (`lib/prisma.ts`): in development, Next.js hot-reload would otherwise spawn a new DB connection on every reload. A global singleton prevents connection exhaustion.
- **Timetable normalisation** (`utils.ts → adjustScheduleToCurrentWeek`): lessons are stored once but re-projected onto the current week so the calendar always shows "this week's" schedule regardless of when the lesson was created.
- **Dark mode**: implemented with semantic Tailwind tokens (`surface`, `ink`, `brand`, `line`) and a `ThemeProvider`, so every component is theme-agnostic.
- **Validation reuse**: the same Zod schemas validate forms on the client *and* are re-validated on the server in actions/APIs — never trust the client alone.
- **Student self-signup with approval**: public endpoint creates a `PendingStudentSignup` (status PENDING); an admin reviews and accepts/declines before a real Student + Clerk account is made.
- **File cleanup**: AI quiz uploads are written to the OS temp dir and **always deleted in a `finally` block**, even on error.

---

## 11. Likely Viva Questions — Quick Answers

| Question | Short answer |
|----------|--------------|
| What problem does it solve? | Schools manage academics, communication, and billing in one role-based platform instead of spreadsheets + separate tools. |
| What does "multi-tenant" mean here? | One app + one DB serves many schools; each is isolated by a `schoolId` on every record. |
| Server Component vs Client Component? | Server Components run on the server (can query DB, hold secrets); Client Components (`"use client"`) run in the browser for interactivity. Default is server. |
| Server Action vs API Route? | Actions are typed server functions called straight from forms (mutations). API routes are REST endpoints for external callers/webhooks and complex request handling. |
| How is the password stored? | We don't store it — Clerk manages credentials. We only keep a role + schoolId in session metadata. |
| How do you prevent a student grading their own quiz? | Grading is server-side; correct answers are fetched from the DB, never sent to the client; `studentId` comes from the auth session. |
| Why Prisma? | Type-safe queries generated from the schema, automatic migrations, single source of truth for the data model. |
| How does a plan upgrade take effect instantly? | Stripe webhook updates the `Subscription` row and `School.plan`; all feature checks read `School.plan`, so the change is immediate. |
| What happens if the OpenAI call fails? | The route catches the error, deletes the temp file, and returns a 500 with the message; the teacher sees an error toast. |
| How is the timetable kept "current"? | Lessons store an absolute date/time but are re-mapped onto the current Monday-based week at render time. |
| Biggest security principle? | Never trust the client: identity from Clerk session, every query scoped by `schoolId`, every mutation re-validated server-side. |

---

## 12. Possible Improvements (Shows maturity)

- Add automated tests (unit for grading/gating logic, e2e for the Stripe flow).
- Rate-limit the AI endpoint per school to control OpenAI cost.
- Add Row-Level Security in PostgreSQL as a defence-in-depth backup to app-level `schoolId` filtering.
- Cache dashboards / use React Suspense streaming for faster perceived load.
- Support more quiz types (currently only MCQ; the schema already has a `QuizType` enum ready to extend).

---

### How to run it (for a live demo)
```bash
npm install
npx prisma migrate deploy        # set up DB
npm run dev                       # http://localhost:3000
# or: docker-compose up           # full stack (Postgres + app)
```
Requires `.env` with `DATABASE_URL`, Clerk keys, Stripe keys + price IDs, `OPENAI_API_KEY`, and Cloudinary name (see `.env.example`).

---

*Good luck in your viva. If you can trace the three workflows in Section 8 from UI → server → database and back, and explain the `schoolId` isolation in Section 4, you can defend any part of this system.*
