// Import required Jest types to ensure proper type definitions
import { describe, it, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Add properly typed Mocha-like functions for VS Code extension tests
// @ts-expect-error - Intentionally extending global
global.suite = describe;
// @ts-expect-error - Intentionally extending global
global.test = it;
// @ts-expect-error - Intentionally extending global
global.suiteSetup = beforeAll;
// @ts-expect-error - Intentionally extending global
global.suiteTeardown = afterAll;
// @ts-expect-error - Intentionally extending global
global.setup = beforeEach;
// @ts-expect-error - Intentionally extending global
global.teardown = afterEach;

// Include this in your tests with:
// import '../test/setup';
