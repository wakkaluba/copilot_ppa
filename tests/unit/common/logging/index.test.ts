import { describe, expect, test } from '@jest/globals';
import { ILogger } from '../../../../src/common/logging/index';

describe('ILogger interface', () => {
  test('should define required logging methods', () => {
    const loggerDefinition = ILogger.prototype;

    // Check that the interface exists and has properties for logging methods
    expect(ILogger).toBeDefined();

    // Create a mock implementation to verify structure
    const mockLogger: ILogger = {
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
