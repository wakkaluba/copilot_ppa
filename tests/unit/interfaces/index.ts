/**
 * Main index file for interface tests
 * 
 * This file re-exports all interface test utilities and mock factories
 * to make them easier to import in test files.
 */

// LLM interfaces and utilities
export * from './llm/LLMPromptOptions.test';
export * from './llm/HardwareSpecs.test';

// Terminal interfaces and utilities
export * from './terminal/CommandAnalysis.test';
export * from './terminal/CommandGenerationResult.test';
export * from './terminal/CommandHistoryEntry.test';
export * from './terminal/CommandResult.test';
export * from './terminal/TerminalSession.test';

// Mock factories
export * from './mockFactories';