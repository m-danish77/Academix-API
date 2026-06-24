import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";
import { config } from "../configs/validateEnv.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

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

describe("Courses API", () => {
  const emailsToDelete: string[] = [];
  const courseTitlesToDelete: string[] = [];
  let instructorToken: string;
  let studentToken: string;
  let createdCourseId: string;
  const testPassword = "Test123.";

  // Create test users and get tokens
  beforeAll(async () => {
    // 1. Instructor user
    const instructorEmail = `instructor_${Date.now()}@test.com`;
    emailsToDelete.push(instructorEmail);
    await request(app).post("/api/auth/register").send({
      name: "Test Instructor",
      email: instructorEmail,
      password: testPassword,
      role: "instructor",
    });
    const instructorLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: instructorEmail, password: testPassword });
    instructorToken = instructorLogin.body.token;

    // 2. Student user
    const studentEmail = `student_${Date.now()}@test.com`;
    emailsToDelete.push(studentEmail);
    await request(app).post("/api/auth/register").send({
      name: "Test Student",
      email: studentEmail,
      password: testPassword,
      role: "student",
    });
    const studentLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: studentEmail, password: testPassword });
    studentToken = studentLogin.body.token;
  });

  // === TESTS ===

  describe("GET /api/courses (Public)", () => {
    it("should return 200 and paginated courses", async () => {
      const res = await request(app).get("/api/courses?page=1&limit=5");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should use default pagination values", async () => {
      const res = await request(app).get("/api/courses");
      expect(res.status).toBe(200);
      expect(res.body.pagination).toHaveProperty("currentPage", 1);
      expect(res.body.pagination).toHaveProperty("itemsPerPage", 10);
    });
  });

  describe("POST /api/courses (Create)", () => {
    it("should create a course as instructor", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({
          title: "Instructor Course",
          description: "Created by instructor",
          maxCapacity: 15,
          price: 29.99,
          videoUrl: "https://www.youtube.com/watch?v=test123",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      createdCourseId = res.body._id; // Save for later tests
      courseTitlesToDelete.push(res.body.title);
    });

    it("should return 403 if student tries to create", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          title: "Student Course",
          description: "Created by student",
          maxCapacity: 15,
          price: 29.99,
          videoUrl: "https://www.youtube.com/watch?v=test123",
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 400 if validation fails", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({ title: "123" }); // Too short

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "fail");
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /api/courses/:courseId (Update)", () => {
    it("should update course as instructor (owner)", async () => {
      const res = await request(app)
        .put(`/api/courses/${createdCourseId}`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({ title: "Updated Title", price: 99.99 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "Updated Title");
      expect(res.body).toHaveProperty("price", 99.99);
    });

    it("should return 404 for non-existent course", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .put(`/api/courses/${fakeId}`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({ title: "Ghost" });

      expect(res.status).toBe(404);
    });

    it("should return 403 if student tries to update", async () => {
      const res = await request(app)
        .put(`/api/courses/${createdCourseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ title: "Hacked!" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/courses/:courseId", () => {
    it("should delete course as instructor (owner)", async () => {
      const res = await request(app)
        .delete(`/api/courses/${createdCourseId}`)
        .set("Authorization", `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Course Deleted");
    });

    it("should return 404 for already deleted course", async () => {
      const res = await request(app)
        .delete(`/api/courses/${createdCourseId}`)
        .set("Authorization", `Bearer ${instructorToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 403 if student tries to delete", async () => {
      // Create a new course first (instructor)
      const newCourse = {
        title: "Delete Test",
        description: "Testing delete",
        maxCapacity: 5,
        price: 10,
      };
      const createRes = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(newCourse);
      const tempCourseId = createRes.body._id;
      courseTitlesToDelete.push("Delete Test");

      // Student tries to delete
      const res = await request(app)
        .delete(`/api/courses/${tempCourseId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  // Cleanup: Delete test users and courses
  afterAll(async () => {
    if (emailsToDelete.length > 0) {
      await User.deleteMany({ email: { $in: emailsToDelete } });
      console.log(`Deleted ${emailsToDelete.length} test users`);
    }

    if (courseTitlesToDelete.length > 0) {
      await Course.deleteMany({ title: { $in: courseTitlesToDelete } });
      console.log(`Deleted ${courseTitlesToDelete.length} test courses`);
    }
  });
});
