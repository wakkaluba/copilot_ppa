import { LLMProvider, LLMMessage, LLMRequestOptions, LLMResponse, LLMStreamEvent } from './llm-provider';
import axios from 'axios';
import { Config } from '../config';

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Implementation of the LLMProvider interface for Ollama
 */
export class OllamaProvider implements LLMProvider {
  readonly name = 'Ollama';
  private baseUrl: string;
  
  constructor(baseUrl = Config.ollamaApiUrl) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Check if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/tags`);
      return true;
    } catch (error) {
      console.error('Ollama not available:', error);
      return false;
    }
  }
  
  /**
   * Get available models from Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`);
      if (response.data && response.data.models) {
        return response.data.models.map((model: any) => model.name);
      }
      return [];
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      return [];
    }
  }
  
  /**
   * Generate text completion using Ollama
   */
  async generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    const request: OllamaGenerateRequest = {
      model,
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: options?.temperature,
        num_predict: options?.maxTokens
      }
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, request);
      const ollamaResponse = response.data as OllamaResponse;
      
      return {
        content: ollamaResponse.response,
        usage: {
          promptTokens: ollamaResponse.prompt_eval_duration ? Math.round(ollamaResponse.prompt_eval_duration) : undefined,
          completionTokens: ollamaResponse.eval_count,
          totalTokens: ollamaResponse.total_duration ? Math.round(ollamaResponse.total_duration) : undefined
        }
      };
    } catch (error) {
      console.error('Ollama completion error:', error);
      throw new Error(`Failed to generate completion: ${error}`);
    }
  }
  
  /**
   * Generate chat completion using Ollama
   */
  async generateChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions
  ): Promise<LLMResponse> {
    // Convert messages to Ollama format
    const ollamaMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const request: OllamaChatRequest = {
      model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: options?.temperature,
        num_predict: options?.maxTokens
      }
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/chat`, request);
      const ollamaResponse = response.data;
      
      return {
        content: ollamaResponse.message?.content || ollamaResponse.response,
        usage: {
          totalTokens: ollamaResponse.total_duration ? Math.round(ollamaResponse.total_duration) : undefined
        }
      };
    } catch (error) {
      console.error('Ollama chat completion error:', error);
      throw new Error(`Failed to generate chat completion: ${error}`);
    }
  }
  
  /**
   * Stream a text completion from Ollama
   */
  async streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
  ): Promise<void> {
    const request: OllamaGenerateRequest = {
      model,
      prompt,
      system: systemPrompt,
      stream: true,
      options: {
        temperature: options?.temperature,
        num_predict: options?.maxTokens
      }
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, request, {
        responseType: 'stream'
      });
      
      const stream = response.data;
      let buffer = '';
      
      stream.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        buffer += chunkStr;
        
        // Process complete JSON objects
        let boundary = 0;
        while (boundary !== -1) {
          boundary = buffer.indexOf('\n', boundary);
          if (boundary !== -1) {
            const jsonStr = buffer.substring(0, boundary).trim();
            buffer = buffer.substring(boundary + 1);
            boundary = 0;
            
            if (jsonStr) {
              try {
                const data = JSON.parse(jsonStr) as OllamaResponse;
                if (callback) {
                  callback({
                    content: data.response,
                    done: data.done
                  });
                }
              } catch (e) {
                console.error('Failed to parse JSON:', e);
              }
            }
          }
        }
      });
      
      return new Promise((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err: Error) => reject(err));
      });
    } catch (error) {
      console.error('Ollama stream completion error:', error);
      throw new Error(`Failed to stream completion: ${error}`);
    }
  }
  
  /**
   * Stream a chat completion from Ollama
   */
  async streamChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
  ): Promise<void> {
    // Convert messages to Ollama format
    const ollamaMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const request: OllamaChatRequest = {
      model,
      messages: ollamaMessages,
      stream: true,
      options: {
        temperature: options?.temperature,
        num_predict: options?.maxTokens
      }
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/chat`, request, {
        responseType: 'stream'
      });
      
      const stream = response.data;
      let buffer = '';
      
      stream.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        buffer += chunkStr;
        
        // Process complete JSON objects
        let boundary = 0;
        while (boundary !== -1) {
          boundary = buffer.indexOf('\n', boundary);
          if (boundary !== -1) {
            const jsonStr = buffer.substring(0, boundary).trim();
            buffer = buffer.substring(boundary + 1);
            boundary = 0;
            
            if (jsonStr) {
              try {
                const data = JSON.parse(jsonStr);
                if (callback) {
                  callback({
                    content: data.message?.content || data.response,
                    done: data.done
                  });
                }
              } catch (e) {
                console.error('Failed to parse JSON:', e);
              }
            }
          }
        }
      });
      
      return new Promise((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err: Error) => reject(err));
      });
    } catch (error) {
      console.error('Ollama stream chat completion error:', error);
      throw new Error(`Failed to stream chat completion: ${error}`);
    }
  }
}
