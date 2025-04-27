"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockLogEntry = createMockLogEntry;
/**
 * Tests for LogEntry interface
 */
var logging_1 = require("../../../../src/types/logging");
describe('LogEntry interface', function () {
    it('should create a valid LogEntry with required fields', function () {
        var logEntry = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.INFO,
            message: 'Test message'
        };
        expect(logEntry).toBeDefined();
        expect(logEntry.timestamp).toEqual(new Date('2025-04-16T12:00:00.000Z'));
        expect(logEntry.level).toBe(logging_1.LogLevel.INFO);
        expect(logEntry.message).toBe('Test message');
        expect(logEntry.context).toBeUndefined();
    });
    it('should create a valid LogEntry with optional details', function () {
        var context = { key: 'value', count: 42 };
        var logEntry = {
            timestamp: new Date('2025-04-16T12:01:00.000Z'),
            level: logging_1.LogLevel.ERROR,
            message: 'Error message',
            context: context
        };
        expect(logEntry).toBeDefined();
        expect(logEntry.timestamp).toEqual(new Date('2025-04-16T12:01:00.000Z'));
        expect(logEntry.level).toBe(logging_1.LogLevel.ERROR);
        expect(logEntry.message).toBe('Error message');
        expect(logEntry.context).toEqual(context);
    });
    it('should accept different log levels', function () {
        var debugLog = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.DEBUG,
            message: 'Debug message'
        };
        var infoLog = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.INFO,
            message: 'Info message'
        };
        var warnLog = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.WARN,
            message: 'Warning message'
        };
        var errorLog = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.ERROR,
            message: 'Error message'
        };
        expect(debugLog.level).toBe(logging_1.LogLevel.DEBUG);
        expect(infoLog.level).toBe(logging_1.LogLevel.INFO);
        expect(warnLog.level).toBe(logging_1.LogLevel.WARN);
        expect(errorLog.level).toBe(logging_1.LogLevel.ERROR);
    });
    it('should accept different types of details', function () {
        var _a, _b, _c;
        var withStringContext = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.INFO,
            message: 'Message with string context',
            context: { value: 'String details' }
        };
        var withNumberContext = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.INFO,
            message: 'Message with number context',
            context: { value: 42 }
        };
        var withArrayContext = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.INFO,
            message: 'Message with array context',
            additionalData: [1, 2, 3]
        };
        var error = new Error('Test error');
        var withErrorContext = {
            timestamp: new Date('2025-04-16T12:00:00.000Z'),
            level: logging_1.LogLevel.ERROR,
            message: 'Message with error context',
            context: { error: error }
        };
        expect((_a = withStringContext.context) === null || _a === void 0 ? void 0 : _a.value).toBe('String details');
        expect((_b = withNumberContext.context) === null || _b === void 0 ? void 0 : _b.value).toBe(42);
        expect(withArrayContext.additionalData).toEqual([1, 2, 3]);
        expect((_c = withErrorContext.context) === null || _c === void 0 ? void 0 : _c.error).toBe(error);
    });
});
/**
 * Creates a mock LogEntry for testing
 */
function createMockLogEntry(overrides) {
    var defaultEntry = {
        timestamp: new Date(),
        level: logging_1.LogLevel.INFO,
        message: 'Test log message'
    };
    return __assign(__assign({}, defaultEntry), overrides);
}
