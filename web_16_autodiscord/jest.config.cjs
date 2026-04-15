/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  passWithNoTests: true,
  testMatch: ["<rootDir>/tests/**/*.(test|spec).[jt]s?(x)"],
  // format.test.js is run via `node` in npm test; use-cases.spec.js is Playwright (test:e2e).
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/tests/format\\.test\\.js",
    "<rootDir>/tests/use-cases\\.spec\\.js",
  ],
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "src/shared/**/*.{ts,tsx}",
    "src/library/**/*.{ts,tsx}",
    "src/utils/**/*.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
  ],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};
