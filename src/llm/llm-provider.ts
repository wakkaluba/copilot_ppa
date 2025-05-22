import { EventEmitter } from 'events';
import {
    ILLMMessage,
    ILLMModelInfo,
    ILLMRequest,
    ILLMRequestOptions,
    ILLMResponse,
    ILLMStreamEvent,
    IProviderCapabilities,
} from './types';

export * from './types';

export interface ILLMProvider extends EventEmitter {
  readonly id: string;
  readonly name: string;

  getCapabilities(): IProviderCapabilities;
  isAvailable(): Promise<boolean>;
  getStatus(): 'active' | 'inactive' | 'error';

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  completePrompt(request: ILLMRequest): Promise<ILLMResponse>;
  streamPrompt?(request: ILLMRequest): AsyncIterable<ILLMResponse>;
  cancelRequest(requestId: string): Promise<boolean>;

  generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse>;

  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void>;

  generateChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse>;

  streamChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void>;

  getModelInfo(modelId: string): Promise<ILLMModelInfo>;
  getAvailableModels(): Promise<ILLMModelInfo[]>;

  setOfflineMode(enabled: boolean): void;
  cacheResponse?(prompt: string, response: ILLMResponse): Promise<void>;
  useCachedResponse?(prompt: string): Promise<ILLMResponse | null>;

  // Add these for provider manager compatibility
  getActiveModel(): string;
  setActiveModel(modelId: string): void;
  getName(): string;
}
