import swaggerJsdoc from "swagger-jsdoc";

// We are writing below code to determine which files to scan for JSDoc comments because in production our routes are compiled to JS files as only dist folder is available in production
const isProduction = process.env.NODE_ENV === "production";
// Determine which files to scan for JSDoc comments
const apis = isProduction
  ? ["./dist/routes/*.js"] // Production: scan compiled JS files
  : ["./src/routes/*.ts"]; // Development: scan source TS files

// Build the servers array dynamically based on environment
const getServers = () => {
  const servers = [];

  if (process.env.DEPLOYED_URL) {
    servers.push({
      url: process.env.DEPLOYED_URL,
      description: isProduction ? "Production server" : "Deployed server",
    });
  }

  servers.push({
    url: "http://localhost:3000/api",
    description: "Local development server",
  });

  return servers;
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Course Management API",
      version: "1.0.0",
      description: "API for courses, enrollments, and authentication",
    },
    servers: getServers(), // ← Dynamically set
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
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis,
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
