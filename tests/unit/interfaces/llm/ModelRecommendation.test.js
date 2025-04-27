"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('ModelRecommendation interface', function () {
    it('should create valid model recommendations', function () {
        var _a, _b;
        var recommendations = [
            {
                id: 'model-1',
                name: 'Fast Local Model',
                provider: 'Local',
                description: 'A fast local inference model',
                tags: ['fast', 'local']
            },
            {
                id: 'model-2',
                name: 'Accurate Cloud Model',
                provider: 'OpenAI',
                description: 'A highly accurate cloud model',
                tags: ['accurate', 'cloud']
            }
        ];
        expect(recommendations).toHaveLength(2);
        expect((_a = recommendations[0]) === null || _a === void 0 ? void 0 : _a.id).toBe('model-1');
        expect((_b = recommendations[1]) === null || _b === void 0 ? void 0 : _b.provider).toBe('OpenAI');
    });
    it('should create a valid recommendation with minimal fields', function () {
        var recommendation = {
            id: 'minimal-model',
            name: 'Minimal Model',
            provider: 'Local',
            description: 'Minimal model for testing',
            parameters: {
                parameterCount: 7
            }
        };
        expect(recommendation).toBeDefined();
        expect(recommendation.id).toBe('minimal-model');
        expect(recommendation.provider).toBe('Local');
    });
    it('should create recommendations with advanced parameters', function () {
        var _a, _b, _c, _d, _e, _f;
        var recommendations = [
            {
                id: 'advanced-model',
                name: 'Advanced Parameter Model',
                provider: 'Custom',
                description: 'Model with advanced parameters',
                tags: ['optimized', 'fast'],
                parameters: {
                    quantization: '8bit',
                    temperature: 0.8,
                    parameterCount: 13,
                    optimizationLevel: 'high'
                },
                contextSize: 16384
            }
        ];
        expect(recommendations).toHaveLength(1);
        expect((_a = recommendations[0]) === null || _a === void 0 ? void 0 : _a.tags).toContain('optimized');
        expect((_c = (_b = recommendations[0]) === null || _b === void 0 ? void 0 : _b.parameters) === null || _c === void 0 ? void 0 : _c['quantization']).toBe('8bit');
        expect((_e = (_d = recommendations[0]) === null || _d === void 0 ? void 0 : _d.parameters) === null || _e === void 0 ? void 0 : _e['parameterCount']).toBe(13);
        expect((_f = recommendations[0]) === null || _f === void 0 ? void 0 : _f.contextSize).toBe(16384);
    });
    it('should handle compatibility between models', function () {
        var localModel = {
            id: 'local-base',
            name: 'Local Base Model',
            provider: 'Local',
            description: 'Base model for local inference',
            parameters: {
                parameterCount: 7
            }
        };
        var cloudModel = {
            id: 'cloud-base',
            name: 'Cloud Base Model',
            provider: 'Remote',
            description: 'Base model for cloud inference'
        };
        // Check the recommendations are valid
        expect(localModel).toBeDefined();
        expect(cloudModel).toBeDefined();
        expect(localModel.provider).not.toEqual(cloudModel.provider);
    });
});
