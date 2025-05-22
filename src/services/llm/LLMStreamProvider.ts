import { EventEmitter } from 'events';
import { LLMProviderError } from './errors';

/**
 * Chunk of text from a streaming LLM response
 */
export interface LLMStreamChunk {
  content: string;
  done: boolean;
  [key: string]: any;
}

/**
 * Events emitted by the stream provider
 */
export interface LLMStreamEvents {
  data: (chunk: LLMStreamChunk) => void;
  error: (error: Error) => void;
  end: (finalText: string) => void;
}

/**
 * Provider for handling streaming LLM responses
 */
export class LLMStreamProvider extends EventEmitter {
  private readonly streamProcessor: any; // TODO: Replace 'any' with actual type
  private readonly chunkExtractor: any; // TODO: Replace 'any' with actual type
  private readonly streamManager: any; // TODO: Replace 'any' with actual type
  private readonly connectionManager: any; // TODO: Replace 'any' with actual type

  /**
   * Streams a message to the LLM and emits data events as chunks arrive.
   * @throws {LLMProviderError} If not implemented.
   */
  public async streamMessage(/* payload: LLMMessagePayload, config?: Partial<LLMSessionConfig> */): Promise<void> {
    throw new LLMProviderError(
      'NOT_IMPLEMENTED',
      'LLMStreamProvider.streamMessage not implemented',
    );
  }

  /**
   * Aborts the current stream.
   * @throws {LLMProviderError} If not implemented.
   */
  public abort(): void {
    throw new LLMProviderError('NOT_IMPLEMENTED', 'LLMStreamProvider.abort not implemented');
  }

  public override on(event: 'data', listener: (chunk: LLMStreamChunk) => void): this;
  public override on(event: 'error', listener: (error: Error) => void): this;
  public override on(event: 'end', listener: (finalText: string) => void): this;
  public override on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public override once(event: 'data', listener: (chunk: LLMStreamChunk) => void): this;
  public override once(event: 'error', listener: (error: Error) => void): this;
  public override once(event: 'end', listener: (finalText: string) => void): this;
  public override once(event: string, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
}
