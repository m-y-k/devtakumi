# DevTakumi — Phase-Wise Build Plan

Each phase is **independently testable** before moving to the next. Phases are ordered to minimize rework (aligned with Section 23 of `technical-spec.md`).

---

## Phase 0 — Infrastructure & Monorepo Scaffold

**Goal:** Runnable dev environment with correct folder layout.

**Deliverables:**
- Monorepo structure per spec (`backend/`, `apps/public-site/`, `apps/student-portal/`, `scripts/`, `docker-compose.yml`)
- Docker Compose: MySQL 8, Judge0 CE, backend (optional profile)
- Spring Boot 3.x skeleton (Java 21, Maven)
- Both React SPAs scaffolded (Vite + React 18 + TypeScript + Tailwind)
- `.env.example` with all required variables
- Root `README.md` with setup instructions

**How to test:**
```bash
docker compose up -d mysql judge0
cd backend && mvn spring-boot:run
curl http://localhost:8080/actuator/health   # → 200 OK
cd apps/public-site && npm run dev             # → loads on :5173
cd apps/student-portal && npm run dev          # → loads on :5174
```

**Exit criteria:** All containers healthy; both frontends compile; backend starts without errors.

---

## Phase 1 — Database Schema & Auth Foundation

**Goal:** Persistent schema + JWT authentication working end-to-end.

**Deliverables:**
- Flyway `V1__init_schema.sql` (Section 15 — all tables)
- JPA entities matching schema
- Spring Security + JWT (access ~15 min, refresh ~7 days via httpOnly cookie)
- Auth endpoints: login, refresh, forgot-password, reset-password, set-password
- BCrypt password hashing (min 8 chars)
- Seed: one `ADMIN` user (env-configured credentials)
- CORS for both frontend origins

**How to test:**
```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devtakumi.local","password":"admin12345"}'
# → { accessToken, refreshToken, user }

# Protected route without token → 401
curl http://localhost:8080/api/me

# With token → 200
curl http://localhost:8080/api/me -H "Authorization: Bearer <token>"
```

**Exit criteria:** Auth flow works; unauthorized requests blocked; admin user can log in.

---

## Phase 2 — Curriculum Seed Data & Public API

**Goal:** All 3 courses + 160 classes seeded; public read-only API live.

**Deliverables:**
- Flyway `V2__seed_curriculum.sql` — Section 22 verbatim (courses, months, weeks, class_sessions)
- `GET /api/public/courses`
- `GET /api/public/courses/{slug}`
- `GET /api/public/courses/{slug}/curriculum`
- App settings table/entity for configurable UPI ID (default: `myk22.wallet@phonepe`)

**How to test:**
```bash
curl http://localhost:8080/api/public/courses
# → 3 courses with correct prices (499, 649, 899)

curl http://localhost:8080/api/public/courses/dsa-foundations/curriculum
# → 4 months, 16 weeks, 80 classes (global_class_number 1–80)

curl http://localhost:8080/api/public/courses/backend-engineering/curriculum
# → classes 81–120

curl http://localhost:8080/api/public/courses/full-stack-development/curriculum
# → classes 121–160
```

**Exit criteria:** 160 class sessions exist; curriculum tree matches Section 22 exactly.

---

## Phase 3 — Public Marketing Site

**Goal:** Unauthenticated marketing site consuming public API.

**Deliverables:**
- `apps/public-site` pages: Home, `/courses`, `/courses/:slug`, `/enroll`, `/about`
- Hero, "The Path" stage cards, mentor bio, feature bullets
- Course catalog grid from API
- Collapsible curriculum tree on course detail
- Enroll CTA with prerequisite messaging for courses 2 & 3

**How to test:**
1. Open `http://localhost:5173` — home page renders with 3 stage cards
2. Navigate to `/courses` — 3 courses from API
3. Open `/courses/dsa-foundations` — full curriculum tree, ₹499 price
4. Courses 2 & 3 show "Unlocks after completing [previous course]" on enroll CTA
5. `/about` renders static contact content

**Exit criteria:** All public pages work without backend auth; data comes from API.

---

## Phase 4 — Enrollment Request Flow (Public Submit)

**Goal:** Visitors can submit manual UPI payment proof.

**Deliverables:**
- `StorageService` (local filesystem) for payment screenshots
- `POST /api/public/enrollment-requests` (multipart: name, email, phone, courseId, upiReference, optional screenshot)
- Enrollment form on `/enroll` with UPI QR, configurable UPI ID, dynamic price
- Confirmation message after submit

**How to test:**
```bash
curl -X POST http://localhost:8080/api/public/enrollment-requests \
  -F "name=Test Student" \
  -F "email=test@example.com" \
  -F "phone=9876543210" \
  -F "courseId=<dsa-course-uuid>" \
  -F "upiReference=UTR123456"
# → 201, status PENDING
```
Plus UI test: fill form on `/enroll`, submit, see confirmation.

**Exit criteria:** Request stored in DB; optional screenshot saved to disk; no auth required.

---

## Phase 5 — Admin Enrollment Approval (Account Creation)

**Goal:** Admin approves/rejects requests; students get accounts.

**Deliverables:**
- `GET /api/admin/enrollment-requests?status=PENDING`
- `POST /api/admin/enrollment-requests/{id}/approve`
- `POST /api/admin/enrollment-requests/{id}/reject`
- On approve: create User (random temp password), create Enrollment (ACTIVE), send set-password email
- `EmailService` via Spring Mail (Brevo SMTP; mock/console in dev)
- Admin UI: `/admin/enrollment-requests` table with Approve/Reject

**How to test:**
1. Submit enrollment request (Phase 4)
2. Login as admin → see pending request with UTR + screenshot
3. Approve → user row created, enrollment ACTIVE, email logged/sent
4. Student uses set-password link → sets password → can log in

**Exit criteria:** Full enrollment-to-account pipeline works; no public self-registration.

---

## Phase 6 — Student Portal Shell & Enrollment Gating

**Goal:** Authenticated LMS navigation with server-side course gating.

**Deliverables:**
- `apps/student-portal`: login, dashboard, profile (change password)
- `GET /api/me`, `GET /api/me/enrollments`
- `GET /api/courses/{courseId}/tree` — gated by ACTIVE/COMPLETED enrollment
- Course dropdown (only enrolled courses)
- Month → Week → Class sidebar accordion
- Dashboard: progress bars, "continue where you left off", announcements feed
- Server rejects access to locked courses (403)

**How to test:**
1. Login as approved student → dashboard shows DSA enrollment + progress
2. Course tree loads for DSA; Backend/Full-Stack return 403
3. Admin marks DSA COMPLETED + grants Backend enrollment → student sees both courses
4. Switching course dropdown navigates correctly

**Exit criteria:** Gating enforced server-side; navigation works for enrolled courses only.

---

## Phase 7 — Class Page (Notes + Live Link + Recording Placeholder)

**Goal:** Core daily learning screen without code runner yet.

**Deliverables:**
- `GET /api/classes/{classId}` (enrollment-gated)
- Class page two-pane layout
- Left pane: metadata, sanitized Markdown notes (`react-markdown` + `rehype-sanitize`)
- Right pane: "Join Live Class" button during `scheduledStart`–`scheduledEnd` window (opens URL in new tab)
- Placeholder when no recording: "Recording will be available after the live session"
- `ClassProgress` entity — track `watched_recording`
- Admin class editor: edit notes, set live meeting URL, schedule

**How to test:**
1. Open a class → notes render safely
2. Set `scheduledStart`/`scheduledEnd` to now ±30 min → "Join Live Class" visible
3. Outside window → button hidden
4. No recording uploaded → placeholder shown

**Exit criteria:** Class page is usable for reading notes and joining live sessions.

---

## Phase 8 — Judge0 Integration & Code Runner

**Goal:** Java code execution for DSA practice questions.

**Deliverables:**
- Judge0 client service (submit + poll)
- `POST /api/code/run` — ad-hoc run with custom stdin
- `POST /api/code/submit` — all test cases, store Submission, compute verdict
- Verdict mapping: ACCEPTED, WRONG_ANSWER, COMPILE_ERROR, RUNTIME_ERROR, TLE
- Rate limit: 1 req / 3 sec per user on run/submit
- Monaco Editor UI: Run, Submit, submission history
- Full-screen split: problem left, editor + console right

**How to test:**
```bash
# With a seeded question ID
curl -X POST http://localhost:8080/api/code/run \
  -H "Authorization: Bearer <token>" \
  -d '{"questionId":"...","language":"java","code":"...","stdin":"5"}'
```
UI: open question → write Java → Run shows stdout → Submit shows per-test-case pass/fail.

**Exit criteria:** Code runs only in Judge0; submissions stored; hidden test cases don't leak I/O.

---

## Phase 9 — Practice Questions & AI Seeding

**Goal:** 5–8 questions per DSA class; seeding tooling.

**Deliverables:**
- `scripts/generate-questions.ts` — LLM prompt from Section 10
- Seed a starter set of questions for at least Week 1 (manual or script)
- `GET /api/classes/{classId}/questions`
- `GET /api/questions/{questionId}`
- `GET /api/questions/{questionId}/submissions`
- Difficulty badges (EASY/MEDIUM/HARD); solved indicator (ACCEPTED submission)
- Admin: CRUD questions, `POST /api/admin/classes/{id}/generate-questions` (nice-to-have)

**How to test:**
1. Class page lists questions with difficulty badges
2. Solved questions show checkmark after ACCEPTED submit
3. Run seed script against one class → 5–8 questions inserted

**Exit criteria:** Questions attach to classes; code runner opens from question click.

---

## Phase 10 — Weekly Assessments

**Goal:** Graded weekly activities for all course types.

**Deliverables:**
- Assessment + AssessmentQuestion entities
- `GET /api/weeks/{weekId}/assessment`
- CODE type (DSA): auto-graded via code submit, running score
- PROJECT_SUBMISSION type (Backend/Full-Stack): repo URL + file upload
- Admin: create/edit assessments, view submissions
- `POST /api/admin/project-submissions/{id}/grade` — manual score + feedback
- Assessment page with open/close window + optional countdown

**How to test:**
1. DSA week assessment: solve CODE problems → score updates automatically
2. Backend week assessment: submit GitHub link → admin grades → student sees score
3. Assessment outside open window → submission blocked

**Exit criteria:** Both assessment types work end-to-end.

---

## Phase 11 — Recording Upload & Signed Playback

**Goal:** Secure self-hosted video streaming.

**Deliverables:**
- `VideoStorageService` (local disk under `/var/devtakumi/recordings/` or configurable)
- `POST /api/admin/classes/{id}/recording` (multipart upload)
- `GET /api/classes/{classId}/recording-url` → short-lived signed token (10 min)
- `GET /api/stream/recordings/{token}` → Range-request streaming
- Student portal: `<video>` player with signed URL (no permanent URL exposed)
- Admin upload widget with progress

**How to test:**
1. Admin uploads MP4 for a class
2. Student opens class → video player loads
3. Seeking works (Range headers)
4. Token expires after 10 min → 401/403 on reuse
5. Unenrolled user cannot get recording URL

**Exit criteria:** Videos stream with seeking; URLs are short-lived and enrollment-gated.

---

## Phase 12 — Admin Console (Full)

**Goal:** Complete admin tooling inside student portal.

**Deliverables:**
- `/admin/*` routes gated by `ADMIN` role
- Curriculum manager (CRUD Course → Month → Week → Class)
- Class editor (notes, schedule, questions, recording)
- Students list: enrollments, statuses
- `POST /api/admin/students/{id}/enrollments/{courseId}/complete` — unlocks next course
- `POST /api/admin/students/{id}/enrollments` — manual grant
- Announcements CRUD (course-scoped or global)
- Submissions & grading views (Section 13.6)

**How to test:**
1. Admin edits class title → reflected on student class page
2. Mark student DSA COMPLETED → Backend becomes enrollable
3. Post announcement → appears on student dashboard
4. All admin endpoints return 403 for STUDENT role

**Exit criteria:** Admin can manage full lifecycle without DB access.

---

## Phase 13 — Email, Security Hardening & CI

**Goal:** Production-ready non-functional requirements.

**Deliverables:**
- Brevo SMTP integration (enrollment approved, rejected, password reset, course unlocked)
- File upload validation (MIME type, size limits)
- Structured logging (enrollment approval, code execution audit)
- Backend unit tests: enrollment gating, verdict mapping
- Integration tests: auth flow
- GitHub Actions CI (build + test)
- Responsive QA on student portal (mobile)

**How to test:**
```bash
cd backend && mvn test                    # all tests pass
# Trigger CI on push
# Test password reset email flow
# Test file upload rejects .exe / oversized files
```

**Exit criteria:** Tests green; emails send (or log in dev); security checklist from Section 16 satisfied.

---

## Dependency Graph

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3
                              │
                              ▼
                         Phase 4 ──► Phase 5
                              │
                              ▼
                         Phase 6 ──► Phase 7
                              │
                              ▼
                         Phase 8 ──► Phase 9
                              │
                              ▼
                         Phase 10
                              │
                              ▼
                         Phase 11
                              │
                              ▼
                         Phase 12 ──► Phase 13
```

Phases 3 and 4 can run in parallel after Phase 2. Phase 11 can start after Phase 7 (doesn't need code runner).

---

## Notes on Existing Code

The workspace contains a prior implementation (`course-backend/`, `course-frontend/`, root `src/`) with a different domain model (Batch/Module/Lecture). The new build follows `technical-spec.md` exactly in the structure defined in Section 19. Legacy folders remain for reference but are not extended.

---

## Current Status

| Phase | Status |
|-------|--------|
| 0 | ✅ Complete |
| 1 | ✅ Complete |
| 2 | ✅ Complete |
| 3–13 | ⏳ Pending |
