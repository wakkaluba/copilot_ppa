import * as fs from 'fs';
import * as path from 'path';
import { ModelConfigService } from '../services/ModelConfigService';
import { ModelConfig } from '../types';
import { ModelConfigValidator } from '../validators/ModelConfigValidator';

jest.mock('fs');
jest.mock('../validators/ModelConfigValidator');

describe('ModelConfigService', () => {
    let configService: ModelConfigService;
    let mockValidator: jest.Mocked<ModelConfigValidator>;
    const configDir = '/path/to/config';

    beforeEach(() => {
        mockValidator = new ModelConfigValidator() as jest.Mocked<ModelConfigValidator>;
        mockValidator.validate.mockReturnValue({ isValid: true, errors: [] });

        // Mock fs functions
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
        (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
        (fs.readFileSync as jest.Mock).mockImplementation(() => JSON.stringify({}));

        configService = new ModelConfigService(configDir, mockValidator);
    });

    describe('configuration management', () => {
        it('should create config directory if it does not exist', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            new ModelConfigService(configDir, mockValidator);
            expect(fs.mkdirSync).toHaveBeenCalledWith(configDir, { recursive: true });
        });

        it('should save valid model configuration', async () => {
            const modelId = 'test-model';
            const config: ModelConfig = {
                name: modelId,
                provider: 'test-provider',
                parameters: {
                    temperature: 0.7,
                    maxTokens: 100
                }
            };

            await configService.saveModelConfig(modelId, config);

            expect(mockValidator.validate).toHaveBeenCalledWith(config);
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                path.join(configDir, `${modelId}.json`),
                JSON.stringify(config, null, 2)
            );
        });

        it('should reject invalid configuration', async () => {
            mockValidator.validate.mockReturnValue({
                isValid: false,
                errors: ['Invalid temperature value']
            });

            const modelId = 'test-model';
            const config: ModelConfig = {
                name: modelId,
                provider: 'test-provider',
                parameters: {
                    temperature: 2.0 // Invalid value
                }
            };

            await expect(configService.saveModelConfig(modelId, config))
                .rejects
                .toThrow('Invalid configuration: Invalid temperature value');
        });

        it('should load existing configuration', async () => {
            const modelId = 'test-model';
            const existingConfig: ModelConfig = {
                name: modelId,
                provider: 'test-provider',
                parameters: { temperature: 0.7 }
            };

            (fs.readFileSync as jest.Mock).mockReturnValue(
                JSON.stringify(existingConfig)
            );

            const config = await configService.loadModelConfig(modelId);
            expect(config).toEqual(existingConfig);
        });

        it('should return null for non-existent configuration', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            const config = await configService.loadModelConfig('non-existent');
            expect(config).toBeNull();
        });

        it('should list all model configurations', async () => {
            const configs = [
                { name: 'model1', provider: 'provider1' },
                { name: 'model2', provider: 'provider2' }
            ];

            (fs.readdirSync as jest.Mock).mockReturnValue([
                'model1.json',
                'model2.json'
            ]);

            configs.forEach((config, i) => {
                (fs.readFileSync as jest.Mock)
                    .mockReturnValueOnce(JSON.stringify(config));
            });

            const loadedConfigs = await configService.listModelConfigs();
            expect(loadedConfigs).toHaveLength(2);
            expect(loadedConfigs[0].name).toBe('model1');
            expect(loadedConfigs[1].name).toBe('model2');
        });
    });

    describe('configuration validation', () => {
        it('should validate required fields', async () => {
            const modelId = 'test-model';
            const config = {
                name: modelId,
                // Missing required provider field
                parameters: { temperature: 0.7 }
            };

            mockValidator.validate.mockReturnValue({
                isValid: false,
                errors: ['Provider is required']
            });

            await expect(configService.saveModelConfig(modelId, config as any))
                .rejects
                .toThrow('Invalid configuration: Provider is required');
        });

        it('should validate parameter ranges', async () => {
            const modelId = 'test-model';
            const config: ModelConfig = {
                name: modelId,
                provider: 'test-provider',
                parameters: {
                    temperature: 1.5, // Out of range
                    maxTokens: -1 // Invalid
                }
            };

            mockValidator.validate.mockReturnValue({
                isValid: false,
                errors: [
                    'Temperature must be between 0 and 1',
                    'maxTokens must be positive'
                ]
            });

            await expect(configService.saveModelConfig(modelId, config))
                .rejects
                .toThrow(/Temperature must be between 0 and 1/);
        });

        it('should handle malformed configuration files', async () => {
            (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');

            await expect(configService.loadModelConfig('test-model'))
                .rejects
                .toThrow(/Failed to parse configuration file/);
        });
    });

    describe('configuration updates', () => {
        it('should merge partial updates', async () => {
            const modelId = 'test-model';
            const existingConfig: ModelConfig = {
                name: modelId,
                provider: 'test-provider',
                parameters: {
                    temperature: 0.7,
                    maxTokens: 100
                }
            };

            (fs.readFileSync as jest.Mock).mockReturnValue(
                JSON.stringify(existingConfig)
            );

            const update = {
                parameters: {
                    temperature: 0.8
                }
            };

            await configService.updateModelConfig(modelId, update);

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('"temperature":0.8')
            );
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('"maxTokens":100')
            );
        });

        it('should validate updates', async () => {
            const modelId = 'test-model';
            const update = {
                parameters: {
                    temperature: 2.0 // Invalid
                }
            };

            mockValidator.validate.mockReturnValue({
                isValid: false,
                errors: ['Temperature must be between 0 and 1']
            });

            await expect(configService.updateModelConfig(modelId, update))
                .rejects
                .toThrow(/Temperature must be between 0 and 1/);
        });
    });

    describe('cleanup', () => {
        it('should handle cleanup gracefully', async () => {
            await expect(configService.dispose()).resolves.not.toThrow();
        });
    });
});
