import axios from 'axios';
import {
  ILLMMessage,
  ILLMModelInfo,
  ILLMRequestOptions,
  ILLMResponse,
  ILLMStreamEvent,
  IProviderCapabilities,
} from '../../../llm/types';
import { ILogger } from '../../../utils/logger';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
import { BaseLLMProvider, IHealthCheckResult, ProviderState } from './BaseLLMProvider';

class ModelError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public modelId: string,
  ) {
    super(message);
    this.name = 'ModelError';
  }
}

class ProviderError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public details?: string,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

class RequestError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public originalError: Error,
  ) {
    super(message);
    this.name = 'RequestError';
  }
}

// Rename interfaces to match ESLint naming convention
interface IOllamaModelInfo {
  name: string;
  id: string;
  digest: string;
  size: number;
  details: {
    format: string;
    family: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
    capabilities?: string[];
  };
  license?: string;
}

interface IOllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string | undefined;
  options?:
    | {
        temperature?: number | null;
        num_predict?: number | null;
        top_k?: number | null;
        presence_penalty?: number | null;
        frequency_penalty?: number | null;
        stop?: string[] | null;
      }
    | undefined;
}

interface IOllamaRequestOptions extends ILLMRequestOptions {
  topK?: number;
  presenceBonus?: number;
  frequencyBonus?: number;
  stopSequences?: string[];
}

export class OllamaProvider extends BaseLLMProvider {
  private client: ReturnType<typeof axios.create>;
  private modelDetails = new Map<string, IOllamaModelInfo>();
  private logger: ILogger;

  constructor(config: ProviderConfig) {
    super('ollama', 'Ollama', config);
    this.logger = (config as { logger?: ILogger }).logger || {
      error: (): void => undefined,
      info: (): void => undefined,
      warn: (): void => undefined,
    };
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeoutMs || 30000,
    });
  }

  protected async performHealthCheck(): Promise<IHealthCheckResult> {
    try {
      const startTime = Date.now();
      await this.client.get('/api/health');
      const endTime = Date.now();
      return {
        isHealthy: true,
        latency: endTime - startTime,
        timestamp: endTime,
      };
    } catch (error) {
      this.logger.error('Ollama health check failed', { error });
      return {
        isHealthy: false,
        error: error instanceof Error ? error : new Error(String(error)),
        latency: 0,
        timestamp: Date.now(),
      };
    }
  }

  public async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/api/health');
      return true;
    } catch (error) {
      this.logger.warn?.('Ollama service unavailable', { error });
      return false;
    }
  }

  public async connect(): Promise<void> {
    // Optionally implement config validation if needed
    this.setProviderState(ProviderState.Initializing);
    try {
      const available = await this.isAvailable();
      if (!available) {
        const err = new ProviderError('Ollama service is not available', this.getId());
        this.logger.error('Ollama connect failed', { error: err });
        throw err;
      }
      await this.refreshModels();
      this.setProviderState(ProviderState.Active);
      this.logger.info?.('Ollama provider connected');
    } catch (error) {
      this.setProviderError(error instanceof Error ? error : new Error(String(error)));
      this.logger.error('Ollama connect error', { error });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.setProviderState(ProviderState.Deactivating);
    this.modelDetails.clear();
    this.setProviderState(ProviderState.Inactive);
    this.logger.info?.('Ollama provider disconnected');
  }

  private async refreshModels(): Promise<void> {
    try {
      const response = await this.client.get('/api/tags');
      const models = response.data.models || [];
      this.modelDetails.clear();
      for (const model of models) {
        this.modelDetails.set(model.name, model);
      }
      this.logger.info?.('Ollama models refreshed', { count: models.length });
    } catch (error) {
      const errorString = error instanceof Error ? error.message : String(error);
      const err = new ProviderError('Failed to fetch models', this.getId(), errorString);
      this.logger.error('Ollama refreshModels error', { error: err });
      throw err;
    }
  }

  public async getAvailableModels(): Promise<ILLMModelInfo[]> {
    await this.refreshModels();
    return Array.from(this.modelDetails.entries()).map(([id, info]) =>
      this.convertModelInfo(id, info),
    );
  }

  public async getModelInfo(modelId: string): Promise<ILLMModelInfo> {
    const info = this.modelDetails.get(modelId);
    if (!info) {
      const err = new ModelError('Model not found', this.getId(), modelId);
      this.logger.warn?.('Ollama getModelInfo: model not found', { modelId, error: err });
      throw err;
    }
    return this.convertModelInfo(modelId, info);
  }

  public async getCapabilities(): Promise<IProviderCapabilities> {
    return {
      maxContextLength: 4096,
      supportsChatCompletion: true,
      supportsStreaming: true,
      supportsSystemPrompts: true,
      supportedFormats: ['text'],
      multimodalSupport: false,
      supportsTemperature: true,
      supportsTopP: false,
      supportsPenalties: true,
      supportsRetries: false,
    };
  }

  public async generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse> {
    try {
      const ollamaOptions = options as IOllamaRequestOptions;
      const request: IOllamaGenerateRequest = {
        model,
        prompt,
        ...(systemPrompt && { system: systemPrompt }),
        ...(options && {
          options: {
            ...(options.temperature !== undefined && { temperature: options.temperature }),
            ...(options.maxTokens !== undefined && { num_predict: options.maxTokens }),
            ...(ollamaOptions?.topK !== undefined && { top_k: ollamaOptions.topK }),
            ...(ollamaOptions?.presenceBonus !== undefined && {
              presence_penalty: ollamaOptions.presenceBonus,
            }),
            ...(ollamaOptions?.frequencyBonus !== undefined && {
              frequency_penalty: ollamaOptions.frequencyBonus,
            }),
            ...(ollamaOptions?.stopSequences !== undefined && {
              stop: ollamaOptions.stopSequences,
            }),
          },
        }),
      };

      const response = await this.client.post('/api/generate', request);

      const result: ILLMResponse = {
        requestId: `${model}-${Date.now()}`,
        model: model,
        prompt: prompt,
        timestamp: Date.now(),
        content: response.data.response,
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
        },
      };

      this.logger.info?.('Ollama completion generated', { model, promptLength: prompt.length });
      return result;
    } catch (error) {
      const err = new RequestError(
        'Generation failed',
        this.getId(),
        error instanceof Error ? error : new Error(String(error)),
      );
      this.logger.error('Ollama generateCompletion error', { error: err });
      throw err;
    }
  }

  public async generateChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse> {
    const prompt = this.formatChatMessages(messages);
    return this.generateCompletion(model, prompt, undefined, options);
  }

  public async streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void> {
    try {
      const ollamaOptions = options as IOllamaRequestOptions;
      const request: IOllamaGenerateRequest = {
        model,
        prompt,
        ...(systemPrompt && { system: systemPrompt }),
        ...(options && {
          options: {
            ...(options.temperature !== undefined && { temperature: options.temperature }),
            ...(options.maxTokens !== undefined && { num_predict: options.maxTokens }),
            ...(ollamaOptions?.topK !== undefined && { top_k: ollamaOptions.topK }),
            ...(ollamaOptions?.presenceBonus !== undefined && {
              presence_penalty: ollamaOptions.presenceBonus,
            }),
            ...(ollamaOptions?.frequencyBonus !== undefined && {
              frequency_penalty: ollamaOptions.frequencyBonus,
            }),
            ...(ollamaOptions?.stopSequences !== undefined && {
              stop: ollamaOptions.stopSequences,
            }),
          },
        }),
      };

      const response = await this.client.post('/api/generate', request, {
        responseType: 'stream',
      });

      for await (const chunk of response.data) {
        const data = JSON.parse(chunk.toString());
        if (callback) {
          callback({
            content: data.response,
            done: !!data.done,
          });
        }
      }
    } catch (error) {
      const err = new RequestError(
        'Streaming failed',
        this.getId(),
        error instanceof Error ? error : new Error(String(error)),
      );
      this.logger.error('Ollama streamCompletion error', { error: err });
      throw err;
    }
  }

  public async streamChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void> {
    const prompt = this.formatChatMessages(messages);
    await this.streamCompletion(model, prompt, undefined, options, callback);
  }

  private convertModelInfo(modelId: string, info: IOllamaModelInfo): ILLMModelInfo {
    return {
      id: modelId,
      name: info.name,
      provider: this.getId(),
      maxContextLength: 4096,
      parameters: {
        format: info.details.format,
        family: info.details.family,
        size: this.parseParameterSize(info.details.parameter_size),
      },
      features: info.details.capabilities || [],
      metadata: {
        quantization: info.details.quantization_level,
        license: info.license,
      },
    };
  }

  private parseParameterSize(size?: string): number | undefined {
    if (!size) {
      return undefined;
    }
    const match = size.match(/(\d+)([BM])/);
    if (!match) {
      return undefined;
    }
    const [, num, unit] = match;
    if (!num) {
      return undefined;
    }
    return unit === 'B' ? parseInt(num, 10) : parseInt(num, 10) / 1000;
  }

  private formatChatMessages(messages: ILLMMessage[]): string {
    return messages
      .map((msg) => `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`)
      .join('\n');
  }

  // Add required provider ID and state methods for compatibility
  public getId(): string {
    return 'ollama';
  }
  public setProviderState(state: ProviderState): void {
    super.setProviderState(state);
  }
  public setProviderError(error: Error): void {
    super.setProviderError(error);
  }
}
