/**
 * Interface for message objects in chat-based interactions with LLMs
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Common options for LLM requests
 */
export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Response structure from LLM providers
 */
export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Stream response event from LLM providers
 */
export interface LLMStreamEvent {
  content: string;
  done: boolean;
}

/**
 * Base interface for all LLM providers
 */
export interface LLMProvider {
  /**
   * Name of the provider
   */
  readonly name: string;
  
  /**
   * Check if the provider is available and ready to use
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Get available models from this provider
   */
  getAvailableModels(): Promise<string[]>;
  
  /**
   * Generate text completion based on a single prompt
   */
  generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions
  ): Promise<LLMResponse>;
  
  /**
   * Generate chat completion based on message history
   */
  generateChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse>;
  
  /**
   * Stream a text completion
   */
  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
  ): Promise<void>;
  
  /**
   * Stream a chat completion
   */
  streamChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
  ): Promise<void>;
}
