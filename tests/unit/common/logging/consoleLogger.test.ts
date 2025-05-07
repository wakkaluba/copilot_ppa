import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { ConsoleLogger } from '../../../../src/common/logging/consoleLogger';
import { ILogger } from '../../../../src/common/logging/index';

describe('ConsoleLogger', () => {
  let logger: ILogger;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create a new logger for each test
    logger = new ConsoleLogger();

    // Spy on console methods
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods after each test
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should implement ILogger interface', () => {
    expect(logger).toHaveProperty('debug');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('error');

    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  test('debug method should forward to console.debug', () => {
    const message = 'Debug message';
    const args = ['arg1', 2, { key: 'value' }];

    logger.debug(message, ...args);

    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    expect(consoleDebugSpy).toHaveBeenCalledWith(message, ...args);
  });

  test('info method should forward to console.info', () => {
    const message = 'Info message';
    const args = ['arg1', 2, { key: 'value' }];

    logger.info(message, ...args);

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleInfoSpy).toHaveBeenCalledWith(message, ...args);
  });

  test('warn method should forward to console.warn', () => {
    const message = 'Warning message';
    const args = ['arg1', 2, { key: 'value' }];

    logger.warn(message, ...args);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(message, ...args);
  });

  test('error method should forward to console.error', () => {
    const message = 'Error message';
    const args = ['arg1', 2, { key: 'value' }];

    logger.error(message, ...args);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(message, ...args);
  });

  test('should handle empty args array', () => {
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(consoleDebugSpy).toHaveBeenCalledWith('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledWith('Info message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
  });

  test('should handle various types of arguments', () => {
    const testCases = [
      { method: 'debug', spy: consoleDebugSpy },
      { method: 'info', spy: consoleInfoSpy },
      { method: 'warn', spy: consoleWarnSpy },
      { method: 'error', spy: consoleErrorSpy }
    ];

    const testArgs = [
      ['string argument'],
      [123],
      [true],
      [{ complex: 'object', nested: { value: 42 } }],
      [null],
      [undefined],
      [[1, 2, 3]],
      [new Error('Test error')]
    ];

    for (const { method, spy } of testCases) {
      for (const args of testArgs) {
        const message = `Testing with ${args}`;

        // Call the method dynamically
        (logger as any)[method](message, ...args);

        expect(spy).toHaveBeenCalledWith(message, ...args);
      }
    }
  });
});
