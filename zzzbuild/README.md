# Copilot PPA - Productivity and Performance Analyzer

![Coverage](https://img.shields.io/badge/Coverage-0.16%25-red)
[![CodeClimate](https://img.shields.io/badge/CodeClimate-pending-lightgrey?logo=code-climate)](https://codeclimate.com/)

> **Coverage Summary**
>
> | Metric      | Covered | Total | Percentage |
> |------------|---------|-------|------------|
> | Lines      | 5       | 3031  | 0.16%      |
> | Statements | 5       | 3126  | 0.15%      |
> | Functions  | 1       | 759   | 0.13%      |
> | Branches   | 2       | 975   | 0.20%      |
>
> _Generated from Jest/Istanbul coverage-summary.json_

A VS Code extension to analyze and improve productivity when using AI pair programming tools like GitHub Copilot.

## Features

- Analyze GitHub Copilot usage patterns
- Get LLM model recommendations based on your hardware
- Connect to local LLM providers like Ollama and LM Studio
- Optimize model selection for your specific hardware capabilities
- Monitor performance metrics for AI interactions

## Requirements

- VS Code 1.60.0 or higher
- For local LLM features:
  - [Ollama](https://ollama.ai/) or [LM Studio](https://lmstudio.ai/) running locally
  - Sufficient RAM/VRAM to run your selected models

## Commands

The extension provides several commands in the Command Palette (`Ctrl+Shift+P`):

- `Copilot PPA: Get LLM Model Recommendations` - Analyze your system and provide model recommendations
- `Copilot PPA: Check CUDA/GPU Support` - Check if your system has GPU acceleration available
- `Copilot PPA: Check LLM Model Compatibility` - Verify if your current model is compatible with your hardware

## Development

### Building the Extension

```bash
# Install dependencies
npm install

# Build the extension
npm run compile

# Watch for changes during development
npm run watch
```

### Testing

We have comprehensive unit and integration tests:

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests with coverage report
npm run test:coverage
```

#### Test Coverage Requirements

We maintain high test coverage standards:
- Minimum 80% statement coverage
- Minimum 80% branch coverage
- Minimum 80% function coverage
- Minimum 80% line coverage

### Continuous Integration

This project uses GitHub Actions for CI/CD:

- Automated builds and tests on every push and pull request
- Test coverage reports
- Automated VSIX package creation
- Deployment to VS Code Marketplace on releases

## Extension Settings

This extension contributes the following settings:

* `localLLM.provider`: The LLM provider to use ('ollama' or 'lmstudio')
* `localLLM.modelId`: The model ID to use for LLM operations
* `vscodeLocalLLMAgent.ollamaEndpoint`: The endpoint for the Ollama API (default: http://localhost:11434)
* `vscodeLocalLLMAgent.lmStudioEndpoint`: The endpoint for the LM Studio API (default: http://localhost:1234)

## Release Notes

### 0.1.0

Initial release of Copilot PPA:
- Basic integration with Ollama and LM Studio
- Model recommendation feature
- CUDA/GPU support detection
- Model compatibility checking
