const { beforeEach, afterEach, describe, it, expect } = require('@jest/globals');
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.describe = describe;
global.it = it;
global.expect = expect;

// Setup global mocks/spies that may be needed
const originalConsoleError = console.error;
console.error = jest.fn();

// Clean up after all tests
afterAll(function () {
    console.error = originalConsoleError;
    jest.restoreAllMocks();
});
