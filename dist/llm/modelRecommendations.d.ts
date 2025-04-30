/**
 * Interface representing hardware specs
 */
export interface HardwareSpecs {
    gpu: {
        available: boolean;
        name?: string;
        vram?: number;
        cudaSupport?: boolean;
    };
    ram: {
        total: number;
        free: number;
    };
    cpu: {
        cores: number;
        model?: string;
    };
}
/**
 * Interface for model recommendation
 */
export interface ModelRecommendation {
    modelName: string;
    provider: 'ollama' | 'lmstudio' | 'other';
    description: string;
    suitability: number;
    minRequirements: {
        vram?: number;
        ram?: number;
        diskSpace?: number;
    };
    useCases: string[];
    quantization?: string;
}
/**
 * Service for recommending LLM models based on system capabilities
 */
export declare class ModelRecommendationService {
    /**
     * Get hardware specifications of the current system
     */
    getHardwareSpecs(): Promise<HardwareSpecs>;
    /**
     * Check if Ollama server is running and get available models
     */
    checkOllamaAvailability(): Promise<string[]>;
    /**
     * Check if LM Studio server is running and get available models
     */
    checkLmStudioAvailability(): Promise<string[]>;
    /**
     * Get model recommendations based on hardware specs and available models
     */
    getModelRecommendations(): Promise<ModelRecommendation[]>;
}
export declare const modelRecommendationService: ModelRecommendationService;
