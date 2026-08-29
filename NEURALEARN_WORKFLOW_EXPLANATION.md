# NeuraLearn School Management System

## Complete Web Application Workflow and Technical Explanation

**Document purpose:** This document explains what NeuraLearn is, who uses it, how its frontend and backend work together, how information moves through the system, and how its major business workflows operate from beginning to end. It is written so it can be adapted directly into a project report, PDF, presentation, or viva explanation.

**Codebase reviewed:** `SCHOOL MANAGMENT SYSTEM/schooldashboardui`

**Application type:** Multi-tenant, subscription-based school management web application

---

## 1. Executive Summary

NeuraLearn is a full-stack school management platform designed to bring academic administration, user management, communication, attendance, assessments, and subscription billing into one system. It serves multiple independent schools from a single deployed application. Each school acts as a separate tenant: it has its own administrators, teachers, students, parents, classes, grades, subjects, lessons, assessments, events, announcements, quizzes, notifications, and subscription.

The application supports five authenticated roles:

- A **Super Admin** manages the platform across all schools.
- A **School Admin** manages one school and its operational data.
- A **Teacher** views a teaching schedule, works with academic records, marks attendance, and creates and assigns quizzes.
- A **Student** views a class schedule, assessments, results, attendance, announcements, events, and assigned quizzes.
- A **Parent** follows the schedules, attendance, and academic performance of linked children.

There are also public workflows for visitors. A school representative can compare plans, enter school and administrator details, pay through Stripe, and receive a provisioned school account. A student can select a school, submit a registration application, optionally register or link a parent, and wait for a school administrator to approve the application.

NeuraLearn is implemented as a single **Next.js 14 App Router** application. It does not have separate frontend and backend repositories. React pages and components form the user interface, while Server Components, Server Actions, and API route handlers provide the backend inside the same project. PostgreSQL stores application data through Prisma, Clerk manages identities and sessions, Stripe manages subscriptions, OpenAI generates quiz questions, and Cloudinary supports uploaded profile or school images.

In one sentence:

> NeuraLearn is a role-aware, multi-school SaaS platform that connects school setup, academic organization, daily classroom work, student monitoring, communication, AI-assisted assessment, and billing in one web application.

---

## 2. The Problem the Application Solves

Schools often maintain information in separate spreadsheets, paper registers, messaging groups, timetable files, and payment systems. That creates repeated data entry, inconsistent records, limited visibility for parents and students, and extra administrative work for teachers.

NeuraLearn addresses this by creating one connected information model:

- A school defines its grades, subjects, classes, and lessons.
- Administrators add teachers, students, and parents to that structure.
- Teachers work from assigned subjects, classes, and lessons.
- Exams and assignments target grades.
- Attendance connects students to lessons.
- Results connect students to exams or assignments.
- Quizzes connect a teacher-created question set to a class and an availability window.
- Students see only the academic information relevant to their class or identity.
- Parents see information related to their linked children.
- Announcements, events, and notifications keep users informed.
- A subscription plan controls account limits and selected product capabilities.

The value of the system is therefore not simply that it has many pages. Its value comes from the relationships between those pages and records.

---

## 3. Users and Responsibilities

### 3.1 Public Visitor

A public visitor does not need an authenticated session. The visitor can:

- Read the landing page.
- Review the Free, Plus, and Pro plans.
- Begin school onboarding.
- Sign in to an existing account.
- Start a public student application.
- Retrieve the public school list and the grades belonging to a selected school during student registration.

The public landing page also checks for an existing Clerk session. If a signed-in user opens `/`, the server reads the user's role and immediately redirects that user to `/{role}`.

### 3.2 Super Admin

The Super Admin is the platform-level operator. Unlike school users, this role is not tied to one school in the normal data-fetching pattern. It can:

- View aggregate counts across all schools.
- View the list of every school.
- Create, update, or delete school records through the management interface.
- View and manage administrator accounts.
- Browse academic and people records across tenants where the relevant list pages support the Super Admin role.
- View cross-school attendance and dashboard information.

The Super Admin dashboard displays school cards with student, teacher, class, and administrator counts. It also displays aggregate user counts, attendance visualization, events, announcements, and a finance chart. The current finance chart uses fixed demonstration data rather than persisted financial transactions.

### 3.3 School Admin

The School Admin is the operational owner of one tenant. The admin's Clerk metadata contains both `role: "admin"` and the school's numeric `schoolId`. The admin can:

- View a school overview with user totals, student distribution, weekly attendance, events, and announcements.
- Manage teachers, students, parents, grades, classes, subjects, and lessons.
- Create and manage exams, assignments, and results.
- View attendance across the school.
- Create school-wide or class-specific events and announcements.
- Review pending student applications and accept or decline them.
- View the current subscription and use Stripe billing tools.

The admin is the main link between a newly provisioned school and its day-to-day academic operation.

### 3.4 Teacher

The Teacher is an academic user. A teacher can:

- View a weekly schedule based on lessons whose `teacherId` matches the signed-in Clerk user ID.
- View school teachers, students, parents, and classes through permitted list pages.
- View lessons and academic information related to the school.
- Create or manage exams, assignments, and results through the current UI.
- Mark attendance only for the teacher's own lesson, on the scheduled day, and during that lesson's time window.
- View events and announcements that are school-wide or relevant to a class the teacher teaches.
- On the Pro plan, upload documents, generate an AI quiz, save it, and assign it to a class.

The teacher dashboard is intentionally schedule-focused: its main content is the weekly timetable, with announcements displayed beside it.

### 3.5 Student

The Student is connected to one grade and one class. A student can:

- View the current class timetable.
- View school-wide events and relevant announcements.
- Browse exams and assignments that belong to the student's grade.
- View the student's own recorded results.
- View the student's own attendance history.
- View assigned quizzes for the student's class.
- Take a quiz only within its configured start and end time.
- Receive automatic scoring after quiz submission.
- Open a current-month summary report and print or save it as a PDF.

The student's database ID is also the Clerk user ID. That enables backend code to use the authenticated `userId` directly when looking up the student's class, results, attendance, and submissions.

### 3.6 Parent

A Parent can be linked to one or more students. The parent can:

- View a weekly schedule for each linked child.
- View exams and assignments relevant to those children.
- View the children's results, including quiz submissions in the combined results page.
- View attendance belonging only to linked children.
- View class-specific or school-wide announcements and events.
- Open a child's student profile and current-month summary report.

The parent dashboard loops over all students whose `parentId` equals the parent's authenticated Clerk user ID and renders a schedule for each child.

---

## 4. Role-to-Module View

The following table summarizes the application navigation and current user-facing permissions. “Manage” means that the current interface exposes create, update, or delete controls; exact controls vary by page.

| Module | Super Admin | School Admin | Teacher | Student | Parent |
|---|---|---|---|---|---|
| Platform schools | View/manage all | No | No | No | No |
| Admin accounts | View/manage | No direct menu item | No | No | No |
| Teachers | View | Manage own school | View | No | No |
| Students | View | Manage own school | View | No | No |
| Student signup requests | No | Approve/decline | No | No | No |
| Parents | View | Manage own school | View | No | No |
| Subjects | View | Manage own school | No menu access | No | No |
| Grades | View | Manage own school | No menu access | No | No |
| Classes | View | Manage own school | View | No | No |
| Lessons | View | Manage own school | View | No | No |
| Exams | View | Manage | Manage/view assigned academic scope | View own grade | View children's scope |
| Assignments | View | Manage | Manage/view assigned academic scope | View own grade | View children's scope |
| Results | View | Manage | Manage relevant subjects/quizzes | View own | View children |
| Attendance | View all | View school | Mark own active lessons | View own | View children |
| Events | View | Manage | View relevant | View relevant | View relevant |
| Announcements | View | Manage | View relevant | View relevant | View relevant |
| AI quiz generator | No | No | Pro-plan teacher | No | No |
| Assigned quizzes | No | No | Assign | Take | No direct quiz page |
| Billing | No | Manage school subscription | No | No | No |

This table describes the current interface. Backend enforcement limitations are discussed separately in Section 18 so they are not confused with the intended product workflow.

---

## 5. High-Level Architecture

```text
                         NEURALEARN USERS
        Public visitor / Super Admin / Admin / Teacher / Student / Parent
                                      |
                                      v
                  +---------------------------------------+
                  | Browser                               |
                  | React UI + interactive client parts   |
                  +-------------------+-------------------+
                                      |
                                      v
                  +---------------------------------------+
                  | Next.js 14 App Router                 |
                  |                                       |
                  | Public pages and protected dashboard  |
                  | Clerk middleware and session metadata |
                  | Server Components for read operations |
                  | Server Actions for form mutations     |
                  | API routes for special workflows      |
                  +----+-------------+----------+---------+
                       |             |          |
             +---------+--+     +----+----+  +--+---------+
             | PostgreSQL |     | Clerk   |  | Stripe     |
             | via Prisma |     | Auth    |  | Billing    |
             +------------+     +---------+  +------------+
                       |
                       |       +---------------------------+
                       +------>| Application relationships |
                               +---------------------------+

                  Additional services used by the app:
                  OpenAI -> AI-generated MCQ questions
                  Cloudinary -> image upload/storage
```

### 5.1 Why This Is a Full-Stack Next.js Application

The frontend and backend are in the same repository:

- Files under `src/app` define pages, layouts, and HTTP route handlers.
- Server Components query Prisma directly before HTML is sent to the browser.
- Client Components handle modal state, forms, calendars, charts, quiz interaction, theme switching, and browser requests.
- Server Actions in `src/lib/actions.ts` handle most create, update, delete, approval, attendance, and quiz-assignment operations.
- API routes under `src/app/api` handle workflows that need request/response control, file upload processing, external webhooks, public form submission, and quiz submission.

This structure reduces the need for a separate REST backend for ordinary dashboard pages while retaining API endpoints where they are useful.

### 5.2 The Three Main Data Paths

#### Read path: Server Component to Prisma

Most list pages run on the server. A page reads the current user, builds a role- and school-aware Prisma `where` condition, queries PostgreSQL, and returns rendered React output. Database credentials and raw Prisma access remain on the server.

```text
Browser requests page
        -> Next.js Server Component
        -> Clerk session is read
        -> Prisma query is built
        -> PostgreSQL returns records
        -> HTML and React payload return to browser
```

#### Write path: Form to Server Action

Most management forms use React Hook Form and Zod in a modal. The submitted data is passed to a Server Action, which writes through Prisma and sometimes creates or updates a Clerk user.

```text
User opens create/update modal
        -> FormContainer loads related dropdown data
        -> Client form validates fields with Zod
        -> useFormState calls a Server Action
        -> Prisma and/or Clerk are updated
        -> UI shows a toast and refreshes the page
```

#### Specialized path: Browser or external service to API route

API routes are used for:

- Public school and grade lookup.
- Public student application submission.
- AI document upload and quiz generation.
- Loading a quiz without its answer key.
- Student quiz submission and automatic grading.
- Stripe checkout, plan changes, billing portal, synchronization, and webhooks.
- Student monthly summary reports.

---

## 6. Frontend Structure and Navigation

### 6.1 Public Interface

The landing page introduces the product, roles, and key features. Its main actions are:

- **Pricing** -> `/pricing`
- **Student Sign-Up** -> `/sign-up/student`
- **Login** -> `/sign-in`
- **Get Started** -> pricing and onboarding

The pricing page presents three cards. Selecting a plan sends the visitor to `/onboarding?plan=FREE`, `PLUS`, or `PRO`.

### 6.2 Dashboard Shell

All dashboard routes share the `(dashboard)` route-group layout. The parentheses are a Next.js organizational feature; they do not add the word `dashboard` to the URL.

The shared layout contains:

- A responsive sidebar.
- The NeuraLearn logo.
- A role-aware menu.
- A dark-mode toggle.
- A sticky top navigation bar.
- A global search box.
- The latest 20 notifications for the signed-in user.
- The signed-in user's name and role.
- A user menu for account actions.

The sidebar is created on the server. It reads the Clerk user and hides entries that are not visible to the user's role. It also reads the school's plan and removes the AI Quiz Generator entry when AI quiz generation is unavailable.

### 6.3 List Page Pattern

Most management pages use the same interaction pattern:

1. Read URL search parameters such as page number, search text, filter, or sort order.
2. Read `userId`, `role`, and `schoolId` from the session.
3. Build a Prisma query for the correct school and role.
4. Fetch a page of records and a total count.
5. Render a reusable table.
6. Display search, filter, sort, pagination, and authorized action buttons.
7. Open a reusable modal for create, update, or delete.
8. Load related data for dropdowns, such as subjects, teachers, grades, classes, or students.
9. Submit to the correct Server Action.
10. Show success/error feedback and refresh the current route.

This pattern is reused for schools, administrators, teachers, students, parents, subjects, grades, classes, lessons, exams, assignments, results, events, and announcements.

---

## 7. Authentication, Role Redirection, and Tenant Identity

### 7.1 Authentication with Clerk

Clerk is responsible for credentials, sign-in sessions, and user identity. The custom sign-in page uses Clerk Elements and asks for a username and password. After sign-in, it reads `user.publicMetadata.role` and routes the user to the matching dashboard:

```text
superadmin -> /superadmin
admin      -> /admin
teacher    -> /teacher
student    -> /student
parent     -> /parent
```

### 7.2 Role and School Metadata

The system expects Clerk public/session metadata in this shape:

```json
{
  "role": "teacher",
  "schoolId": 12
}
```

The `getCurrentUser()` helper reads:

- `userId`: the Clerk identity.
- `role`: the authorization category.
- `schoolId`: the tenant to which a normal school user belongs.

For Admin, Teacher, Student, and Parent records, the Prisma primary key is the Clerk user ID. This avoids a separate identity mapping table.

### 7.3 Route-Level Authorization

`src/middleware.ts` compares requested paths with `routeAccessMap` in `src/lib/settings.ts`. For routes present in that map, a user with the wrong role is redirected to the user's own role dashboard. Public routes bypass this role loop, including the landing page, pricing, onboarding, sign-in, student sign-up, selected Stripe routes, and public lookup APIs.

Route authorization is only one layer. Sensitive API routes and Server Actions should also verify role, identity, ownership, and school scope because hiding a page or button is not a complete security boundary. The current degree of backend verification varies by workflow; Section 18 records the exact hardening work still needed.

### 7.4 Multi-Tenancy

`School` is the tenant root. Most business records contain a `schoolId` foreign key, including teachers, students, parents, grades, classes, subjects, lessons, exams, assignments, events, announcements, quizzes, quiz assignments, notifications, and subscriptions.

For normal school users, list pages usually add:

```text
where: { schoolId: currentUser.schoolId }
```

For a Super Admin, the filter is generally omitted so records from all schools can be viewed. Records such as Result and Attendance do not have their own `schoolId`; their tenant is inferred through the connected student, lesson, exam, or assignment.

---

## 8. End-to-End School Onboarding and Payment Workflow

This is the workflow that turns a public visitor into the first administrator of a new school.

### Step 1: Select a plan

The visitor opens `/pricing` and selects Free, Plus, or Pro. The selection is added to the onboarding URL as a query parameter.

### Step 2: Enter school and admin information

The onboarding form collects:

- School name, email, phone, website, address, and description.
- Administrator username, email, and password.

The browser sends this information to `POST /api/stripe/checkout`.

### Step 3: Validate and create a pending registration

The checkout route validates the request with Zod. It rejects an invalid plan, malformed fields, a password shorter than eight characters, or a school name that already exists.

If valid, it creates a `PendingSignup` record containing:

- The selected plan.
- The submitted school/admin payload.
- The administrator email.
- A 24-hour expiration time.

The final School is not created yet because payment has not been confirmed.

### Step 4: Create a Stripe Checkout Session

The backend translates the plan into a Stripe Price ID from environment configuration and creates a subscription checkout session. The pending signup ID and plan are stored in Stripe metadata so the asynchronous webhook can reconnect payment to the submitted application.

The browser redirects to the Stripe-hosted payment page.

### Step 5: Stripe confirms checkout

After checkout, Stripe sends `checkout.session.completed` to `POST /api/stripe/webhook`. The webhook reads the raw body and validates the Stripe signature using `STRIPE_WEBHOOK_SECRET`. This prevents forged provisioning requests.

### Step 6: Provision the tenant and administrator

For a new-school checkout, the webhook:

1. Retrieves the `PendingSignup`.
2. Retrieves Stripe subscription details.
3. Determines the effective plan from the Stripe price or pending plan.
4. Prevents duplicate provisioning for an already recorded Stripe subscription.
5. Creates the administrator identity in Clerk.
6. Runs a Prisma transaction that creates the School, Admin, and Subscription and deletes the pending signup.
7. Updates Clerk metadata with `role: "admin"` and the newly created `schoolId`.

If database provisioning fails inside this flow, the code attempts to delete the just-created Clerk user so a half-created identity is not left behind.

### Step 7: Poll for completion

Stripe returns the browser to `/onboarding/success?session_id=...`. The success page polls `/api/stripe/provision-status` every two seconds, up to 30 attempts. That endpoint retrieves the Stripe session and checks whether its subscription ID exists in the local Subscription table.

When ready, the page displays a button that sends the new administrator to sign in.

### Why the workflow is asynchronous

The browser's success redirect is not proof that the application has completed provisioning. Stripe's signed webhook is the authoritative payment event. The pending record and polling page bridge that asynchronous gap.

```text
Pricing -> Onboarding form -> PendingSignup -> Stripe Checkout
                                              |
                                              v
                                     Signed Stripe webhook
                                              |
                     Clerk Admin <- School + Admin + Subscription transaction
                                              |
                                              v
                                 Success page detects readiness
```

---

## 9. Subscription Plans and Billing Workflow

### 9.1 Plan definitions

| Capability | Free | Plus | Pro |
|---|---:|---:|---:|
| Monthly display price | $0 | $29 | $99 |
| Maximum admins | 1 | 1 | Unlimited |
| Maximum teachers | 5 | 15 | Unlimited |
| Maximum students | 50 | 250 | Unlimited |
| Quizzes | No | Yes | Yes |
| AI quiz generation | No | No | Yes |
| Exams | No | Yes | Yes |
| Finance chart | No | Yes | Yes |
| Announcements | Yes | Yes | Yes |
| Events | Yes | Yes | Yes |
| Attendance | Yes | Yes | Yes |
| Notifications | No | Yes | Yes |

These values are defined in `src/lib/plans-shared.ts` and are used by the pricing, menu, billing, limit, and feature-gating code.

### 9.2 User-count limits

When an administrator creates an Admin, Teacher, or Student through the corresponding action, the backend can call `assertWithinLimit`. That function:

1. Loads the school's current plan.
2. Chooses the maximum count for the requested resource.
3. Counts existing records in the school's tenant.
4. Throws `PlanLimitError` if the maximum has already been reached.

The public student-approval flow also checks the student limit before creating the accepted account.

### 9.3 Billing page

The school administrator's billing page loads the school and Subscription record and displays:

- Current plan and price.
- Subscription status.
- Renewal/current period end.
- Whether cancellation is scheduled.
- User limits and major enabled features.
- A button to open the Stripe Billing Portal.
- A plan-change interface.
- A manual “sync from Stripe” recovery action.

### 9.4 Changing plan

`POST /api/stripe/change-plan` requires an Admin role and school ID.

- If the school already has a Stripe subscription, the route replaces the subscription item's Price ID and requests prorations.
- If no subscription ID exists, it creates a new Stripe Checkout Session for the existing school.
- The interface distinguishes upgrades and downgrades and asks for confirmation.

The local plan is ultimately reconciled through Stripe events or a manual sync. Subscription update/delete events update the Subscription row and `School.plan`. A failed invoice changes the local subscription status to `PAST_DUE`.

### 9.5 Stripe Billing Portal and manual sync

The billing portal route creates a Stripe-managed portal session using the school's Stripe customer ID. This is where payment method and cancellation tasks can be handled.

The sync route searches Stripe for an active subscription carrying the school's metadata. It then upserts the local Subscription and updates the school's plan in one transaction. This gives administrators a recovery path if a webhook was delayed or missed.

---

## 10. Public Student Registration and Admin Approval

This workflow is separate from school onboarding. It lets a student apply to an existing school without immediately creating an active account.

### 10.1 Student application

The public registration form first calls `/api/public/schools` and displays all school names. After a school is selected, it calls `/api/public/grades?schoolId=...` and displays only that school's grades.

The student completes:

- Username and password.
- Name and surname.
- Optional email and phone.
- Address, blood type, birthday, and sex.
- Requested grade.

The form explicitly explains that the class will be assigned by the school administrator after approval.

### 10.2 Parent choice

The applicant chooses one of three parent modes:

- **New parent:** submit full parent details and credentials.
- **Existing parent:** enter an existing parent username and password so the relationship can be verified.
- **None:** continue without linking a parent.

For an existing parent, the API verifies that the parent belongs to the selected school, finds the corresponding Clerk account, and calls Clerk password verification.

### 10.3 Pending record

The public endpoint verifies that:

- The school exists.
- The grade belongs to that school.
- Required parent data matches the selected mode.
- An existing parent's credentials are valid when that mode is chosen.
- The student username is not already used by an active Student.

It then creates a `PendingStudentSignup` with status `PENDING`. No Student Clerk account or active Student row exists yet.

### 10.4 Administrator review

The school admin opens `/admin/signup-requests`. The page queries only pending applications for the admin's school and loads matching classes. For each application, the admin can:

- Review the student and parent details.
- Select a class from the student's requested grade.
- Accept the request.
- Decline the request.

### 10.5 Acceptance

The acceptance action performs several checks:

1. The reviewer must be an authenticated Admin with a school ID.
2. The pending request must belong to that school and still be pending.
3. The chosen class must belong to the school.
4. The class must have remaining capacity.
5. The class grade must equal the student's requested grade.
6. The school's student plan limit must not be exceeded.

It then resolves the parent:

- For an existing parent, it links that existing Parent ID.
- For a new parent, it creates a Clerk parent identity and a Parent row.
- For no parent, it continues without a link.

Finally, it creates the student's Clerk identity, creates the Student row with the selected class and grade, changes the pending request to `ACCEPTED`, records the review time/admin ID, notifies teachers that a student was enrolled, and refreshes the request and student pages.

Declining a request changes the status to `DECLINED` and records who reviewed it and when; it does not create a login account.

---

## 11. Academic Setup Workflow

For a new school, the cleanest setup order is:

```text
School
  -> Grades and Subjects
  -> Teachers
  -> Classes
  -> Students and Parents
  -> Lessons / Timetable
  -> Exams and Assignments
  -> Results and Attendance
  -> Quizzes, Events, Announcements, Reports
```

### 11.1 Grades

A Grade represents a school level. The combination of grade level and school ID is unique, so two schools may both have Grade 5, but one school cannot create Grade 5 twice.

### 11.2 Subjects

A Subject belongs to a school and can connect to multiple Teachers. Subject names are unique within a school. Subjects are later referenced by lessons, exams, and assignments.

### 11.3 Teachers

Creating a teacher is a two-system operation:

1. Check the school's teacher limit.
2. Create a Clerk identity with role and school metadata.
3. Create a Prisma Teacher row using the Clerk ID.
4. Connect the teacher to selected subjects.

A teacher can teach many subjects and lessons and can supervise classes.

### 11.4 Classes

A Class belongs to one Grade and may have one supervisor Teacher. It has a capacity used during direct student creation and public signup approval. A class contains students, lessons, class-specific events and announcements, and quiz assignments.

Class names are unique within one school.

### 11.5 Students and Parents

An active Student must belong to a Grade and Class. It may optionally link to a Parent. Direct admin creation checks the school plan and class capacity, creates a Clerk identity, and creates the Student record.

A Parent has its own Clerk identity and can link to multiple students. This relationship is what drives the parent dashboard, result filters, attendance filters, announcements, and summary-report authorization.

### 11.6 Lessons and the timetable

A Lesson connects:

- One Subject.
- One Class.
- One Teacher.
- A weekday.
- A start time and end time.
- Optional semester start and end dates.
- One School.

The weekly calendar does not require a new lesson row every week. `adjustScheduleToCurrentWeek` takes stored lesson times and projects them onto the most recent Monday-based week while retaining the time of day. Teachers see lessons by `teacherId`; students and parents see lessons by `classId`.

---

## 12. Daily Dashboard Workflows

### 12.1 Admin dashboard

When an Admin opens `/admin`, the server builds school-scoped dashboard data:

- Counts of admins, teachers, students, and parents.
- Male/female student distribution from live Student records.
- Present/absent counts for the current week from Attendance records.
- Calendar and upcoming events.
- The latest announcements.

This gives the administrator an operational snapshot before moving into a management page.

### 12.2 Teacher dashboard

When a Teacher opens `/teacher`, Clerk supplies the teacher's user ID. The calendar container queries lessons with that teacher ID, joins subject, teacher, and class information, adjusts the events to the current week, and displays the timetable. The teacher can then move to attendance, assessments, results, people lists, or the AI quiz workflow.

### 12.3 Student dashboard

When a Student opens `/student`, the app finds the class containing the authenticated Student ID. It displays that class's timetable, an event calendar, and relevant announcements. Other pages use the same user ID and class/grade relationships to filter assessments, attendance, results, and quizzes.

### 12.4 Parent dashboard

When a Parent opens `/parent`, the app loads every Student whose `parentId` is the authenticated parent. It renders a class timetable for each child and a relevant announcement feed.

### 12.5 Super Admin dashboard

The Super Admin dashboard performs cross-tenant queries. It shows:

- Aggregate user counts.
- Cards for all schools with their student, teacher, class, and admin counts.
- Cross-school student distribution and attendance.
- Events and announcements.
- A demonstration finance chart.

---

## 13. Attendance Workflow

Attendance has two different experiences: a Teacher marker and a read-only viewer for the other roles.

### 13.1 Teacher marking flow

1. The Teacher opens `/list/attendance`.
2. The page determines today's weekday using the server clock.
3. Prisma loads only lessons assigned to that teacher for today.
4. The app loads students in the classes attached to those lessons.
5. Existing attendance values are loaded into the marker.
6. The teacher selects a lesson and marks each student present or absent.
7. The client submits records to `markAttendance`.
8. The Server Action verifies that the requester is a Teacher.
9. It verifies all submitted records refer to the same lesson.
10. It verifies that the lesson belongs to the signed-in teacher.
11. It verifies the submitted date is today.
12. It verifies today matches the lesson's weekday.
13. It verifies the current time is between the lesson start and end times.
14. In a transaction, it replaces attendance records for those student/lesson pairs.
15. Attendance and dashboard pages are revalidated.

The business rule is intentionally strict: attendance cannot be marked early, late, on another date, or for another teacher's lesson.

### 13.2 Read-only views

- An Admin sees attendance connected to lessons in the admin's school.
- A Super Admin sees all attendance.
- A Student sees only records with the student's ID.
- A Parent first resolves linked child IDs, then sees only those children's records.

The viewer receives student name, date, presence status, lesson, class, subject, and teacher details.

### Current data-model limitation

The database has a unique constraint on `(studentId, lessonId)` rather than `(studentId, lessonId, date)`. The marking action deletes the prior row for the student/lesson pair before creating the current one. Therefore, for a recurring lesson, the present schema retains only the latest attendance state per student and lesson rather than a complete day-by-day history. A production attendance history should make the date part of the uniqueness constraint.

---

## 14. Exams, Assignments, Results, and Reports

### 14.1 Exams

An Exam has a title, date, start/end time, Subject, Grade, and School. Admins and Teachers can create exams through the current interface. When an exam is created, the action queries students in the selected grade and creates an `EXAM` notification for them.

List visibility is role-aware:

- Admin: exams in the school.
- Teacher: exams connected to subjects taught by the teacher.
- Student: exams belonging to the student's grade.
- Parent: exams belonging to grades of the parent's children.
- Super Admin: all exams.

### 14.2 Assignments

An Assignment has a due date, Subject, Grade, and School. Its filtering model mirrors exams. Creating an assignment produces an `ASSIGNMENT` notification for students in the selected grade.

### 14.3 Results

A Result records a numeric score for one Student and either an Exam or Assignment. The results page combines two different datasets:

- Traditional Result rows for exams and assignments.
- QuizSubmission rows for automatically graded quizzes.

The page normalizes these into one table, allows filtering by result type, sorting by date/score/student/title, and paginates the merged data in memory.

Role filtering is applied as follows:

- A Student sees only their own results and quiz submissions.
- A Parent sees results and quiz submissions for linked children.
- A Teacher sees traditional results related to the teacher's subjects and quiz submissions for quizzes created by that teacher.
- Admin and Super Admin views are broader, subject to the page's school-scoping behavior.

### 14.4 Student monthly summary report

The Student profile can open a report modal. The client calls `GET /api/student/[id]/summary`. The API authorizes the request by role:

- Super Admin may view any student.
- Admin/Teacher must belong to the same school.
- Student may view only their own report.
- Parent may view only a linked child.

It then calculates the current calendar month's:

- Attendance total, present count, absence count, and percentage.
- Attendance breakdown by subject.
- Exam and assignment results and average raw score.
- Quiz attempts and average quiz percentage.
- Relevant school-wide or class announcements.

The report is rendered in a print-friendly modal with a **Print / Save PDF** button that uses the browser's print functionality.

---

## 15. AI Quiz Creation, Assignment, and Submission

This is NeuraLearn's most specialized academic workflow.

### 15.1 Teacher opens the generator

The AI Quiz Generator route is visible only to Teachers whose school has `aiQuiz` enabled. Under the current plan definitions, that means Pro. The page also verifies the user is a Teacher, loads the Teacher's school, reads the plan, loads school classes, and loads quizzes previously created by that teacher.

### 15.2 Upload and AI generation

The Teacher chooses:

- A PDF, DOCX, PPTX, or TXT document.
- Between 1 and 20 questions.
- Easy, medium, hard, or mixed difficulty.

The browser sends multipart form data to `POST /api/generate-quiz`.

The route:

1. Requires an authenticated user.
2. Resolves the school ID from session metadata, with a Teacher database fallback.
3. Calls `assertFeature(schoolId, "aiQuiz")`; a blocked plan receives HTTP 402.
4. Saves the upload to an operating-system temporary file.
5. Extracts text according to file type:
   - PDF -> `pdf-parse`
   - DOCX -> `mammoth`
   - PPTX -> unzip with JSZip and collect slide XML text using fast-xml-parser
   - TXT -> direct text read
6. Rejects unsupported files or extracted text shorter than 50 characters.
7. Restricts the prompt source to the first 40,000 characters.
8. Calls OpenAI `gpt-4o-mini` and requests JSON output.
9. Returns an array of questions, each containing a question, exactly four options, one answer, and a difficulty label.
10. Deletes the temporary file in a `finally` block even when an error occurs.

```text
Teacher document
      -> temporary upload
      -> text extraction
      -> OpenAI prompt
      -> JSON MCQs
      -> teacher review
```

### 15.3 Save the quiz

After reviewing the generated questions, the teacher supplies a title and saves the quiz. The Server Action creates:

- One Quiz row owned by the teacher and school.
- Multiple QuizQuestion rows containing options, correct answer, and difficulty.

Options are stored as JSON. Correct answers remain in the database and are deliberately omitted from the student quiz-loading response.

### 15.4 Assign the quiz

The teacher selects:

- A saved quiz.
- A class.
- A start date/time.
- An end date/time.

The assignment action rejects invalid dates and requires the end to be after the start. It creates a QuizAssignment and sends a `QUIZ` notification to students in the selected class.

### 15.5 Student quiz list

The Student's **My Quizzes** page first resolves the Student's class and school. It queries QuizAssignments for that class and includes any existing submission for the student. Each card is classified as:

- Not started.
- Available.
- Closed.
- Completed.
- Locked after an anti-cheat event.

Only an available assignment links to the quiz-taking screen.

### 15.6 Load quiz safely

The quiz-taking page calls `GET /api/quiz/[assignmentId]`. The response includes title, teacher, class, options, question text, and difficulty, but intentionally excludes each question's `answer` field. It also refuses to return a quiz outside its time window.

### 15.7 Quiz-taking interface and anti-cheat behavior

The interface shows:

- One question at a time.
- Four selectable options.
- Difficulty label.
- Answer progress.
- Previous/next navigation.
- Question navigation dots.
- A final submit action.

The current client implements strict anti-cheat behavior. If the browser tab becomes hidden or the window loses focus, it submits the answers currently entered and locks the screen. It also auto-submits when the assignment end time is reached and warns before the user leaves the page.

### 15.8 Server-side submission and grading

The browser sends the assignment ID and selected answers to `POST /api/quiz/submit`. It does not send a student ID or correct answers.

The server:

1. Gets `studentId` from the authenticated Clerk user ID.
2. Rejects an invalid request body.
3. Rejects a second attempt using both an explicit lookup and the database unique constraint on `(quizAssignmentId, studentId)`.
4. Loads the assignment and checks its start/end time.
5. Loads correct answers directly from the database.
6. Compares submitted strings to the answer key on the server.
7. Counts correct answers.
8. Creates one QuizSubmission and its QuizAnswer children.
9. Returns score, total marks, and rounded percentage.

The client converts the percentage into a display grade and shows the result immediately. Because grading happens on the server and the answer key is not part of the quiz response, the browser cannot award its own score.

---

## 16. Events, Announcements, Notifications, and Search

### 16.1 Events

An Event contains a title, description, start and end time, school, and optional class. A null class means it is school-wide. The admin can create and manage events. Student, parent, and teacher list pages combine school scoping with class relationships so users see school-wide events and events relevant to their class context.

The dashboard calendar accepts a selected date through the URL and displays upcoming events for that date/context.

### 16.2 Announcements

An Announcement contains a title, description, date, school, and optional class. The admin can create and manage announcements. Dashboard announcement panels show the three most recent relevant items. Admins see the school's items; normal academic users see school-wide announcements plus announcements related to their classes.

### 16.3 Notifications

Notifications are persisted per recipient with:

- User ID.
- School ID.
- Title and description.
- Notification type.
- Optional link.
- Read/unread flag.
- Creation time.

The current code creates database-backed in-app notifications for these important events:

- New exam -> students in the selected grade.
- New assignment -> students in the selected grade.
- New quiz assignment -> students in the selected class.
- New student enrollment -> teachers in the school.

The Navbar loads the latest 20 notifications for the current user. The bell manages unread display, and a Server Action marks either selected notifications or all unread notifications as read. These are in-app database notifications; the current implementation is not a WebSocket or push-notification service.

### 16.4 Global search

The navigation search sends the user to `/search?q=...`. The server searches up to eight matching records in each category:

- Students.
- Teachers.
- Classes.
- Subjects.
- Parents.

Search is case-insensitive and school-scoped for normal users. Super Admin search is cross-school. Results link to relevant profiles or list pages.

---

## 17. Database Design

The Prisma schema contains 24 models organized into six business domains.

### 17.1 Tenant and people

- **School:** tenant root, branding/contact information, current plan.
- **Admin:** Clerk-linked administrator for a school.
- **Teacher:** profile, subjects, lessons, classes, quizzes, and school.
- **Student:** profile, grade, class, optional parent, attendance, results, quizzes, and school.
- **Parent:** profile, linked students, and school.

### 17.2 Academic structure

- **Grade:** grade level unique within a school.
- **Class:** named section, capacity, grade, optional supervisor, and school.
- **Subject:** subject name and teacher relationships within a school.
- **Lesson:** scheduled relationship between subject, class, teacher, weekday, time, and school.

### 17.3 Assessment and attendance

- **Exam:** titled, timed assessment for a subject and grade.
- **Assignment:** due-date assessment for a subject and grade.
- **Result:** score connecting a student to an exam or assignment.
- **Attendance:** present/absent state connecting a student and lesson with a date.

### 17.4 Quiz lifecycle

- **Quiz:** teacher-owned MCQ collection.
- **QuizQuestion:** question, four options, correct answer, and difficulty.
- **QuizAssignment:** class assignment with a start/end window.
- **QuizSubmission:** one student's scored attempt.
- **QuizAnswer:** each selected answer inside an attempt.

The important chain is:

```text
Teacher -> Quiz -> QuizQuestion
                   |
Quiz -> QuizAssignment -> Class
             |
             -> QuizSubmission -> Student
                         |
                         -> QuizAnswer -> QuizQuestion
```

Quiz children use cascade deletes so deleting a Quiz removes dependent questions, assignments, submissions, and answers through the relation chain.

### 17.5 Communication

- **Event:** school-wide or class-specific calendar entry.
- **Announcement:** school-wide or class-specific message.
- **Notification:** per-user read/unread in-app alert.

Notification indexes on `(userId, read)` and `(userId, createdAt)` support fast unread counts and recent-item queries.

### 17.6 Billing and pending workflows

- **Subscription:** one-to-one School billing state that mirrors key Stripe fields.
- **PendingSignup:** temporary school/admin onboarding payload waiting for payment.
- **PendingStudentSignup:** student application waiting for administrator review.

### 17.7 Important uniqueness rules

- School name is globally unique.
- Admin, Teacher, Student, and Parent usernames are globally unique within their respective models.
- Grade level is unique per school.
- Class name is unique per school.
- Subject name is unique per school.
- Subscription is unique per school and Stripe subscription/customer IDs are unique.
- A Student may submit a given QuizAssignment only once.
- The current Attendance design allows one row per Student/Lesson pair.

---

## 18. Security, Reliability, and Current Implementation Notes

This section separates the product workflow from the codebase's current hardening level. It is important for an accurate technical report: these are implementation observations, not descriptions of the intended user experience.

### 18.1 Security controls already present

- Clerk manages authentication and sessions.
- Role and school metadata are read on the server.
- Many list queries are explicitly school-scoped and role-filtered.
- Stripe webhooks verify their signature against the raw request body.
- Public inputs are validated with Zod.
- Student signup verifies that a chosen grade belongs to the selected school.
- Student approval verifies admin role, tenant, grade/class compatibility, class capacity, and plan limit.
- Attendance verifies teacher ownership, date, weekday, and time window.
- AI generation checks authentication, school association, and Pro feature access.
- Quiz answers are omitted from the quiz-loading response.
- Quiz grading and one-attempt enforcement happen on the server.
- The monthly student summary performs role/ownership checks.
- AI temporary files are deleted in a `finally` block.
- Multi-step Stripe database writes use Prisma transactions.

### 18.2 Authorization should be made consistent

Several general CRUD Server Actions trust record IDs or `schoolId` values submitted by the form and do not independently verify the caller's role, ownership, or tenant before every mutation. Some actions, such as student-approval, attendance, billing, reports, and portions of event handling, are much more defensive than the generic CRUD actions.

A production hardening pass should introduce shared helpers such as:

- `requireRole(...)`
- `requireSchool()`
- `requireSameSchool(recordSchoolId)`
- `requireTeacherOwnsSubject(...)`
- `requireQuizOwnership(...)`

Every Server Action and API route should call the appropriate helper. The server must derive the school ID from the authenticated session for normal users instead of trusting a hidden form field.

### 18.3 Middleware coverage is not complete

The route-access map covers many dashboard routes, but it omits some visible routes such as grades, lessons, and search. The middleware also does not call a blanket `auth.protect()` for every non-public route. Mapped paths receive a role comparison; unlisted paths rely on their own page/query behavior.

Production behavior should be simplified to:

1. Explicitly declare public routes.
2. Require authentication everywhere else.
3. Apply role rules to every protected page and API.
4. Repeat critical checks inside the action/API itself.

### 18.4 Quiz ownership and assignment checks need strengthening

The quiz-loading route checks the time window and hides answers, but it does not currently verify that the requester is the Student assigned to that class. Quiz submission takes the user ID from Clerk, but it should additionally verify that the identity is an active Student in the assignment's class and school. The save, assign, and delete quiz Server Actions should verify Teacher role and ownership rather than trusting supplied teacher, school, quiz, and class IDs.

### 18.5 Plan enforcement is partial

The plan configuration advertises multiple gated features. Current backend enforcement is strongest for:

- Maximum Admin/Teacher/Student counts.
- Pro-only AI quiz generation.

Other flags such as `quizzes`, `exams`, `financeChart`, and `notifications` are not consistently checked in every related page/action. The Plus plan advertises manual quizzes, but the current teacher quiz interface is the Pro-only AI generator and there is no separate manual quiz-builder route. The plan table should therefore be described as the intended product policy until all feature routes enforce it.

### 18.6 Pending credentials are sensitive

School onboarding and public student signup temporarily place submitted credentials inside JSON payloads in `PendingSignup` or `PendingStudentSignup` so Clerk accounts can be created after payment or approval. That means passwords are present in application database payloads during the pending period.

For production, this should be replaced with a safer workflow, for example:

- Create a Clerk invitation rather than storing a password.
- Use a short-lived, single-use setup token.
- Encrypt any unavoidable temporary credential at the application layer.
- Delete expired pending records automatically.
- Ensure logs never include request payloads or credentials.

### 18.7 Dashboard demonstration data

Some visual elements should not be represented as live business metrics:

- `FinanceChart` uses a hard-coded monthly dataset.
- The Teacher detail page displays a fixed `90%` attendance value.
- Some generic performance components may be visual placeholders.

User counts, student distribution, weekly attendance chart, calendars, announcements, and most list data are read from Prisma.

### 18.8 Attendance history limitation

As explained earlier, attendance uniqueness currently excludes the date. Add `date` to the unique key before claiming complete historical attendance tracking.

### 18.9 Data validation and transactional consistency

Forms use Zod on the client, but every mutation should parse the schema again inside the Server Action. Multi-system account creation should also compensate consistently if either Clerk or Prisma succeeds and the other fails. The Stripe provisioning path attempts compensation, but generic Teacher, Student, Parent, and Admin creation would benefit from the same pattern.

### 18.10 Deployment notes

The application can be run with Node or Docker. The normal build script runs Prisma client generation before `next build`. The Dockerfile currently runs `prisma migrate dev` while building the image. Production deployment should usually run `prisma migrate deploy` as a controlled release/startup step instead of creating development migrations during image construction.

---

## 19. Complete System Story

The following story connects the major workflows into one narrative suitable for a presentation.

1. A school representative visits NeuraLearn and reviews the subscription plans.
2. The representative chooses a plan and submits school and first-admin details.
3. NeuraLearn stores the application as pending and redirects the representative to Stripe Checkout.
4. Stripe confirms the subscription through a signed webhook.
5. NeuraLearn creates the tenant, subscription, administrator database row, and Clerk administrator identity.
6. The administrator signs in and reaches the school dashboard.
7. The administrator creates grades and subjects, then adds teachers and connects them to subjects.
8. The administrator creates classes, assigns grades and supervisors, and defines class capacity.
9. Students are either created by the administrator or submit public applications.
10. For a public application, the admin reviews it, chooses a matching class, and accepts or declines it.
11. Accepted students and any new parents receive active Clerk-backed accounts and linked database profiles.
12. The administrator defines weekly lessons connecting class, subject, teacher, day, and time.
13. Teachers and students sign in and see schedules derived from those lesson relationships.
14. During an active lesson, the assigned teacher opens attendance and records present/absent values.
15. Admins or teachers create exams and assignments for grades; affected students receive notifications.
16. Scores are recorded as Results and become visible to the correct student, parent, teacher, and admin views.
17. A Pro-plan teacher uploads a document. NeuraLearn extracts its text, calls OpenAI, and returns editable MCQ content.
18. The teacher saves the quiz and assigns it to a class with a start/end window.
19. Students in that class receive a notification and see the quiz in My Quizzes.
20. A student takes the quiz during the allowed period. Answers are graded on the server and stored as a submission.
21. Quiz performance appears beside exam and assignment scores in the Results page and monthly student summary.
22. Parents monitor their linked children through schedules, attendance, results, announcements, and printable monthly reports.
23. Administrators manage billing through the Stripe portal or switch plans; Stripe webhooks keep the local plan synchronized.
24. The Super Admin observes schools and aggregate platform information across tenants.

This lifecycle demonstrates how a single tenant begins as a public registration and grows into an operational academic environment.

---

## 20. How to Explain the Application in a Viva or Presentation

### Short version

> NeuraLearn is a multi-tenant school management SaaS built with Next.js, PostgreSQL, Prisma, and Clerk. Each school is isolated using a school ID, while Clerk metadata defines the signed-in user's role and tenant. Server Components read dashboard data, Server Actions handle normal mutations, and API routes handle Stripe, AI generation, quiz grading, public signup, and reports. It supports platform admins, school admins, teachers, students, and parents. Its standout workflow lets a Pro teacher upload a document, generate MCQs through OpenAI, assign the quiz to a class, and receive server-graded student submissions.

### Strong points to emphasize

- One codebase provides both frontend and backend.
- The data model connects the entire academic lifecycle.
- Each role receives a different experience from the same database.
- The school ID is the central multi-tenant boundary.
- Clerk identity IDs are reused as role-profile primary keys.
- Stripe webhooks make paid account provisioning reliable and asynchronous.
- AI generation is separated from quiz storage, assignment, and grading.
- Quiz grading does not trust the browser.
- Public student signup uses an approval step rather than immediately creating access.
- Monthly summary reports combine attendance, academic results, quizzes, and communication.

### Honest maturity statement

> The application has a broad and connected functional workflow. Before production deployment, authorization should be standardized across all Server Actions and APIs, plan flags should be enforced consistently, pending credentials should be removed from database payloads, and attendance uniqueness should include the date.

---

## 21. Suggested PDF Structure

For a polished report, this document can be arranged as:

1. Title page.
2. Abstract or executive summary.
3. Problem statement and objectives.
4. User roles and role matrix.
5. System architecture diagram.
6. Technology stack.
7. Authentication and multi-tenancy.
8. Database design or ERD.
9. School onboarding and billing sequence.
10. Student application and approval sequence.
11. Academic setup and daily role workflows.
12. Attendance workflow.
13. Exam, assignment, result, and report workflow.
14. AI quiz sequence and quiz grading.
15. Communication and notification workflow.
16. Security and validation.
17. Current limitations and future improvements.
18. Conclusion.

Useful screenshots would include:

- Landing page and pricing cards.
- Onboarding form.
- Each role's dashboard.
- Student signup progress steps.
- Admin signup-review page.
- A representative CRUD list and modal.
- Weekly timetable.
- Attendance marker and viewer.
- Quiz generator, generated questions, assignment dialog, student quiz, and result screen.
- Billing page.
- Monthly summary report.
- Prisma ERD (`ERD.svg`).

---

## 22. Glossary

| Term | Meaning in NeuraLearn |
|---|---|
| Tenant | One school and its isolated data inside the shared application |
| Multi-tenant | One deployed app/database serves multiple independent schools |
| Clerk | External authentication and identity provider |
| Prisma | Type-safe ORM used to query PostgreSQL |
| Server Component | React component executed on the server, often used for direct reads |
| Client Component | Browser-executed component used for interaction and local state |
| Server Action | Server function invoked from the React form workflow |
| API route | HTTP endpoint implemented inside the Next.js application |
| Webhook | Signed server-to-server event sent by Stripe |
| Provisioning | Creating the School, Admin, Subscription, and identity after checkout |
| Feature gate | Plan-based rule deciding whether a capability is available |
| MCQ | Multiple-choice question |
| Tenant scoping | Adding the current school ID to a data query |
| Revalidation | Refreshing server-rendered data after a mutation |

---

## 23. Source Map for Further Reference

The most important implementation files are:

| Area | Main source files |
|---|---|
| Application entry and public site | `src/app/page.tsx`, `src/app/pricing/page.tsx` |
| Dashboard layout/navigation | `src/app/(dashboard)/layout.tsx`, `src/components/Menu.tsx`, `src/components/Navbar.tsx` |
| Authentication middleware | `src/middleware.ts`, `src/lib/settings.ts`, `src/lib/utils.ts` |
| Database model | `prisma/schema.prisma`, `ERD.svg` |
| Forms and mutations | `src/components/FormContainer.tsx`, `src/components/FormModal.tsx`, `src/components/forms/*`, `src/lib/actions.ts` |
| Plans and limits | `src/lib/plans-shared.ts`, `src/lib/plans.ts` |
| School onboarding | `src/app/onboarding/*`, `src/app/api/stripe/checkout/route.ts` |
| Stripe provisioning | `src/app/api/stripe/webhook/route.ts`, `src/lib/stripe-provisioning.ts` |
| Billing management | `src/app/(dashboard)/admin/billing/*`, `src/app/api/stripe/change-plan/route.ts`, `portal/route.ts`, `sync/route.ts` |
| Student self-registration | `src/app/sign-up/student/*`, `src/app/api/public/student-signup/route.ts` |
| Signup approval | `src/app/(dashboard)/admin/signup-requests/*`, approval actions in `src/lib/actions.ts` |
| Timetables | `src/components/BigCalendarContainer.tsx`, `src/lib/utils.ts` |
| Attendance | `src/app/(dashboard)/list/attendance/page.tsx`, `AttendanceMarker.tsx`, attendance action in `src/lib/actions.ts` |
| AI quiz generation | `src/app/api/generate-quiz/route.ts`, `src/components/QuizGeneratorClient.tsx` |
| Quiz management | quiz actions in `src/lib/actions.ts`, `SavedQuizzesList.tsx` |
| Quiz attempt/grading | `src/app/(dashboard)/list/my-quizzes/page.tsx`, `quiz-take/[id]/page.tsx`, `src/app/api/quiz/*` |
| Results | `src/app/(dashboard)/list/results/page.tsx` |
| Monthly report | `src/app/api/student/[id]/summary/route.ts`, `StudentSummaryReport.tsx` |
| Search | `src/components/NavbarSearch.tsx`, `src/app/(dashboard)/search/page.tsx` |
| Notifications | `src/components/NotificationBell.tsx`, notification helpers in `src/lib/actions.ts` |
| Deployment | `package.json`, `Dockerfile`, `docker-compose.yml`, `prisma.config.ts` |

---

## 24. Conclusion

NeuraLearn is a connected school operations platform rather than a collection of unrelated dashboard screens. Its central design is the combination of a School tenant, Clerk-backed role identities, and a relational academic model. That structure allows the same lesson to drive a teacher timetable, student timetable, parent view, attendance session, assessment context, and class communication.

The application also demonstrates several modern full-stack patterns: Server Components for protected reads, Server Actions for form mutations, API routes for external and file-based workflows, Stripe webhook provisioning, AI-assisted content creation, and server-side quiz grading.

The main product journey begins with school subscription and provisioning, continues through academic setup and user enrollment, and reaches daily use through schedules, attendance, assessments, quizzes, results, communication, and reporting. With the authorization, plan-enforcement, sensitive-pending-data, and attendance-history improvements listed above, the current foundation can be developed into a stronger production-grade school SaaS platform.

