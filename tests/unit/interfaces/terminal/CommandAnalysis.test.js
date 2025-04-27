"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('CommandAnalysis Interface', function () {
    test('should create a command analysis with low risk', function () {
        var analysis = {
            command: 'ls -la',
            analysis: 'Lists all files (including hidden files) with details in the current directory',
            riskLevel: 'low',
            safeToExecute: true
        };
        expect(analysis).toBeDefined();
        expect(analysis.command).toBe('ls -la');
        expect(analysis.analysis).toBe('Lists all files (including hidden files) with details in the current directory');
        expect(analysis.riskLevel).toBe('low');
        expect(analysis.safeToExecute).toBe(true);
    });
    test('should create a command analysis with medium risk', function () {
        var analysis = {
            command: 'rm file.txt',
            analysis: 'Deletes a file named file.txt. This is irreversible.',
            riskLevel: 'medium',
            safeToExecute: true
        };
        expect(analysis).toBeDefined();
        expect(analysis.command).toBe('rm file.txt');
        expect(analysis.analysis).toBe('Deletes a file named file.txt. This is irreversible.');
        expect(analysis.riskLevel).toBe('medium');
        expect(analysis.safeToExecute).toBe(true);
    });
    test('should create a command analysis with high risk', function () {
        var analysis = {
            command: 'rm -rf /',
            analysis: 'Recursively deletes files starting from the root directory. This is extremely dangerous.',
            riskLevel: 'high',
            safeToExecute: false
        };
        expect(analysis).toBeDefined();
        expect(analysis.command).toBe('rm -rf /');
        expect(analysis.analysis).toBe('Recursively deletes files starting from the root directory. This is extremely dangerous.');
        expect(analysis.riskLevel).toBe('high');
        expect(analysis.safeToExecute).toBe(false);
    });
    test('should create a command analysis without risk level', function () {
        var analysis = {
            command: 'echo "Hello world"',
            analysis: 'Prints "Hello world" to the console',
            safeToExecute: true
        };
        expect(analysis).toBeDefined();
        expect(analysis.command).toBe('echo "Hello world"');
        expect(analysis.analysis).toBe('Prints "Hello world" to the console');
        expect(analysis.riskLevel).toBeUndefined();
        expect(analysis.safeToExecute).toBe(true);
    });
    test('should ensure properties have the correct types', function () {
        var analysis = {
            command: 'git status',
            analysis: 'Shows the working tree status',
            riskLevel: 'low',
            safeToExecute: true
        };
        expect(typeof analysis.command).toBe('string');
        expect(typeof analysis.analysis).toBe('string');
        expect(['low', 'medium', 'high', undefined].includes(analysis.riskLevel)).toBe(true);
        expect(typeof analysis.safeToExecute).toBe('boolean');
    });
});
