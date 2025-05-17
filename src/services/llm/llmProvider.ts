export interface LLMProviderOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  [key: string]: any;
}

export interface LLMProvider {
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
    options?: LLMProviderOptions,
  ): Promise<{
    content: string;
    model: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }>;
  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMProviderOptions,
    callback?: (event: { content: string; done: boolean }) => void,
  ): Promise<void>;
  getModelInfo?(modelId: string): Promise<{
    id: string;
    name: string;
    provider: string;
    parameters: number;
    contextLength: number;
  }>;
}
