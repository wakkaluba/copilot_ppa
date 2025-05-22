# LLM Provider Implementation Guide

## Overview

This guide explains how to implement a new LLM provider for the system. All providers must implement the `LLMProvider` interface and extend the `BaseLLMProvider` class for common functionality.

## Implementation Steps

### 1. Create Provider Class

```typescript
export class CustomProvider extends BaseLLMProvider {
    readonly name = 'Custom';

    constructor(options: CustomProviderOptions) {
        super();
        // Initialize provider-specific resources
    }
}
```

### 2. Implement Required Methods

#### Connection Management
```typescript
async isAvailable(): Promise<boolean> {
    // Check if the provider service is available
}

async connect(): Promise<void> {
    // Establish connection to the provider
}

async disconnect(): Promise<void> {
    // Clean up resources and disconnect
}
```

#### Model Management
```typescript
async getAvailableModels(): Promise<LLMModelInfo[]> {
    // Return list of available models
}

async getModelInfo(modelId: string): Promise<LLMModelInfo> {
    // Return information about a specific model
}
```

#### Text Generation
```typescript
async generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions
): Promise<LLMResponse> {
    // Generate text completion
}

async generateChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions
): Promise<LLMResponse> {
    // Generate chat completion
}
```

#### Streaming Support
```typescript
async streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
): Promise<void> {
    // Stream text completion
}

async streamChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void
): Promise<void> {
    // Stream chat completion
}
```

### 3. Error Handling

- Use the provider's error handling utilities:
```typescript
try {
  await provider.connect();
} catch (error) {
  // Handle connection error
  throw new ProviderConnectionError('Failed to connect to provider', error);
}
```
- Always provide meaningful error messages.
- Document all thrown errors in provider APIs.

### 4. Status Management

- Update provider status using the status management system:
```typescript
protected updateStatus(updates: Partial<LLMProviderStatus>): void {
    this.status = { ...this.status, ...updates };
    this.emit('statusChanged', this.status);
}
```

### 5. Provider Registration

Register the provider with the system:
```typescript
const provider = new CustomProvider(options);
LLMProviderManager.getInstance().registerProvider(provider);
```

## Best Practices

### 1. Resource Management
- Clean up resources in disconnect()
- Handle connection timeouts
- Implement proper error recovery

### 2. Model Handling
- Cache model information when possible
- Validate model compatibility
- Handle model loading errors

### 3. Request Options
- Support standard request options:
  - temperature
  - maxTokens
  - topP
  - presencePenalty
  - frequencyPenalty
  - stop sequences

### 4. Error Management
- Provide detailed error messages
- Include error codes
- Log errors appropriately
- Handle rate limits

### 5. Event Emission
- Emit status changes
- Emit error events
- Emit connection events
- Emit model change events

## Testing

### 1. Required Tests
- Connection management
- Model discovery
- Text generation
- Chat completion
- Streaming
- Error handling
- Event emission

### 2. Test Structure
```typescript
describe('CustomProvider', () => {
    let provider: CustomProvider;

    beforeEach(() => {
        provider = new CustomProvider(options);
    });

    describe('connection', () => {
        it('should connect successfully', async () => {
            // Test connection
        });
    });

    describe('models', () => {
        it('should list available models', async () => {
            // Test model listing
        });
    });

    describe('generation', () => {
        it('should generate completions', async () => {
            // Test text generation
        });
    });
});
```

## Example Provider

See `OllamaProvider` implementation for a complete example:
- `src/llm/ollama-provider.ts`
- Connection management
- API integration
- Streaming support
- Error handling
- Status updates
