const axios = require('axios');
const { ModelRecommendationService, modelRecommendationService } = require('../modelRecommendations');

// Mock axios
jest.mock('axios');

describe('ModelRecommendationService (JS test for TS implementation)', () => {
    let service;

    beforeEach(() => {
        service = new ModelRecommendationService();
        jest.clearAllMocks();
    });

    describe('getHardwareSpecs', () => {
        it('should detect and return hardware specifications', async () => {
            // Execute
            const specs = await service.getHardwareSpecs();

            // Assert basic structure
            expect(specs).toBeDefined();
            expect(typeof specs).toBe('object');
            expect(specs.ram).toBeDefined();
            expect(specs.cpu).toBeDefined();
            expect(specs.gpu).toBeDefined();

            // Test RAM properties
            expect(specs.ram.total).toBeGreaterThan(0);
            expect(specs.ram.free).toBeGreaterThan(0);

            // Test CPU properties
            expect(specs.cpu.cores).toBeGreaterThan(0);
            expect(specs.cpu.model || '').toBeDefined();

            // Test GPU properties (may not be available on all systems)
            if (specs.gpu.available) {
                expect(specs.gpu.name || '').toBeDefined();
                expect(specs.gpu.vram || 0).toBeDefined();
            }
        });
    });

    describe('checkOllamaAvailability', () => {
        it('should return available models from Ollama', async () => {
            // Setup
            axios.get.mockResolvedValueOnce({
                status: 200,
                data: {
                    models: [
                        { name: 'llama2' },
                        { name: 'mistral' }
                    ]
                }
            });

            // Execute
            const models = await service.checkOllamaAvailability();

            // Assert
            expect(axios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags', { timeout: 2000 });
            expect(models).toEqual(['llama2', 'mistral']);
        });

        it('should handle Ollama server unavailability gracefully', async () => {
            // Setup
            axios.get.mockRejectedValueOnce(new Error('Server not running'));

            // Execute
            const models = await service.checkOllamaAvailability();

            // Assert
            expect(models).toEqual([]);
        });
    });

    describe('checkLmStudioAvailability', () => {
        it('should return available models from LM Studio', async () => {
            // Setup
            axios.get.mockResolvedValueOnce({
                status: 200,
                data: {
                    data: [
                        { id: 'wizard-coder' },
                        { id: 'llama2-13b' }
                    ]
                }
            });

            // Execute
            const models = await service.checkLmStudioAvailability();

            // Assert
            expect(axios.get).toHaveBeenCalledWith('http://localhost:1234/v1/models', { timeout: 2000 });
            expect(models).toEqual(['wizard-coder', 'llama2-13b']);
        });

        it('should handle LM Studio server unavailability gracefully', async () => {
            // Setup
            axios.get.mockRejectedValueOnce(new Error('Cannot connect to LM Studio'));

            // Execute
            const models = await service.checkLmStudioAvailability();

            // Assert
            expect(models).toEqual([]);
        });
    });

    describe('getModelRecommendations', () => {
        it('should generate recommendations based on hardware and available models', async () => {
            // Setup
            const hardwareSpecs = {
                gpu: {
                    available: true,
                    name: 'Test GPU',
                    vram: 6144,
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

            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce(hardwareSpecs);
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['llama2', 'codellama']);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce(['mistral']);

            // Execute
            const recommendations = await service.getModelRecommendations();

            // Assert
            // Should have all three available models
            const modelNames = recommendations.map(r => r.modelName);
            expect(modelNames).toContain('llama2');
            expect(modelNames).toContain('codellama');
            expect(modelNames).toContain('mistral');

            // Should have required properties
            recommendations.forEach(rec => {
                expect(rec).toHaveProperty('modelName');
                expect(rec).toHaveProperty('provider');
                expect(rec).toHaveProperty('description');
                expect(rec).toHaveProperty('suitability');
                expect(rec).toHaveProperty('minRequirements');
                expect(Array.isArray(rec.useCases)).toBe(true);
            });
        });

        it('should calculate suitability based on hardware specs', async () => {
            // Setup
            // Case 1: High-spec GPU available
            const highSpecHardware = {
                gpu: {
                    available: true,
                    name: 'NVIDIA RTX',
                    vram: 12288,
                    cudaSupport: true
                },
                ram: {
                    total: 32768,
                    free: 16384
                },
                cpu: {
                    cores: 16
                }
            };

            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce(highSpecHardware);
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['codellama']);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce([]);

            // Execute
            const recommendations = await service.getModelRecommendations();

            // Assert
            const codellama = recommendations.find(r => r.modelName === 'codellama');
            expect(codellama.suitability).toBeGreaterThanOrEqual(90); // High score with good GPU

            // Setup again with lower specs
            jest.clearAllMocks();

            const lowSpecHardware = {
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

            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce(lowSpecHardware);
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['codellama']);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce([]);

            // Execute again
            const recommendations2 = await service.getModelRecommendations();

            // Assert
            const codellama2 = recommendations2.find(r => r.modelName === 'codellama');
            expect(codellama2.suitability).toBeLessThan(80); // Lower score without GPU
        });

        it('should provide installation instructions for recommended models', async () => {
            // Setup
            jest.spyOn(service, 'getHardwareSpecs').mockResolvedValueOnce({
                gpu: { available: true },
                ram: { total: 16384, free: 8192 },
                cpu: { cores: 8 }
            });
            jest.spyOn(service, 'checkOllamaAvailability').mockResolvedValueOnce(['llama2']);
            jest.spyOn(service, 'checkLmStudioAvailability').mockResolvedValueOnce([]);

            // Execute
            const recommendations = await service.getModelRecommendations();

            // Assert
            const llama = recommendations.find(r => r.modelName === 'llama2');
            expect(llama.installationInstructions).toBeDefined();
            expect(llama.installationInstructions).toContain('ollama pull llama2');
        });
    });

    describe('singleton pattern', () => {
        it('should export a singleton instance of the service', () => {
            expect(modelRecommendationService).toBeInstanceOf(ModelRecommendationService);

            // The singleton should be the same instance
            const { modelRecommendationService: instance2 } = require('../modelRecommendations');
            expect(instance2).toBe(modelRecommendationService);
        });
    });
});
