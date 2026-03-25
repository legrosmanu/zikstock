/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");
const dotenv = require("dotenv");

// Load test environment variables from .env.test
dotenv.config({ path: ".env.test" });

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  // Reduce test timeout from default 5000ms to fail faster when Firestore is not running
  testTimeout: 1000,
  transform: {
    ...tsJestTransformCfg,
  },
};