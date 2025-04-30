/**
 * Interface for all LLM providers (Ollama, LM Studio, etc.)
 */
export interface ILLMProvider {
    /**
     * The name of the LLM provider
     */
    readonly name: string;
    /**
     * The model being used by this provider
     */
    readonly model: string;
    /**
     * Send a prompt to the LLM and get a response
     * @param prompt The prompt to send to the LLM
     * @param options Optional provider-specific options
     * @returns A promise that resolves to the LLM's response
     */
    sendPrompt(prompt: string, options?: ILLMRequestOptions): Promise<ILLMResponse>;
    /**
     * Check if the provider is connected and ready
     * @returns A promise that resolves to true if connected, false otherwise
     */
    isConnected(): Promise<boolean>;
    /**
     * Initialize the provider with the given configuration
     * @param config The provider-specific configuration
     * @returns A promise that resolves when initialization is complete
     */
    initialize(config: ILLMProviderConfig): Promise<void>;
}
/**
 * Common options for LLM requests
 */
export interface ILLMRequestOptions {
    /**
     * Temperature controls randomness (0.0 to 1.0)
     */
    temperature?: number;
    /**
     * Maximum tokens to generate
     */
    maxTokens?: number;
    /**
     * Stop sequences to end generation
     */
    stopSequences?: string[];
    /**
     * Whether to stream the response
     */
    stream?: boolean;
    /**
     * Provider-specific parameters
     */
    [key: string]: any;
}
/**
 * Response from an LLM
 */
export interface ILLMResponse {
    /**
     * The generated text
     */
    text: string;
    /**
     * Token usage information
     */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    /**
     * Provider-specific metadata
     */
    metadata?: Record<string, any>;
}
/**
 * Base configuration for LLM providers
 */
export interface ILLMProviderConfig {
    /**
     * API endpoint URL
     */
    apiEndpoint: string;
    /**
     * Model to use
     */
    model: string;
    /**
     * Default request options
     */
    defaultOptions?: ILLMRequestOptions;
}
