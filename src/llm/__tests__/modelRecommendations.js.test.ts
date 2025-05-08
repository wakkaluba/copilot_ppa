import axios from 'axios';
import { ModelRecommendationService } from '../modelRecommendations.js';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ModelRecommendationService (JS implementation)', () => {
    let service: ModelRecommendationService;

    beforeEach(() => {
        service = new ModelRecommendationService();
        jest.clearAllMocks();
    });

    describe('getHardwareSpecs', () => {
        it('should return hardware specifications with default values', async () => {
            // Execute
            const specs = await service.getHardwareSpecs();

            // Assert
            expect(specs).toBeDefined();
            expect(specs.ram).toBeDefined();
            expect(specs.cpu).toBeDefined();
            expect(specs.gpu).toBeDefined();

            // Default values check
            expect(specs.ram.total).toBeGreaterThan(0);
            expect(specs.ram.free).toBeGreaterThan(0);
            expect(specs.cpu.cores).toBeGreaterThan(0);
        });

        it('should handle errors gracefully', async () => {
            // Setup: Override getHardwareSpecs to throw an error
            jest.spyOn(service, 'getHardwareSpecs').mockImplementationOnce(() => {
                throw new Error('Simulated hardware detection error');
            });

            // Execute & Assert
            await expect(service.getHardwareSpecs()).rejects.toThrow('Simulated hardware detection error');
        });
    });

    describe('checkOllamaAvailability', () => {
        it('should return available Ollama models when server responds correctly', async () => {
            // Setup
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: {
                    models: [
                        { name: 'llama2:7b' },
                        { name: 'mistral:7b' },
                        { name: 'phi2' }
                    ]
                }
            });

            // Execute
            const models = await service.checkOllamaAvailability();

            // Assert
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags', { timeout: 2000 });
            expect(models).toEqual(['llama2:7b', 'mistral:7b', 'phi2']);
        });

        it('should handle connection errors with Ollama server', async () => {
            // Setup
            mockedAxios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

            // Execute
            const models = await service.checkOllamaAvailability();

            // Assert
            expect(models).toEqual([]);
        });

        it('should handle unexpected Ollama API response formats', async () => {
            // Setup - response with incorrect format
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: { unexpected: 'format' }
            });

            // Execute
            const models = await service.checkOllamaAvailability();

            // Assert
            expect(models).toEqual([]);
        });
    });

    describe('checkLmStudioAvailability', () => {
        it('should return available LM Studio models when server responds correctly', async () => {
            // Setup
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: {
                    data: [
                        { id: 'mistral-7b-instruct' },
                        { id: 'llama2-13b-chat' },
                        { id: 'dolphin-mixtral' }
                    ]
                }
            });

            // Execute
            const models = await service.checkLmStudioAvailability();

            // Assert
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/v1/models', { timeout: 2000 });
            expect(models).toEqual(['mistral-7b-instruct', 'llama2-13b-chat', 'dolphin-mixtral']);
        });

        it('should handle connection errors with LM Studio server', async () => {
            // Setup
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection timeout'));

            // Execute
            const models = await service.checkLmStudioAvailability();

            // Assert
            expect(models).toEqual([]);
        });

        it('should handle non-standard response formats from LM Studio', async () => {
            // Setup - response with incorrect format
            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: { models: [] } // Not matching expected format
            });

            // Execute
            const models = await service.checkLmStudioAvailability();

            // Assert
            expect(models).toEqual([]);
        });
    });

    describe('getModelRecommendations', () => {
        it('should integrate hardware specs and available models for recommendations', async () => {
            // Setup
            const mockHardwareSpecs = {
                gpu: {
                    available: true,
                    name: 'NVIDIA Test GPU',
                    vram: 8192,
                    cudaSupport: true
                },
                ram: {
                    total: 32768,
                    free: 16384
                },
                cpu: {
                    cores: 12,
                    model: 'Intel Test CPU'
                }
            };

            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce(mockHardwareSpecs);
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['mistral', 'llama2']);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce(['wizard-coder-15b']);

            // Execute
            const recommendations = await service.getModelRecommendations();

            // Assert
            expect(recommendations.length).toBeGreaterThan(0);

            // Should have filtered the recommendations correctly
            const modelNames = recommendations.map(r => r.modelName);
            expect(modelNames).toContain('llama2');
            expect(modelNames).toContain('mistral');
            expect(modelNames).toContain('wizard-coder');
            expect(modelNames).not.toContain('codellama'); // Not in available models

            // Should have all necessary properties
            recommendations.forEach(model => {
                expect(model).toHaveProperty('modelName');
                expect(model).toHaveProperty('provider');
                expect(model).toHaveProperty('description');
                expect(model).toHaveProperty('suitability');
                expect(model).toHaveProperty('minRequirements');
                expect(model).toHaveProperty('useCases');
                expect(Array.isArray(model.useCases)).toBe(true);
            });
        });

        it('should return base recommendations when no models are available', async () => {
            // Setup
            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce({
                gpu: { available: false },
                ram: { total: 8192, free: 4096 },
                cpu: { cores: 4 }
            });
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce([]);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce([]);

            // Execute
            const recommendations = await service.getModelRecommendations();

            // Assert
            expect(recommendations.length).toBe(4); // All default models

            // Check the consistency between GPU availability and suitability scores
            const llamaModel = recommendations.find(r => r.modelName === 'llama2');
            expect(llamaModel?.suitability).toBe(70); // Should be lower for non-GPU
        });

        it('should propagate errors from hardware specs', async () => {
            // Setup
            jest.spyOn(service, 'getHardwareSpecs').mockRejectedValueOnce(new Error('Cannot access hardware info'));

            // Execute & Assert
            await expect(service.getModelRecommendations()).rejects.toThrow('Cannot access hardware info');
        });
    });

    describe('module exports', () => {
        it('should export both the class and a singleton instance', () => {
            // Import the module directly
            const moduleExports = require('../modelRecommendations.js');

            // Verify exports
            expect(moduleExports.ModelRecommendationService).toBeDefined();
            expect(moduleExports.modelRecommendationService).toBeDefined();
            expect(moduleExports.modelRecommendationService).toBeInstanceOf(moduleExports.ModelRecommendationService);
        });
    });
});
