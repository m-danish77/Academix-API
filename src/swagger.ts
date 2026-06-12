import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0", // which version of OpenAPI we use
    info: {
      title: "Course Management API",
      version: "1.0.0",
      description: "API for courses, enrollments, and authentication",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local development server",
      },
    ],
    // ADD THIS TAGS ARRAY – order controls display in Swagger UI
    tags: [
      { name: "Authentication", description: "User registration and login" },
      { name: "Courses", description: "Create, read, update, delete courses" },
      {
        name: "Enrollments",
        description: "Enroll in courses and view enrollments",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          // tells Swagger we use JWT tokens
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }], // apply auth globally
  },
  apis: ["./src/routes/*.ts"], // tells swagger-jsdoc where to find your route comments
};

export default swaggerJsdoc(options);
