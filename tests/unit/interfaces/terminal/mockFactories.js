"use strict";
/**
 * Mock terminal interface factory utilities
 *
 * This file contains factory functions to create mock implementations of terminal-related
 * interfaces used throughout the Copilot PPA extension.
 */
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
exports.createMockCommandResult = createMockCommandResult;
exports.createMockCommandHistoryEntry = createMockCommandHistoryEntry;
exports.createMockTerminalSession = createMockTerminalSession;
exports.createMockCommandGenerationResult = createMockCommandGenerationResult;
exports.createMockCommandAnalysis = createMockCommandAnalysis;
/**
 * Creates a mock CommandResult
 */
function createMockCommandResult(overrides) {
    var defaultCommandResult = {
        command: 'ls -la',
        output: 'total 12\ndrwxr-xr-x  2 user user 4096 Apr 16 10:00 .\ndrwxr-xr-x 10 user user 4096 Apr 16 10:00 ..',
        exitCode: 0,
        executionTime: 120,
        timestamp: new Date().toISOString(),
        shellType: 'bash',
        cwd: '/home/user'
    };
    return __assign(__assign({}, defaultCommandResult), overrides);
}
/**
 * Creates a mock CommandHistoryEntry
 */
function createMockCommandHistoryEntry(overrides) {
    var defaultEntry = {
        command: 'npm install',
        timestamp: new Date().toISOString(),
        shellType: 'bash',
        cwd: '/home/user/project',
        favorite: false
    };
    return __assign(__assign({}, defaultEntry), overrides);
}
/**
 * Creates a mock TerminalSession
 */
function createMockTerminalSession(overrides) {
    var terminal = {
        sendText: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
    };
    var defaultSession = {
        id: 'mock-terminal-session',
        name: 'Mock Terminal',
        shellType: 'bash',
        cwd: '/home/user/project',
        terminal: terminal,
        executeCommand: jest.fn().mockResolvedValue(createMockCommandResult()),
        getHistory: jest.fn().mockReturnValue([
            createMockCommandHistoryEntry({ command: 'cd project' }),
            createMockCommandHistoryEntry({ command: 'npm install' }),
        ]),
        clearHistory: jest.fn()
    };
    return __assign(__assign({}, defaultSession), overrides);
}
/**
 * Creates a mock CommandGenerationResult
 */
function createMockCommandGenerationResult(overrides) {
    var defaultResult = {
        command: 'find . -name "*.js" | xargs grep "TODO"',
        explanation: 'Find all JavaScript files and search for TODO comments',
        shellType: 'bash',
        alternatives: [
            'grep -r "TODO" --include="*.js" .',
            'git grep "TODO" -- "*.js"'
        ],
        confidence: 0.95
    };
    return __assign(__assign({}, defaultResult), overrides);
}
/**
 * Creates a mock CommandAnalysis
 */
function createMockCommandAnalysis(overrides) {
    var defaultAnalysis = {
        command: 'ls -la',
        purpose: 'List all files in the current directory including hidden files',
        components: [
            {
                value: 'ls',
                description: 'List directory contents'
            },
            {
                value: '-la',
                description: 'Show in long format (-l) and show hidden files (-a)'
            }
        ],
        safety: {
            level: 'safe',
            concerns: []
        },
        alternatives: [
            {
                command: 'find . -maxdepth 1',
                description: 'Alternative using find'
            }
        ]
    };
    return __assign(__assign({}, defaultAnalysis), overrides);
}
