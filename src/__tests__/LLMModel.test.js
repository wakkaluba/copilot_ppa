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
// Test fixtures with improved typing
var createBasicModel = function () { return ({
    id: 'test-model',
    name: 'Test Model',
    provider: 'ollama',
    description: 'A model for testing'
}); };
var createFullModel = function () { return (__assign(__assign({}, createBasicModel()), { parameters: {
        temperature: 0.7,
        maxTokens: 2048
    }, size: '7GB', license: 'MIT', tags: ['test', 'coding'], installed: true })); };
describe('LLMModel Interface', function () {
    describe('Required Properties', function () {
        it('should create a valid model with required properties', function () {
            var model = createBasicModel();
            expect(model.id).toBe('test-model');
            expect(model.name).toBe('Test Model');
            expect(model.provider).toBe('ollama');
            expect(model.description).toBe('A model for testing');
        });
        it('should error when missing required properties', function () {
            var requiredProps = ['id', 'name', 'provider', 'description'];
            requiredProps.forEach(function (prop) {
                var invalidModel = __assign({}, createBasicModel());
                delete invalidModel[prop];
                expect(function () { return validateModel(invalidModel); }).toThrow("Missing required property: ".concat(prop));
            });
        });
    });
    describe('Provider Types', function () {
        it('should accept all valid provider types', function () {
            var providers = ['ollama', 'lmstudio', 'huggingface'];
            providers.forEach(function (provider) {
                var model = __assign(__assign({}, createBasicModel()), { provider: provider });
                expect(function () { return validateModel(model); }).not.toThrow();
            });
        });
        it('should reject invalid provider types', function () {
            expect(function () {
                validateModel(__assign(__assign({}, createBasicModel()), { 
                    // @ts-expect-error Testing invalid provider type
                    provider: 'invalid-provider' }));
            }).toThrow('Invalid provider type: invalid-provider');
        });
    });
    describe('Optional Properties', function () {
        it('should handle optional properties correctly', function () {
            var model = createFullModel();
            expect(model.parameters).toEqual({
                temperature: 0.7,
                maxTokens: 2048
            });
            expect(model.size).toBe('7GB');
            expect(model.license).toBe('MIT');
            expect(model.tags).toEqual(['test', 'coding']);
            expect(model.installed).toBe(true);
        });
        it('should allow undefined optional properties', function () {
            var model = createBasicModel();
            expect(model.parameters).toBeUndefined();
            expect(model.size).toBeUndefined();
            expect(model.license).toBeUndefined();
            expect(model.tags).toBeUndefined();
            expect(model.installed).toBeUndefined();
        });
        it('should validate optional property types when present', function () {
            var invalidModels = [
                __assign(__assign({}, createBasicModel()), { parameters: 'invalid' }),
                __assign(__assign({}, createBasicModel()), { size: 123 }),
                __assign(__assign({}, createBasicModel()), { license: true }),
                __assign(__assign({}, createBasicModel()), { tags: 'invalid' }),
                __assign(__assign({}, createBasicModel()), { installed: 'yes' })
            ];
            invalidModels.forEach(function (model) {
                expect(function () { return validateModel(model); }).toThrow();
            });
        });
    });
    describe('Provider-Specific Models', function () {
        it('should handle Ollama models', function () {
            var model = {
                id: 'llama2',
                name: 'Llama 2 (7B)',
                provider: 'ollama',
                description: 'A 7B parameter model optimized for chat.',
                tags: ['chat', 'general'],
                size: '3.8GB',
                license: 'Llama 2 Community License',
                installed: true
            };
            validateOllamaSpecificRequirements(model);
        });
        it('should handle LM Studio models', function () {
            var model = {
                id: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
                name: 'Mistral Instruct (7B) GGUF',
                provider: 'lmstudio',
                description: 'GGUF version of Mistral 7B.',
                tags: ['general', 'instruction'],
                size: '4.1GB',
                license: 'Apache 2.0',
                installed: false
            };
            validateLMStudioSpecificRequirements(model);
        });
        it('should handle Hugging Face models', function () {
            var model = {
                id: 'meta-llama/Llama-2-7b-chat-hf',
                name: 'Llama 2 Chat (7B)',
                provider: 'huggingface',
                description: 'Hugging Face hosted Llama 2.',
                tags: ['chat', 'general'],
                size: '13GB',
                license: 'Llama 2 Community License',
                installed: false
            };
            validateHuggingFaceSpecificRequirements(model);
        });
    });
    describe('Model Features', function () {
        var model;
        beforeEach(function () {
            model = createFullModel();
        });
        it('should handle parameters correctly', function () {
            expect(model.parameters).toEqual({
                temperature: 0.7,
                maxTokens: 2048
            });
        });
        it('should validate parameter ranges', function () {
            var invalidParameters = [
                { temperature: 1.5 }, // Too high
                { temperature: -0.1 }, // Too low
                { maxTokens: 0 }, // Too low
                { maxTokens: -100 } // Negative
            ];
            invalidParameters.forEach(function (params) {
                expect(function () { return validateModelParameters(__assign(__assign({}, model), { parameters: params })); }).toThrow();
            });
        });
        it('should handle metadata correctly', function () {
            expect(model.size).toBe('7GB');
            expect(model.license).toBe('MIT');
            expect(model.tags).toEqual(['test', 'coding']);
            expect(model.installed).toBe(true);
        });
        describe('Token Cost Calculations', function () {
            it('should calculate basic token costs correctly', function () {
                var inputTokens = 100;
                var outputTokens = 50;
                var pricing = { input: 0.0001, output: 0.0002 };
                var cost = calculateTokenCost(inputTokens, outputTokens, pricing);
                expect(cost).toBe(pricing.input * inputTokens + pricing.output * outputTokens);
            });
            it('should handle zero tokens', function () {
                var pricing = { input: 0.0001, output: 0.0002 };
                expect(calculateTokenCost(0, 0, pricing)).toBe(0);
            });
            it('should handle large token counts', function () {
                var pricing = { input: 0.0001, output: 0.0002 };
                var cost = calculateTokenCost(1000000, 500000, pricing);
                expect(cost).toBe(200); // 100 + 100
            });
            it('should round costs to 6 decimal places', function () {
                var pricing = { input: 0.0000001, output: 0.0000002 };
                var cost = calculateTokenCost(100, 50, pricing);
                expect(cost).toBeCloseTo(0.00002, 6);
            });
        });
    });
});
// Validation helpers
function validateModel(model) {
    // Required properties
    var requiredProps = ['id', 'name', 'provider', 'description'];
    requiredProps.forEach(function (prop) {
        if (!model[prop]) {
            throw new Error("Missing required property: ".concat(prop));
        }
    });
    // Provider type
    if (!['ollama', 'lmstudio', 'huggingface'].includes(model.provider)) {
        throw new Error("Invalid provider type: ".concat(model.provider));
    }
    // Optional property type validation
    if (model.parameters && typeof model.parameters !== 'object') {
        throw new Error('Parameters must be an object if present');
    }
    if (model.size && typeof model.size !== 'string') {
        throw new Error('Size must be a string if present');
    }
    if (model.license && typeof model.license !== 'string') {
        throw new Error('License must be a string if present');
    }
    if (model.tags && !Array.isArray(model.tags)) {
        throw new Error('Tags must be an array if present');
    }
    if (model.installed !== undefined && typeof model.installed !== 'boolean') {
        throw new Error('Installed must be a boolean if present');
    }
}
function validateModelParameters(model) {
    if (!model.parameters) {
        return;
    }
    if (model.parameters['temperature'] !== undefined) {
        if (model.parameters['temperature'] < 0 || model.parameters['temperature'] > 1) {
            throw new Error('Temperature must be between 0 and 1');
        }
    }
    if (model.parameters['maxTokens'] !== undefined) {
        if (model.parameters['maxTokens'] < 1) {
            throw new Error('maxTokens must be greater than 0');
        }
    }
}
function validateOllamaSpecificRequirements(model) {
    expect(model.provider).toBe('ollama');
    expect(model.id).not.toContain('/');
    validateModel(model);
}
function validateLMStudioSpecificRequirements(model) {
    expect(model.provider).toBe('lmstudio');
    expect(model.id).toContain('/');
    validateModel(model);
}
function validateHuggingFaceSpecificRequirements(model) {
    expect(model.provider).toBe('huggingface');
    expect(model.id).toContain('/');
    validateModel(model);
}
function calculateTokenCost(inputTokens, outputTokens, pricing) {
    var cost = pricing.input * inputTokens + pricing.output * outputTokens;
    return Number(cost.toFixed(6)); // Round to 6 decimal places
}
