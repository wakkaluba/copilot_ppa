# LLM System Error Handling Guide

## Error Handling

This document describes error handling strategies, patterns, and best practices for the project. See code and service documentation for implementation details.

---

## Overview

The LLM system implements a comprehensive error handling strategy across all layers. This guide explains the error handling patterns and best practices.

## Error Types

### 1. Provider Errors
```typescript
export class LLMProviderError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'LLMProviderError';
  }
}
```

### 2. Service Errors
```typescript
export class ServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ServiceError';
  }
}
```

### 3. Usage
- Always throw specific error types for domain errors.
- Use error codes for programmatic handling.
- Add context to error messages.
- Never silently swallow exceptions.

## Stubs and Fallbacks
- When a module is missing, export a stub that throws a meaningful error on use.
- Example:
```typescript
export class NotImplementedStub {
  static getInstance(): never {
    throw new ServiceError('This feature is not implemented.');
  }
}
```

## Best Practices
- Use try/catch for async operations.
- Log errors with context.
- Return user-friendly messages in UI.
- Document all thrown errors in JSDoc.

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
// LogLevel enum for consistent log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

// LogEntry interface for structured log records
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  code?: string;
  message: string;
  component: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// Logger interface for extensible logging
export interface Logger {
  log(entry: LogEntry): void;
  error(message: string, details?: unknown, code?: string): void;
  warn(message: string, details?: unknown, code?: string): void;
  info(message: string, details?: unknown, code?: string): void;
  debug(message: string, details?: unknown, code?: string): void;
}
```

Example implementation:

```typescript
function logError(error: Error, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date(),
    level: LogLevel.ERROR,
    code: getErrorCode(error),
    message: error.message,
    component: getComponent(),
    details: context,
    stack: error.stack
  };
  // Use your logger implementation here
  logger.log(entry);
  // Optionally, also output to console
  console.error(JSON.stringify(entry));
}
```

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
