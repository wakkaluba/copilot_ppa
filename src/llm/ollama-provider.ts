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

// This is a stub for the OllamaProvider. Implement the full provider in src/services/llm/providers/OllamaProvider.ts
export class OllamaProvider extends EventEmitter implements ILLMProvider {
  readonly id: string = 'ollama';
  readonly name: string = 'Ollama';

  getCapabilities(): IProviderCapabilities {
    throw new Error('Not implemented.');
  }
  isAvailable(): Promise<boolean> {
    throw new Error('Not implemented.');
  }
  getStatus(): 'active' | 'inactive' | 'error' {
    throw new Error('Not implemented.');
  }
  connect(): Promise<void> {
    throw new Error('Not implemented.');
  }
  disconnect(): Promise<void> {
    throw new Error('Not implemented.');
  }
  isConnected(): boolean {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  completePrompt(_request: ILLMRequest): Promise<ILLMResponse> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  streamPrompt?(_request: ILLMRequest): AsyncIterable<ILLMResponse> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cancelRequest(_requestId: string): Promise<boolean> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateCompletion(
    _model: string,
    _prompt: string,
    _systemPrompt?: string,
    _options?: ILLMRequestOptions,
  ): Promise<ILLMResponse> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  streamCompletion(
    _model: string,
    _prompt: string,
    _systemPrompt?: string,
    _options?: ILLMRequestOptions,
    _callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateChatCompletion(
    _model: string,
    _messages: ILLMMessage[],
    _options?: ILLMRequestOptions,
  ): Promise<ILLMResponse> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  streamChatCompletion(
    _model: string,
    _messages: ILLMMessage[],
    _options?: ILLMRequestOptions,
    _callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getModelInfo(_modelId: string): Promise<ILLMModelInfo> {
    throw new Error('Not implemented.');
  }
  getAvailableModels(): Promise<ILLMModelInfo[]> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setOfflineMode(_enabled: boolean): void {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cacheResponse?(_prompt: string, _response: ILLMResponse): Promise<void> {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useCachedResponse?(_prompt: string): Promise<ILLMResponse | null> {
    throw new Error('Not implemented.');
  }
  getActiveModel(): string {
    throw new Error('Not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setActiveModel(_modelId: string): void {
    throw new Error('Not implemented.');
  }
  getName(): string {
    return this.name;
  }
}
