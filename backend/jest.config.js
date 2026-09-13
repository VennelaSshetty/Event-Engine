export default {
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  testMatch: ["**/*.test.js"],

  clearMocks: true
};