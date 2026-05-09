# 🎓 Course & Enrollment Management API

A robust, production-ready backend system built with **Node.js**, **Express**, and **TypeScript**. This project implements a full-scale educational platform logic, including Role-Based Access Control (RBAC), secure course management, and a high-integrity enrollment engine.

## 🚀 Key Features

### 🔐 Advanced Authentication & Security

* **JWT Authentication:** Secure stateless session management.
* **Role-Based Access Control (RBAC):** Middleware-driven permissions for `Students` and `Admins`.
* **Resource Ownership:** Logic-level protection ensuring only the creator of a course can modify or delete it.
* **Security Headers:** Implemented `Helmet` and `CORS` for protection against common web vulnerabilities.

### 📚 Course Management

* Full CRUD functionality for courses.
* Automatic instructor assignment via JWT payload.
* Data integrity via Mongoose Schemas.

### 🧠 Enrollment "Smart" Logic

* **Capacity Enforcement:** Strictly prevents enrollments once `maxCapacity` is reached using atomic database counts.
* **Duplicate Prevention:** Ensures a student cannot enroll in the same course twice.
* **Conflict Resolution:** Instructors are programmatically blocked from enrolling in their own courses.

### 📊 Dynamic Dashboards

* **Student View:** Aggregated list of enrolled courses with nested population of instructor details.
* **Admin View:** Real-time class rosters with filtered student data (Data Minimization).

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript (Strict Mode)
* **Database:** MongoDB via Mongoose
* **Security:** JWT, Bcrypt, Helmet, CORS
* **Testing:** Bruno

## ⚙️ Logic Architecture: The Enrollment Gatekeeper

One of the core challenges of this project was managing the "Many-to-Many" relationship between Students and Courses. I implemented a **Bridge Model** (Enrollment) to handle this, governed by a multi-step validation pipeline:

1. **Identity Verification:** Extract user context from JWT.
2. **Existence Check:** Verify the course exists in the database.
3. **Integrity Check:** Query the Enrollment collection for existing student-course pairs.
4. **Resource Check:** Perform a `countDocuments` query to compare current enrollment numbers against `maxCapacity`.
5. **Atomic Transaction:** Create the enrollment record only if all conditions are met.

## 🚦 API Endpoints (Snapshot)

### Auth

* `POST /api/auth/register` - Create a new account
* `POST /api/auth/login` - Receive JWT access token

### Courses

* `GET /api/courses` - Browse all courses (Public)
* `POST /api/courses` - Create a course (Admin only)
* `PUT /api/courses/:courseId` - Update course (Owner only)

### Enrollments

* `POST /api/enroll/:courseId` - Join a course (Student only)
* `GET /api/my-courses` - Student dashboard
* `GET /api/course/:courseId/students` - Admin roster view

## 📦 Installation & Setup

1. **Clone the repo:**
```bash
git clone [your-repo-link]

```


2. **Install dependencies:**
```bash
npm install

```


3. **Environment Variables:**
Create a `.env` file and add the following:

```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    JWT_EXPIRES_IN=1d
    ```
4.  **Run Development Mode:**
    
```bash
    npm run dev
    ```

## 🐶 API Testing with Bruno
I used **Bruno** for testing because of its lightweight, Git-friendly approach to API collections. You can find the `/bruno-collection` folder in this repo to import and test the endpoints immediately.

---

### 💡 Final Developer Note
This project was a significant step in moving from "Basic CRUD" to "System Engineering." It taught me the importance of global error handling and why TypeScript is essential for maintaining large-scale backend architectures.

```
