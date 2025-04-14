// Import required Jest types to ensure proper type definitions
import { describe, it, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Add properly typed Mocha-like functions for VS Code extension tests
// @ts-ignore - Intentionally extending global
global.suite = describe;
// @ts-ignore - Intentionally extending global
global.test = it;
// @ts-ignore - Intentionally extending global
global.suiteSetup = beforeAll;
// @ts-ignore - Intentionally extending global
global.suiteTeardown = afterAll;
// @ts-ignore - Intentionally extending global
global.setup = beforeEach;
// @ts-ignore - Intentionally extending global
global.teardown = afterEach;

// Include this in your tests with:
// import '../test/setup';
