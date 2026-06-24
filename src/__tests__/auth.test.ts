import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { config } from "../configs/validateEnv.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Connect to database BEFORE all tests
beforeAll(async () => {
  await mongoose.connect(config.ATLAS_URI);
  console.log("MongoDB Atlas connected");
});

describe("Auth API", () => {
  const testEmail = `test_${Date.now()}@example.com`;

  describe("POST /api/auth/register", () => {
    it("should create a user and return 201", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test",
        email: testEmail,
        password: "Test123.",
        role: "student",
      });

      expect(res.status).toBe(201);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return a token for valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "Test123." });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 400 for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "wrong" });

      expect(res.status).toBe(400);
    });
  });

  // Delete test user after all tests and close connection
  afterAll(async () => {
    await User.deleteOne({ email: testEmail });
    console.log(`Deleted test user: ${testEmail}`);

    await mongoose.connection.close();
    console.log("MongoDB Atlas disconnected");
  });
});
