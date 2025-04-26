import * as vscode from 'vscode';
import * as fs from 'fs';
import { describe, expect, test, beforeEach, jest, afterEach } from '@jest/globals';
import { AdvancedLogger } from '../../../src/utils/advancedLogger';
import { LogLevel } from '../../../src/types/logging';

// Interface definitions first
interface MockWriteStream {
  write: jest.Mock;
  end: jest.Mock;
}

// Create type for mock output channel
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
const mockConfig: { [key: string]: any } = {
  'copilot-ppa.logger.level': 'info',
  'copilot-ppa.logger.logToFile': true,
  'copilot-ppa.logger.logFilePath': '/mock/log/path.log',
  'copilot-ppa.logger.maxSize': 10 * 1024 * 1024,
  'copilot-ppa.logger.maxFiles': 5,
  'copilot-ppa.logger.maxInMemoryLogs': 1000,
};

jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue({
  get: (key: string, defaultValue?: any) => {
    const fullKey = `copilot-ppa.logger.${key}`;
    return mockConfig[fullKey] ?? defaultValue;
  },
  update: jest.fn(),
} as any);

// Mock fs module
jest.mock('fs', () => {
  const mockWriteStream: MockWriteStream = {
    write: jest.fn(),
    end: jest.fn()
  };
  
  return {
    WriteStream: jest.fn(() => mockWriteStream),
    writeFileSync: jest.fn(),
    appendFileSync: jest.fn(),
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    statSync: jest.fn(),
    createWriteStream: jest.fn(() => mockWriteStream)
  };
});

// Create the mock configuration getter with proper typing
const getMockConfigValue = jest.fn((...args: unknown[]) => {
  const key = args[0] as string;
  const defaultValue = args[1];
  const fullKey = `copilot-ppa.logger.${key}`;
  return mockConfig[fullKey] ?? defaultValue;
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

describe('AdvancedLogger', () => {
  let logger: AdvancedLogger;
  let mockOutputChannel: MockOutputChannel;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get the mock output channel created by the VS Code mock
    mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock)() as MockOutputChannel;
    
    // Reset the singleton instance
    (AdvancedLogger as any).instance = undefined;
    
    // Get fresh logger instance
    logger = AdvancedLogger.getInstance();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getInstance should return singleton instance', () => {
    const instance1 = AdvancedLogger.getInstance();
    const instance2 = AdvancedLogger.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('debug should log debug level messages', () => {
    const message = 'Debug message';
    const context = { key: 'value' };
    const source = 'TestSource';

    logger.debug(message, context, source);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] [TestSource] Debug message')
    );
  });

  test('info should log info level messages', () => {
    const message = 'Info message';
    const context = { key: 'value' };
    const source = 'TestSource';

    logger.info(message, context, source);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[INFO ] [TestSource] Info message')
    );
  });

  test('warn should log warning level messages', () => {
    const message = 'Warning message';
    const context = { key: 'value' };
    const source = 'TestSource';

    logger.warn(message, context, source);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[WARN ] [TestSource] Warning message')
    );
  });

  test('error should log error level messages', () => {
    const message = 'Error message';
    const context = { key: 'value' };
    const source = 'TestSource';

    logger.error(message, context, source);

    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] [TestSource] Error message')
    );
  });

  test('log should respect log level filtering', () => {
    // Set log level to INFO
    (logger as any).logLevel = LogLevel.INFO;

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
      expect.stringContaining('[INFO ]')
    );
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[WARN ]')
    );
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]')
    );
  });

  test('log should maintain max in-memory logs limit', () => {
    const maxLogs = (logger as any).maxInMemoryLogs;
    
    // Log more messages than the limit
    for (let i = 0; i < maxLogs + 10; i++) {
      logger.info(`Message ${i}`);
    }

    // Check that logs array is capped at max size
    expect((logger as any).inMemoryLogs.length).toBe(maxLogs);
  });

  test('clearLogs should clear in-memory logs', () => {
    // Add some logs
    logger.info('Test message 1');
    logger.info('Test message 2');

    // Clear logs
    logger.clearLogs();

    // Check that logs are cleared
    expect((logger as any).inMemoryLogs).toHaveLength(0);
  });

  test('getLogs should return copy of logs array', () => {
    // Add some logs
    logger.info('Test message');

    const logs = logger.getLogs();

    // Verify it's a copy by modifying it
    logs.push({
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: 'New message'
    });

    // Original logs should be unchanged
    expect(logs.length).not.toBe((logger as any).inMemoryLogs.length);
  });

  test('addLogListener should add listener that receives log entries', () => {
    const mockListener = jest.fn();
    logger.addLogListener(mockListener);

    const message = 'Test message';
    logger.info(message);

    expect(mockListener).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.INFO,
        message
      })
    );
  });

  test('removeLogListener should remove the listener', () => {
    const mockListener = jest.fn();
    logger.addLogListener(mockListener);
    logger.removeLogListener(mockListener);

    logger.info('Test message');

    expect(mockListener).not.toHaveBeenCalled();
  });

  test('enableFileLogging should set up file logging', () => {
    // Get the mock write stream that was created by our fs mock
    const mockWriteStream = (fs.createWriteStream as jest.Mock)() as MockWriteStream;

    // Enable file logging
    const logPath = '/test/path/log.txt';
    (logger as any).enableFileLogging(logPath);

    // Log a message
    logger.info('Test message');

    // Should write to file
    expect(mockWriteStream.write).toHaveBeenCalled();
  });

  test('disableFileLogging should clean up file logging', () => {
    // Set up mock write stream
    const mockWriteStream: MockWriteStream = {
      write: jest.fn(),
      end: jest.fn()
    };
    (logger as any).logFileStream = mockWriteStream;
    (logger as any).fileLoggingEnabled = true;

    // Disable file logging
    logger.disableFileLogging();

    // Should end stream and update state
    expect(mockWriteStream.end).toHaveBeenCalled();
    expect((logger as any).fileLoggingEnabled).toBe(false);
    expect((logger as any).logFileStream).toBeNull();
  });

  test('getEntryCount should return correct count with level filter', () => {
    logger.info('Info message 1');
    logger.info('Info message 2');
    logger.error('Error message');

    expect(logger.getEntryCount(LogLevel.INFO)).toBe(2);
    expect(logger.getEntryCount(LogLevel.ERROR)).toBe(1);
    expect(logger.getEntryCount()).toBe(3); // All entries
  });

  test('showOutputChannel should show the VS Code output channel', () => {
    logger.showOutputChannel();
    expect(mockOutputChannel.show).toHaveBeenCalled();
  });
});