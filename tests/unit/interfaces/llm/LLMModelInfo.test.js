"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('LLMModelInfo interface', function () {
    it('should create a valid basic model info object', function () {
        var modelInfo = {
            id: 'model-1',
            name: 'Test Model',
            provider: 'OpenAI',
            description: 'A test model'
        };
        expect(modelInfo).toBeDefined();
        expect(modelInfo.id).toBe('model-1');
        expect(modelInfo.name).toBe('Test Model');
        expect(modelInfo.provider).toBe('OpenAI');
        expect(modelInfo.description).toBe('A test model');
    });
    it('should create a valid model info with tags', function () {
        var modelInfo = {
            id: 'model-2',
            name: 'Test Model with Tags',
            provider: 'Google',
            description: 'A test model with tags',
            tags: ['fast', 'accurate', 'multilingual']
        };
        expect(modelInfo).toBeDefined();
        expect(modelInfo.tags).toContain('fast');
        expect(modelInfo.tags).toContain('accurate');
        expect(modelInfo.tags).toHaveLength(3);
    });
    it('should create a valid model info with parameters', function () {
        var _a;
        var modelInfo = {
            id: 'model-3',
            name: 'Test Model with Parameters',
            provider: 'Anthropic',
            description: 'A model with advanced parameters',
            contextSize: 8192,
            parameters: {
                quantization: 'Q4_0',
                temperature: 0.7,
                parameterCount: 7
            },
            tags: ['claude', 'conversation']
        };
        expect(modelInfo).toBeDefined();
        expect((_a = modelInfo.parameters) === null || _a === void 0 ? void 0 : _a['quantization']).toBe('Q4_0');
        expect(modelInfo.contextSize).toBe(8192);
    });
    it('should include contextSize property', function () {
        var modelInfo = {
            id: 'model-4',
            name: 'Test Model with Context Length',
            provider: 'Cohere',
            description: 'A model with specified context length',
            contextSize: 4096
        };
        expect(modelInfo).toBeDefined();
        expect(modelInfo.id).toBe('model-4');
        expect(modelInfo.contextSize).toBe(4096);
    });
    it('should allow undefined optional parameters', function () {
        var _a;
        var modelInfo = {
            id: 'model-5',
            name: 'Minimal Model',
            provider: 'Local',
            description: 'A minimal model definition',
            parameters: {
                parameterCount: 7
            }
        };
        expect(modelInfo).toBeDefined();
        expect(modelInfo.id).toBe('model-5');
        expect(modelInfo.tags).toBeUndefined();
        expect(modelInfo.contextSize).toBeUndefined();
        expect((_a = modelInfo.parameters) === null || _a === void 0 ? void 0 : _a['parameterCount']).toBe(7);
    });
});
