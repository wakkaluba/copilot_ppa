"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelRecommendationService = exports.ModelRecommendationService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Service for recommending LLM models based on system capabilities
 */
class ModelRecommendationService {
    /**
     * Get hardware specifications of the current system
     */
    async getHardwareSpecs() {
        try {
            // This is a simplified version - in a real implementation,
            // we would use platform-specific APIs to get actual hardware info
            const specs = {
                gpu: {
                    available: false
                },
                ram: {
                    total: 16384,
                    free: 8192 // Assume 8GB free
                },
                cpu: {
                    cores: 8
                }
            };
            // In a real implementation, we would detect CUDA/GPU here
            try {
                // Check for CUDA support - this is just a placeholder
                // In reality, we would use node-gpu or similar libraries
                specs.gpu.available = true;
                specs.gpu.name = "Generic GPU";
                specs.gpu.vram = 4096; // 4GB
                specs.gpu.cudaSupport = true;
            }
            catch (error) {
                console.log('No GPU detected or error detecting GPU:', error);
            }
            return specs;
        }
        catch (error) {
            console.error('Error getting hardware specs:', error);
            throw new Error(`Failed to get hardware specifications: ${error.message}`);
        }
    }
    /**
     * Check if Ollama server is running and get available models
     */
    async checkOllamaAvailability() {
        try {
            const response = await axios_1.default.get('http://localhost:11434/api/tags', {
                timeout: 2000
            });
            if (response.status === 200 && response.data && response.data.models) {
                return response.data.models.map((model) => model.name);
            }
            return [];
        }
        catch (error) {
            console.log('Ollama server not available:', error);
            return [];
        }
    }
    /**
     * Check if LM Studio server is running and get available models
     */
    async checkLmStudioAvailability() {
        try {
            const response = await axios_1.default.get('http://localhost:1234/v1/models', {
                timeout: 2000
            });
            if (response.status === 200 && response.data && response.data.data) {
                return response.data.data.map((model) => model.id);
            }
            return [];
        }
        catch (error) {
            console.log('LM Studio server not available:', error);
            return [];
        }
    }
    /**
     * Get model recommendations based on hardware specs and available models
     */
    async getModelRecommendations() {
        const specs = await this.getHardwareSpecs();
        const ollamaModels = await this.checkOllamaAvailability();
        const lmStudioModels = await this.checkLmStudioAvailability();
        // Base recommendations - would be expanded in a real implementation
        const baseRecommendations = [
            {
                modelName: 'llama2',
                provider: 'ollama',
                description: 'General purpose model with good performance across various tasks.',
                suitability: specs.gpu.available ? 90 : 70,
                minRequirements: {
                    vram: 4000,
                    ram: 8000
                },
                useCases: ['Code completion', 'Text generation', 'Summarization'],
                quantization: 'Q4_0'
            },
            {
                modelName: 'codellama',
                provider: 'ollama',
                description: 'Specialized model for code generation and understanding.',
                suitability: specs.gpu.available ? 95 : 75,
                minRequirements: {
                    vram: 6000,
                    ram: 8000
                },
                useCases: ['Code completion', 'Code explanation', 'Refactoring suggestions'],
                quantization: 'Q4_0'
            },
            {
                modelName: 'mistral',
                provider: 'ollama',
                description: 'Efficient and powerful general-purpose model.',
                suitability: specs.gpu.available ? 88 : 82,
                minRequirements: {
                    vram: 4000,
                    ram: 8000
                },
                useCases: ['Text generation', 'Code assistance', 'Question answering'],
                quantization: 'Q4_0'
            },
            {
                modelName: 'wizard-coder',
                provider: 'lmstudio',
                description: 'Specialized model for code generation with great performance.',
                suitability: specs.gpu.available ? 93 : 78,
                minRequirements: {
                    vram: 4000,
                    ram: 8000
                },
                useCases: ['Code generation', 'Debugging assistance', 'Code conversion'],
                quantization: 'GPTQ'
            }
        ];
        // Filter recommendations based on available models
        const recommendations = baseRecommendations.filter(rec => {
            if (rec.provider === 'ollama') {
                return ollamaModels.includes(rec.modelName);
            }
            else if (rec.provider === 'lmstudio') {
                return lmStudioModels.some(model => model.includes(rec.modelName));
            }
            return true; // Include other providers by default
        });
        // If no models are available, return base recommendations anyway
        return recommendations.length > 0 ? recommendations : baseRecommendations;
    }
}
exports.ModelRecommendationService = ModelRecommendationService;
// Export singleton instance
exports.modelRecommendationService = new ModelRecommendationService();
//# sourceMappingURL=modelRecommendations.js.map