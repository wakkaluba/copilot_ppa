"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import required Jest types to ensure proper type definitions
const globals_1 = require("@jest/globals");
// Add properly typed Mocha-like functions for VS Code extension tests
// @ts-ignore - Intentionally extending global
global.suite = globals_1.describe;
// @ts-ignore - Intentionally extending global
global.test = globals_1.it;
// @ts-ignore - Intentionally extending global
global.suiteSetup = globals_1.beforeAll;
// @ts-ignore - Intentionally extending global
global.suiteTeardown = globals_1.afterAll;
// @ts-ignore - Intentionally extending global
global.setup = globals_1.beforeEach;
// @ts-ignore - Intentionally extending global
global.teardown = globals_1.afterEach;
// Include this in your tests with:
// import '../test/setup';
//# sourceMappingURL=setup.js.map