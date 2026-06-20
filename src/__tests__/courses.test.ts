import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
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

describe("Courses API", () => {
  // Store user emails for cleanup
  const emailsToDelete: string[] = [];
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;
  let createdCourseId: string;
  const testPassword = "Test123.";

  // Create test users and get tokens
  beforeAll(async () => {
    // 1. Admin user
    const adminEmail = `admin_${Date.now()}@test.com`;
    emailsToDelete.push(adminEmail);
    await request(app).post("/api/auth/register").send({
      name: "Test Admin",
      email: adminEmail,
      password: testPassword,
      role: "admin",
    });
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: testPassword });
    adminToken = adminLogin.body.token;

    // 2. Instructor user
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

    // 3. Student user
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
    const newCourse = {
      title: "Test Course",
      description: "This is a test course description",
      maxCapacity: 10,
      price: 49.99,
    };

    it("should create a course as admin", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newCourse);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", newCourse.title);
      createdCourseId = res.body._id; // Save for later tests
    });

    it("should create a course as instructor", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({
          title: "Instructor Course",
          description: "Created by instructor",
          maxCapacity: 15,
          price: 29.99,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
    });

    it("should return 403 if student tries to create", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(newCourse);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
    });

    it("should return 400 if validation fails", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "123" }); // Too short

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "fail");
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /api/courses/:courseId (Update)", () => {
    it("should update course as admin", async () => {
      const res = await request(app)
        .put(`/api/courses/${createdCourseId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Updated Title", price: 99.99 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "Updated Title");
      expect(res.body).toHaveProperty("price", 99.99);
    });

    it("should return 404 for non-existent course", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .put(`/api/courses/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Ghost" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/courses/:courseId", () => {
    it("should delete course as admin", async () => {
      const res = await request(app)
        .delete(`/api/courses/${createdCourseId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Course Deleted");
    });

    it("should return 404 for already deleted course", async () => {
      const res = await request(app)
        .delete(`/api/courses/${createdCourseId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // Cleanup: Delete all test users
  afterAll(async () => {
    if (emailsToDelete.length > 0) {
      await User.deleteMany({ email: { $in: emailsToDelete } });
      console.log(`Deleted ${emailsToDelete.length} test users`);
    }
  });
});
