# LLM API Research

## Ollama API

Ollama provides a REST API for interacting with local LLMs:

- **Base URL**: http://localhost:11434/api
- **Key Endpoints**:
  - `/generate` - Generate text from a prompt (single completion)
  - `/chat` - Chat completion with message history
  - `/tags` - List available models

### Example Generate Request
```json
POST /api/generate
{
  "model": "llama2",
  "prompt": "Write a hello world program in JavaScript",
  "system": "You are a helpful coding assistant",
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Example Chat Request
```json
POST /api/chat
{
  "model": "llama2",
  "messages": [
    { "role": "system", "content": "You are a helpful coding assistant" },
    { "role": "user", "content": "Write a hello world program in JavaScript" }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 500
}
```

## LM Studio API

LM Studio provides an OpenAI-compatible API for interacting with local LLMs:

- **Base URL**: http://localhost:1234/v1 (default port)
- **Key Endpoints**:
  - `/chat/completions` - OpenAI-compatible chat completions
  - `/completions` - OpenAI-compatible text completions
  - `/models` - List available models

### Example Chat Completions Request
```json
POST /v1/chat/completions
{
  "model": "local-model",
  "messages": [
    { "role": "system", "content": "You are a helpful coding assistant" },
    { "role": "user", "content": "Write a hello world program in JavaScript" }
  ],
  "temperature": 0.7,
  "max_tokens": 500,
  "stream": false
}
```

### Key Differences and Considerations

1. **API Compatibility**: 
   - Ollama uses a custom API format
   - LM Studio follows the OpenAI API specification

2. **Authentication**:
   - Both APIs typically don't require authentication for local use
   - LM Studio accepts an API key header but doesn't validate it locally

3. **Streaming Support**:
   - Both APIs support streaming responses
   - Streaming format differs between the two
