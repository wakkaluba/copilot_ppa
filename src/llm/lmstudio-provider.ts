import { LLMProvider, LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from './llm-provider';
import axios from 'axios';
import { Config } from '../config';

interface OpenAIChatMessage {
  role: string;
  content: string;
}

interface OpenAIChatCompletionRequest {
  model: string;
  messages: OpenAIChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenAICompletionRequest {
  model: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    text: string;
    index: number;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Implementation of LLMProvider for LM Studio's OpenAI-compatible API
 */
export class LMStudioProvider implements LLMProvider {
  readonly name = 'LM Studio';
  private baseUrl: string;
  
  constructor(baseUrl = Config.lmStudioApiUrl) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Check if LM Studio is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/models`);
      return true;
    } catch (error) {
      console.error('LM Studio not available:', error);
      return false;
    }
  }
  
  /**
   * Get available models from LM Studio
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`);
      if (response.data && response.data.data) {
        return response.data.data.map((model: any) => model.id);
      }
      return ['local-model']; // Default fallback if no models reported
    } catch (error) {
      console.error('Failed to get LM Studio models:', error);
      return ['local-model']; // Default fallback on error
    }
  }
  
  /**
   * Generate text completion using LM Studio
   */
  async generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    // For LM Studio, we'll use chat completions API with system+user messages
    // as it provides better control than the plain completions API
    if (systemPrompt) {
      const messages: OpenAIChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];
      
      return this.generateChatCompletion(model, messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      })), options);
    }
    
    // If no system prompt is provided, use completions API
    const request: OpenAICompletionRequest = {
      model,
      prompt,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: false
    };
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/completions`,
        request,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const openAIResponse = response.data as OpenAICompletionResponse;
      
      return {
        content: openAIResponse.choices[0].text,
        usage: {
          promptTokens: openAIResponse.usage?.prompt_tokens,
          completionTokens: openAIResponse.usage?.completion_tokens,
          totalTokens: openAIResponse.usage?.total_tokens
        }
      };
    } catch (error) {
      console.error('LM Studio completion error:', error);
      throw new Error(`Failed to generate completion: ${error}`);
    }
  }
  
  /**
   * Generate chat completion using LM Studio
   */
  async generateChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    const openAIMessages: OpenAIChatMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const request: OpenAIChatCompletionRequest = {
      model,
      messages: openAIMessages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: false
    };
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        request,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const openAIResponse = response.data as OpenAIChatCompletionResponse;
      
      return {
        content: openAIResponse.choices[0].message.content,
        usage: {
          promptTokens: openAIResponse.usage?.prompt_tokens,
          completionTokens: openAIResponse.usage?.completion_tokens,
          totalTokens: openAIResponse.usage?.total_tokens
        }
      };
    } catch (error) {
      console.error('LM Studio chat completion error:', error);
      throw new Error(`Failed to generate chat completion: ${error}`);
    }
  }
  
  /**
   * Stream a text completion from LM Studio
   */
  async streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
  ): Promise<void> {
    // For system prompts, use the chat API
    if (systemPrompt) {
      const messages: LLMMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];
      
      return this.streamChatCompletion(model, messages, options, callback);
    }
    
    const request: OpenAICompletionRequest = {
      model,
      prompt,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: true
    };
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/completions`,
        request,
        { 
          headers: { 'Content-Type': 'application/json' },
          responseType: 'stream'
        }
      );
      
      const stream = response.data;
      let buffer = '';
      let contentSoFar = '';
      
      stream.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        buffer += chunkStr;
        
        // Process complete lines from the stream
        while (true) {
          const lineEndIndex = buffer.indexOf('\n');
          if (lineEndIndex === -1) {break;}
          
          const line = buffer.substring(0, lineEndIndex).trim();
          buffer = buffer.substring(lineEndIndex + 1);
          
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              if (callback) {
                callback({ content: contentSoFar, done: true });
              }
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices[0]?.text || '';
              contentSoFar += text;
              
              if (callback) {
                callback({ content: text, done: false });
              }
            } catch (e) {
              console.error('Failed to parse JSON:', e);
            }
          }
        }
      });
      
      return new Promise((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err: Error) => reject(err));
      });
    } catch (error) {
      console.error('LM Studio stream completion error:', error);
      throw new Error(`Failed to stream completion: ${error}`);
    }
  }
  
  /**
   * Stream a chat completion from LM Studio
   */
  async streamChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
  ): Promise<void> {
    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const request: OpenAIChatCompletionRequest = {
      model,
      messages: openAIMessages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: true
    };
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`, 
        request,
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'stream'
        }
      );
      
      const stream = response.data;
      let buffer = '';
      let contentSoFar = '';
      
      stream.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        buffer += chunkStr;
        
        // Process complete lines from the stream
        while (true) {
          const lineEndIndex = buffer.indexOf('\n');
          if (lineEndIndex === -1) {break;}
          
          const line = buffer.substring(0, lineEndIndex).trim();
          buffer = buffer.substring(lineEndIndex + 1);
          
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              if (callback) {
                callback({ content: contentSoFar, done: true });
              }
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                contentSoFar += content;
                
                if (callback) {
                  callback({ content, done: false });
                }
              }
            } catch (e) {
              console.error('Failed to parse JSON:', e);
            }
          }
        }
      });
      
      return new Promise((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err: Error) => reject(err));
      });
    } catch (error) {
      console.error('LM Studio stream chat completion error:', error);
      throw new Error(`Failed to stream chat completion: ${error}`);
    }
  }
}
