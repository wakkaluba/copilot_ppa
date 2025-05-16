/**
 * LLM error types for provider, connection, and resource errors.
 * See docs/error-handling.md for usage patterns and best practices.
 */

/**
 * Error thrown by LLM providers (e.g., Ollama, LM Studio).
 */
export class LLMProviderError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'LLMProviderError';
  }
}

/**
 * Error thrown for LLM connection issues.
 */
export class LLMConnectionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LLMConnectionError';
  }
}

/**
 * Error thrown for resource-related failures (e.g., memory, disk).
 */
export class LLMResourceError extends Error {
  constructor(
    public readonly resource: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LLMResourceError';
  }
}

/**
 * Error thrown for configuration issues.
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly providerId: string,
    public readonly setting: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Error thrown when a provider fails in a generic way.
 */
export class ProviderError extends Error {
  constructor(message: string, public readonly providerId: string) {
    super(message);
    this.name = 'ProviderError';
  }
}

/**
 * Error thrown when a requested model is not found.
 */
export class ModelNotFoundError extends Error {
  constructor(modelId: string) {
    super(`Model ${modelId} not found`);
    this.name = 'ModelNotFoundError';
  }
}
