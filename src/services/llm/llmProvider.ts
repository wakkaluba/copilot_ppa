export interface ILLMProviderOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  // Use unknown for extensibility, avoid any
  [key: string]: unknown;
}

export interface ILLMProvider {
  id: string;
  name: string;
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isAvailable(): Promise<boolean>;
  listModels(): Promise<Array<{ name: string; modified_at: string; size: number }>>;
  generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: unknown,
  ): Promise<{
    content: string;
    model: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }>;
  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: unknown,
    callback?: (event: { content: string; done: boolean }) => void,
  ): Promise<void>;
  getModelInfo(modelId: string): Promise<{
    id: string;
    name: string;
    provider: string;
    parameters: number;
    contextLength: number;
  }>;
}
