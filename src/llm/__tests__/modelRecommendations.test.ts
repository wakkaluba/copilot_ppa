import axios from 'axios';
import { ModelRecommendationService } from '../modelRecommendations';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ModelRecommendationService', () => {
    let service: ModelRecommendationService;

    beforeEach(() => {
        // Create a new instance of the service before each test
        service = new ModelRecommendationService();

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('getHardwareSpecs', () => {
        it('should return hardware specifications', async () => {
            const specs = await service.getHardwareSpecs();

            // Verify the returned hardware specs structure
            expect(specs).toHaveProperty('gpu');
            expect(specs).toHaveProperty('ram');
            expect(specs).toHaveProperty('cpu');

            // Verify GPU properties
            expect(specs.gpu).toHaveProperty('available');

            // Verify RAM properties
            expect(specs.ram).toHaveProperty('total');
            expect(specs.ram).toHaveProperty('free');

            // Verify CPU properties
            expect(specs.cpu).toHaveProperty('cores');
        });

        it('should handle errors when getting hardware specs', async () => {
            // Mock the implementation to throw an error
            jest.spyOn(service as any, 'getHardwareSpecs').mockImplementationOnce(() => {
                throw new Error('Hardware detection failed');
            });

            // Verify error is propagated
            await expect(service.getHardwareSpecs()).rejects.toThrow('Hardware detection failed');
        });
    });

    describe('checkOllamaAvailability', () => {
        it('should return available Ollama models when server is running', async () => {
            // Mock successful response from Ollama server
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: {
                    models: [
                        { name: 'llama2' },
                        { name: 'codellama' },
                        { name: 'mistral' }
                    ]
                }
            });

            const models = await service.checkOllamaAvailability();

            // Verify axios was called with correct URL
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags', { timeout: 2000 });

            // Verify returned models
            expect(models).toEqual(['llama2', 'codellama', 'mistral']);
        });

        it('should return empty array when Ollama server is not available', async () => {
            // Mock network error
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection refused'));

            const models = await service.checkOllamaAvailability();

            // Verify axios was called
            expect(mockedAxios.get).toHaveBeenCalled();

            // Verify empty array is returned
            expect(models).toEqual([]);
        });

        it('should return empty array when Ollama response is malformed', async () => {
            // Mock malformed response
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: {} // Missing models property
            });

            const models = await service.checkOllamaAvailability();

            // Verify empty array is returned
            expect(models).toEqual([]);
        });
    });

    describe('checkLmStudioAvailability', () => {
        it('should return available LM Studio models when server is running', async () => {
            // Mock successful response from LM Studio server
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: {
                    data: [
                        { id: 'wizard-coder' },
                        { id: 'llama2-7b' },
                        { id: 'mistral-7b' }
                    ]
                }
            });

            const models = await service.checkLmStudioAvailability();

            // Verify axios was called with correct URL
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/v1/models', { timeout: 2000 });

            // Verify returned models
            expect(models).toEqual(['wizard-coder', 'llama2-7b', 'mistral-7b']);
        });

        it('should return empty array when LM Studio server is not available', async () => {
            // Mock network error
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection refused'));

            const models = await service.checkLmStudioAvailability();

            // Verify axios was called
            expect(mockedAxios.get).toHaveBeenCalled();

            // Verify empty array is returned
            expect(models).toEqual([]);
        });

        it('should return empty array when LM Studio response is malformed', async () => {
            // Mock malformed response
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: {} // Missing data property
            });

            const models = await service.checkLmStudioAvailability();

            // Verify empty array is returned
            expect(models).toEqual([]);
        });
    });

    describe('getModelRecommendations', () => {
        it('should return filtered recommendations based on available models', async () => {
            // Mock hardware specs with GPU
            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce({
                gpu: {
                    available: true,
                    name: 'NVIDIA GeForce RTX 3080',
                    vram: 10240,
                    cudaSupport: true
                },
                ram: {
                    total: 32768,
                    free: 16384
                },
                cpu: {
                    cores: 12,
                    model: 'AMD Ryzen 9 5900X'
                }
            });

            // Mock Ollama models
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['llama2', 'mistral']);

            // Mock LM Studio models
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce(['wizard-coder']);

            const recommendations = await service.getModelRecommendations();

            // Verify all dependencies were called
            expect(service.getHardwareSpecs).toHaveBeenCalled();
            expect(service.checkOllamaAvailability).toHaveBeenCalled();
            expect(service.checkLmStudioAvailability).toHaveBeenCalled();

            // Verify recommendations are filtered correctly
            expect(recommendations.length).toBeGreaterThan(0);

            // Only llama2, mistral from Ollama and wizard-coder from LM Studio should be included
            const modelNames = recommendations.map(r => r.modelName);
            expect(modelNames).toContain('llama2');
            expect(modelNames).toContain('mistral');
            expect(modelNames).toContain('wizard-coder');
            expect(modelNames).not.toContain('codellama'); // This should be filtered out

            // Verify recommendation structure
            recommendations.forEach(rec => {
                expect(rec).toHaveProperty('modelName');
                expect(rec).toHaveProperty('provider');
                expect(rec).toHaveProperty('description');
                expect(rec).toHaveProperty('suitability');
                expect(rec).toHaveProperty('minRequirements');
                expect(rec).toHaveProperty('useCases');
            });
        });

        it('should use GPU-specific suitability scores when GPU is available', async () => {
            // Mock hardware specs with GPU
            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce({
                gpu: {
                    available: true,
                    name: 'NVIDIA GeForce RTX 3080',
                    vram: 10240,
                    cudaSupport: true
                },
                ram: {
                    total: 32768,
                    free: 16384
                },
                cpu: {
                    cores: 12,
                    model: 'AMD Ryzen 9 5900X'
                }
            });

            // Mock available models to include all base recommendations
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['llama2', 'codellama', 'mistral']);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce(['wizard-coder']);

            const recommendations = await service.getModelRecommendations();

            // Check that GPU-specific suitability scores are used
            const llamaModel = recommendations.find(r => r.modelName === 'llama2');
            expect(llamaModel?.suitability).toBe(90); // With GPU
        });

        it('should use CPU-specific suitability scores when GPU is not available', async () => {
            // Mock hardware specs without GPU
            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce({
                gpu: {
                    available: false
                },
                ram: {
                    total: 16384,
                    free: 8192
                },
                cpu: {
                    cores: 8,
                    model: 'Intel Core i7'
                }
            });

            // Mock available models to include all base recommendations
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['llama2', 'codellama', 'mistral']);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce(['wizard-coder']);

            const recommendations = await service.getModelRecommendations();

            // Check that CPU-specific suitability scores are used
            const llamaModel = recommendations.find(r => r.modelName === 'llama2');
            expect(llamaModel?.suitability).toBe(70); // Without GPU
        });

        it('should return base recommendations when no models are available', async () => {
            // Mock hardware specs
            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce({
                gpu: {
                    available: true,
                    name: 'NVIDIA GeForce RTX 3080',
                    vram: 10240,
                    cudaSupport: true
                },
                ram: {
                    total: 32768,
                    free: 16384
                },
                cpu: {
                    cores: 12
                }
            });

            // Mock empty arrays for available models
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce([]);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce([]);

            const recommendations = await service.getModelRecommendations();

            // Verify that base recommendations are returned
            expect(recommendations.length).toBe(4); // All base models

            // Verify all base models are included
            const modelNames = recommendations.map(r => r.modelName);
            expect(modelNames).toContain('llama2');
            expect(modelNames).toContain('codellama');
            expect(modelNames).toContain('mistral');
            expect(modelNames).toContain('wizard-coder');
        });

        it('should handle errors during recommendation generation', async () => {
            // Mock hardware specs to throw error
            jest.spyOn(service, 'getHardwareSpecs').mockRejectedValueOnce(new Error('Hardware detection failed'));

            // Test should fail with the same error
            await expect(service.getModelRecommendations()).rejects.toThrow('Hardware detection failed');
        });
    });

    // Test the singleton instance
    describe('modelRecommendationService singleton', () => {
        it('should export a singleton instance of ModelRecommendationService', () => {
            // Import the singleton from the module
            const { modelRecommendationService } = require('../modelRecommendations');

            // Verify it's an instance of ModelRecommendationService
            expect(modelRecommendationService).toBeInstanceOf(ModelRecommendationService);
        });
    });
});
