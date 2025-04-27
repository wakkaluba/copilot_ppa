/**
 * Tests for LogEntry interface
 */
import { LogEntry, LogLevel } from '../../../../src/types/logging';

describe('LogEntry interface', () => {
  it('should create a valid LogEntry with required fields', () => {
    const logEntry: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.INFO,
      message: 'Test message'
    };

    expect(logEntry).toBeDefined();
    expect(logEntry.timestamp).toEqual(new Date('2025-04-16T12:00:00.000Z'));
    expect(logEntry.level).toBe(LogLevel.INFO);
    expect(logEntry.message).toBe('Test message');
    expect(logEntry.context).toBeUndefined();
  });

  it('should create a valid LogEntry with optional details', () => {
    const context = { key: 'value', count: 42 };
    const logEntry: LogEntry = {
      timestamp: new Date('2025-04-16T12:01:00.000Z'),
      level: LogLevel.ERROR,
      message: 'Error message',
      context
    };

    expect(logEntry).toBeDefined();
    expect(logEntry.timestamp).toEqual(new Date('2025-04-16T12:01:00.000Z'));
    expect(logEntry.level).toBe(LogLevel.ERROR);
    expect(logEntry.message).toBe('Error message');
    expect(logEntry.context).toEqual(context);
  });

  it('should accept different log levels', () => {
    const debugLog: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.DEBUG,
      message: 'Debug message'
    };

    const infoLog: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.INFO,
      message: 'Info message'
    };

    const warnLog: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.WARN,
      message: 'Warning message'
    };

    const errorLog: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.ERROR,
      message: 'Error message'
    };

    expect(debugLog.level).toBe(LogLevel.DEBUG);
    expect(infoLog.level).toBe(LogLevel.INFO);
    expect(warnLog.level).toBe(LogLevel.WARN);
    expect(errorLog.level).toBe(LogLevel.ERROR);
  });

  it('should accept different types of details', () => {
    const withStringContext: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.INFO,
      message: 'Message with string context',
      context: { value: 'String details' }
    };

    const withNumberContext: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.INFO,
      message: 'Message with number context',
      context: { value: 42 }
    };

    const withArrayContext: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.INFO,
      message: 'Message with array context',
      additionalData: [1, 2, 3]
    };

    const error = new Error('Test error');
    const withErrorContext: LogEntry = {
      timestamp: new Date('2025-04-16T12:00:00.000Z'),
      level: LogLevel.ERROR,
      message: 'Message with error context',
      context: { error }
    };

    expect(withStringContext.context?.value).toBe('String details');
    expect(withNumberContext.context?.value).toBe(42);
    expect(withArrayContext.additionalData).toEqual([1, 2, 3]);
    expect(withErrorContext.context?.error).toBe(error);
  });
});

/**
 * Creates a mock LogEntry for testing
 */
export function createMockLogEntry(overrides?: Partial<LogEntry>): LogEntry {
  const defaultEntry: LogEntry = {
    timestamp: new Date(),
    level: LogLevel.INFO,
    message: 'Test log message'
  };

  return { ...defaultEntry, ...overrides };
}