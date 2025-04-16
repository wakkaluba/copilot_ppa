/**
 * Tests for LogEntry interface
 */
import { LogEntry, LogLevel } from '../../../../src/utils/logger';

describe('LogEntry interface', () => {
  it('should create a valid LogEntry with required fields', () => {
    const logEntry: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.INFO,
      message: 'Test message'
    };

    expect(logEntry).toBeDefined();
    expect(logEntry.timestamp).toBe('2025-04-16T12:00:00.000Z');
    expect(logEntry.level).toBe(LogLevel.INFO);
    expect(logEntry.message).toBe('Test message');
    expect(logEntry.details).toBeUndefined();
  });

  it('should create a valid LogEntry with optional details', () => {
    const details = { key: 'value', count: 42 };
    const logEntry: LogEntry = {
      timestamp: '2025-04-16T12:01:00.000Z',
      level: LogLevel.ERROR,
      message: 'Error message',
      details
    };

    expect(logEntry).toBeDefined();
    expect(logEntry.timestamp).toBe('2025-04-16T12:01:00.000Z');
    expect(logEntry.level).toBe(LogLevel.ERROR);
    expect(logEntry.message).toBe('Error message');
    expect(logEntry.details).toEqual(details);
  });

  it('should accept different log levels', () => {
    const debugLog: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.DEBUG,
      message: 'Debug message'
    };

    const infoLog: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.INFO,
      message: 'Info message'
    };

    const warnLog: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.WARN,
      message: 'Warning message'
    };

    const errorLog: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.ERROR,
      message: 'Error message'
    };

    expect(debugLog.level).toBe(LogLevel.DEBUG);
    expect(infoLog.level).toBe(LogLevel.INFO);
    expect(warnLog.level).toBe(LogLevel.WARN);
    expect(errorLog.level).toBe(LogLevel.ERROR);
  });

  it('should accept different types of details', () => {
    const withStringDetails: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.INFO,
      message: 'Message with string details',
      details: 'String details'
    };

    const withNumberDetails: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.INFO,
      message: 'Message with number details',
      details: 42
    };

    const withArrayDetails: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.INFO,
      message: 'Message with array details',
      details: [1, 2, 3]
    };

    const error = new Error('Test error');
    const withErrorDetails: LogEntry = {
      timestamp: '2025-04-16T12:00:00.000Z',
      level: LogLevel.ERROR,
      message: 'Message with error details',
      details: error
    };

    expect(withStringDetails.details).toBe('String details');
    expect(withNumberDetails.details).toBe(42);
    expect(withArrayDetails.details).toEqual([1, 2, 3]);
    expect(withErrorDetails.details).toBe(error);
  });
});

/**
 * Creates a mock LogEntry for testing
 */
export function createMockLogEntry(overrides?: Partial<LogEntry>): LogEntry {
  const defaultEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    message: 'Test log message'
  };

  return { ...defaultEntry, ...overrides };
}