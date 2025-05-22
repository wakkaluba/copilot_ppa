import { EventEmitter } from 'events';
import {
    ILLMMessage,
    ILLMModelInfo,
    ILLMProvider,
    ILLMRequest,
    ILLMRequestOptions,
    ILLMResponse,
    ILLMStreamEvent,
    IProviderCapabilities,
} from './llm-provider';

export class LMStudioProvider extends EventEmitter implements ILLMProvider {
  id!: string;
  name!: string;
  private activeModel: string = '';

  getCapabilities(): IProviderCapabilities {
    throw new Error('Method not implemented.');
  }
  isAvailable(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getStatus(): 'active' | 'inactive' | 'error' {
    throw new Error('Method not implemented.');
  }
  connect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  isConnected(): boolean {
    throw new Error('Method not implemented.');
  }
  completePrompt(request: ILLMRequest): Promise<ILLMResponse> {
    throw new Error('Method not implemented.');
  }
  streamPrompt?(request: ILLMRequest): AsyncIterable<ILLMResponse> {
    throw new Error('Method not implemented.');
  }
  cancelRequest(requestId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse> {
    throw new Error('Method not implemented.');
  }
  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  generateChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse> {
    throw new Error('Method not implemented.');
  }
  streamChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getModelInfo(modelId: string): Promise<ILLMModelInfo> {
    throw new Error('Method not implemented.');
  }
  getAvailableModels(): Promise<ILLMModelInfo[]> {
    throw new Error('Method not implemented.');
  }
  setOfflineMode(enabled: boolean): void {
    throw new Error('Method not implemented.');
  }
  cacheResponse?(prompt: string, response: ILLMResponse): Promise<void>;
  useCachedResponse?(prompt: string): Promise<ILLMResponse | null>;
  getActiveModel(): string {
    return this.activeModel;
  }
  setActiveModel(modelId: string): void {
    this.activeModel = modelId;
  }
  getName(): string {
    return this.name;
  }
}
