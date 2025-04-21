# LLM System Configuration Guide

## Overview

The LLM system provides extensive configuration options for customizing provider settings, model parameters, and system behavior. This guide explains all available configuration options and how to use them.

## Configuration Structure

### 1. Provider Configuration
```typescript
interface ProviderConfig {
    // Provider selection
    provider: 'ollama' | 'lmstudio' | 'custom';
    
    // Active model configuration
    modelId: string;
    
    // Connection settings
    endpoint?: string;
    timeout?: number;
    maxRetries?: number;
    
    // Authentication (if needed)
    authToken?: string;
    apiKey?: string;
}
```

### 2. Model Configuration
```typescript
interface ModelConfig {
    // Model parameters
    contextLength: number;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stopSequences: string[];
    
    // Resource limits
    maxTokens: number;
    memoryLimit: number;
    
    // System prompts
    systemPrompt?: string;
    promptTemplate?: string;
}
```

### 3. System Configuration
```typescript
interface SystemConfig {
    // Resource management
    maxConcurrentRequests: number;
    maxQueueLength: number;
    cacheSize: number;
    cacheTTL: number;
    
    // Health checks
    healthCheckInterval: number;
    metricsCollectionInterval: number;
    
    // Feature flags
    enableStreaming: boolean;
    enableCache: boolean;
    enableOfflineMode: boolean;
    enableTelemetry: boolean;
}
```

## Configuration Management

### 1. VS Code Settings

Settings are managed through VS Code's configuration system:
```json
{
    "llm.provider": {
        "type": "ollama",
        "modelId": "llama2",
        "endpoint": "http://localhost:11434"
    },
    "llm.model": {
        "temperature": 0.7,
        "maxTokens": 2000,
        "contextLength": 4096
    },
    "llm.system": {
        "maxConcurrentRequests": 5,
        "cacheSize": 100,
        "enableStreaming": true
    }
}
```

### 2. Provider-specific Configuration

Each provider can have its own configuration schema:

#### Ollama
```json
{
    "llm.ollama": {
        "endpoint": "http://localhost:11434",
        "modelsPath": "~/.ollama/models",
        "timeout": 30000
    }
}
```

#### LM Studio
```json
{
    "llm.lmstudio": {
        "endpoint": "http://localhost:1234",
        "modelsPath": "~/LMStudio/models",
        "openaiCompatible": true
    }
}
```

## Configuration API

### 1. Reading Configuration
```typescript
class ConfigurationManager {
    getProviderConfig(): ProviderConfig {
        return vscode.workspace.getConfiguration('llm.provider');
    }
    
    getModelConfig(): ModelConfig {
        return vscode.workspace.getConfiguration('llm.model');
    }
    
    getSystemConfig(): SystemConfig {
        return vscode.workspace.getConfiguration('llm.system');
    }
}
```

### 2. Updating Configuration
```typescript
class ConfigurationManager {
    async updateProviderConfig(
        updates: Partial<ProviderConfig>
    ): Promise<void> {
        await vscode.workspace.getConfiguration('llm.provider')
            .update('', updates, vscode.ConfigurationTarget.Global);
    }
    
    async updateModelConfig(
        updates: Partial<ModelConfig>
    ): Promise<void> {
        await vscode.workspace.getConfiguration('llm.model')
            .update('', updates, vscode.ConfigurationTarget.Global);
    }
}
```

### 3. Configuration Validation
```typescript
class ConfigurationValidator {
    validateProviderConfig(config: ProviderConfig): ValidationResult {
        const errors: string[] = [];
        
        if (!config.provider) {
            errors.push('Provider type is required');
        }
        
        if (!config.modelId) {
            errors.push('Model ID is required');
        }
        
        if (config.timeout && config.timeout < 1000) {
            errors.push('Timeout must be at least 1000ms');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
```

## Configuration Events

### 1. Configuration Change Handling
```typescript
class ConfigurationManager {
    private readonly disposables: vscode.Disposable[] = [];
    
    constructor() {
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(
                this.handleConfigChange.bind(this)
            )
        );
    }
    
    private async handleConfigChange(
        event: vscode.ConfigurationChangeEvent
    ): Promise<void> {
        if (event.affectsConfiguration('llm')) {
            await this.reloadConfiguration();
        }
    }
}
```

### 2. Provider Updates
```typescript
class ProviderManager {
    async handleConfigurationChange(): Promise<void> {
        const config = this.configManager.getProviderConfig();
        
        if (this.shouldSwitchProvider(config)) {
            await this.switchProvider(config.provider);
        }
        
        if (this.shouldUpdateModel(config)) {
            await this.updateModel(config.modelId);
        }
    }
}
```

## Default Configuration

### 1. Provider Defaults
```typescript
const defaultProviderConfig: ProviderConfig = {
    provider: 'ollama',
    modelId: 'llama2',
    endpoint: 'http://localhost:11434',
    timeout: 30000,
    maxRetries: 3
};
```

### 2. Model Defaults
```typescript
const defaultModelConfig: ModelConfig = {
    contextLength: 4096,
    temperature: 0.7,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    stopSequences: [],
    maxTokens: 2000,
    memoryLimit: 4096
};
```

### 3. System Defaults
```typescript
const defaultSystemConfig: SystemConfig = {
    maxConcurrentRequests: 5,
    maxQueueLength: 100,
    cacheSize: 1000,
    cacheTTL: 3600,
    healthCheckInterval: 60000,
    metricsCollectionInterval: 5000,
    enableStreaming: true,
    enableCache: true,
    enableOfflineMode: false,
    enableTelemetry: true
};
```

## Best Practices

1. **Configuration Organization**
   - Use clear namespaces
   - Group related settings
   - Document all options
   - Provide sensible defaults

2. **Validation**
   - Validate all inputs
   - Provide clear error messages
   - Handle missing values
   - Check dependencies

3. **Updates**
   - Handle changes gracefully
   - Validate before applying
   - Notify affected components
   - Maintain state consistency

4. **Security**
   - Protect sensitive settings
   - Use secure storage
   - Validate authentication
   - Manage tokens safely

5. **Documentation**
   - Document all options
   - Provide examples
   - Explain dependencies
   - Update for changes