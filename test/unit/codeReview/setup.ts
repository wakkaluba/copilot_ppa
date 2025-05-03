const chai = require('chai');
const sinonChai = require('sinon-chai');
const { jest } = require('@jest/globals');

// Setup chai with sinon-chai plugin
chai.use(sinonChai);

// Mock console methods to prevent noise during tests
const originalConsoleError = console.error;
console.error = jest.fn();

// Clean up after all tests
afterAll(() => {
    console.error = originalConsoleError;
    jest.restoreAllMocks();
});
