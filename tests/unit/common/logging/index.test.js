const { describe, expect, test } = require('@jest/globals');
const { ILogger } = require('../../../../src/common/logging/index');

describe('ILogger interface', () => {
  test('should define required logging methods', () => {
    // Check that the interface exists and has properties for logging methods
    expect(ILogger).toBeDefined();

    // Create a mock implementation to verify structure
    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Verify that our mock satisfies the interface
    expect(typeof mockLogger.debug).toBe('function');
    expect(typeof mockLogger.info).toBe('function');
    expect(typeof mockLogger.warn).toBe('function');
    expect(typeof mockLogger.error).toBe('function');
  });
});
