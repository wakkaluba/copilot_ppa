/**
 * Tests for LLMModelValidator
 * Source: src\services\llm\services\LLMModelValidator.ts
 */
import * as assert from 'assert';
// TODO: Import the module to test
// import { } from '../../src/services/llm/services/LLMModelValidator.ts';
import { LLMModelValidator } from '@src/services/llm/services/LLMModelValidator';

describe('LLMModelValidator', () => {
    let validator: LLMModelValidator;

    beforeEach(() => {
        validator = new LLMModelValidator();
    });

    it('should construct without error', () => {
        assert.ok(validator);
    });

    it('should validate a model with matching requirements as valid', () => {
        const model = { version: '1.0.0', hardwareRequirements: {}, capabilities: ['a'], supportedFormats: ['json'], parameters: {} };
        const requirements = { minVersion: '1.0.0', hardware: {}, capabilities: ['a'], formats: ['json'], parameters: {} };
        const result = validator.validateModel(model as any, requirements as any);
        assert.strictEqual(result.isValid, true);
        assert.deepStrictEqual(result.errors, []);
    });

    it('should report error for model with missing capability', () => {
        const model = { version: '1.0.0', hardwareRequirements: {}, capabilities: [], supportedFormats: ['json'], parameters: {} };
        const requirements = { minVersion: '1.0.0', hardware: {}, capabilities: ['a'], formats: ['json'], parameters: {} };
        const result = validator.validateModel(model as any, requirements as any);
        assert.strictEqual(result.isValid, false);
        assert.ok(result.errors.some(e => e && e.field === 'capabilities'));
    });
});
