import { ConfigurationError, LLMProviderError } from './errors';

/**
 * Factory for accessing LLM services
 */
export class LLMFactory {
  /**
   * Gets the singleton instance of LLMFactory.
   * @throws {ConfigurationError} If the factory is not implemented.
   */
  public static getInstance(/* options: Partial<LLMFactoryOptions> = {} */): LLMFactory {
    throw new ConfigurationError(
      'LLMFactory.getInstance not implemented',
      'LLMFactory',
      'getInstance',
    );
  }
  /**
   * Gets the connection manager.
   * @throws {LLMProviderError} If not implemented.
   */
  public getConnectionManager(): never {
    throw new LLMProviderError(
      'NOT_IMPLEMENTED',
      'LLMFactory.getConnectionManager not implemented',
    );
  }
  /**
   * Gets the host manager.
   * @throws {LLMProviderError} If not implemented.
   */
  public getHostManager(): never {
    throw new LLMProviderError('NOT_IMPLEMENTED', 'LLMFactory.getHostManager not implemented');
  }
  /**
   * Gets the session manager.
   * @throws {LLMProviderError} If not implemented.
   */
  public getSessionManager(): never {
    throw new LLMProviderError('NOT_IMPLEMENTED', 'LLMFactory.getSessionManager not implemented');
  }
  /**
   * Creates a stream provider.
   * @throws {LLMProviderError} If not implemented.
   */
  public createStreamProvider(/* endpoint?: string */): never {
    throw new LLMProviderError(
      'NOT_IMPLEMENTED',
      'LLMFactory.createStreamProvider not implemented',
    );
  }
  /**
   * Initializes the factory.
   * @throws {LLMProviderError} If not implemented.
   */
  public async initialize(): Promise<void> {
    throw new LLMProviderError('NOT_IMPLEMENTED', 'LLMFactory.initialize not implemented');
  }
  /**
   * Disposes the factory.
   * @throws {LLMProviderError} If not implemented.
   */
  public dispose(): never {
    throw new LLMProviderError('NOT_IMPLEMENTED', 'LLMFactory.dispose not implemented');
  }
}
