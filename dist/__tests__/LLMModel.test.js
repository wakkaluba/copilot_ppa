"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test fixtures with improved typing
const createBasicModel = () => ({
    id: 'test-model',
    name: 'Test Model',
    provider: 'ollama',
    description: 'A model for testing'
});
const createFullModel = () => ({
    ...createBasicModel(),
    parameters: {
        temperature: 0.7,
        maxTokens: 2048
    },
    size: '7GB',
    license: 'MIT',
    tags: ['test', 'coding'],
    installed: true
});
describe('LLMModel Interface', () => {
    describe('Required Properties', () => {
        it('should create a valid model with required properties', () => {
            const model = createBasicModel();
            expect(model.id).toBe('test-model');
            expect(model.name).toBe('Test Model');
            expect(model.provider).toBe('ollama');
            expect(model.description).toBe('A model for testing');
        });
        it('should error when missing required properties', () => {
            const requiredProps = ['id', 'name', 'provider', 'description'];
            requiredProps.forEach(prop => {
                const invalidModel = { ...createBasicModel() };
                delete invalidModel[prop];
                expect(() => validateModel(invalidModel)).toThrow(`Missing required property: ${prop}`);
            });
        });
    });
    describe('Provider Types', () => {
        it('should accept all valid provider types', () => {
            const providers = ['ollama', 'lmstudio', 'huggingface'];
            providers.forEach(provider => {
                const model = {
                    ...createBasicModel(),
                    provider
                };
                expect(() => validateModel(model)).not.toThrow();
            });
        });
        it('should reject invalid provider types', () => {
            expect(() => {
                validateModel({
                    ...createBasicModel(),
                    // @ts-expect-error Testing invalid provider type
                    provider: 'invalid-provider'
                });
            }).toThrow('Invalid provider type: invalid-provider');
        });
    });
    describe('Optional Properties', () => {
        it('should handle optional properties correctly', () => {
            const model = createFullModel();
            expect(model.parameters).toEqual({
                temperature: 0.7,
                maxTokens: 2048
            });
            expect(model.size).toBe('7GB');
            expect(model.license).toBe('MIT');
            expect(model.tags).toEqual(['test', 'coding']);
            expect(model.installed).toBe(true);
        });
        it('should allow undefined optional properties', () => {
            const model = createBasicModel();
            expect(model.parameters).toBeUndefined();
            expect(model.size).toBeUndefined();
            expect(model.license).toBeUndefined();
            expect(model.tags).toBeUndefined();
            expect(model.installed).toBeUndefined();
        });
        it('should validate optional property types when present', () => {
            const invalidModels = [
                { ...createBasicModel(), parameters: 'invalid' },
                { ...createBasicModel(), size: 123 },
                { ...createBasicModel(), license: true },
                { ...createBasicModel(), tags: 'invalid' },
                { ...createBasicModel(), installed: 'yes' }
            ];
            invalidModels.forEach(model => {
                expect(() => validateModel(model)).toThrow();
            });
        });
    });
    describe('Provider-Specific Models', () => {
        it('should handle Ollama models', () => {
            const model = {
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
        it('should handle LM Studio models', () => {
            const model = {
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
        it('should handle Hugging Face models', () => {
            const model = {
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
    describe('Model Features', () => {
        let model;
        beforeEach(() => {
            model = createFullModel();
        });
        it('should handle parameters correctly', () => {
            expect(model.parameters).toEqual({
                temperature: 0.7,
                maxTokens: 2048
            });
        });
        it('should validate parameter ranges', () => {
            const invalidParameters = [
                { temperature: 1.5 }, // Too high
                { temperature: -0.1 }, // Too low
                { maxTokens: 0 }, // Too low
                { maxTokens: -100 } // Negative
            ];
            invalidParameters.forEach(params => {
                expect(() => validateModelParameters({
                    ...model,
                    parameters: params
                })).toThrow();
            });
        });
        it('should handle metadata correctly', () => {
            expect(model.size).toBe('7GB');
            expect(model.license).toBe('MIT');
            expect(model.tags).toEqual(['test', 'coding']);
            expect(model.installed).toBe(true);
        });
        describe('Token Cost Calculations', () => {
            it('should calculate basic token costs correctly', () => {
                const inputTokens = 100;
                const outputTokens = 50;
                const pricing = { input: 0.0001, output: 0.0002 };
                const cost = calculateTokenCost(inputTokens, outputTokens, pricing);
                expect(cost).toBe(pricing.input * inputTokens + pricing.output * outputTokens);
            });
            it('should handle zero tokens', () => {
                const pricing = { input: 0.0001, output: 0.0002 };
                expect(calculateTokenCost(0, 0, pricing)).toBe(0);
            });
            it('should handle large token counts', () => {
                const pricing = { input: 0.0001, output: 0.0002 };
                const cost = calculateTokenCost(1000000, 500000, pricing);
                expect(cost).toBe(200); // 100 + 100
            });
            it('should round costs to 6 decimal places', () => {
                const pricing = { input: 0.0000001, output: 0.0000002 };
                const cost = calculateTokenCost(100, 50, pricing);
                expect(cost).toBeCloseTo(0.00002, 6);
            });
        });
    });
});
// Validation helpers
function validateModel(model) {
    // Required properties
    const requiredProps = ['id', 'name', 'provider', 'description'];
    requiredProps.forEach(prop => {
        if (!model[prop]) {
            throw new Error(`Missing required property: ${prop}`);
        }
    });
    // Provider type
    if (!['ollama', 'lmstudio', 'huggingface'].includes(model.provider)) {
        throw new Error(`Invalid provider type: ${model.provider}`);
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
    if (!model.parameters)
        return;
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
    const cost = pricing.input * inputTokens + pricing.output * outputTokens;
    return Number(cost.toFixed(6)); // Round to 6 decimal places
}
//# sourceMappingURL=LLMModel.test.js.map