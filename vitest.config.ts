import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // We're testing a Node.js API
    include: ["src/**/*.test.ts"], // Look for test files anywhere in src
    globals: true,
    sequence: {
      concurrent: false, // prevent concurrent test execution to avoid db conflicts
    },
  },
});
