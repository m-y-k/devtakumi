# OutOfMemoryAcademy — Full Technical Specification

**Version:** 1.0
**Purpose of this document:** This is a complete, self-contained build spec for an AI coding agent (Cursor / Antigravity) to implement without further clarification. Every entity, endpoint, page, and business rule needed to build the product is defined here. Where a decision was made on the product owner's behalf, it is explicitly flagged as an **ASSUMPTION** — the agent should implement the assumption as stated unless told otherwise, not invent its own alternative.

**Do not invent curriculum content, pricing, or class titles.** Section 22 contains the exact, final curriculum. Use it verbatim as seed data — do not paraphrase, reorder, renumber, or add/remove classes.

---

## 1. Product Overview

OutOfMemoryAcademy is a coding bootcamp offering three sequential, gated courses, taught by a working engineer (Mohammad Yusuf Khan, SDE @ Flipkart). The product has **two separate front-end applications** sharing **one backend API**:

1. **Public Marketing Site** (`apps/public-site`) — unauthenticated. Shows the three courses, curriculum, pricing, mentor bio, and lets a visitor submit an enrollment request with UPI payment proof.
2. **Student Portal** (`apps/student-portal`) — authenticated LMS. Sign-in only (no public self-registration — accounts are created after an admin approves an enrollment request). Contains course navigation, class pages (lecture + notes + questions), weekly assessments, and an in-browser code runner.

The same Student Portal app also serves the **Admin/Instructor console**, gated by role (`ADMIN`), rather than being a third codebase. See Section 13.

### Course progression model
The three courses are **gated stages**, not independent purchases:

| Order | Course | Duration | Price (one-time) | Unlocks when |
|---|---|---|---|---|
| 1 | DSA Foundations | 4 months | ₹499 | Always available |
| 2 | Backend Engineering (Java + Spring Boot + SQL) | 6 months | ₹649 | Student has `COMPLETED` status on DSA Foundations |
| 3 | Full-Stack Development (Vanilla JS + React) | 8 months | ₹899 | Student has `COMPLETED` status on Backend Engineering |

A student cannot enroll in or see the content of Course 2 or 3 until the prior course is marked complete by an admin. This gating is a core business rule — enforce it server-side, not just in the UI.

---

## 2. System Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  apps/public-site    │     │ apps/student-portal  │
│  (React SPA)         │     │ (React SPA)          │
│  - no auth           │     │ - JWT auth           │
│  - course catalog     │     │ - STUDENT + ADMIN UI │
│  - enrollment form    │     │                       │
└──────────┬───────────┘     └──────────┬───────────┘
           │        REST/JSON over HTTPS            │
           └───────────────┬─────────────────────────┘
                            ▼
                 ┌─────────────────────┐
                 │   backend (Spring    │
                 │   Boot API)           │
                 │  - Spring Security    │
                 │    + JWT              │
                 │  - MySQL              │
                 │  - Local disk storage │
                 │    (notes/screenshots/│
                 │    recordings)        │
                 │  - Judge0 client      │
                 │    (code execution)   │
                 └──────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 ┌─────────────┐    ┌───────────────┐   ┌───────────────┐
 │ MySQL        │    │ Local disk /   │   │ Judge0 (self-  │
 │ (primary DB) │    │ block volume   │   │ hosted via     │
 │              │    │ (notes PDFs,   │   │ Docker) for    │
 │              │    │ payment proof  │   │ code execution │
 │              │    │ screenshots,   │   │                │
 │              │    │ recordings)    │   │                │
 └─────────────┘    └───────────────┘   └───────────────┘

All four boxes (backend, MySQL, storage, Judge0) run on a single VM for v1 — see Section 20.1. This is a deliberate cost/simplicity trade-off for the current scale, not a scalability ceiling; each is still a separate process/container so any one of them can be moved to its own host later without a code change.
```

**ASSUMPTION:** Both front-ends are separate React SPAs deployed independently (e.g. two Vercel/Netlify projects or two static hosting buckets) so the marketing site can be iterated on/cached aggressively without touching the authenticated app. Both call the same backend base URL.

---

## 3. Tech Stack (pinned — do not substitute without asking)

| Layer | Choice | Cost |
|---|---|---|
| Backend language/framework | Java 21 + Spring Boot 3.x | Free |
| Backend build tool | Maven | Free |
| Backend modules | Spring Web, Spring Security, Spring Data JPA, Validation (`@Valid`), Spring Mail | Free |
| Database | **MySQL 8.x** | Free (self-hosted) |
| Frontend framework | React 18 (Vite, not CRA) | Free |
| Frontend language | TypeScript | Free |
| Frontend styling | Tailwind CSS | Free |
| Code editor component | Monaco Editor (`@monaco-editor/react`) | Free |
| Code execution engine | Judge0 CE, self-hosted via Docker Compose (open-source, MIT-licensed, actively maintained) | Free |
| Auth | JWT (access + refresh token pair), Spring Security filter chain | Free |
| Password hashing | BCrypt | Free |
| File & video storage | **Local filesystem on the backend VM**, behind a `StorageService`/`VideoStorageService` interface (see Section 17) | Free |
| Email (transactional) | Spring Mail via SMTP, **Brevo free SMTP relay** (300 emails/day free forever — comfortably covers enrollment/reset emails at this scale) | Free |
| Live class delivery | Zoom or Google Meet — external, link-based only (see Section 12) | Free (existing accounts) |
| Containerization | Docker + Docker Compose for local dev and Judge0 | Free |
| CI | GitHub Actions (free minutes tier) | Free |
| Frontend hosting | **Cloudflare Pages** (both React apps) — unlimited bandwidth, commercial use allowed on the free tier | Free |
| Backend/DB/Judge0 hosting | See Section 20.1 — a single always-on VM | Free–~$5/mo |
| TLS certificates | Let's Encrypt (via Certbot or Caddy's automatic HTTPS) | Free |
| Domain name | Any registrar | ~$8–12/yr (only real recurring cost) |

**Why not PostgreSQL / MinIO?** Per your request this stack was re-picked for cost, not because Postgres or MinIO are bad — Postgres remains the better default in general. MySQL is used throughout Section 15 as requested. MinIO was dropped specifically because it's no longer a healthy open-source option (see Section 17) — this isn't a cost call, it's a project-health one.

---

## 4. Roles & Access Control

Two roles only: `STUDENT`, `ADMIN`.

| Capability | STUDENT | ADMIN |
|---|---|---|
| Browse public site | ✅ (no auth needed) | ✅ |
| Submit enrollment request | ✅ (no auth needed) | n/a |
| Log into student portal | ✅ | ✅ |
| View own enrolled course content | ✅ | ✅ (all courses) |
| Submit code / assessment answers | ✅ | ❌ |
| Review/approve/reject enrollment requests | ❌ | ✅ |
| Create/edit courses, months, weeks, classes | ❌ | ✅ |
| Upload notes, set live meeting link, upload recording | ❌ | ✅ |
| Create/edit practice questions & assessments | ❌ | ✅ |
| View all student submissions, grade project submissions | ❌ | ✅ |
| Mark a student's course as `COMPLETED` (unlocks next course) | ❌ | ✅ |
| Post announcements | ❌ | ✅ |

Enforce all of the above server-side with `@PreAuthorize`, not just by hiding UI elements.

---

## 5. Core Domain Model

Entity list with purpose (full column-level schema is in Section 15):

- **User** — a person who can log in (student or admin).
- **Course** — one of the 3 top-level offerings (DSA / Backend / Full-Stack). Maps 1:1 to "Phase" in the curriculum.
- **Month** — belongs to a Course. (e.g. "Month 1: Programming Foundations & Absolute Basics")
- **Week** — belongs to a Month. (e.g. "Week 1: Introduction to Programming & Core Data Types")
- **ClassSession** — belongs to a Week. One of the Mon–Fri classes. Has a global class number (1–160), a title, a day, notes, a live meeting link, and a recording link.
- **Question** — a practice coding question attached to a ClassSession, shown in the left pane.
- **EnrollmentRequest** — a public, pre-account record of someone claiming to have paid, awaiting admin review.
- **Enrollment** — an approved, active link between a User and a Course, with status.
- **Assessment** — a weekly graded activity attached to a Week.
- **AssessmentQuestion** — a problem within an Assessment (reuses the same shape as Question).
- **Submission** — a student's code run/submit event, linked to either a standalone Question (practice) or an AssessmentQuestion (graded).
- **Announcement** — admin-posted message, optionally scoped to a course.
- **ClassProgress** — tracks whether a student has watched a class recording / solved its questions, for the progress bar.

---

## 6. Public Marketing Portal — Pages & Behavior

No login required for any page below.

### 6.1 Home
- Hero section with headline/subhead (reuse tone from the source deck: *"One mentor. One roadmap. From your first array to a full production stack."*)
- "The Path" section: 3 stage cards (DSA Foundations / Backend Engineering / Full-Stack Development) each showing duration, price, one-line description, and a step badge ("Step 01 · Mandatory", "Step 02 · If you continue", "Step 03 · If you continue").
- Note callout: *"Each stage is a checkpoint, not a package deal — progress only if the prior stage is cleared."*
- "What's Included" section (6 feature bullets — live sessions, WhatsApp doubt group, portal with curated questions, hands-on projects, direct mentorship, small batches).
- "Why Learn From Me" mentor bio section: name, title ("SDE @ Flipkart"), bio paragraph.
- CTA button → Enrollment page.

### 6.2 Course Catalog (`/courses`)
Grid/list of the 3 courses pulled from `GET /api/public/courses`. Each card links to its detail page. Locked-for-purchase-order courses (2 and 3) are still visible/browsable publicly (marketing needs to show the whole path) but their "Enroll" CTA should say "Unlocks after completing [previous course]" instead of a raw enroll button — **ASSUMPTION**: still allow submitting an enrollment request for a later course (admin will manually judge eligibility at review time), since the platform has no self-serve purchase flow anyway.

### 6.3 Course Detail (`/courses/:slug`)
- Full month → week → class breakdown (read-only, collapsible tree), pulled from `GET /api/public/courses/:slug/curriculum`.
- Pricing box, duration, prerequisite note.
- "Enroll" CTA → Enrollment page, pre-selecting this course.

### 6.4 Enrollment Request (`/enroll`)
This is the manual-payment flow (Section 7). Form fields:
- Full name (required)
- Email (required)
- Phone number (required)
- Course selection (dropdown, required)
- Static payment section: display the UPI QR code image + UPI ID (`myk22.wallet@phonepe` — **treat as a configurable admin setting, not a hardcoded value**, so it can be changed without a redeploy) and an amount matching the selected course's price
- UPI transaction reference / UTR number (required text field)
- Payment screenshot upload (optional but recommended, image upload)
- Submit → `POST /api/public/enrollment-requests` → shows a confirmation message ("We'll verify your payment and email your login details within 24 hours.")

### 6.5 About / Contact (`/about`)
Static content page. Low priority, minimal spec — one paragraph + contact email/WhatsApp link is sufficient.

---

## 7. Enrollment & Manual Payment Verification Flow

This replaces a payment gateway integration. End-to-end flow:

1. Visitor fills the Enrollment Request form (6.4) and pays manually via UPI outside the platform (scanning the displayed QR).
2. `EnrollmentRequest` is created with status `PENDING`.
3. Admin sees pending requests in the Admin Console (Section 13.1), with the UTR reference and screenshot to cross-check against their UPI app / bank statement.
4. Admin clicks **Approve** or **Reject**.
   - **Approve** →
     a. If no `User` exists for that email, create one with role `STUDENT` and a random temporary password.
     b. Create an `Enrollment` row for that user + course with status `ACTIVE`.
     c. Send an email with a "Set your password" link (signed, expiring token) and a link to the Student Portal login page.
     d. `EnrollmentRequest.status` → `APPROVED`.
   - **Reject** → `EnrollmentRequest.status` → `REJECTED`, optional admin note stored, optionally emails the visitor.
5. Student logs into the Student Portal with their email + chosen password.

**ASSUMPTION:** One student can hold multiple `Enrollment` rows over time (one per course, added as they progress) but only ever actively enrolled in the courses they've been approved for. Admin manually creates the enrollment for Course 2/3 once Course 1 is marked `COMPLETED` — there's no automatic "graduation" trigger, it's a deliberate manual gate matching the "checkpoint, not a package deal" business rule.

---

## 8. Student LMS Portal — Pages & Behavior

Auth-gated. Login page is the entry point; no public sign-up route exists in this app.

### 8.1 Login (`/login`)
Email + password. On success, store JWT access+refresh token pair. "Forgot password" link triggers a reset email.

### 8.2 Dashboard (`/dashboard`)
- List of the student's enrollments with a progress bar per course (`classes with progress / total classes` in that course).
- "Continue where you left off" card → deep-links to the next unfinished class.
- Recent announcements feed.
- If the student has zero enrollments (shouldn't normally happen since accounts are only created on approval, but handle gracefully): show an empty state pointing to the marketing site.

### 8.3 Course Navigation
- **Course dropdown** (top of the portal, always visible once inside a course context): lists only the courses the student has an `ACTIVE` or `COMPLETED` enrollment for. Switching it navigates to that course's Month 1 / Week 1 / Class 1 by default (or last visited class in that course, if tracked).
- Below the course dropdown, a **Month → Week → Class** tree/accordion in a left sidebar. Clicking a class loads the Class Page (8.4) in the main panel. Current class is highlighted; classes with all questions solved get a checkmark.

### 8.4 Class Page — the core screen
Two-pane layout:

**Left pane** (per Section 9 in detail):
1. Class metadata: class number, title, day (Mon–Fri), scheduled date/time.
2. **Notes** section — renders admin-authored Markdown (may include images/code blocks).
3. **Questions** list — each question shows title + difficulty badge; clicking opens the Code Runner (Section 11) in a modal or right-side split view with that question loaded.

**Main/right pane — Lecture window:**
- If current time is within the class's scheduled live window: show a prominent **"Join Live Class"** button that opens the Zoom/Meet URL in a new tab (see Section 12 for why this is a link-out, not an iframe).
- Else if a recording exists: embed the recording player (Cloudflare Stream / Bunny.net player embed using a signed playback URL fetched from the backend, never the raw provider URL).
- Else (no live session yet, no recording yet): show a "Recording will be available after the live session" placeholder with the scheduled date/time.

### 8.5 Weekly Assessment (`/courses/:courseId/weeks/:weekId/assessment`)
- Shown once the Week's classes are visible; has an open/close time window (`opens_at`/`closes_at`) and optional `duration_minutes` countdown once started.
- For `CODE` type assessments (used in DSA weeks): list of problems, each opens the Code Runner; submissions auto-graded against test cases; a running score is shown.
- For `PROJECT_SUBMISSION` type assessments (used in Backend/Full-Stack weeks): a text field for a GitHub repo link / deployed URL + optional file upload; graded manually by admin later (score + feedback fields, visible to student once graded).

### 8.6 Profile / Settings (`/profile`)
Minimal: change password, view enrollment history. Not a priority — keep this screen small.

---

## 9. Class Page Deep-Dive: Left Pane Contents

This is the screen students live in daily, so precision matters:

- **Notes**: stored as Markdown text (`ClassSession.notesMarkdown`), authored by admin in a Markdown editor (e.g. a simple textarea + live preview is sufficient — do not build a full WYSIWYG). Rendered with a sanitized Markdown renderer (e.g. `react-markdown` + `rehype-sanitize`) to prevent stored XSS.
- **Questions**: ordered list, each with a difficulty badge (`EASY`/`MEDIUM`/`HARD` — colour-coded green/amber/red) and a solved/unsolved indicator per the logged-in student (derived from whether any `Submission` for that question by that user has `verdict = ACCEPTED`).
- Clicking a question opens the **Code Runner** (Section 11) either as a full-screen split (problem statement left, Monaco editor + console right) or a modal — **ASSUMPTION**: full-screen split, since students will spend real time here, not a cramped modal.

---

## 10. Practice Question Content — AI Generation Prompt Template

The product owner does not want to hand-write ~160 classes × 5–8 questions manually. This section defines the exact prompt template to use (via a seed script that calls an LLM API, or manually pasted into an AI assistant) to generate the initial question bank. **Build a one-off seeding script** (`scripts/generate-questions.ts` or a Java `CommandLineRunner`) that iterates every `ClassSession` from Section 22 and calls an LLM with this template, then inserts the parsed JSON as `Question` rows.

### Prompt template

```
SYSTEM:
You are generating practice coding questions for a Java-based coding bootcamp class.
Only use concepts that have been taught up to and including the class described below —
never reference a concept from a later class in the curriculum.

CONTEXT:
- Phase: {phase_name}                     e.g. "Phase 1: Data Structures & Algorithms"
- Month: {month_title}                    e.g. "Month 2: Time Complexity, Searching, Sorting & Strings"
- Week: {week_title}                      e.g. "Week 6: Binary Search Mastery"
- Class number: {global_class_number}     e.g. 27
- Class title: {class_title}              e.g. "Binary Search Implementation: Iterative vs. Recursive structural approaches"
- Target language: Java
- Student level so far: {beginner|intermediate|advanced}   (beginner = Month 1, intermediate = Months 2-3, advanced = Month 4+)

TASK:
Generate 5 to 8 practice questions that reinforce ONLY the concept(s) named in the class
title above. Order them from easiest to hardest. Do not repeat a question pattern already
used in an earlier class of the same week (assume you're seeing them in order).

OUTPUT FORMAT:
Return ONLY a JSON array, no prose, matching this schema exactly:

[
  {
    "title": "string",
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "statement_markdown": "string — full problem statement in plain language",
    "constraints": ["string", "..."],
    "examples": [
      { "input": "string", "output": "string", "explanation": "string" }
    ],
    "starter_code_java": "string — method signature + surrounding class shell only, NO solution logic",
    "test_cases": [
      { "input": "string", "expected_output": "string", "hidden": true|false }
    ],
    "tags": ["string", "..."]
  }
]

RULES:
- At least 2 examples per question.
- At least 6 test cases per question, at least 3 of them "hidden": true.
- Test cases must include edge cases relevant to the topic (empty input, single element,
  boundary values, duplicates, negatives — whichever apply).
- starter_code_java must compile as-is (valid Java syntax) with an empty/TODO method body.
```

**ASSUMPTION:** This same template, parameterised, should also be exposed as an **admin-only endpoint** (`POST /api/admin/classes/{id}/generate-questions`) that calls the LLM live and lets the admin preview/edit/accept the generated questions before saving — so content can be regenerated or extended later without another manual seeding pass. This is a "nice to have" for v1 but the seeding script is mandatory.

---

## 11. Weekly Assessments & Code Execution Environment

### 11.1 Scope
Code execution (auto-run + auto-grade) is **required for DSA Foundations (Course 1) only** — both for standalone practice Questions and for `CODE`-type weekly Assessments. Backend/Full-Stack courses use `PROJECT_SUBMISSION`-type assessments instead (manually graded, no sandboxed execution needed). Build the code runner generically so it *could* support other languages later, but only wire up Java for v1.

### 11.2 Architecture
- Self-host **Judge0 CE** via Docker Compose alongside the backend (it ships its own Postgres+Redis instance — keep it isolated from the app's primary Postgres).
- Backend exposes:
  - `POST /api/code/run` — ad-hoc run against student-provided input (no scoring), used for the "Run" button while a student is iterating.
  - `POST /api/code/submit` — runs the student's code against **all** test cases for the question (visible + hidden), stores a `Submission`, computes a verdict, and (if tied to an Assessment) contributes to the score.
- Backend submits to Judge0's `POST /submissions?base64_encoded=true&wait=false`, then polls `GET /submissions/{token}` (or configures Judge0's webhook callback) until a terminal status, then maps Judge0's status to the app's `verdict` enum:
  - `Accepted` → `ACCEPTED` (only if ALL test cases pass)
  - `Wrong Answer` → `WRONG_ANSWER`
  - `Compilation Error` → `COMPILE_ERROR`
  - `Time Limit Exceeded` → `TLE`
  - Any runtime error status → `RUNTIME_ERROR`
- Default limits: 2 second CPU time, 256MB memory per run — configurable per question if needed later (not required for v1).
- **Security note:** never execute student code anywhere except inside Judge0's isolated containers. Never `eval`/`exec` code directly in the Spring Boot process.

### 11.3 Code Runner UI
- Monaco Editor, Java syntax highlighting, pre-filled with the question's `starter_code_java`.
- "Run" button → executes against a student-entered custom input (uses `/api/code/run`), shows stdout/stderr.
- "Submit" button → executes against all test cases (`/api/code/submit`), shows a per-test-case pass/fail table (hidden test cases show pass/fail only, not their input/expected output), plus overall verdict.
- Submission history for that question, visible to the student (their own submissions only).

---

## 12. Live Classes & Recordings

**Live delivery is Zoom/Google Meet, not a custom stream.** Do not attempt to iframe-embed Zoom or Meet — both block iframe embedding via `X-Frame-Options`/CSP by default, and building this "properly" requires the Zoom Web SDK (OAuth app review, meeting SDK credentials) which is out of scope for v1. Instead:

- Admin sets a `liveMeetingUrl` per `ClassSession` (just a plain Zoom/Meet link).
- Student Portal shows a **"Join Live Class"** button (`target="_blank"`) during the scheduled window (`scheduledStart` to `scheduledEnd`, both stored per class), and hides it outside that window.

**Recordings** are not linked directly to a public Zoom/YouTube URL (course content shouldn't be trivially shareable). Flow (cost-minimized, self-hosted):
1. After the live session, admin downloads the Zoom/Meet cloud recording (MP4) and uploads it through the Admin Console (Section 13.4).
2. Backend stores the file on the VM's local disk / attached block volume under a non-web-servable directory (e.g. `/var/ooma/recordings/{classSessionId}.mp4`), storing the path on `ClassSession.recordingProviderVideoId` (repurposed as an internal storage key, not a third-party ID).
3. When a student requests to watch, the backend does **not** expose a static file URL. Instead:
   - `GET /api/classes/{id}/recording-url` checks the requester actually has an active enrollment for that class's course, then returns a short-lived signed URL (a backend-issued token with an expiry, e.g. 10 minutes, embedded as a query param) pointing at a streaming endpoint.
   - `GET /api/stream/recordings/{token}` validates the token and streams the file with proper `Range` header / `Accept-Ranges: bytes` support (Spring's `ResourceHttpRequestHandler` or a manual `ResponseEntity<Resource>` with range handling) so the browser's native `<video>` player can seek without downloading the whole file — no third-party video service required.
   - The frontend never sees a permanent or public URL, only the short-lived token.

**ASSUMPTION:** This trades away automatic transcoding/adaptive bitrate (what a paid service like Cloudflare Stream or Bunny would give you) for zero recurring cost. At this scale (small cohorts, MP4 source files from Zoom/Meet, mostly desktop viewing) that trade-off is reasonable. If the catalog grows large enough that disk space or bandwidth from a single VM becomes a real constraint, the two documented upgrade paths — in order of effort — are: (a) point the same `VideoStorageService` interface at an open-source, actively-maintained S3-compatible store such as **SeaweedFS** (Apache 2.0) so files live on cheaper block/object storage instead of the app VM's disk, or (b) move to a paid streaming provider (Cloudflare Stream/Bunny) for transcoding. Do not implement either upgrade path in v1 — just keep the interface abstracted so the swap doesn't touch calling code.

---

## 13. Admin/Instructor Console

Lives inside the Student Portal app, under `/admin/*` routes, gated by `role = ADMIN`. Sidebar sections:

### 13.1 Enrollment Requests
Table of `PENDING` requests (name, email, course, UTR reference, screenshot thumbnail, submitted date) with **Approve**/**Reject** actions (Section 7). Filterable by status.

### 13.2 Courses / Curriculum Manager
CRUD over Course → Month → Week → ClassSession tree. For v1, since the full curriculum (Section 22) is seeded up front, this is mainly for **editing** (fixing a typo, adjusting a scheduled date) rather than building from scratch — but full CRUD should exist so new cohorts/content can be added later.

### 13.3 Class Editor
Per class: edit title, day, scheduled start/end, `liveMeetingUrl`, notes (Markdown editor), and manage its Question list (add/edit/delete/reorder — reuses the shape from Section 10's generation output, editable by hand too).

### 13.4 Recording Upload
Per class: file upload widget → backend streams the file to the video provider (Section 12), shows upload progress, and displays the resulting playback status (processing/ready).

### 13.5 Assessments
Per week: create/edit an Assessment (type, open/close window, duration), attach/reorder questions (for `CODE` type) or configure submission instructions (for `PROJECT_SUBMISSION` type).

### 13.6 Submissions & Grading
- For `CODE` assessments: read-only view of all students' scores/verdicts (auto-graded).
- For `PROJECT_SUBMISSION` assessments: list of submitted links per student, with a score + feedback text field for the admin to fill in.

### 13.7 Students
List of all students, their enrollments and per-course status (`ACTIVE`/`COMPLETED`/`LOCKED`). A **"Mark course complete"** action here is what unlocks the next course for that student (Section 7) — this is a deliberate, explicit admin action, never automatic.

### 13.8 Announcements
Simple create/list/delete for announcements, optionally scoped to one course or shown to everyone.

---

## 14. REST API Contract

Base path: `/api`. All authenticated routes require `Authorization: Bearer <JWT>`.

### Public (no auth)
```
GET    /api/public/courses
GET    /api/public/courses/{slug}
GET    /api/public/courses/{slug}/curriculum
POST   /api/public/enrollment-requests          (multipart, incl. optional screenshot)
```

### Auth
```
POST   /api/auth/login                          { email, password } -> { accessToken, refreshToken, user }
POST   /api/auth/refresh                        { refreshToken } -> { accessToken }
POST   /api/auth/forgot-password                { email }
POST   /api/auth/reset-password                 { token, newPassword }
POST   /api/auth/set-password                   { token, newPassword }   (first-login flow after approval)
```

### Student (role: STUDENT or ADMIN)
```
GET    /api/me
GET    /api/me/enrollments
GET    /api/courses/{courseId}/tree              (months -> weeks -> classes, respects enrollment gating)
GET    /api/classes/{classId}
GET    /api/classes/{classId}/questions
GET    /api/classes/{classId}/recording-url      (mints signed playback URL)
GET    /api/questions/{questionId}
POST   /api/code/run                             { questionId, language, code, stdin }
POST   /api/code/submit                          { questionId, language, code }
GET    /api/questions/{questionId}/submissions    (own submissions only)
GET    /api/weeks/{weekId}/assessment
POST   /api/assessments/{assessmentId}/questions/{questionId}/submit
POST   /api/assessments/{assessmentId}/project-submission   { repoUrl / fileUpload }
GET    /api/announcements
```

### Admin (role: ADMIN)
```
GET    /api/admin/enrollment-requests?status=PENDING
POST   /api/admin/enrollment-requests/{id}/approve
POST   /api/admin/enrollment-requests/{id}/reject      { note }

POST   /api/admin/courses
PUT    /api/admin/courses/{id}
POST   /api/admin/courses/{id}/months
PUT    /api/admin/months/{id}
POST   /api/admin/months/{id}/weeks
PUT    /api/admin/weeks/{id}
POST   /api/admin/weeks/{id}/classes
PUT    /api/admin/classes/{id}
DELETE /api/admin/classes/{id}

POST   /api/admin/classes/{id}/questions
PUT    /api/admin/questions/{id}
DELETE /api/admin/questions/{id}
POST   /api/admin/classes/{id}/generate-questions      (LLM-assisted, Section 10)

POST   /api/admin/classes/{id}/recording             (multipart upload)

POST   /api/admin/weeks/{id}/assessment
PUT    /api/admin/assessments/{id}
POST   /api/admin/assessments/{id}/questions

GET    /api/admin/assessments/{id}/submissions
POST   /api/admin/project-submissions/{id}/grade      { score, feedback }

GET    /api/admin/students
GET    /api/admin/students/{id}
POST   /api/admin/students/{id}/enrollments/{courseId}/complete
POST   /api/admin/students/{id}/enrollments               (manually grant a course)

POST   /api/admin/announcements
DELETE /api/admin/announcements/{id}
```

---

## 15. Database Schema (MySQL 8.x)

**UUID primary keys:** MySQL has no `gen_random_uuid()` default like Postgres. Generate UUIDs in the application layer instead — with Hibernate 6 (bundled in Spring Boot 3.x) use `@GeneratedValue` + `@UuidGenerator` on each entity's `id` field, mapped to `CHAR(36)`. Do not rely on a MySQL-side default expression for this; app-generated UUIDs are more portable and avoid MySQL version-specific quirks with `DEFAULT (UUID())`.

**Timestamps:** MySQL's `TIMESTAMP` type only covers 1970–2038 and auto-converts across the session timezone, which causes subtle bugs. Use `DATETIME` everywhere instead, and always write/read UTC from the application (`Instant` in Java, serialized as UTC) — never rely on MySQL server timezone conversion.

**Enums:** MySQL has no reusable named enum type (no Postgres-style `CREATE TYPE`) — declare `ENUM(...)` inline per column, as below.

**Arrays / semi-structured data:** MySQL has no array type. Where the Postgres version used `TEXT[]` or `JSONB`, use MySQL's native `JSON` column type instead (supported MySQL 5.7.8+/8.x).

```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32),
  password_hash VARCHAR(255),          -- null until first-login set-password is completed
  role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE courses (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,   -- 'dsa-foundations' | 'backend-engineering' | 'full-stack-development'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_inr INT NOT NULL,
  duration_months INT NOT NULL,
  order_index INT NOT NULL,            -- 1, 2, 3
  prerequisite_course_id CHAR(36),
  FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE months (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  month_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE weeks (
  id CHAR(36) PRIMARY KEY,
  month_id CHAR(36) NOT NULL,
  week_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE class_sessions (
  id CHAR(36) PRIMARY KEY,
  week_id CHAR(36) NOT NULL,
  global_class_number INT NOT NULL UNIQUE,   -- 1..160
  title VARCHAR(500) NOT NULL,
  day ENUM('MON', 'TUE', 'WED', 'THU', 'FRI') NOT NULL,
  scheduled_start DATETIME,
  scheduled_end DATETIME,
  notes_markdown MEDIUMTEXT,
  live_meeting_url VARCHAR(500),
  recording_provider VARCHAR(50),      -- 'local' for v1 (see Section 12/17); left extensible for a future provider swap
  recording_provider_video_id VARCHAR(500),   -- v1: internal storage path/key, not a third-party ID
  order_index INT NOT NULL,
  FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE questions (
  id CHAR(36) PRIMARY KEY,
  class_session_id CHAR(36),           -- null if only used inside an assessment
  title VARCHAR(255) NOT NULL,
  difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
  statement_markdown MEDIUMTEXT NOT NULL,
  constraints JSON,                    -- array of strings
  examples JSON NOT NULL,              -- [{input, output, explanation}]
  starter_code_java MEDIUMTEXT,
  test_cases JSON NOT NULL,            -- [{input, expected_output, hidden}]
  tags JSON,                           -- array of strings
  order_index INT NOT NULL,
  FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE enrollment_requests (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  course_id CHAR(36) NOT NULL,
  upi_reference VARCHAR(255) NOT NULL,
  payment_screenshot_url VARCHAR(500),
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  admin_note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE enrollments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE (user_id, course_id)
) ENGINE=InnoDB;

CREATE TABLE assessments (
  id CHAR(36) PRIMARY KEY,
  week_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('CODE', 'PROJECT_SUBMISSION') NOT NULL,
  opens_at DATETIME NOT NULL,
  closes_at DATETIME NOT NULL,
  duration_minutes INT,
  FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assessment_questions (
  id CHAR(36) PRIMARY KEY,
  assessment_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  points INT NOT NULL DEFAULT 10,
  order_index INT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB;

CREATE TABLE submissions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  question_id CHAR(36),
  assessment_id CHAR(36),
  language VARCHAR(50) NOT NULL DEFAULT 'java',
  code MEDIUMTEXT NOT NULL,
  verdict ENUM('ACCEPTED', 'WRONG_ANSWER', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TLE', 'PENDING') NOT NULL DEFAULT 'PENDING',
  score INT,
  test_case_results JSON,              -- [{passed, hidden}] (no input/output leaked for hidden cases)
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
) ENGINE=InnoDB;

CREATE TABLE project_submissions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  assessment_id CHAR(36) NOT NULL,
  repo_url VARCHAR(500),
  file_url VARCHAR(500),
  score INT,
  feedback TEXT,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE class_progress (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  class_session_id CHAR(36) NOT NULL,
  watched_recording BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
  UNIQUE (user_id, class_session_id)
) ENGINE=InnoDB;

CREATE TABLE announcements (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36),                  -- null = shown to everyone
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;
```

**Spring config notes:** add the `mysql-connector-j` dependency (not `postgresql`), set `spring.datasource.url=jdbc:mysql://<host>:3306/ooma?useSSL=true&serverTimezone=UTC`, and `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect`. Use **Flyway** for migrations (Flyway supports MySQL natively) — write the above as a versioned migration (e.g. `V1__init_schema.sql`), don't rely on `ddl-auto`.

---

## 16. Auth & Security

- JWT access token (short-lived, ~15 min) + refresh token (long-lived, ~7 days, stored httpOnly cookie or securely in the client — pick one consistently, do not store either token in `localStorage` if avoidable due to XSS risk; httpOnly cookie for refresh token is preferred).
- Passwords hashed with BCrypt, minimum 8 characters enforced client- and server-side.
- All admin endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`.
- Enrollment-gated content endpoints (`/api/courses/{courseId}/tree`, class content, etc.) must check the requesting user actually has an `ACTIVE`/`COMPLETED` enrollment for that course — do not rely on the frontend to hide locked courses.
- File uploads (payment screenshots, recordings, project files) validated by MIME type and size limit server-side before storing.
- Rate-limit `/api/code/run` and `/api/code/submit` per user (e.g. 1 request per 3 seconds) to prevent Judge0 abuse.
- CORS restricted to the two known frontend origins.
- All traffic over HTTPS in production.

---

## 17. File / Video Storage

Abstract behind two interfaces so the underlying storage can be swapped without touching business logic:

- `StorageService` — for notes attachments, payment screenshots, project submission files.
- `VideoStorageService` — for class recordings (Section 12).

**Default implementation for v1: local filesystem**, not S3/MinIO. Store uploads under a configurable root directory (e.g. `/var/ooma/storage/{category}/{uuid}.{ext}`), never inside a web-servable static folder. Serve everything through authenticated backend endpoints (pre-signed-style short-lived tokens for downloads, standard multipart upload endpoints for uploads) rather than direct file URLs — this gets you the same access-control behavior as a signed S3 URL without needing an object storage service at all, at zero extra cost or moving parts.

**Why not MinIO (the usual free/open-source S3-compatible default)?** As of this spec, MinIO is a poor recommendation: it stripped the admin console from its open-source Community Edition in May 2025, stopped publishing pre-built binaries/Docker images in October 2025 (source-only distribution), and by December 2025 the maintainers put the project into maintenance mode — the GitHub repo shows archived/read-only. It still runs if you already have it, but it's not a healthy pick for a new build. Don't use it.

**If you outgrow local disk later** (multi-server deployment, need real S3 API compatibility for tooling, etc.), the two actively-maintained open-source alternatives worth evaluating first are **SeaweedFS** (Apache 2.0, ~30k stars, simple single-binary deploy, strong general-purpose pick) and **Garage** (Rust, AGPL, lighter-weight, built for small geo-distributed clusters). Either can sit behind the same `StorageService`/`VideoStorageService` interfaces with no changes to calling code. Do not build this in v1 — local disk is sufficient at the stated scale and keeps the infrastructure to a single VM.

---

## 18. Notifications / Email

**Default provider: Brevo's free SMTP relay** (300 emails/day, free forever, no credit card required for the free tier). At this cohort size that ceiling won't be reached — enrollment approvals, password resets, and course-unlock emails are low-volume, non-bulk sends. Configure it as a standard SMTP relay via Spring Mail (`spring.mail.host=smtp-relay.brevo.com`, port 587, credentials from Brevo's dashboard) — no code beyond normal `JavaMailSender` usage is needed, so swapping providers later (SES, Postmark, etc.) is a config change, not a rewrite. Do not self-host an SMTP server (e.g. Postfix) — deliverability without an established sending reputation is poor enough to actively hurt the enrollment flow, so this is one place where "free" isn't worth the self-hosting trade-off.

Minimum required transactional emails:
1. **Enrollment approved** — set-password link + portal URL.
2. **Enrollment rejected** — optional, with admin note if provided.
3. **Password reset requested**.
4. **New course unlocked** — sent when admin marks a course complete and grants the next one.

**ASSUMPTION:** No live-class reminder emails or weekly digest emails in v1 — out of scope, flagged here so it isn't silently skipped vs. silently assumed unnecessary.

---

## 19. Repository / Folder Structure

```
outofmemory-academy/
├── backend/                          # Spring Boot (Maven)
│   ├── src/main/java/com/ooma/
│   │   ├── auth/                     # JWT filter, login/refresh/reset endpoints
│   │   ├── users/
│   │   ├── courses/                  # Course, Month, Week, ClassSession
│   │   ├── questions/
│   │   ├── enrollment/               # EnrollmentRequest, Enrollment
│   │   ├── assessments/
│   │   ├── submissions/
│   │   ├── code/                     # Judge0 client, run/submit endpoints
│   │   ├── storage/                  # StorageService, VideoStorageService + impls
│   │   ├── email/
│   │   ├── admin/                    # admin-only controllers
│   │   └── config/                   # SecurityConfig, CorsConfig, etc.
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/             # Flyway migrations (use Flyway, not JPA auto-ddl, in prod)
│   └── src/test/java/...
├── apps/
│   ├── public-site/                  # React + Vite + TS
│   │   └── src/{pages,components,api}/
│   └── student-portal/               # React + Vite + TS
│       └── src/{pages,components,api,admin}/
├── scripts/
│   └── generate-questions.ts         # Section 10 seeding script
├── docker-compose.yml                # postgres, judge0, backend (dev)
└── README.md
```

**ASSUMPTION:** Use Flyway (not Hibernate `ddl-auto: update`) for schema migrations in any environment beyond local dev — safer for an outsourced team iterating without full context of prior schema state.

---

## 20. Non-Functional Requirements

- **Scale**: this is a small-cohort bootcamp (tens to low hundreds of concurrent students, not thousands). A single small VPS/managed Postgres instance is sufficient — do not over-engineer for horizontal scale.
- **Responsive design**: student portal must work well on mobile (students may check notes/questions on phones between live sessions), not just desktop.
- **Accessibility**: standard semantic HTML, sufficient color contrast for difficulty badges, keyboard-navigable forms.
- **Testing**: unit tests for backend service layer (especially enrollment gating logic and code-verdict mapping), and integration tests for the auth flow. Frontend: component tests are lower priority than backend correctness for v1.
- **Environment config**: all secrets (DB creds, JWT secret, SMTP creds, storage provider keys, Judge0 URL) via environment variables / `.env`, never hardcoded.
- **Logging**: structured logging (SLF4J/Logback) on the backend, especially around the code execution and payment-approval flows for auditability.

---

## 21. Explicit Assumptions & Out-of-Scope (v1)

To prevent the coding agent from silently inventing behavior, everything below is a deliberate scope decision:

- **No payment gateway integration.** Manual UPI + admin approval only (Section 7). Do not add Razorpay/Stripe/PhonePe SDK integration unless asked.
- **No public self-registration.** Accounts are created only via the enrollment-approval flow.
- **No live in-browser video streaming.** Zoom/Meet links only (Section 12).
- **No mobile app.** Web only, responsive.
- **No multi-language code execution beyond Java for v1**, even though the runner is built generically.
- **No automatic course-unlock.** Admin must manually mark a course `COMPLETED` and grant the next enrollment.
- **No social features** (comments, leaderboards, forums) beyond the WhatsApp group mentioned in marketing copy, which is external to the platform.
- **No attendance tracking** in v1 (class progress tracks recording-watched + questions-solved only, not live attendance).

---

## 22. Seed Data — Full Curriculum (verbatim, use exactly as given)

Seed `courses`, `months`, `weeks`, and `class_sessions` from this exact structure. Global class numbers 1–160 map directly to `class_sessions.global_class_number`.

### Course 1: DSA Foundations (`dsa-foundations`) — 4 months, ₹499, order_index 1

**Month 1: Programming Foundations & Absolute Basics**

*Week 1: Introduction to Programming & Core Data Types*
1. How Computers Think: Compilers, Interpreters, and setting up the Java Environment (JDK vs. JRE vs. JVM).
2. Variables & Memory: What happens in RAM when you declare a variable?
3. Primitive Data Types: Deep dive into int, float, double, char, boolean, and their exact byte limits.
4. Standard Input/Output: Mastering the Scanner class for interactive programs and formatting output.
5. Operators & Expressions: Arithmetic, Relational, Logical operators, and operator precedence rules.

*Week 2: Conditional Logic & Digital Arithmetic*
6. Decision Making: if, else if, else, and nested conditions.
7. Multiple Choices: switch-case statements and modern switch expressions.
8. Bitwise Operators: Understanding binary representation, AND, OR, XOR, and Bit Shifts (<<, >>).
9. Logic Building: Drawing flowcharts and writing pseudocode for real-world problems.
10. Week 2 Review & Core Syntax Live Lab Quiz.

*Week 3: Loops & Logic-Building Patterns*
11. Loops Part 1: The anatomy of a while loop and do-while loops.
12. Loops Part 2: The for loop, initialization, condition, and increment/decrement mechanics.
13. Nested Loops: Code tracing, dry-running variables step-by-step on a whiteboard.
14. Logic Building via Pattern Printing: Building stars, numbers, and inverted pyramid patterns.
15. Control Statements: How and when to use break, continue, and return points safely.

*Week 4: Functions & Introduction to 1D Arrays*
16. Functions/Methods: Declaring methods, parameters, return types, and execution stacks.
17. Memory Scope: Local vs. Global scope, and debunking the "Pass by Value vs. Reference" myth in Java.
18. Introduction to 1D Arrays: Why do we need them? Memory contiguous allocation and indexing.
19. Basic Array Operations: Inserting, updating, traversing, and tracking elements in an array.
20. Month 1 Comprehensive Assessment: Building basic console apps (e.g., Calculator, Number Guessing Game).

**Month 2: Time Complexity, Searching, Sorting & Strings**

*Week 5: Code Efficiency & Linear Searching*
21. Introduction to Time & Space Complexity: Why performance matters when data grows.
22. Asymptotic Notations: Visually understanding Big-O, Big-Omega, and Big-Theta.
23. Analyzing Complexity: Calculating Big-O for linear loops, nested loops, and conditional structures.
24. Linear Search: Algorithm, implementation, and analyzing best/worst-case scenarios.
25. Array Math: Finding Maximum, Minimum, and tracking frequencies in arrays.

*Week 6: Binary Search Mastery*
26. Divide & Conquer Strategy: The intuition behind Binary Search (Sorted array logic).
27. Binary Search Implementation: Iterative vs. Recursive structural approaches.
28. Binary Search Tweaks: Finding the Floor, Ceiling, First Occurrence, and Last Occurrence of an element.
29. Advanced Binary Search: Searching in a Rotated Sorted Array.
30. Binary Search on Answer: Peak Element detection and real-world optimizations.

*Week 7: Basic Sorting Algorithms & Multi-Dimensional Arrays*
31. Bubble Sort: The intuition of swapping adjacent elements, optimization flags, and dry-runs.
32. Selection Sort & Insertion Sort: Card-sorting analogy, mechanics, and inner-loop transitions.
33. Introduction to 2D Arrays (Matrices): Memory architecture (Row-major vs. Column-major).
34. 2D Array Operations: Matrix Addition, Multiplication, and Transposition.
35. Advanced Matrix Techniques: Spiral traversal and 90-degree matrix rotation algorithms.

*Week 8: String Manipulation & Pointers*
36. Strings in Java: String Immutability, Heap memory allocation, and the String Constant Pool.
37. Essential String Mechanics: Operations, String Comparisons, and using StringBuilder for performance.
38. Two-Pointer Technique: Reversing arrays, checking palindromes, and container container problems.
39. Basic Sliding Window: Fixed-size window patterns for contiguous subarray tracking.
40. Month 2 Review & Mid-Phase DSA Coding Contest.

**Month 3: Intermediate DSA (Recursion, Backtracking & Linear Structures)**

*Week 9: Recursion Foundations*
41. Recursion Principle: The concept of a function calling itself. The base case vs. infinite stack overflow.
42. The Call Stack: Visualizing recursion memory allocation with trees.
43. Classic Recursion: Factorials, Fibonacci sequences, and power calculations.
44. String Recursion: Generating subsequences, reversing strings recursively.
45. Tail Recursion vs. Non-Tail Recursion optimization techniques.

*Week 10: Backtracking Mastery*
46. The Backtracking Concept: Navigating decision trees and state pruning.
47. Permutations & Combinations: Generating all possible structural arrangements of an array.
48. Maze Problems: The classic Rat in a Maze puzzle layout.
49. N-Queens Problem: Constraint validation and matrix state restoration.
50. Sudoku Solver: Formulating advanced row, column, and subgrid validation rules.

*Week 11: Linked Lists*
51. Dynamic Memory: Nodes, Pointers, and Singly Linked List structures vs. Arrays.
52. Linked List Operations: Insertion and Deletion at Head, Tail, and middle index positions.
53. Structural Reversal: Reversing a Linked List iteratively and recursively.
54. Cycle Mechanics: Floyd's Cycle Detection (Tortoise & Hare) and Cycle Removal loops.
55. Doubly & Circular Linked Lists: Multi-directional node tracking.

*Week 12: Stacks & Queues*
56. Stacks (LIFO): Array-based and Linked-List-based implementations.
57. Queues (FIFO): Custom implementations and Circular Queue arrays.
58. Evaluation Logic: Balanced Parentheses verification and Infix-to-Postfix string conversions.
59. Monotonic Stack Patterns: Next Greater Element / Next Smaller Element logic.
60. Month 3 Assessment & Code Review (Linked Lists, Stacks, Queues).

**Month 4: Advanced DSA (Trees, Heaps, Graphs & DP)**

*Week 13: Hierarchical Structures (Trees & BST)*
61. Trees Concept: Binary Tree nodes, root elements, and leaf classifications.
62. Traversal Paths: Pre-order, In-order, Post-order (Recursive & Iterative layouts).
63. Breadth-First Search (BFS): Level Order Traversal utilizing Queue states.
64. Binary Search Trees (BST): Properties, element validation, node Insertion, and Deletion.
65. Structural Optimization: Balanced Trees concept (AVL/Red-Black overview) and Lowest Common Ancestor.

*Week 14: Heaps & Hash Maps*
66. Binary Heaps: Min-Heap and Max-Heap complete array-based layouts.
67. PriorityQueues: Heapify mechanics, Custom Comparators, and Heap Sort operations.
68. Top K Patterns: Finding the K-th largest element and merging K sorted streams.
69. Hashing: Concept, Hash Codes, Collision resolution mechanisms (Chaining vs. Open Addressing).
70. Hashing Tools: HashMap and HashSet internals in Java (hashCode() and equals()).

*Week 15: Graph Networks*
71. Graph Basics: Vertices, Edges, Adjacency Matrices, and Adjacency Lists.
72. Network Traversals: Breadth-First Search (BFS) and Depth-First Search (DFS) implementation loops.
73. Topological Sorting: Directed Acyclic Graph orderings (Kahn's Algorithm).
74. Shortest Path: Dijkstra's Algorithm using PriorityQueues.
75. Spanning Trees: Kruskal's and Prim's Minimum Spanning Tree structures.

*Week 16: Dynamic Programming (DP) & Advanced Data Structures*
76. DP Concept: Identifying overlapping subproblems and optimal substructures.
77. Memoization vs. Tabulation: Converting recursive solutions into efficient iterative arrays.
78. Classic 1D/2D DP: Climbing Stairs, House Robber, and 0/1 Knapsack equations.
79. Prefix Trees (Tries): Efficient character-by-character string storage, search, and autocomplete logic.
80. Phase 1 Capstone Hackathon & DSA Certification Challenge.

---

### Course 2: Backend Engineering (`backend-engineering`) — 6 months, ₹649, order_index 2, prerequisite: dsa-foundations

**Month 5: Advanced Java Concepts & SQL Database Modeling**

*Week 17: Object-Oriented Programming (OOP) Deep Dive*
81. Classes, Objects, and Constructors. Access Modifiers (public, private, protected, default).
82. Encapsulation & Inheritance: Extends vs. Implements, and memory behavior of subclass instances.
83. Polymorphism: Method Overloading vs. Method Overriding (Runtime vs. Compile-time execution).
84. Abstraction: Abstract Classes vs. Interfaces (including Java 8+ Default/Static interface methods).
85. Error Handling: Exception Hierarchy, try-catch-finally, and throwing custom business exceptions.

*Week 18: Advanced Java Mechanics*
86. Java Generics: Building type-safe components and generic boundary structures.
87. Collections Internals: Inner mechanics of ArrayList, LinkedList, and HashSet memory resizing.
88. Lambda Expressions & Streams: Modern functional processing over arrays and collections.
89. Multithreading Foundations: Lifecycle of a Thread, Runnable implementation, and synchronization locks.
90. Java Memory Internals: Stack vs. Heap allocation, and how Garbage Collection frees dead objects.

*Week 19: Relational Databases & SQL Basics*
91. Database Architecture: Relational Databases vs. File Systems, and SQL vs. NoSQL environments.
92. Data Definition Language (DDL): Writing clean CREATE, ALTER, and DROP statements.
93. Data Manipulation Language (DML): Master INSERT, UPDATE, DELETE, and Primary/Foreign Key constraints.
94. Query Filtering: SELECT syntax, WHERE clauses, Wildcards, and logical pagination mapping.
95. Aggregations: GROUP BY, HAVING, and calculating analytics via SUM, AVG, COUNT.

*Week 20: Advanced SQL & Data Architecture*
96. Table Joins: Combining multi-table entities via INNER, LEFT, RIGHT, and FULL OUTER joins.
97. Complex Queries: Subqueries, Correlated Subqueries, and CTEs (Common Table Expressions).
98. Normalization Theory: Redundancy eradication up to 3rd Normal Form (1NF, 2NF, 3NF).
99. Transactions Isolation: ACID Properties, locking modes, and maintaining data consistency.
100. Database Indexing: How B-Trees accelerate queries, and analyzing Slow Query Execution Plans.

*Phase 2 - Project 1 Release: Design and write a highly normalized Database Schema for a digital booking platform.*

**Month 6: Spring Boot Ecosystem & REST API Architecture**

*Week 21: Spring Framework Core Mechanics*
101. Enterprise Frameworks Concept: The Spring Ecosystem overview.
102. Dependency Injection: Understanding Inversion of Control (IoC) to break rigid code dependencies.
103. Core Annotations: Wiring components using @Component, @Service, @Repository, and @Autowired.
104. Lifecycle of Beans: Singleton vs. Prototype instantiations and scopes.
105. Application Properties: Environment isolation with Profiles and configuration files.

*Week 22: RESTful Web API Design*
106. REST Architecture: HTTP Methods (GET, POST, PUT, DELETE), request anatomy, and status codes.
107. Web Routing: Implementing API controllers using @RestController and @RequestMapping.
108. Extracting Parameters: Handling inputs from @PathVariable, @RequestParam, and URL shapes.
109. Payload Bindings: Transforming raw JSON payloads into Java Data Transfer Objects (DTOs) via @RequestBody.
110. Global Exception Handling: Building error handlers using @ControllerAdvice.

*Week 23: Data Persistence with Spring Data JPA & Hibernate*
111. ORM Concepts: The abstraction bridge between database tables and Java objects.
112. Entity Mapping: Configuring entity classes with @Entity, @Table, @Id, and @GeneratedValue.
113. JPA Repositories: Generating automated CRUD operations and custom query methods.
114. Mappings: Setting up @OneToOne and @OneToMany relational mapping boundaries.
115. Performance Tuning: Fixing the N+1 select problem and controlling Lazy vs. Eager loading.

*Week 24: Security, Testing & Architecture Cleanliness*
116. API Validations: Guarding endpoint structures using Jakarta validation constraints (@Valid).
117. Web Security Concept: Introduction to Authentication vs. Authorization and JWT tokens.
118. Enterprise Logging: Using SLF4J/Logback for application state tracking.
119. Automated Testing: Writing robust unit tests using JUnit 5 and mocking database contexts with Mockito.
120. Backend Evaluation & Project Showcase.

*Phase 2 - Project 2 Release: Build a production-grade, secure REST API with fully automated validation, custom error handling, and persistent data layers.*

---

### Course 3: Full-Stack Development (`full-stack-development`) — 8 months, ₹899, order_index 3, prerequisite: backend-engineering

**Month 7: UI Engineering & JavaScript Runtime Mechanics**

*Week 25: Modern HTML5 & Responsive Styling (CSS3)*
121. Web Browsers: How DOM rendering engines read source structures. Semantic HTML5 tags.
122. CSS Specificity: The Cascading inheritance engine, selectors, and the CSS Box Model layout.
123. Flexbox Engine: Master directional alignment controls along main and cross axes.
124. Grid Layouts: Advanced multi-dimensional layout sheets, grid templates, and areas.
125. Responsive Web: Building media queries, fluid sizing viewports, and modern CSS variables.

*Week 26: Core JavaScript Runtime Mechanics*
126. JavaScript Basics: Variable lifecycles (var, let, const), implicit conversions, and dynamic data typing.
127. Scopes & Execution Context: Scoping chains, Closures, and how the compilation phase hoists declarations.
128. First-Class Functions: Callbacks, Arrow Functions, and High-Order arrays mappings.
129. Complex Types: Array structures mutation methods (map(), filter(), reduce()) and Object states.
130. Modern ES6+ Tooling: Destructuring assignments, Spread operators, and Template Strings.

*Week 27: DOM Manipulation & Async JavaScript*
131. DOM APIs: Dynamic document generation, node selection query selectors, and modifying markup.
132. Event Engine: Binding listeners, Event Bubbling propagation paths, and Event Delegation strategies.
133. Asynchronous Event Loop: Call Stacks, Web APIs, Task Queues, and the event processing cycle.
134. Promises Lifecycle: Creating, chaining, and error-catching on async pipelines.
135. Async/Await Syntax: Writing cleaner async flows with try-catch blocks.

*Week 28: Network Communication & Modern Git Workflows*
136. Network API Integration: Fetching raw REST payloads using the browser's Fetch API.
137. Browser Storage: Using localStorage, sessionStorage, and setting cookies.
138. Node Tooling: Managing dependencies through npm or yarn environments.
139. Version Control: Git repository setups, remote synchronization, branching, and pull requests on GitHub.
140. Month 7 Project Showcase: Building a modular data dashboard application using pure Vanilla JS.

**Month 8: Component Architecture with React.js & Full-Stack Assembly**

*Week 29: React Component Ecosystem*
141. Declarative UI Concept: Comparing React's state rendering loop against imperative Vanilla structures.
142. Vite Project Bootstrapping: Exploring structural assets, package maps, and compilation tasks.
143. JSX Mechanics: Rules of element compilation, fragment abstractions, and attribute mapping.
144. Functional Components: Passing properties (props) down component trees as immutable inputs.
145. Iterative Components: Mapping item arrays into lists while retaining strict key attributes.

*Week 30: State Lifecycles & Side-Effects Pipelines*
146. State Engine: Declaring mutable UI values inside components with the useState hook.
147. User Input Forms: Creating controlled form components vs. uncontrolled inputs.
148. Handling Side Effects: Utilizing the useEffect hook, controlling execution with dependency arrays, and cleanup tasks.
149. Data Subscriptions: Calling distant Spring Boot backend APIs directly inside component hooks.
150. Custom Hooks: Abstracting heavy data tracking or event logic out of UI view files.

*Week 31: Advanced React Architectures*
151. Client Routing: Configuring client-side routes using React Router DOM.
152. Dynamic URL Routing: Parsing variables using useParams and updating query tracking strings.
153. Global Contexts: Stopping prop drilling limitations by configuring global application contexts with useContext.
154. Code Optimization: Managing rendering recalculation limits via useMemo and useCallback hook checks.
155. UI Frameworks: Integrating style frameworks like Tailwind CSS into the React rendering flow.

*Week 32: Full-Stack Assembly & Public Deployment*
156. System Plumbing: Routing frontend network calls directly to the localized Spring Boot endpoints.
157. Cross-Origin Control: Configuring CORS policy variables inside Java configuration filters to accept external client queries.
158. Secure Interceptors: Attaching JWT verification tokens to client request headers.
159. Deployment Engines: Uploading static UI components to Vercel/Netlify, and host servers for databases.
160. Final Capstone Reviews & Graduation Project Evaluations.

*Phase 3 - Grand Capstone Project: Build a fully deployed, secure E-Commerce Hub or SaaS Collaboration dashboard using a React frontend, Spring Boot backend service layers, and persistent relational SQL database configurations.*

---

## 23. Suggested Build Order

For an outsourced agent working through this spec top-down, this sequencing avoids rework:

1. **Backend skeleton**: entities + migrations (Section 15), Spring Security + JWT auth (Section 16).
2. **Public API + Public Site**: course catalog, curriculum display, enrollment request submission (Sections 6, 14).
3. **Admin: enrollment approval flow** end-to-end (Section 7, 13.1) — this is the only way test student accounts get created, so it unblocks everything downstream.
4. **Curriculum seed data** (Section 22) loaded via migration/seed script.
5. **Student Portal shell**: login, dashboard, course dropdown, Month/Week/Class navigation (Section 8.1–8.4, without questions/code runner yet).
6. **Notes + Lecture window** (Zoom link-out + recording placeholder) on the Class Page.
7. **Judge0 integration + Code Runner UI** (Section 11).
8. **Question seeding via the AI prompt template** (Section 10) once the class tree exists to attach questions to.
9. **Weekly Assessments** (both types) (Section 8.5, 13.5, 13.6).
10. **Recording upload + signed playback** (Section 12).
11. **Admin console polish**: students list, course-completion gating action (13.7), announcements (13.8).
12. **Non-functional pass**: responsive QA, rate limiting, logging, tests.