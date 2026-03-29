/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/**/*.(test|spec).[jt]s?(x)"],
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "src/shared/**/*.{ts,tsx}",
    "src/library/**/*.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "src/shared/seeded-loader.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      lines: 90,
      functions: 90,
      branches: 60,
    },
  },
};
