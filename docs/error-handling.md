# LLM System Error Handling Guide

## Overview

The LLM system implements a comprehensive error handling strategy across all layers. This guide explains the error handling patterns and best practices.

## Error Types

### 1. Provider Errors
```typescript
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
```

Common provider error codes:
- `CONNECTION_FAILED` - Failed to connect to provider
- `GENERATE_FAILED` - Text generation failed
- `CHAT_FAILED` - Chat completion failed
- `FETCH_MODELS_FAILED` - Failed to fetch model list
- `FETCH_MODEL_INFO_FAILED` - Failed to get model info
- `MODEL_NOT_FOUND` - Requested model not found
- `INVALID_REQUEST` - Invalid request parameters

### 2. Connection Errors
```typescript
export class LLMConnectionError extends Error {
    constructor(
        public readonly code: ConnectionErrorCode,
        message: string,
        public readonly details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'LLMConnectionError';
    }
}
```

Connection error codes:
- `CONNECTION_TIMEOUT` - Connection attempt timed out
- `CONNECTION_REFUSED` - Connection refused by host
- `HOST_UNREACHABLE` - Host not reachable
- `AUTHENTICATION_FAILED` - Failed to authenticate
- `NETWORK_ERROR` - Network-related errors

### 3. Resource Errors
```typescript
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
```

Resource types:
- Memory allocation
- Process limits
- File system access
- Model loading
- Cache storage

## Error Handling Patterns

### 1. Provider Level

```typescript
class CustomProvider extends BaseLLMProvider {
    protected handleError(error: unknown, code = 'UNKNOWN_ERROR'): never {
        // Convert to provider error
        const providerError = new LLMProviderError(
            code,
            this.formatErrorMessage(error),
            error
        );

        // Update provider status
        this.updateStatus({
            error: providerError.message,
            isAvailable: false
        });

        // Log error details
        console.error('Provider error:', {
            code: providerError.code,
            message: providerError.message,
            provider: this.name,
            cause: providerError.cause
        });

        // Emit error event
        this.emit('error', providerError);

        throw providerError;
    }

    private formatErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
```

### 2. Connection Level

```typescript
class ConnectionManager {
    private async handleConnectionError(error: unknown): Promise<void> {
        const connectionError = new LLMConnectionError(
            this.getErrorCode(error),
            this.getErrorMessage(error),
            this.getErrorDetails(error)
        );

        // Update connection state
        this.updateState({
            state: ConnectionState.ERROR,
            error: connectionError
        });

        // Attempt recovery
        await this.initiateErrorRecovery(connectionError);

        // Notify listeners
        this.emit('connectionError', connectionError);
    }

    private async initiateErrorRecovery(error: LLMConnectionError): Promise<void> {
        switch (error.code) {
            case 'CONNECTION_TIMEOUT':
                await this.handleTimeoutRecovery();
                break;
            case 'HOST_UNREACHABLE':
                await this.handleHostRecovery();
                break;
            // ... handle other cases
        }
    }
}
```

## Error Recovery Strategies

### 1. Automatic Retry
```typescript
async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!shouldRetry(error, options)) {
                throw error;
            }
            await delay(options.getDelay(attempt));
        }
    }

    throw lastError;
}
```

### 2. Circuit Breaker
```typescript
class CircuitBreaker {
    private failures = 0;
    private lastFailure?: Date;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.isOpen()) {
            throw new Error('Circuit breaker is open');
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
}
```

### 3. Fallback Mechanisms
```typescript
class LLMProvider {
    async generateWithFallback(
        prompt: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse> {
        try {
            return await this.generateCompletion(prompt, options);
        } catch (error) {
            if (this.offlineMode) {
                return this.useCachedResponse(prompt);
            }
            if (this.canUseFallbackModel(error)) {
                return this.generateWithFallbackModel(prompt, options);
            }
            throw error;
        }
    }
}
```

## Error Reporting

### 1. Structured Logging
```typescript
interface ErrorLog {
    timestamp: string;
    level: 'ERROR' | 'WARN' | 'INFO';
    code: string;
    message: string;
    component: string;
    details?: Record<string, unknown>;
    stack?: string;
    userId?: string; // Optional: user/session identifier
    requestId?: string; // Optional: trace request across services
    environment?: string; // e.g., 'production', 'development'
    tags?: string[]; // Optional: for categorization
}

function logError(
  error: Error,
  context?: Record<string, unknown>,
  options?: {
    userId?: string;
    requestId?: string;
    environment?: string;
    tags?: string[];
  }
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    code: getErrorCode(error),
    message: error.message,
    component: getComponent(),
    details: context,
    stack: error.stack,
    userId: options?.userId,
    requestId: options?.requestId,
    environment: options?.environment,
    tags: options?.tags
  };
  console.error(JSON.stringify(errorLog));
}
```

- **Best Practices:**
  - Always include `requestId` for distributed tracing if available.
  - Use `tags` for filtering/searching logs (e.g., `['auth', 'db']`).
  - Set `environment` to distinguish between production, staging, etc.
  - Attach `userId` or session info for user-related errors (respect privacy).

### 2. Telemetry
```typescript
class ErrorTelemetry {
    private static instance: ErrorTelemetry;
    private errors: Map<string, ErrorMetrics> = new Map();

    recordError(error: Error): void {
        const code = getErrorCode(error);
        const metrics = this.getOrCreateMetrics(code);
        metrics.count++;
        metrics.lastOccurrence = new Date();
        this.updateErrorRate(metrics);
    }

    private updateErrorRate(metrics: ErrorMetrics): void {
        const now = Date.now();
        const window = 60 * 1000; // 1 minute
        metrics.occurrences = metrics.occurrences.filter(
            time => now - time < window
        );
        metrics.occurrences.push(now);
        metrics.errorRate = metrics.occurrences.length / (window / 1000);
    }
}
```

## Best Practices

1. **Error Classification**
   - Use specific error types
   - Include error codes
   - Provide detailed messages
   - Preserve error context

2. **Recovery Strategies**
   - Implement automatic retries
   - Use circuit breakers
   - Provide fallback options
   - Handle offline scenarios

3. **Error Propagation**
   - Maintain error chains
   - Add context at each level
   - Use consistent error formats
   - Document error contracts

4. **Monitoring and Alerts**
   - Log all errors
   - Track error metrics
   - Set up alerts
   - Monitor error trends

5. **User Experience**
   - Show meaningful messages
   - Provide recovery options
   - Maintain system stability
   - Keep users informed
