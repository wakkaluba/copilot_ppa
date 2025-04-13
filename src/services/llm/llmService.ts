import { LLMCacheService } from '../cache/llmCacheService';

// Assuming you already have an LLMProvider interface and implementations

export class LLMService {
  private provider: LLMProvider;
  private cacheService: LLMCacheService;
  
  constructor(provider: LLMProvider) {
    this.provider = provider;
    this.cacheService = new LLMCacheService();
  }
  
  public async generateResponse(prompt: string, options: LLMRequestOptions = {}): Promise<string> {
    const model = options.model || this.provider.getDefaultModel();
    const params = {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000,
      // Other parameters the provider might need
    };
    
    // Try to get from cache first
    const cachedResponse = await this.cacheService.get(prompt, model, params);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cache hit, call the provider
    const response = await this.provider.generateText(prompt, model, params);
    
    // Cache the response
    this.cacheService.set(prompt, model, params, response);
    
    return response;
  }
  
  public clearCache(): void {
    this.cacheService.clearCache();
  }
  
  public clearExpiredCache(): void {
    this.cacheService.clearExpiredCache();
  }
}

export interface LLMRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

// This interface definition would likely be in a separate file
export interface LLMProvider {
  generateText(prompt: string, model: string, params: any): Promise<string>;
  getDefaultModel(): string;
  getAvailableModels(): Promise<string[]>;
  // Other methods the provider should implement
}
