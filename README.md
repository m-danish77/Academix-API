# Academix — Course & Enrollment Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vitest](https://img.shields.io/badge/Vitest-24%2B%20tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)

A production-ready RESTful API for an online learning platform — featuring JWT authentication, email verification, role-based access, and a complete course enrollment system.

**Base URL:** `https://your-app.onrender.com/api`  
**Interactive Docs:** `https://your-app.onrender.com/api-docs`

---

## Features

**Authentication & Authorization**
- JWT-based stateless auth with expiration
- Email verification via Gmail SMTP (Nodemailer)
- Role-based access control — `student`, `instructor`, `admin`
- Rate limiting: 5 attempts/15 min (auth), 100/min (general)
- Bcrypt password hashing with salting

**Course Management**
- Full CRUD with instructor ownership (only creator can edit/delete; admin can bypass)
- Pagination via `?page=` and `?limit=` query params
- Zod schema validation with descriptive error messages
- Optional YouTube video URL per course

**Enrollment System**
- Students enroll in courses; instructors cannot enroll in their own
- Max capacity enforcement per course
- Duplicate enrollment prevention
- Students view their enrolled courses; instructors view enrolled students

**Security & Observability**
- Helmet.js for secure HTTP headers
- CORS with configurable origins
- Request ID tracing (`X-Request-Id` header) across all logs
- Winston structured logging to file + console
- Morgan HTTP request logging with Request ID
- Environment validation — fail-fast on missing required vars

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+, TypeScript 6 |
| Framework | Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Auth | jsonwebtoken, bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Winston, Morgan |
| Email | Nodemailer (Gmail SMTP) |
| Testing | Vitest, Supertest |
| Docs | Swagger UI, swagger-jsdoc |

---

## Getting Started

**Prerequisites:** Node.js v18+, MongoDB Atlas account, Gmail App Password

```bash
git clone https://github.com/m-danish77/Academix-API.git
cd Academix-API
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Environment Variables

```env
ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
BASE_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=you@gmail.com

VERIFICATION_TOKEN_EXPIRY=24h
DEPLOYED_URL=http://localhost:3000
```

> Generate a Gmail App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) — never use your real Gmail password.

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register (student or instructor) | No |
| `GET` | `/api/auth/verify-email?token=` | Verify email address | No |
| `POST` | `/api/auth/login` | Login → returns JWT | No |

### Courses

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/courses?page=1&limit=10` | List all courses (paginated) | No |
| `POST` | `/api/courses` | Create a course | Instructor / Admin |
| `PUT` | `/api/courses/:courseId` | Update a course | Instructor (own) / Admin |
| `DELETE` | `/api/courses/:courseId` | Delete a course | Instructor (own) / Admin |

### Enrollments

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/enroll/:courseId` | Enroll in a course | Student |
| `GET` | `/api/my-courses` | View my enrolled courses | Student / Admin |
| `GET` | `/api/course/:courseId/students` | View students in a course | Instructor / Admin |

### Quick Example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secure123.","role":"student"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secure123."}'

# Create a course (instructor token required)
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Node.js Masterclass","description":"Learn Node from scratch","maxCapacity":30,"price":49.99}'
```

---

## Testing

```bash
npm test
```

20+ integration tests via Vitest + Supertest. Email verification is auto-bypassed in test mode.

| Suite | Coverage |
|---|---|
| `auth.test.ts` | Register, login, validation, duplicates |
| `courses.test.ts` | CRUD, pagination, role guards, 404s |
| `enrollments.test.ts` | Enroll, capacity, duplicates, role guards, Request ID |

---

## Database Seeding

Seeds **10 users** (2 admins, 3 instructors, 5 students), **9 courses**, and **10+ enrollments**.

| Role | Email | Password |
|---|---|---|
| Admin | ali.ahmed@example.com | Test987. |
| Instructor | usman.malik@example.com | Test987. |
| Student | muhammad.zain@example.com | Test987. |

---

## Project Structure

```
src/
├── __tests__/          # Integration tests (auth, courses, enrollments)
├── configs/            # Logger, MongoDB connection, env validation
├── controllers/        # Route handlers (auth, courses, enrollments)
├── middlewares/        # JWT auth, role guard, rate limiter, Zod validation
├── models/             # Mongoose models (User, Course, Enrollment)
├── routes/             # Express routers
├── scripts/            # Database seeder
├── services/           # Email service (Nodemailer)
├── types/              # Express request augmentation
├── validations/        # Zod schemas
├── app.ts              # Express app setup
├── server.ts           # Entry point
└── swagger.ts          # OpenAPI config
```

---

## Deployment

Deployed on **Render** (free tier):

1. Push to GitHub → connect repo on [render.com](https://render.com)
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add all environment variables in the Render dashboard

To prevent cold starts, ping `https://your-app.onrender.com/` every 10 minutes using [cron-job.org](https://cron-job.org).

---

## Data Models

| Model | Key Fields |
|---|---|
| **User** | `name`, `email` (unique), `password` (hashed), `role`, `isVerified` |
| **Course** | `title`, `description`, `maxCapacity`, `price`, `instructor` (ref), `videoUrl` |
| **Enrollment** | `studentId` (ref), `courseId` (ref) |

---

## License

MIT — Built by [Muhammad Munib Danish](https://github.com/m-danish77)
