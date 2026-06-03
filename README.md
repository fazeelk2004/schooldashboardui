# NeuraLearn

A comprehensive, multi-tenant school management dashboard built with Next.js 14. Designed for schools to manage academics, communications, and billing in one place — with role-based access for admins, teachers, students, and parents.

---

## Features

### Academic Management
- **Lessons** — Schedule lessons by day, subject, class, and teacher with semester tracking
- **Exams** — Create and manage assessments with subject and grade associations
- **Assignments** — Track assignments with due dates, subjects, and grade levels
- **Grades** — Grade level management (1–12) per school
- **Results** — Record and view exam and assignment scores
- **Attendance** — Per-lesson attendance tracking with date markers

### Quiz System
- **AI Quiz Generation** *(PRO plan)* — Upload PDFs, DOCX, PPTX, or TXT files; OpenAI generates multiple-choice quizzes automatically
  - Configurable difficulty: easy / medium / hard
  - 1–20 questions per quiz
- **Quiz Management** — Create, assign, and track MCQ quizzes across classes
- **Quiz Submissions** — Students submit answers with automatic scoring

### Communication
- **Announcements** — School-wide or class-specific broadcasts
- **Events** — School calendar with multi-day event support
- **Notifications** — Real-time alerts for assignments, exams, quizzes, and announcements with read/unread tracking

### User & Role Management
- **Multi-tenancy** — Each school is an isolated tenant with its own branding
- **Admins** — Full management capabilities within their school
- **Teachers** — Manage classes, lessons, subjects, and create quizzes
- **Students** — View schedules, grades, assignments, and take quizzes
- **Parents** — Monitor child attendance, grades, assignments, and exams
- **Student Signup Approval** — Admin review workflow for pending registrations

### Billing & Subscriptions
| Plan | Price | Admins | Teachers | Students | Notable Features |
|------|-------|--------|----------|----------|-----------------|
| FREE | $0/mo | 1 | 5 | 50 | Announcements, events, attendance |
| PLUS | $29/mo | 1 | 15 | 250 | + Quizzes, exams, finance charts, notifications |
| PRO | $99/mo | Unlimited | Unlimited | Unlimited | + AI quiz generation, all features |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4.1 (semantic design tokens, dark mode) |
| Auth | Clerk |
| Database | PostgreSQL via Prisma ORM 7.4.2 |
| Payments | Stripe |
| AI | OpenAI API (gpt-4o-mini) |
| Images | Cloudinary |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Calendar | React Big Calendar |
| File Parsing | pdf-parse, mammoth, jszip + fast-xml-parser |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
schooldashboardui/
├── src/
│   ├── app/
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── admin/                # Admin home & billing
│   │   │   ├── teacher/              # Teacher home
│   │   │   ├── student/              # Student home
│   │   │   ├── parent/               # Parent home
│   │   │   ├── superadmin/           # Super-admin management
│   │   │   ├── search/               # Global search
│   │   │   └── list/                 # Data management pages
│   │   │       ├── admins/
│   │   │       ├── announcements/
│   │   │       ├── assignments/
│   │   │       ├── attendance/
│   │   │       ├── classes/
│   │   │       ├── events/
│   │   │       ├── exams/
│   │   │       ├── grades/
│   │   │       ├── lessons/
│   │   │       ├── my-quizzes/
│   │   │       ├── quiz-generator/
│   │   │       ├── quiz-take/
│   │   │       ├── results/
│   │   │       ├── schools/
│   │   │       ├── students/
│   │   │       ├── subjects/
│   │   │       ├── teachers/
│   │   │       └── parents/
│   │   ├── api/
│   │   │   ├── generate-quiz/        # AI quiz generation endpoint
│   │   │   ├── quiz/                 # Quiz CRUD & submissions
│   │   │   ├── stripe/               # Stripe checkout & webhooks
│   │   │   ├── student/              # Student summary reports
│   │   │   └── public/               # Unauthenticated endpoints
│   │   ├── onboarding/               # School setup flow
│   │   ├── pricing/                  # Public pricing page
│   │   ├── sign-in/                  # Clerk sign-in
│   │   ├── sign-up/                  # Student registration
│   │   └── page.tsx                  # Public home page
│   ├── components/
│   │   ├── forms/                    # 14 CRUD form components
│   │   ├── Table.tsx                 # Reusable data table
│   │   ├── DashboardShell.tsx        # Sidebar + content layout
│   │   ├── Navbar.tsx                # Top nav with search & notifications
│   │   ├── Menu.tsx                  # Sidebar navigation
│   │   ├── BigCalendar.tsx           # Lesson/event calendar
│   │   ├── QuizGeneratorClient.tsx   # AI quiz upload UI
│   │   ├── FinanceChart.tsx          # Revenue visualization
│   │   ├── AttendanceChart.tsx       # Attendance visualization
│   │   └── ...                       # 20+ more components
│   └── lib/
│       ├── actions.ts                # Server actions (mutations)
│       ├── data.ts                   # Data fetching utilities
│       ├── prisma.ts                 # Prisma client singleton
│       ├── plans.ts                  # Plan feature-gating logic
│       ├── plans-shared.ts           # Plan tier definitions
│       ├── stripe.ts                 # Stripe utilities
│       ├── stripe-provisioning.ts    # Subscription provisioning
│       ├── formValidationSchemas.ts  # Zod schemas
│       ├── settings.ts               # Route access control
│       └── utils.ts                  # Helpers
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Seed script
│   └── migrations/                   # Migration history
├── public/                           # Static assets & icons
├── Dockerfile
├── docker-compose.yml
└── ERD.svg                           # Entity-relationship diagram
```

---

## Database Schema

**24 models** covering the full school data model:

`School` · `Admin` · `Teacher` · `Student` · `Parent` · `Grade` · `Class` · `Subject` · `Lesson` · `Exam` · `Assignment` · `Result` · `Attendance` · `Event` · `Announcement` · `Quiz` · `QuizQuestion` · `QuizAssignment` · `QuizSubmission` · `QuizAnswer` · `Notification` · `Subscription` · `PendingSignup` · `PendingStudentSignup`

See [ERD.svg](ERD.svg) for the full entity-relationship diagram.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Accounts for: Clerk, Stripe, OpenAI, Cloudinary

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/neuralearn

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# OpenAI (AI quiz generation — PRO plan)
OPENAI_API_KEY=sk-...

# Stripe (billing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FREE=price_...
STRIPE_PRICE_PLUS=price_...
STRIPE_PRICE_PRO=price_...

# Cloudinary (image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Set up the database

```bash
# Run migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Generate Prisma client + build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Docker

Start the full stack (PostgreSQL + Next.js app) with Docker Compose:

```bash
docker-compose up
```

The app will be available at `http://localhost:3000`. The database runs on port `5432`.

---

## Design System

Tailwind CSS is extended with semantic color tokens that work across light and dark modes:

| Token | Usage |
|-------|-------|
| `surface` / `surface-muted` / `surface-subtle` | Backgrounds |
| `ink` / `ink-muted` / `ink-subtle` | Text |
| `line` | Borders |
| `brand` / `brand-soft` | Primary accent |

Reusable utility classes are defined in `globals.css`:

- `.panel` — card container
- `.input-base` — form inputs
- `.btn-primary` / `.btn-ghost` — buttons
- `.chip` — badges and tags

---

## Deployment

### Vercel (recommended)

1. Push to GitHub and import the repository in Vercel.
2. Add all environment variables in the Vercel dashboard.
3. Set the build command to `npm run build` (Prisma client is generated automatically).

### Self-hosted (Docker)

Use the provided `Dockerfile` and `docker-compose.yml`. Ensure `DATABASE_URL` points to a production PostgreSQL instance and all secrets are injected via environment variables.

> **Stripe Webhooks**: In production, configure your Stripe dashboard to send webhook events to `https://yourdomain.com/api/stripe/webhook` and update `STRIPE_WEBHOOK_SECRET` accordingly.

---

## License

MIT
