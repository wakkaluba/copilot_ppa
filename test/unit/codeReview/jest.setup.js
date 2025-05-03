// Setup file for Jest tests in the codeReview module
require('@jest/globals');
const chai = require('chai');
const sinonChai = require('sinon-chai');

// Setup chai with sinon-chai plugin
chai.use(sinonChai);

// Ensure global test functions are defined
global.describe = global.describe || jest.fn();
global.it = global.it || jest.fn();
global.test = global.test || jest.fn();
global.expect = global.expect || jest.fn();
global.beforeEach = global.beforeEach || jest.fn();
global.afterEach = global.afterEach || jest.fn();
global.beforeAll = global.beforeAll || jest.fn();
global.afterAll = global.afterAll || jest.fn();

// Mock console methods to prevent noise during tests
const originalConsoleError = console.error;
console.error = jest.fn();

// Set up global test environment
jest.setTimeout(10000);

// Restore console methods after tests
afterAll(() => {
  console.error = originalConsoleError;
  jest.restoreAllMocks();
});
