"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigValidationError_1 = require("../errors/ConfigValidationError");
describe('ConfigValidationError', function () {
    it('should create error with message and code', function () {
        var error = new ConfigValidationError_1.ConfigValidationError('Invalid config', 'CONFIG_001');
        expect(error.message).toBe('Invalid config');
        expect(error.code).toBe('CONFIG_001');
        expect(error.name).toBe('ConfigValidationError');
    });
    it('should create error with details', function () {
        var details = {
            field: 'build.target',
            value: 'invalid',
            expected: ['es2015', 'esnext']
        };
        var error = new ConfigValidationError_1.ConfigValidationError('Invalid target value', 'CONFIG_002', details);
        expect(error.details).toEqual(details);
    });
    it('should include stack trace', function () {
        var error = new ConfigValidationError_1.ConfigValidationError('Test error', 'CONFIG_003');
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('ConfigValidationError');
    });
    it('should format error message with details', function () {
        var details = {
            field: 'plugins',
            value: null
        };
        var error = new ConfigValidationError_1.ConfigValidationError('Invalid plugins configuration', 'CONFIG_004', details);
        expect(error.toString()).toContain('Invalid plugins configuration');
        expect(error.toString()).toContain('plugins');
    });
    it('should handle missing details', function () {
        var error = new ConfigValidationError_1.ConfigValidationError('Simple error', 'CONFIG_005');
        expect(error.toString()).toBe('ConfigValidationError: Simple error');
        expect(error.details).toBeUndefined();
    });
    it('should preserve error code in stack trace', function () {
        var error = new ConfigValidationError_1.ConfigValidationError('Error with code', 'CONFIG_006');
        expect(error.stack).toContain('CONFIG_006');
    });
});
//# sourceMappingURL=ConfigValidationError.test.js.map