# OutOfMemoryAcademy

A coding bootcamp platform with three sequential gated courses (DSA Foundations, Backend Engineering, Full-Stack Development), taught by Mohammad Yusuf Khan (SDE @ Flipkart).

## Architecture

```
apps/public-site      → React SPA (Vite + TypeScript + Tailwind) — no auth
apps/student-portal   → React SPA (Vite + TypeScript + Tailwind) — JWT auth + admin console
backend               → Spring Boot 3.x (Java 21, Maven) — REST API
```

## Quick Start

### Prerequisites

- Java 21
- Node.js 20+
- Docker & Docker Compose (for MySQL + Judge0)
- Maven (or use `mvnw`)

### 1. Start infrastructure

```bash
docker compose up -d mysql judge0
```

### 2. Start backend

```bash
cd backend
cp ../.env.example .env   # edit secrets as needed
mvn spring-boot:run
```

The app seeds an admin user (`admin@ooma.local` / `admin12345`) and curriculum data on first startup.

### 3. Start frontends

```bash
# Public marketing site (port 5173)
cd apps/public-site
npm install
npm run dev

# Student portal (port 5174)
cd apps/student-portal
npm install
npm run dev
```

### 4. Verify

```bash
curl http://localhost:8080/actuator/health        # → 200 OK
curl http://localhost:8080/api/public/courses      # → 3 courses
curl http://localhost:5173                         # → Public site loads
curl http://localhost:5174                         # → Student portal loads
```

## Project Structure

```
outofmemory-academy/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/ooma/
│   │   ├── auth/                     # JWT auth, login/refresh/reset
│   │   ├── users/                    # User entity, /api/me
│   │   ├── courses/                  # Course/Month/Week/ClassSession
│   │   ├── questions/                # Practice questions
│   │   ├── enrollment/               # Enrollment requests & enrollments
│   │   ├── assessments/              # Weekly assessments
│   │   ├── submissions/              # Code & project submissions
│   │   ├── code/                     # Judge0 integration
│   │   ├── storage/                  # File & video storage
│   │   ├── email/                    # Transactional emails (Brevo SMTP)
│   │   ├── admin/                    # Admin-only controllers
│   │   └── config/                   # Security, CORS, etc.
│   └── src/main/resources/db/migration/   # Flyway migrations
├── apps/
│   ├── public-site/                  # Marketing site (React)
│   └── student-portal/               # Student LMS + Admin console (React)
├── scripts/
│   └── generate-questions.ts         # AI question seeding script
├── docker-compose.yml                # MySQL + Judge0 + Backend
├── .env.example
└── .github/workflows/ci.yml
```

## API Overview

All endpoints under `/api`. See `technical-spec.md` Section 14 for the full API contract.

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/public/courses | List all courses |
| GET | /api/public/courses/{slug} | Course details |
| GET | /api/public/courses/{slug}/curriculum | Full curriculum tree |
| POST | /api/public/enrollment-requests | Submit enrollment |

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login (returns JWT) |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| POST | /api/auth/set-password | First-login set password |

### Student (authenticated)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/me | Current user |
| GET | /api/me/enrollments | User's enrollments |
| GET | /api/courses/{courseId}/tree | Gated course tree |
| GET | /api/classes/{classId} | Class details + notes |
| GET | /api/classes/{classId}/questions | Class practice questions |
| POST | /api/code/run | Run code (Judge0) |
| POST | /api/code/submit | Submit code for grading |

### Admin (ADMIN role)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/enrollment-requests | List pending requests |
| POST | /api/admin/enrollment-requests/{id}/approve | Approve enrollment |
| POST | /api/admin/enrollment-requests/{id}/reject | Reject enrollment |
| PUT | /api/admin/classes/{id} | Edit class |
| POST | /api/admin/classes/{id}/recording | Upload recording |
| GET | /api/admin/students | List students |
| POST | /api/admin/students/{id}/enrollments/{courseId}/complete | Mark course complete |

## Email Setup

Configure via environment variables:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=your-brevo-username
SMTP_PASSWORD=your-brevo-password
MAIL_FROM=noreply@yourdomain.com
```

In development, emails are logged to the console instead of sent.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Java 21, Spring Boot 3.x, Maven |
| Database | MySQL 8.x (Flyway migrations) |
| Auth | JWT (access + refresh tokens) |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Code Execution | Judge0 CE (self-hosted via Docker) |
| File Storage | Local filesystem |
| Email | Brevo SMTP (Spring Mail) |
| CI | GitHub Actions |
