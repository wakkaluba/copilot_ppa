import { EventEmitter } from 'events';
import { LLMProviderValidator } from '../LLMProviderValidator';
import { IHealthCheckResult, LLMProvider, ProviderConfig } from '../types';

describe('LLMProviderValidator', () => {
    let validator: LLMProviderValidator;

    beforeEach(() => {
        validator = new LLMProviderValidator();
    });

    describe('validateConfig', () => {
        it('should validate a valid config', () => {
            const config: ProviderConfig = {
                apiEndpoint: 'https://api.example.com',
                apiKey: 'test-key',
                requestTimeout: 5000,
                healthCheck: {
                    interval: 30000,
                    timeout: 5000
                }
            };

            const result = validator.validateConfig(config);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate config with minimal required fields', () => {
            const config: ProviderConfig = {
                apiEndpoint: 'https://api.example.com'
            };

            const result = validator.validateConfig(config);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect missing required fields', () => {
            const config = {} as ProviderConfig;

            const result = validator.validateConfig(config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Missing required field: apiEndpoint');
        });

        it('should validate timeout values', () => {
            const config: ProviderConfig = {
                apiEndpoint: 'https://api.example.com',
                requestTimeout: -1,
                healthCheck: {
                    interval: -1,
                    timeout: -1
                }
            };

            const result = validator.validateConfig(config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Request timeout must be a positive number');
            expect(result.errors).toContain('Health check interval must be a positive number');
            expect(result.errors).toContain('Health check timeout must be a positive number');
        });

        it('should validate API endpoint URL', () => {
            const config: ProviderConfig = {
                apiEndpoint: 'not-a-url'
            };

            const result = validator.validateConfig(config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid API endpoint URL');
        });
    });

    describe('validateHealth', () => {
        it('should validate valid health check result', () => {
            const health: IHealthCheckResult = {
                isHealthy: true,
                timestamp: Date.now(),
                details: {
                    latency: 100
                }
            };

            const result = validator.validateHealth(health);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate unhealthy result with details', () => {
            const health: IHealthCheckResult = {
                isHealthy: false,
                timestamp: Date.now(),
                details: {
                    error: 'Connection timeout',
                    latency: 500
                }
            };

            const result = validator.validateHealth(health);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid health check values', () => {
            const health = {
                isHealthy: 'true',
                timestamp: -1
            } as any;

            const result = validator.validateHealth(health);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Health check must return a boolean isHealthy status');
            expect(result.errors).toContain('Health check timestamp must be a non-negative number');
        });

        it('should require details for unhealthy status', () => {
            const health: IHealthCheckResult = {
                isHealthy: false,
                timestamp: Date.now()
            };

            const result = validator.validateHealth(health);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Unhealthy status must include details with error information');
        });
    });

    describe('validateProvider', () => {
        it('should validate a valid provider', async () => {
            const mockProvider = new EventEmitter() as LLMProvider;
            mockProvider.id = 'test-provider';
            mockProvider.name = 'Test Provider';
            mockProvider.isAvailable = jest.fn().mockResolvedValue(true);
            mockProvider.connect = jest.fn();
            mockProvider.disconnect = jest.fn();
            mockProvider.healthCheck = jest.fn().mockResolvedValue({
                isHealthy: true,
                timestamp: Date.now(),
                details: { latency: 100 }
            });
            mockProvider.getStatus = jest.fn().mockReturnValue({
                state: 'active',
                lastHealthCheck: {
                    isHealthy: true,
                    timestamp: Date.now()
                }
            });
            mockProvider.getAvailableModels = jest.fn().mockResolvedValue([{
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                contextLength: 4096,
                parameters: {}
            }]);
            mockProvider.getCapabilities = jest.fn().mockResolvedValue({
                maxContextLength: 4096,
                supportsChatCompletion: true,
                supportsStreaming: true,
                supportsSystemPrompts: true
            });

            const result = await validator.validateProvider(mockProvider);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect missing required methods', async () => {
            const mockProvider = new EventEmitter() as LLMProvider;
            mockProvider.id = 'test-provider';
            mockProvider.name = 'Test Provider';

            const result = await validator.validateProvider(mockProvider);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Provider must implement isAvailable method');
            expect(result.errors).toContain('Provider must implement connect method');
            expect(result.errors).toContain('Provider must implement disconnect method');
            expect(result.errors).toContain('Provider must implement healthCheck method');
            expect(result.errors).toContain('Provider must implement getStatus method');
            expect(result.errors).toContain('Provider must implement getAvailableModels method');
            expect(result.errors).toContain('Provider must implement getCapabilities method');
        });

        it('should validate provider capabilities', async () => {
            const mockProvider = new EventEmitter() as LLMProvider;
            mockProvider.id = 'test-provider';
            mockProvider.name = 'Test Provider';
            mockProvider.isAvailable = jest.fn().mockResolvedValue(true);
            mockProvider.connect = jest.fn();
            mockProvider.disconnect = jest.fn();
            mockProvider.healthCheck = jest.fn().mockResolvedValue({
                isHealthy: true,
                timestamp: Date.now(),
                details: { latency: 100 }
            });
            mockProvider.getStatus = jest.fn().mockReturnValue({
                state: 'active'
            });
            mockProvider.getAvailableModels = jest.fn().mockResolvedValue([]);
            mockProvider.getCapabilities = jest.fn().mockResolvedValue({
                maxContextLength: 'not-a-number',
                supportsChatCompletion: 'not-a-boolean',
                supportsStreaming: 'not-a-boolean',
                supportsSystemPrompts: 'not-a-boolean'
            });

            const result = await validator.validateProvider(mockProvider);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Provider capabilities maxContextLength must be a number');
            expect(result.errors).toContain('Provider capabilities supportsChatCompletion must be a boolean');
            expect(result.errors).toContain('Provider capabilities supportsStreaming must be a boolean');
            expect(result.errors).toContain('Provider capabilities supportsSystemPrompts must be a boolean');
        });

        it('should handle provider validation errors', async () => {
            const mockProvider = new EventEmitter() as LLMProvider;
            mockProvider.id = 'test-provider';
            mockProvider.name = 'Test Provider';
            mockProvider.isAvailable = jest.fn().mockRejectedValue(new Error('Not available'));
            mockProvider.connect = jest.fn();
            mockProvider.disconnect = jest.fn();
            mockProvider.healthCheck = jest.fn().mockRejectedValue(new Error('Health check failed'));
            mockProvider.getStatus = jest.fn().mockReturnValue({ state: 'error' });
            mockProvider.getAvailableModels = jest.fn().mockRejectedValue(new Error('Failed to get models'));
            mockProvider.getCapabilities = jest.fn().mockRejectedValue(new Error('Failed to get capabilities'));

            const result = await validator.validateProvider(mockProvider);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Provider validation failed');
        });
    });

    describe('validateResponse', () => {
        it('should validate a valid response', () => {
            const response = {
                content: 'Test response',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            };

            const result = validator.validateResponse(response);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate response without usage info', () => {
            const response = {
                content: 'Test response'
            };

            const result = validator.validateResponse(response);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid response content', () => {
            const responses = [
                null,
                undefined,
                { content: '' },
                { content: 123 }
            ];

            responses.forEach(response => {
                const result = validator.validateResponse(response);
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            });
        });

        it('should validate token usage values', () => {
            const response = {
                content: 'Test response',
                usage: {
                    promptTokens: -1,
                    completionTokens: 'not-a-number',
                    totalTokens: 10
                }
            };

            const result = validator.validateResponse(response);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('promptTokens must be a non-negative integer');
            expect(result.errors).toContain('completionTokens must be a non-negative integer');
            expect(result.errors).toContain('totalTokens must equal promptTokens + completionTokens');
        });
    });
});
