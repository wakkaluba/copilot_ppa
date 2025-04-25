// filepath: d:\___coding\tools\copilot_ppa\tests\unit\utils\logger.test.ts
import * as vscode from 'vscode';
import { describe, expect, test, beforeEach, jest, afterEach } from '@jest/globals';
import { LoggerImpl, LogLevel, Logger, LogEntry } from '../../../src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Interface definitions
interface MockOutputChannel extends vscode.OutputChannel {
  appendLine: jest.Mock;
  show: jest.Mock;
  dispose: jest.Mock;
  clear: jest.Mock;
  hide: jest.Mock;
  append: jest.Mock;
  replace: jest.Mock;
}

// Create mock configuration
const mockConfig = {
  'copilot-ppa.logger.level': 'info',
  'copilot-ppa.logger.logToFile': false,
  'copilot-ppa.logger.logFilePath': '',
  'copilot-ppa.logger.maxInMemoryLogs': 1000
};

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  appendFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Create the mock configuration getter
const getMockConfigValue = jest.fn((...args: unknown[]) => {
  const key = args[0] as string;
  const defaultValue = args[1];
  return mockConfig[`copilot-ppa.logger.${key}`] ?? defaultValue;
});

// Mock VS Code API
jest.mock('vscode', () => {
  const outputChannel: MockOutputChannel = {
    name: 'Copilot PPA',
    appendLine: jest.fn(),
    show: jest.fn(),
    dispose: jest.fn(),
    clear: jest.fn(),
    hide: jest.fn(),
    append: jest.fn(),
    replace: jest.fn()
  };

  return {
    window: {
      createOutputChannel: jest.fn().mockReturnValue(outputChannel)
    },
    workspace: {
      getConfiguration: jest.fn().mockReturnValue({
        get: getMockConfigValue,
        update: jest.fn()
      })
    },
    OutputChannel: jest.fn()
  };
});

describe('LoggerImpl', () => {
  let logger: LoggerImpl;
  let mockOutputChannel: MockOutputChannel;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get the mock output channel created by the VS Code mock
    mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock)() as MockOutputChannel;
    
    // Create new logger instance
    logger = new LoggerImpl();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should create output channel when initialized', () => {
    expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Copilot PPA');
  });

  test('debug should log debug level messages', () => {
    // Set log level to DEBUG
    (logger as any)._logLevel = LogLevel.DEBUG;
    
    const message = 'Debug message';
    const details = { key: 'value' };

    logger.debug(message, details);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] Debug message')
    );
  });

  test('info should log info level messages', () => {
    const message = 'Info message';
    const details = { key: 'value' };

    logger.info(message, details);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Info message')
    );
  });

  test('warn should log warning level messages', () => {
    const message = 'Warning message';
    const details = { key: 'value' };

    logger.warn(message, details);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[WARN] Warning message')
    );
  });

  test('error should log error level messages', () => {
    const message = 'Error message';
    const details = { key: 'value' };

    logger.error(message, details);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] Error message')
    );
  });

  test('should respect log level filtering', () => {
    // Set log level to INFO
    (logger as any)._logLevel = LogLevel.INFO;

    logger.debug('Debug message'); // Should be filtered out
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    // Debug message should not be logged
    expect(mockOutputChannel.appendLine).not.toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]')
    );

    // Other messages should be logged
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]')
    );
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]')
    );
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]')
    );
  });

  test('should maintain max in-memory logs limit', () => {
    (logger as any)._maxInMemoryLogs = 5;
    
    // Log more messages than the limit
    for (let i = 0; i < 10; i++) {
      logger.info(`Message ${i}`);
    }

    // Check that logs array is capped at max size
    expect((logger as any)._logEntries.length).toBe(5);
  });

  test('clearLogs should clear in-memory logs and output channel', () => {
    // Add some logs
    logger.info('Test message 1');
    logger.info('Test message 2');

    // Clear logs
    logger.clearLogs();

    // Check that logs are cleared
    expect((logger as any)._logEntries).toHaveLength(0);
    expect(mockOutputChannel.clear).toHaveBeenCalled();
  });

  test('getLogEntries should return copy of logs array', () => {
    // Add some logs
    logger.info('Test message');

    const logs = logger.getLogEntries();

    // Verify it's a copy by checking it's not the same reference
    expect(logs).not.toBe((logger as any)._logEntries);
    // But it should have the same content
    expect(logs).toEqual((logger as any)._logEntries);
  });

  test('showOutputChannel should show the VS Code output channel', () => {
    logger.showOutputChannel();
    expect(mockOutputChannel.show).toHaveBeenCalled();
  });

  test('exportLogs should write logs to a file', async () => {
    // Add some logs
    logger.info('Test message');

    const filePath = path.join(os.homedir(), 'test-logs.json');
    
    // Mock timestamp to have consistent filename
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');
    
    await logger.exportLogs(filePath);
    
    // Should write to file
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      filePath,
      expect.any(String)
    );
  });

  test('log should store entry in memory', () => {
    const message = 'Test message';
    logger.info(message);
    
    // Check that entry was added
    const entries = (logger as any)._logEntries;
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toEqual(expect.objectContaining({
      message,
      level: LogLevel.INFO
    }));
  });

  test('should log to file when enabled', () => {
    // Mock fs.existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // Enable file logging
    (logger as any)._logToFile = true;
    (logger as any)._logFilePath = '/test/log/file.log';
    
    logger.info('Test message');
    
    // Should write to file
    expect(fs.appendFileSync).toHaveBeenCalled();
  });

  test('should convert string log level to enum', () => {
    const logger = new LoggerImpl();
    
    // Test with different configuration values
    mockConfig['copilot-ppa.logger.level'] = 'debug';
    const logger1 = new LoggerImpl();
    expect((logger1 as any)._logLevel).toBe(LogLevel.DEBUG);
    
    mockConfig['copilot-ppa.logger.level'] = 'warn';
    const logger2 = new LoggerImpl();
    expect((logger2 as any)._logLevel).toBe(LogLevel.WARN);
    
    mockConfig['copilot-ppa.logger.level'] = 'error';
    const logger3 = new LoggerImpl();
    expect((logger3 as any)._logLevel).toBe(LogLevel.ERROR);
    
    mockConfig['copilot-ppa.logger.level'] = 'invalid';
    const logger4 = new LoggerImpl();
    expect((logger4 as any)._logLevel).toBe(LogLevel.INFO); // Default
  });
});