import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import mongoose from "mongoose";
import { config } from "../configs/validateEnv.js";

// Connect to database before tests
beforeAll(async () => {
  await mongoose.connect(config.ATLAS_URI);
  console.log("MongoDB Atlas connected");
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.close();
  console.log("MongoDB Atlas disconnected");
});

describe("Enrollments API", () => {
  const emailsToDelete: string[] = [];
  let instructorToken: string;
  let studentToken: string;
  let student2Token: string;
  let courseId: string;
  const testPassword = "Test123.";

  beforeAll(async () => {
    // 1. Instructor
    const instructorEmail = `instructor_enroll_${Date.now()}@test.com`;
    emailsToDelete.push(instructorEmail);
    await request(app).post("/api/auth/register").send({
      name: "Instructor Enroll",
      email: instructorEmail,
      password: testPassword,
      role: "instructor",
    });
    const instructorLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: instructorEmail, password: testPassword });
    instructorToken = instructorLogin.body.token;

    // 2. Student 1
    const studentEmail = `student_enroll_${Date.now()}@test.com`;
    emailsToDelete.push(studentEmail);
    await request(app).post("/api/auth/register").send({
      name: "Student Enroll",
      email: studentEmail,
      password: testPassword,
      role: "student",
    });
    const studentLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: studentEmail, password: testPassword });
    studentToken = studentLogin.body.token;

    // 3. Student 2 (for full capacity test)
    const student2Email = `student2_enroll_${Date.now()}@test.com`;
    emailsToDelete.push(student2Email);
    await request(app).post("/api/auth/register").send({
      name: "Student Enroll 2",
      email: student2Email,
      password: testPassword,
      role: "student",
    });
    const student2Login = await request(app)
      .post("/api/auth/login")
      .send({ email: student2Email, password: testPassword });
    student2Token = student2Login.body.token;

    // 4. Create a course (as instructor) with maxCapacity = 2
    const courseRes = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        title: "Enrollment Test Course",
        description: "For testing enrollments",
        maxCapacity: 2,
        price: 0,
      });
    courseId = courseRes.body._id;
  });

  describe("POST /api/enroll/:courseId", () => {
    it("should enroll a student successfully", async () => {
      const res = await request(app)
        .post(`/api/enroll/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("status", "success");
      expect(res.body.data).toHaveProperty("courseId", courseId);
    });

    it("should return 400 if already enrolled", async () => {
      const res = await request(app)
        .post(`/api/enroll/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("already enrolled");
    });

    it("should return 400 if instructor tries to enroll in own course", async () => {
      const res = await request(app)
        .post(`/api/enroll/${courseId}`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Instructor can't enrolled");
    });

    it("should return 400 if course is full", async () => {
      // Enroll student 2 (now capacity is full)
      await request(app)
        .post(`/api/enroll/${courseId}`)
        .set("Authorization", `Bearer ${student2Token}`)
        .send();

      // Create a 3rd student
      const student3Email = `student3_full_${Date.now()}@test.com`;
      emailsToDelete.push(student3Email);
      await request(app).post("/api/auth/register").send({
        name: "Student Full",
        email: student3Email,
        password: testPassword,
        role: "student",
      });
      const student3Login = await request(app)
        .post("/api/auth/login")
        .send({ email: student3Email, password: testPassword });
      const student3Token = student3Login.body.token;

      const res = await request(app)
        .post(`/api/enroll/${courseId}`)
        .set("Authorization", `Bearer ${student3Token}`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("course enrollment is full");
    });

    it("should return 404 for non-existent course", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post(`/api/enroll/${fakeId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send();

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/my-courses", () => {
    it("should return enrolled courses for a student", async () => {
      const res = await request(app)
        .get("/api/my-courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("courseId");
      expect(res.body[0].courseId).toHaveProperty("title");
    });

    it("should return 401 if not logged in", async () => {
      const res = await request(app).get("/api/my-courses");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/course/:courseId/students", () => {
    it("should return students for instructor of the course", async () => {
      const res = await request(app)
        .get(`/api/course/${courseId}/students`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body[0].studentId).toHaveProperty("name");
      expect(res.body[0].studentId).toHaveProperty("email");
    });

    it("should return 403 if student tries to view", async () => {
      const res = await request(app)
        .get(`/api/course/${courseId}/students`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send();

      expect(res.status).toBe(403);
    });
  });

  // Cleanup: Delete all test users, course, and enrollments
  afterAll(async () => {
    // Delete enrollments first
    await Enrollment.deleteMany({ courseId: courseId });
    console.log(`Deleted enrollments for course ${courseId}`);

    // Delete the test course
    await Course.deleteOne({ _id: courseId });
    console.log(`Deleted test course`);

    // Delete all test users
    if (emailsToDelete.length > 0) {
      await User.deleteMany({ email: { $in: emailsToDelete } });
      console.log(`Deleted ${emailsToDelete.length} test users`);
    }
  });
});
