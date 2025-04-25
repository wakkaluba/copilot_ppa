# Copilot PPA Architecture

This document describes the architectural design and key components of the Copilot PPA extension.

## Core Design Principles

1. **Type Safety**: We maintain strict TypeScript typing throughout the codebase to reduce runtime errors
2. **Single Source of Truth**: Common interfaces and types are defined in a single location
3. **Clean Deprecation Paths**: Deprecated code includes clear migration paths to newer implementations
4. **Error Handling**: Consistent error handling with proper typing

## Directory Structure

- `src/`: Main source code
  - `types/`: Shared type definitions
  - `models/`: Data models and interfaces
  - `services/`: Service implementations
  - `utils/`: Utility functions
  - `performance/`: Performance monitoring features
  - `debug/`: Debugging tools
  - `webview/`: VS Code webview implementation
  - `security/`: Security features

## Key Components

### Type Definitions

Central type definitions are located in `src/types/` directory. Key shared interfaces include:

- `ChatMessage`: Defined in `src/types/conversation.ts` - the central definition for chat messages
- `Conversation`: Defines conversation structure with messages
- `LogEntry` and `Logger`: Defined in `src/utils/logger.ts`

### Services

- `PerformanceManager`: Central management of performance monitoring (`src/performance/performanceManager.ts`)
- `ModelCompatibilityChecker`: Checks if models are compatible with system specifications

### Deprecated Components

The following components are deprecated but maintained for backward compatibility:

- `RuntimeAnalyzer`: Deprecated in favor of `PerformanceManager`. Includes forwarding methods to the new implementation.

## Interface Naming Conventions

We follow modern TypeScript naming conventions:

- Interface names do NOT use the "I" prefix (e.g., `Logger` instead of `ILogger`)
- Type names are descriptive of their purpose
- Enums use PascalCase

## Error Handling

- All functions with potential errors use proper error typing
- We use `unknown` instead of `any` for error types to ensure proper error checking
- Error logging is done through the `Logger` interface implementation

## Shared Types

To avoid duplicate type definitions, we've consolidated common interfaces:

1. `ChatMessage` interface is defined in `src/types/conversation.ts`
2. All files that previously defined their own `ChatMessage` interfaces now import from the central location
3. For specialized versions of shared interfaces, we use interface extension rather than redefinition

## Re-export Pattern

For backward compatibility, we use TypeScript re-exports:

```typescript
// Example: src/models/chat.ts
import { ChatMessage } from '../types/conversation';
export { ChatMessage };
```

This pattern allows existing code to continue importing from the old locations while using the consolidated type definitions.

## Utility Functions

Utility functions in `src/utils/common.ts` follow functional programming principles:

- Pure functions wherever possible
- Properly typed parameters and return values
- No side effects when not necessary

## Testing

- Unit tests for all major components
- Type-safe mock implementations of interfaces
- Comprehensive test coverage for critical services