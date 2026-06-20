import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // We're testing a Node.js API
    include: ["src/**/*.test.ts"], // Look for test files anywhere in src
    globals: true, // By this we can use describe, it, expect without importing them!
    sequence: {
      concurrent: false, // prevent concurrent test execution to avoid db conflicts
    },
  },
});
