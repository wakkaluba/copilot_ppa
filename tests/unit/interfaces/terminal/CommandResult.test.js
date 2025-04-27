"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('CommandResult Interface', function () {
    test('should create a successful command result', function () {
        var result = {
            stdout: 'Command executed successfully',
            stderr: '',
            exitCode: 0,
            success: true
        };
        expect(result).toBeDefined();
        expect(result.stdout).toBe('Command executed successfully');
        expect(result.stderr).toBe('');
        expect(result.exitCode).toBe(0);
        expect(result.success).toBe(true);
    });
    test('should create a failed command result', function () {
        var result = {
            stdout: '',
            stderr: 'Error: Command not found',
            exitCode: 127,
            success: false
        };
        expect(result).toBeDefined();
        expect(result.stdout).toBe('');
        expect(result.stderr).toBe('Error: Command not found');
        expect(result.exitCode).toBe(127);
        expect(result.success).toBe(false);
    });
    test('should have both stdout and stderr populated', function () {
        var result = {
            stdout: 'Some output',
            stderr: 'Some warnings occurred',
            exitCode: 0,
            success: true
        };
        expect(result).toBeDefined();
        expect(result.stdout).toBe('Some output');
        expect(result.stderr).toBe('Some warnings occurred');
        expect(result.exitCode).toBe(0);
        expect(result.success).toBe(true);
    });
    test('should ensure properties have the correct types', function () {
        var result = {
            stdout: 'Output text',
            stderr: 'Error text',
            exitCode: 1,
            success: false
        };
        expect(typeof result.stdout).toBe('string');
        expect(typeof result.stderr).toBe('string');
        expect(typeof result.exitCode).toBe('number');
        expect(typeof result.success).toBe('boolean');
    });
});
