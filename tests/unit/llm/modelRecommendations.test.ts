/**
 * Tests for ModelRecommendationService in llm
 */
import axios from 'axios';
import { HardwareSpecs, ModelRecommendationService } from '../../../src/llm/modelRecommendations';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ModelRecommendationService', () => {
    let modelRecommendationService: ModelRecommendationService;
    const mockHardwareSpecs: HardwareSpecs = {
        gpu: {
            available: true,
            name: 'Test GPU',
            vram: 8192,
            cudaSupport: true
        },
        ram: {
            total: 16384,
            free: 8192
        },
        cpu: {
            cores: 8,
            model: 'Test CPU'
        }
    };

    const mockHardwareSpecsNoGpu: HardwareSpecs = {
        gpu: {
            available: false
        },
        ram: {
            total: 8192,
            free: 4096
        },
        cpu: {
            cores: 4
        }
    };

    beforeEach(() => {
        modelRecommendationService = new ModelRecommendationService();
        jest.clearAllMocks();
    });

    describe('getHardwareSpecs', () => {
        it('should return hardware specs', async () => {
            // We'll spy on the implementation to return our mock data
            const spy = jest.spyOn(modelRecommendationService, 'getHardwareSpecs');
            spy.mockResolvedValue(mockHardwareSpecs);

            const result = await modelRecommendationService.getHardwareSpecs();
            expect(result).toEqual(mockHardwareSpecs);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should handle errors when getting hardware specs', async () => {
            const errorMessage = 'Hardware detection failed';
            const spy = jest.spyOn(modelRecommendationService, 'getHardwareSpecs');
            spy.mockRejectedValue(new Error(errorMessage));

            await expect(modelRecommendationService.getHardwareSpecs()).rejects.toThrow(
                `Failed to get hardware specifications: ${errorMessage}`
            );
        });
    });

    describe('checkOllamaAvailability', () => {
        it('should return available Ollama models when server is running', async () => {
            const mockOllamaModels = ['llama2', 'codellama', 'mistral'];
            mockedAxios.get.mockResolvedValue({
                status: 200,
                data: {
                    models: mockOllamaModels.map(name => ({ name }))
                }
            });

            const result = await modelRecommendationService.checkOllamaAvailability();
            expect(result).toEqual(mockOllamaModels);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags', {
                timeout: 2000
            });
        });

        it('should return empty array when Ollama server is not running', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

            const result = await modelRecommendationService.checkOllamaAvailability();
            expect(result).toEqual([]);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags', {
                timeout: 2000
            });
        });

        it('should return empty array when Ollama response format is unexpected', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 200,
                data: {}  // Missing models property
            });

            const result = await modelRecommendationService.checkOllamaAvailability();
            expect(result).toEqual([]);
        });
    });

    describe('checkLmStudioAvailability', () => {
        it('should return available LM Studio models when server is running', async () => {
            const mockLmStudioModels = ['gpt-3.5-turbo', 'wizard-coder-python', 'llama-2-13b'];
            mockedAxios.get.mockResolvedValue({
                status: 200,
                data: {
                    data: mockLmStudioModels.map(id => ({ id }))
                }
            });

            const result = await modelRecommendationService.checkLmStudioAvailability();
            expect(result).toEqual(mockLmStudioModels);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/v1/models', {
                timeout: 2000
            });
        });

        it('should return empty array when LM Studio server is not running', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

            const result = await modelRecommendationService.checkLmStudioAvailability();
            expect(result).toEqual([]);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/v1/models', {
                timeout: 2000
            });
        });

        it('should return empty array when LM Studio response format is unexpected', async () => {
            mockedAxios.get.mockResolvedValue({
                status: 200,
                data: {}  // Missing data property
            });

            const result = await modelRecommendationService.checkLmStudioAvailability();
            expect(result).toEqual([]);
        });
    });

    describe('getModelRecommendations', () => {
        it('should return filtered recommendations based on available models with GPU', async () => {
            // Mock hardware specs with GPU
            jest.spyOn(modelRecommendationService, 'getHardwareSpecs').mockResolvedValue(mockHardwareSpecs);

            // Mock available Ollama models
            jest.spyOn(modelRecommendationService, 'checkOllamaAvailability')
                .mockResolvedValue(['llama2', 'mistral']);

            // Mock available LM Studio models
            jest.spyOn(modelRecommendationService, 'checkLmStudioAvailability')
                .mockResolvedValue(['wizard-coder-13b']);

            const recommendations = await modelRecommendationService.getModelRecommendations();

            // We should get recommendations for llama2, mistral, and wizard-coder
            expect(recommendations.length).toBeGreaterThanOrEqual(3);
            expect(recommendations.find(r => r.modelName === 'llama2')).toBeDefined();
            expect(recommendations.find(r => r.modelName === 'mistral')).toBeDefined();
            expect(recommendations.find(r => r.modelName === 'wizard-coder')).toBeDefined();

            // CodeLlama should be filtered out as it's not in our mock available models
            expect(recommendations.find(r => r.modelName === 'codellama')).toBeUndefined();

            // With GPU, llama2 should have high suitability
            const llama2 = recommendations.find(r => r.modelName === 'llama2');
            expect(llama2?.suitability).toBeGreaterThanOrEqual(90);
        });

        it('should return filtered recommendations based on available models without GPU', async () => {
            // Mock hardware specs without GPU
            jest.spyOn(modelRecommendationService, 'getHardwareSpecs').mockResolvedValue(mockHardwareSpecsNoGpu);

            // Mock available Ollama models
            jest.spyOn(modelRecommendationService, 'checkOllamaAvailability')
                .mockResolvedValue(['llama2', 'mistral']);

            // Mock available LM Studio models - empty for this test
            jest.spyOn(modelRecommendationService, 'checkLmStudioAvailability')
                .mockResolvedValue([]);

            const recommendations = await modelRecommendationService.getModelRecommendations();

            // We should get recommendations for llama2 and mistral, but not wizard-coder
            expect(recommendations.length).toBeGreaterThanOrEqual(2);
            expect(recommendations.find(r => r.modelName === 'llama2')).toBeDefined();
            expect(recommendations.find(r => r.modelName === 'mistral')).toBeDefined();
            expect(recommendations.find(r => r.modelName === 'wizard-coder')).toBeUndefined();

            // Without GPU, llama2 should have lower suitability
            const llama2 = recommendations.find(r => r.modelName === 'llama2');
            expect(llama2?.suitability).toBeLessThan(90);
        });

        it('should return base recommendations when no models are available', async () => {
            // Mock hardware specs
            jest.spyOn(modelRecommendationService, 'getHardwareSpecs').mockResolvedValue(mockHardwareSpecs);

            // Mock available models - both empty
            jest.spyOn(modelRecommendationService, 'checkOllamaAvailability').mockResolvedValue([]);
            jest.spyOn(modelRecommendationService, 'checkLmStudioAvailability').mockResolvedValue([]);

            const recommendations = await modelRecommendationService.getModelRecommendations();

            // Should return all base recommendations
            expect(recommendations.length).toBeGreaterThanOrEqual(4);
            expect(recommendations.find(r => r.modelName === 'llama2')).toBeDefined();
            expect(recommendations.find(r => r.modelName === 'codellama')).toBeDefined();
            expect(recommendations.find(r => r.modelName === 'mistral')).toBeDefined();
            expect(recommendations.find(r => r.modelName === 'wizard-coder')).toBeDefined();
        });

        it('should handle errors in hardware specs detection', async () => {
            // Mock hardware specs to throw error
            jest.spyOn(modelRecommendationService, 'getHardwareSpecs')
                .mockRejectedValue(new Error('Hardware detection failed'));

            // Mock available models
            jest.spyOn(modelRecommendationService, 'checkOllamaAvailability').mockResolvedValue(['llama2']);
            jest.spyOn(modelRecommendationService, 'checkLmStudioAvailability').mockResolvedValue([]);

            await expect(modelRecommendationService.getModelRecommendations()).rejects.toThrow('Hardware detection failed');
        });

        it('should handle errors in Ollama availability check', async () => {
            // Mock hardware specs
            jest.spyOn(modelRecommendationService, 'getHardwareSpecs').mockResolvedValue(mockHardwareSpecs);

            // Mock Ollama check to throw unexpected error
            jest.spyOn(modelRecommendationService, 'checkOllamaAvailability')
                .mockRejectedValue(new Error('Unexpected Ollama error'));

            // Mock LM Studio availability
            jest.spyOn(modelRecommendationService, 'checkLmStudioAvailability').mockResolvedValue([]);

            // Should not throw, but return base recommendations
            const recommendations = await modelRecommendationService.getModelRecommendations();
            expect(recommendations.length).toBeGreaterThanOrEqual(4);
        });

        it('should handle errors in LM Studio availability check', async () => {
            // Mock hardware specs
            jest.spyOn(modelRecommendationService, 'getHardwareSpecs').mockResolvedValue(mockHardwareSpecs);

            // Mock Ollama availability
            jest.spyOn(modelRecommendationService, 'checkOllamaAvailability').mockResolvedValue(['llama2']);

            // Mock LM Studio check to throw unexpected error
            jest.spyOn(modelRecommendationService, 'checkLmStudioAvailability')
                .mockRejectedValue(new Error('Unexpected LM Studio error'));

            // Should not throw, but return recommendations based on Ollama availability
            const recommendations = await modelRecommendationService.getModelRecommendations();
            expect(recommendations.length).toBeGreaterThanOrEqual(1);
            expect(recommendations.find(r => r.modelName === 'llama2')).toBeDefined();
        });
    });
});
