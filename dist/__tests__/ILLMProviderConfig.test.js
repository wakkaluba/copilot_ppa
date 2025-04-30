"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('ILLMProviderConfig Interface', function () {
    // Test for basic configuration
    describe('Basic Configuration', function () {
        it('should create a valid provider config with required fields', function () {
            var config = {
                apiEndpoint: 'http://localhost:11434/api',
                model: 'llama2'
            };
            expect(config.apiEndpoint).toBe('http://localhost:11434/api');
            expect(config.model).toBe('llama2');
            expect(config.defaultOptions).toBeUndefined();
        });
        it('should create a config with all available properties', function () {
            var _a, _b, _c, _d;
            var defaultOptions = {
                temperature: 0.7,
                maxTokens: 2000,
                stopSequences: ['\n\n', 'END'],
                stream: false
            };
            var config = {
                apiEndpoint: 'http://localhost:1234/v1',
                model: 'TheBloke/Llama-2-7B-Chat-GGUF',
                defaultOptions: defaultOptions
            };
            expect(config.apiEndpoint).toBe('http://localhost:1234/v1');
            expect(config.model).toBe('TheBloke/Llama-2-7B-Chat-GGUF');
            expect(config.defaultOptions).toBeDefined();
            expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a.temperature).toBe(0.7);
            expect((_b = config.defaultOptions) === null || _b === void 0 ? void 0 : _b.maxTokens).toBe(2000);
            expect((_c = config.defaultOptions) === null || _c === void 0 ? void 0 : _c.stopSequences).toEqual(['\n\n', 'END']);
            expect((_d = config.defaultOptions) === null || _d === void 0 ? void 0 : _d.stream).toBe(false);
        });
    });
    // Test for different provider configurations
    describe('Provider-Specific Configurations', function () {
        it('should work with Ollama configuration', function () {
            var _a;
            var config = {
                apiEndpoint: 'http://localhost:11434',
                model: 'codellama',
                defaultOptions: {
                    temperature: 0.5,
                    maxTokens: 1500
                }
            };
            expect(config.apiEndpoint).toContain('localhost:11434');
            expect(config.model).toBe('codellama');
            expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a.temperature).toBe(0.5);
        });
        it('should work with LM Studio configuration', function () {
            var _a;
            var config = {
                apiEndpoint: 'http://localhost:1234',
                model: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
                defaultOptions: {
                    temperature: 0.8,
                    maxTokens: 4000,
                    stream: true
                }
            };
            expect(config.apiEndpoint).toContain('localhost:1234');
            expect(config.model).toContain('Mistral');
            expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a.stream).toBe(true);
        });
        it('should work with custom provider configuration', function () {
            var _a;
            var config = {
                apiEndpoint: 'https://api.custom-llm.example.com',
                model: 'custom-model-v1',
                defaultOptions: {
                    temperature: 0.3,
                    // Custom provider-specific option
                    customParam: 'value'
                }
            };
            expect(config.apiEndpoint).toContain('api.custom-llm.example.com');
            expect(config.model).toBe('custom-model-v1');
            expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a['customParam']).toBe('value');
        });
    });
    // Test for URL validation
    describe('API Endpoint URL Validation', function () {
        it('should accept valid URL formats', function () {
            var validURLs = [
                'http://localhost:11434/api',
                'https://api.example.com/v1',
                'http://127.0.0.1:8080',
                'https://llm.service.com/api/generate'
            ];
            validURLs.forEach(function (url) {
                var config = {
                    apiEndpoint: url,
                    model: 'test-model'
                };
                expect(config.apiEndpoint).toBe(url);
                // Simple URL validation check
                expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
            });
        });
    });
    // Test for default request options configuration
    describe('Default Request Options', function () {
        it('should properly configure temperature values', function () {
            // Test with different valid temperature values
            [0, 0.1, 0.5, 0.7, 1.0].forEach(function (temp) {
                var _a, _b, _c;
                var config = {
                    apiEndpoint: 'http://localhost:11434',
                    model: 'llama2',
                    defaultOptions: {
                        temperature: temp
                    }
                };
                expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a.temperature).toBe(temp);
                expect((_b = config.defaultOptions) === null || _b === void 0 ? void 0 : _b.temperature).toBeGreaterThanOrEqual(0);
                expect((_c = config.defaultOptions) === null || _c === void 0 ? void 0 : _c.temperature).toBeLessThanOrEqual(1);
            });
        });
        it('should properly configure maxTokens values', function () {
            // Test with different token limits
            [100, 500, 1000, 2000, 4000].forEach(function (tokens) {
                var _a, _b;
                var config = {
                    apiEndpoint: 'http://localhost:11434',
                    model: 'llama2',
                    defaultOptions: {
                        maxTokens: tokens
                    }
                };
                expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a.maxTokens).toBe(tokens);
                expect((_b = config.defaultOptions) === null || _b === void 0 ? void 0 : _b.maxTokens).toBeGreaterThan(0);
            });
        });
        it('should properly configure streaming option', function () {
            // Test with streaming enabled and disabled
            [true, false].forEach(function (streamEnabled) {
                var _a;
                var config = {
                    apiEndpoint: 'http://localhost:11434',
                    model: 'llama2',
                    defaultOptions: {
                        stream: streamEnabled
                    }
                };
                expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a.stream).toBe(streamEnabled);
            });
        });
        it('should handle custom provider-specific options', function () {
            var _a, _b, _c, _d;
            var config = {
                apiEndpoint: 'http://localhost:11434',
                model: 'llama2',
                defaultOptions: {
                    temperature: 0.7,
                    // Custom provider-specific options
                    top_p: 0.95,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.2,
                    logitBias: { '50256': -100 }
                }
            };
            expect((_a = config.defaultOptions) === null || _a === void 0 ? void 0 : _a['top_p']).toBe(0.95);
            expect((_b = config.defaultOptions) === null || _b === void 0 ? void 0 : _b['frequency_penalty']).toBe(0.5);
            expect((_c = config.defaultOptions) === null || _c === void 0 ? void 0 : _c['presence_penalty']).toBe(0.2);
            expect((_d = config.defaultOptions) === null || _d === void 0 ? void 0 : _d['logitBias']).toEqual({ '50256': -100 });
        });
    });
});
//# sourceMappingURL=ILLMProviderConfig.test.js.map