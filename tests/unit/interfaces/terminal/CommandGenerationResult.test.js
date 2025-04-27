"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('CommandGenerationResult Interface', function () {
    test('should create a valid command generation result with all properties', function () {
        var result = {
            command: 'find . -name "*.js" | xargs grep "TODO"',
            explanation: 'This command searches for TODO comments in all JavaScript files',
            isValid: true
        };
        expect(result).toBeDefined();
        expect(result.command).toBe('find . -name "*.js" | xargs grep "TODO"');
        expect(result.explanation).toBe('This command searches for TODO comments in all JavaScript files');
        expect(result.isValid).toBe(true);
    });
    test('should create a valid command generation result without explanation', function () {
        var result = {
            command: 'git pull origin main',
            isValid: true
        };
        expect(result).toBeDefined();
        expect(result.command).toBe('git pull origin main');
        expect(result.explanation).toBeUndefined();
        expect(result.isValid).toBe(true);
    });
    test('should create an invalid command generation result', function () {
        var result = {
            command: 'unknown-command --invalid-flag',
            explanation: 'Could not generate a valid command for the given input',
            isValid: false
        };
        expect(result).toBeDefined();
        expect(result.command).toBe('unknown-command --invalid-flag');
        expect(result.explanation).toBe('Could not generate a valid command for the given input');
        expect(result.isValid).toBe(false);
    });
    test('should ensure properties have the correct types', function () {
        var result = {
            command: 'npm install typescript --save-dev',
            explanation: 'Installs TypeScript as a dev dependency',
            isValid: true
        };
        expect(typeof result.command).toBe('string');
        expect(typeof result.explanation).toBe('string');
        expect(typeof result.isValid).toBe('boolean');
    });
});
