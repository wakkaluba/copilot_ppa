import { LLMProvider as ILLMProvider, ProviderCapabilities, LLMRequest, LLMResponse } from './types';

/**
 * Base implementation of the LLM Provider interface
 */
export abstract class LLMProvider implements ILLMProvider {
    /**
     * Get the name of this provider
     */
    abstract getName(): string;
    
    /**
     * Get the capabilities of this provider
     */
    abstract getCapabilities(): ProviderCapabilities;
    
    /**
     * Check if the provider is available
     */
    abstract isAvailable(): Promise<boolean>;
    
    /**
     * Get the current status of the provider
     */
    abstract getStatus(): 'active' | 'inactive' | 'error';
    
    /**
     * Complete a prompt using this provider
     * @param request The LLM request to process
     */
    abstract completePrompt(request: LLMRequest): Promise<LLMResponse>;
    
    /**
     * Stream a prompt response from this provider (optional)
     * @param request The LLM request to process
     */
    async *streamPrompt(request: LLMRequest): AsyncIterable<LLMResponse> {
        // Default implementation for providers that don't support streaming
        // Just get the full response and yield it
        const response = await this.completePrompt(request);
        yield response;
    }
    
    /**
     * Cancel an in-progress request
     * @param requestId The ID of the request to cancel
     */
    abstract cancelRequest(requestId: string): Promise<boolean>;
}
