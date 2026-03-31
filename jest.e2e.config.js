/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  // Increased timeout for E2E tests (30s) as they involve Docker/DB
  testTimeout: 30000,
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  // Specifically look for your e2e test files
  testMatch: ["**/*.e2e.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
