"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../../../../src/terminal/types");
describe('CommandHistoryEntry Interface', function () {
    test('should create a command history entry with all properties', function () {
        var commandResult = {
            stdout: 'Command output',
            stderr: '',
            exitCode: 0,
            success: true
        };
        var entry = {
            command: 'ls -la',
            timestamp: new Date('2025-04-16T10:30:00'),
            shellType: types_1.TerminalShellType.VSCodeDefault,
            result: commandResult
        };
        expect(entry).toBeDefined();
        expect(entry.command).toBe('ls -la');
        expect(entry.timestamp).toEqual(new Date('2025-04-16T10:30:00'));
        expect(entry.shellType).toBe(types_1.TerminalShellType.VSCodeDefault);
        expect(entry.result).toEqual(commandResult);
    });
    test('should create a command history entry without result', function () {
        var entry = {
            command: 'git status',
            timestamp: new Date('2025-04-16T10:35:00'),
            shellType: types_1.TerminalShellType.GitBash
        };
        expect(entry).toBeDefined();
        expect(entry.command).toBe('git status');
        expect(entry.timestamp).toEqual(new Date('2025-04-16T10:35:00'));
        expect(entry.shellType).toBe(types_1.TerminalShellType.GitBash);
        expect(entry.result).toBeUndefined();
    });
    test('should work with different shell types', function () {
        var entry1 = {
            command: 'dir',
            timestamp: new Date(),
            shellType: types_1.TerminalShellType.PowerShell
        };
        var entry2 = {
            command: 'ls',
            timestamp: new Date(),
            shellType: types_1.TerminalShellType.WSLBash
        };
        expect(entry1.shellType).toBe(types_1.TerminalShellType.PowerShell);
        expect(entry2.shellType).toBe(types_1.TerminalShellType.WSLBash);
    });
    test('should ensure properties have the correct types', function () {
        var entry = {
            command: 'npm install',
            timestamp: new Date(),
            shellType: types_1.TerminalShellType.VSCodeDefault
        };
        expect(typeof entry.command).toBe('string');
        expect(entry.timestamp instanceof Date).toBe(true);
        expect(typeof entry.shellType).toBe('string');
    });
});
