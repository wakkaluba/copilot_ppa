import * as vscode from 'vscode';
import { Logger, LogLevel } from '../../../src/utils/logger';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// Mock vscode
jest.mock('vscode', () => ({
  window: {
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    })
  }
}));

describe('Logger', () => {
  let logger: Logger;
  let mockOutputChannel: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOutputChannel = {
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    };
    (vscode.window.createOutputChannel as jest.Mock).mockReturnValue(mockOutputChannel);
    
    // Reset singleton
    // @ts-ignore: Accessing private property
    Logger.instance = undefined;
    
    logger = Logger.getInstance();
    
    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should log messages with correct level', () => {
    logger.setLogLevel(LogLevel.Debug); // Set to debug to see all levels
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    // All levels should be logged when level is set to Debug
    expect(mockOutputChannel.appendLine).toHaveBeenCalledTimes(4);
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] Debug message'));
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[INFO] Info message'));
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[WARN] Warning message'));
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[ERROR] Error message'));

    // Console should show all logs
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Info message'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Warning message'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error message'));
  });

  test('should respect log level settings', () => {
    logger.setLogLevel(LogLevel.Error);
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    // Only Error level should be logged
    expect(mockOutputChannel.appendLine).toHaveBeenCalledTimes(1);
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] Error message')
    );
  });

  test('should log additional arguments', () => {
    logger.setLogLevel(LogLevel.Debug);
    
    logger.info('Message with', 'multiple', 'arguments');
    logger.info('Object argument', { key: 'value' });
    logger.info('Number argument', 42);
    logger.info('Boolean argument', true);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledTimes(4);
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('Message with multiple arguments')
    );
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('Object argument {"key":"value"}')
    );
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('Number argument 42')
    );
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('Boolean argument true')
    );
  });

  test('should handle errors when writing to output channel', () => {
    // Mock appendLine to throw an error
    mockOutputChannel.appendLine.mockImplementation(() => {
      throw new Error('Test error');
    });
    
    // Spy on console.error specifically for this test
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    logger.info('This should handle errors');
    
    expect(errorSpy).toHaveBeenCalledWith(
      'Error writing to output channel:',
      expect.any(Error)
    );
    
    errorSpy.mockRestore();
  });

  test('should create singleton instance', () => {
    const instance1 = Logger.getInstance();
    const instance2 = Logger.getInstance();
    
    expect(instance1).toBe(instance2);
    expect(vscode.window.createOutputChannel).toHaveBeenCalledTimes(1);
  });
});