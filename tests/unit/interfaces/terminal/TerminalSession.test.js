"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../../../../src/terminal/types");
describe('TerminalSession Interface', function () {
    test('should create a terminal session with all properties', function () {
        var commandHistory = [
            {
                command: 'cd projects',
                timestamp: new Date('2025-04-16T10:25:00'),
                shellType: types_1.TerminalShellType.VSCodeDefault
            },
            {
                command: 'git status',
                timestamp: new Date('2025-04-16T10:26:00'),
                shellType: types_1.TerminalShellType.VSCodeDefault
            }
        ];
        var session = {
            id: 'terminal-1',
            name: 'Development Terminal',
            shellType: types_1.TerminalShellType.VSCodeDefault,
            createdAt: new Date('2025-04-16T10:20:00'),
            commandHistory: commandHistory
        };
        expect(session).toBeDefined();
        expect(session.id).toBe('terminal-1');
        expect(session.name).toBe('Development Terminal');
        expect(session.shellType).toBe(types_1.TerminalShellType.VSCodeDefault);
        expect(session.createdAt).toEqual(new Date('2025-04-16T10:20:00'));
        expect(session.commandHistory).toEqual(commandHistory);
        expect(session.commandHistory.length).toBe(2);
    });
    test('should create a terminal session with empty command history', function () {
        var session = {
            id: 'terminal-2',
            name: 'Empty Terminal',
            shellType: types_1.TerminalShellType.PowerShell,
            createdAt: new Date('2025-04-16T10:30:00'),
            commandHistory: []
        };
        expect(session).toBeDefined();
        expect(session.id).toBe('terminal-2');
        expect(session.name).toBe('Empty Terminal');
        expect(session.shellType).toBe(types_1.TerminalShellType.PowerShell);
        expect(session.createdAt).toEqual(new Date('2025-04-16T10:30:00'));
        expect(session.commandHistory).toEqual([]);
        expect(session.commandHistory.length).toBe(0);
    });
    test('should create terminal sessions with different shell types', function () {
        var gitBashSession = {
            id: 'git-bash',
            name: 'Git Bash',
            shellType: types_1.TerminalShellType.GitBash,
            createdAt: new Date(),
            commandHistory: []
        };
        var wslSession = {
            id: 'wsl',
            name: 'WSL Terminal',
            shellType: types_1.TerminalShellType.WSLBash,
            createdAt: new Date(),
            commandHistory: []
        };
        expect(gitBashSession.shellType).toBe(types_1.TerminalShellType.GitBash);
        expect(wslSession.shellType).toBe(types_1.TerminalShellType.WSLBash);
    });
    test('should ensure properties have the correct types', function () {
        var session = {
            id: 'terminal-3',
            name: 'Test Terminal',
            shellType: types_1.TerminalShellType.VSCodeDefault,
            createdAt: new Date(),
            commandHistory: []
        };
        expect(typeof session.id).toBe('string');
        expect(typeof session.name).toBe('string');
        expect(typeof session.shellType).toBe('string');
        expect(session.createdAt instanceof Date).toBe(true);
        expect(Array.isArray(session.commandHistory)).toBe(true);
    });
});
