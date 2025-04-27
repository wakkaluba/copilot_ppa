"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var fs = require("fs");
var globals_1 = require("@jest/globals");
var advancedLogger_1 = require("../../../src/utils/advancedLogger");
var logging_1 = require("../../../src/types/logging");
// Create mock configuration
var mockConfig = {
    'copilot-ppa.logger.level': 'info',
    'copilot-ppa.logger.logToFile': true,
    'copilot-ppa.logger.logFilePath': '/mock/log/path.log',
    'copilot-ppa.logger.maxSize': 10 * 1024 * 1024,
    'copilot-ppa.logger.maxFiles': 5,
    'copilot-ppa.logger.maxInMemoryLogs': 1000,
};
globals_1.jest.spyOn(vscode.workspace, 'getConfiguration').mockReturnValue({
    get: function (key, defaultValue) {
        var _a;
        var fullKey = "copilot-ppa.logger.".concat(key);
        return (_a = mockConfig[fullKey]) !== null && _a !== void 0 ? _a : defaultValue;
    },
    update: globals_1.jest.fn(),
});
// Mock fs module
globals_1.jest.mock('fs', function () {
    var mockWriteStream = {
        write: globals_1.jest.fn(),
        end: globals_1.jest.fn()
    };
    return {
        WriteStream: globals_1.jest.fn(function () { return mockWriteStream; }),
        writeFileSync: globals_1.jest.fn(),
        appendFileSync: globals_1.jest.fn(),
        existsSync: globals_1.jest.fn(),
        mkdirSync: globals_1.jest.fn(),
        statSync: globals_1.jest.fn(),
        createWriteStream: globals_1.jest.fn(function () { return mockWriteStream; })
    };
});
// Create the mock configuration getter with proper typing
var getMockConfigValue = globals_1.jest.fn(function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var key = args[0];
    var defaultValue = args[1];
    var fullKey = "copilot-ppa.logger.".concat(key);
    return (_a = mockConfig[fullKey]) !== null && _a !== void 0 ? _a : defaultValue;
});
// Mock VS Code API
globals_1.jest.mock('vscode', function () {
    var outputChannel = {
        name: 'Copilot PPA',
        appendLine: globals_1.jest.fn(),
        show: globals_1.jest.fn(),
        dispose: globals_1.jest.fn(),
        clear: globals_1.jest.fn(),
        hide: globals_1.jest.fn(),
        append: globals_1.jest.fn(),
        replace: globals_1.jest.fn()
    };
    return {
        window: {
            createOutputChannel: globals_1.jest.fn().mockReturnValue(outputChannel)
        },
        workspace: {
            getConfiguration: globals_1.jest.fn().mockReturnValue({
                get: getMockConfigValue,
                update: globals_1.jest.fn()
            })
        },
        OutputChannel: globals_1.jest.fn()
    };
});
(0, globals_1.describe)('AdvancedLogger', function () {
    var logger;
    var mockOutputChannel;
    (0, globals_1.beforeEach)(function () {
        // Reset mocks
        globals_1.jest.clearAllMocks();
        // Get the mock output channel created by the VS Code mock
        mockOutputChannel = vscode.window.createOutputChannel();
        // Reset the singleton instance
        advancedLogger_1.AdvancedLogger.instance = undefined;
        // Get fresh logger instance
        logger = advancedLogger_1.AdvancedLogger.getInstance();
    });
    (0, globals_1.afterEach)(function () {
        globals_1.jest.resetAllMocks();
    });
    (0, globals_1.test)('getInstance should return singleton instance', function () {
        var instance1 = advancedLogger_1.AdvancedLogger.getInstance();
        var instance2 = advancedLogger_1.AdvancedLogger.getInstance();
        (0, globals_1.expect)(instance1).toBe(instance2);
    });
    (0, globals_1.test)('debug should log debug level messages', function () {
        var message = 'Debug message';
        var context = { key: 'value' };
        var source = 'TestSource';
        logger.debug(message, context, source);
        (0, globals_1.expect)(mockOutputChannel.appendLine).toHaveBeenCalledWith(globals_1.expect.stringContaining('[DEBUG] [TestSource] Debug message'));
    });
    (0, globals_1.test)('info should log info level messages', function () {
        var message = 'Info message';
        var context = { key: 'value' };
        var source = 'TestSource';
        logger.info(message, context, source);
        (0, globals_1.expect)(mockOutputChannel.appendLine).toHaveBeenCalledWith(globals_1.expect.stringContaining('[INFO ] [TestSource] Info message'));
    });
    (0, globals_1.test)('warn should log warning level messages', function () {
        var message = 'Warning message';
        var context = { key: 'value' };
        var source = 'TestSource';
        logger.warn(message, context, source);
        (0, globals_1.expect)(mockOutputChannel.appendLine).toHaveBeenCalledWith(globals_1.expect.stringContaining('[WARN ] [TestSource] Warning message'));
    });
    (0, globals_1.test)('error should log error level messages', function () {
        var message = 'Error message';
        var context = { key: 'value' };
        var source = 'TestSource';
        logger.error(message, context, source);
        (0, globals_1.expect)(mockOutputChannel.appendLine).toHaveBeenCalledWith(globals_1.expect.stringContaining('[ERROR] [TestSource] Error message'));
    });
    (0, globals_1.test)('log should respect log level filtering', function () {
        // Set log level to INFO
        logger.logLevel = logging_1.LogLevel.INFO;
        logger.debug('Debug message'); // Should be filtered out
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');
        // Debug message should not be logged
        (0, globals_1.expect)(mockOutputChannel.appendLine).not.toHaveBeenCalledWith(globals_1.expect.stringContaining('[DEBUG]'));
        // Other messages should be logged
        (0, globals_1.expect)(mockOutputChannel.appendLine).toHaveBeenCalledWith(globals_1.expect.stringContaining('[INFO ]'));
        (0, globals_1.expect)(mockOutputChannel.appendLine).toHaveBeenCalledWith(globals_1.expect.stringContaining('[WARN ]'));
        (0, globals_1.expect)(mockOutputChannel.appendLine).toHaveBeenCalledWith(globals_1.expect.stringContaining('[ERROR]'));
    });
    (0, globals_1.test)('log should maintain max in-memory logs limit', function () {
        var maxLogs = logger.maxInMemoryLogs;
        // Log more messages than the limit
        for (var i = 0; i < maxLogs + 10; i++) {
            logger.info("Message ".concat(i));
        }
        // Check that logs array is capped at max size
        (0, globals_1.expect)(logger.inMemoryLogs.length).toBe(maxLogs);
    });
    (0, globals_1.test)('clearLogs should clear in-memory logs', function () {
        // Add some logs
        logger.info('Test message 1');
        logger.info('Test message 2');
        // Clear logs
        logger.clearLogs();
        // Check that logs are cleared
        (0, globals_1.expect)(logger.inMemoryLogs).toHaveLength(0);
    });
    (0, globals_1.test)('getLogs should return copy of logs array', function () {
        // Add some logs
        logger.info('Test message');
        var logs = logger.getLogs();
        // Verify it's a copy by modifying it
        logs.push({
            timestamp: new Date(),
            level: logging_1.LogLevel.INFO,
            message: 'New message'
        });
        // Original logs should be unchanged
        (0, globals_1.expect)(logs.length).not.toBe(logger.inMemoryLogs.length);
    });
    (0, globals_1.test)('addLogListener should add listener that receives log entries', function () {
        var mockListener = globals_1.jest.fn();
        logger.addLogListener(mockListener);
        var message = 'Test message';
        logger.info(message);
        (0, globals_1.expect)(mockListener).toHaveBeenCalledWith(globals_1.expect.objectContaining({
            level: logging_1.LogLevel.INFO,
            message: message
        }));
    });
    (0, globals_1.test)('removeLogListener should remove the listener', function () {
        var mockListener = globals_1.jest.fn();
        logger.addLogListener(mockListener);
        logger.removeLogListener(mockListener);
        logger.info('Test message');
        (0, globals_1.expect)(mockListener).not.toHaveBeenCalled();
    });
    (0, globals_1.test)('enableFileLogging should set up file logging', function () {
        // Get the mock write stream that was created by our fs mock
        var mockWriteStream = fs.createWriteStream();
        // Enable file logging
        var logPath = '/test/path/log.txt';
        logger.enableFileLogging(logPath);
        // Log a message
        logger.info('Test message');
        // Should write to file
        (0, globals_1.expect)(mockWriteStream.write).toHaveBeenCalled();
    });
    (0, globals_1.test)('disableFileLogging should clean up file logging', function () {
        // Set up mock write stream
        var mockWriteStream = {
            write: globals_1.jest.fn(),
            end: globals_1.jest.fn()
        };
        logger.logFileStream = mockWriteStream;
        logger.fileLoggingEnabled = true;
        // Disable file logging
        logger.disableFileLogging();
        // Should end stream and update state
        (0, globals_1.expect)(mockWriteStream.end).toHaveBeenCalled();
        (0, globals_1.expect)(logger.fileLoggingEnabled).toBe(false);
        (0, globals_1.expect)(logger.logFileStream).toBeNull();
    });
    (0, globals_1.test)('getEntryCount should return correct count with level filter', function () {
        logger.info('Info message 1');
        logger.info('Info message 2');
        logger.error('Error message');
        (0, globals_1.expect)(logger.getEntryCount(logging_1.LogLevel.INFO)).toBe(2);
        (0, globals_1.expect)(logger.getEntryCount(logging_1.LogLevel.ERROR)).toBe(1);
        (0, globals_1.expect)(logger.getEntryCount()).toBe(3); // All entries
    });
    (0, globals_1.test)('showOutputChannel should show the VS Code output channel', function () {
        logger.showOutputChannel();
        (0, globals_1.expect)(mockOutputChannel.show).toHaveBeenCalled();
    });
});
