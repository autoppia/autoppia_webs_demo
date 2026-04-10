/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/**/*.(test|spec).[jt]s?(x)"],
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/shared/**/*.{ts,tsx}",
    "src/library/**/*.{ts,tsx}",
    "!src/library/dataset.ts",
    "src/utils/**/*.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageThreshold: {
    global: {
      statements: 90,
      lines: 90,
      functions: 90,
      branches: 60,
    },
  },
};
