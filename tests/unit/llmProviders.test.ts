import { OllamaProvider } from '../../src/llm/ollama-provider';
import { LMStudioProvider } from '../../src/llm/lmstudio-provider';
import { LLMMessage } from '../../src/llm/llm-provider';
import axios from 'axios';
import { Readable } from 'stream';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LLM Providers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.get.mockResolvedValue({
            data: {
                models: ['llama2', 'codellama'],
                response: 'Test response',
                message: { content: 'Test response' },
                choices: [{ message: { content: 'Test response' } }]
            }
        });
        mockedAxios.post.mockResolvedValue({
            data: {
                response: 'Test response',
                message: { content: 'Test response' },
                choices: [{ message: { content: 'Test response' } }]
            }
        });
    });

    describe('OllamaProvider', () => {
        test('has correct name', () => {
            const provider = new OllamaProvider('http://localhost:11434');
            expect(provider.name).toBe('Ollama');
        });

        test('checks availability', async () => {
            const provider = new OllamaProvider('http://localhost:11434');
            const isAvailable = await provider.isAvailable();
            
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/tags');
            expect(isAvailable).toBe(true);
        });

        test('gets available models', async () => {
            const provider = new OllamaProvider('http://localhost:11434');
            const models = await provider.getAvailableModels();
            
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/tags');
            expect(Array.isArray(models)).toBe(true);
        });

        test('generates completion', async () => {
            const provider = new OllamaProvider('http://localhost:11434');
            const response = await provider.generateCompletion(
                'llama2',
                'Hello world',
                undefined,
                { temperature: 0.7 }
            );
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:11434/generate',
                {
                    model: 'llama2',
                    prompt: 'Hello world',
                    system: undefined,
                    options: {
                        temperature: 0.7,
                        num_predict: undefined
                    },
                    stream: false
                }
            );
            expect(response.content).toBe('Test response');
        });

        test('generates chat completion', async () => {
            const provider = new OllamaProvider('http://localhost:11434');
            const messages: LLMMessage[] = [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there!' }
            ];
            const response = await provider.generateChatCompletion(
                'llama2',
                messages,
                { temperature: 0.7 }
            );
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:11434/chat',
                {
                    messages,
                    model: 'llama2',
                    options: {
                        temperature: 0.7,
                        num_predict: undefined
                    },
                    stream: false
                }
            );
            expect(response.content).toBe('Test response');
        });

        test('streams completion', async () => {
            const provider = new OllamaProvider('http://localhost:11434');
            const events: { content: string, done: boolean }[] = [];
            
            // Create a proper readable stream
            const mockStream = new Readable({
                read() {} // No-op since we'll push data manually
            });

            mockedAxios.post.mockResolvedValueOnce({
                data: mockStream
            });

            // Start the streaming operation
            const streamPromise = provider.streamCompletion(
                'llama2',
                'Hello world',
                undefined,
                { temperature: 0.7 },
                (event) => events.push(event)
            );

            // Simulate streaming data
            mockStream.push(JSON.stringify({ response: 'Test', done: false }) + '\n');
            mockStream.push(JSON.stringify({ response: ' response', done: true }) + '\n');
            mockStream.push(null); // End the stream

            await streamPromise;
            
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:11434/generate',
                {
                    model: 'llama2',
                    prompt: 'Hello world',
                    system: undefined,
                    options: {
                        temperature: 0.7,
                        num_predict: undefined
                    },
                    stream: true
                },
                { responseType: 'stream' }
            );
            expect(events).toEqual([
                { content: 'Test', done: false },
                { content: ' response', done: true }
            ]);
        });

        test('streams chat completion', async () => {
            const provider = new OllamaProvider('http://localhost:11434');
            const messages: LLMMessage[] = [
                { role: 'user', content: 'Hello' }
            ];
            const events: { content: string, done: boolean }[] = [];
            
            // Create a proper readable stream
            const mockStream = new Readable({
                read() {} // No-op since we'll push data manually
            });

            mockedAxios.post.mockResolvedValueOnce({
                data: mockStream
            });

            // Start the streaming operation
            const streamPromise = provider.streamChatCompletion(
                'llama2',
                messages,
                { temperature: 0.7 },
                (event) => events.push(event)
            );

            // Simulate streaming data
            mockStream.push(JSON.stringify({ message: { content: 'Test' }, done: false }) + '\n');
            mockStream.push(JSON.stringify({ message: { content: ' response' }, done: true }) + '\n');
            mockStream.push(null); // End the stream

            await streamPromise;
            
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:11434/chat',
                {
                    messages,
                    model: 'llama2',
                    options: {
                        temperature: 0.7,
                        num_predict: undefined
                    },
                    stream: true
                },
                { responseType: 'stream' }
            );
            expect(events).toEqual([
                { content: 'Test', done: false },
                { content: ' response', done: true }
            ]);
        });

        test('handles errors gracefully', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed'));
            
            const provider = new OllamaProvider('http://localhost:11434');
            await expect(provider.isAvailable()).resolves.toBe(false);
        });
    });

    describe('LMStudioProvider', () => {
        test('has correct name', () => {
            const provider = new LMStudioProvider('http://localhost:1234');
            expect(provider.name).toBe('LM Studio');
        });

        test('checks availability', async () => {
            const provider = new LMStudioProvider('http://localhost:1234');
            const isAvailable = await provider.isAvailable();
            
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/models');
            expect(isAvailable).toBe(true);
        });

        test('gets available models', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    data: [
                        { id: 'model1' },
                        { id: 'model2' }
                    ]
                }
            });

            const provider = new LMStudioProvider('http://localhost:1234');
            const models = await provider.getAvailableModels();
            
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/models');
            expect(models).toEqual(['model1', 'model2']);
        });

        test('falls back to default model when models list fails', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Failed to get models'));

            const provider = new LMStudioProvider('http://localhost:1234');
            const models = await provider.getAvailableModels();
            
            expect(models).toEqual(['local-model']);
        });

        test('generates completion', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    choices: [{ text: 'Test response' }],
                    usage: {
                        prompt_tokens: 10,
                        completion_tokens: 5,
                        total_tokens: 15
                    }
                }
            });

            const provider = new LMStudioProvider('http://localhost:1234');
            const response = await provider.generateCompletion(
                'model1',
                'Hello world',
                undefined,
                { temperature: 0.7 }
            );
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:1234/completions',
                {
                    model: 'model1',
                    prompt: 'Hello world',
                    temperature: 0.7,
                    max_tokens: undefined,
                    stream: false
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            expect(response.content).toBe('Test response');
            expect(response.usage).toEqual({
                promptTokens: 10,
                completionTokens: 5,
                totalTokens: 15
            });
        });

        test('generates chat completion', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    choices: [{
                        message: { content: 'Test response' }
                    }],
                    usage: {
                        prompt_tokens: 10,
                        completion_tokens: 5,
                        total_tokens: 15
                    }
                }
            });

            const provider = new LMStudioProvider('http://localhost:1234');
            const messages: LLMMessage[] = [
                { role: 'user', content: 'Hello' }
            ];
            const response = await provider.generateChatCompletion(
                'model1',
                messages,
                { temperature: 0.7 }
            );
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:1234/chat/completions',
                {
                    model: 'model1',
                    messages: [{ role: 'user', content: 'Hello' }],
                    temperature: 0.7,
                    max_tokens: undefined,
                    stream: false
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            expect(response.content).toBe('Test response');
            expect(response.usage).toEqual({
                promptTokens: 10,
                completionTokens: 5,
                totalTokens: 15
            });
        });

        test('streams completion', async () => {
            const provider = new LMStudioProvider('http://localhost:1234');
            const events: { content: string, done: boolean }[] = [];
            
            // Create a proper readable stream
            const mockStream = new Readable({
                read() {} // No-op since we'll push data manually
            });

            mockedAxios.post.mockResolvedValueOnce({
                data: mockStream
            });

            // Start the streaming operation
            const streamPromise = provider.streamCompletion(
                'model1',
                'Hello world',
                undefined,
                { temperature: 0.7 },
                (event) => events.push(event)
            );

            // Simulate streaming SSE data
            mockStream.push('data: {"choices":[{"text":"Test"}]}\n\n');
            mockStream.push('data: {"choices":[{"text":" response"}]}\n\n');
            mockStream.push('data: [DONE]\n\n');
            mockStream.push(null); // End the stream

            await streamPromise;
            
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:1234/completions',
                {
                    model: 'model1',
                    prompt: 'Hello world',
                    temperature: 0.7,
                    max_tokens: undefined,
                    stream: true
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    responseType: 'stream'
                }
            );
            expect(events).toEqual([
                { content: 'Test', done: false },
                { content: ' response', done: false },
                { content: 'Test response', done: true }
            ]);
        });

        test('streams chat completion', async () => {
            const provider = new LMStudioProvider('http://localhost:1234');
            const messages: LLMMessage[] = [
                { role: 'user', content: 'Hello' }
            ];
            const events: { content: string, done: boolean }[] = [];
            
            // Create a proper readable stream
            const mockStream = new Readable({
                read() {} // No-op since we'll push data manually
            });

            mockedAxios.post.mockResolvedValueOnce({
                data: mockStream
            });

            // Start the streaming operation
            const streamPromise = provider.streamChatCompletion(
                'model1',
                messages,
                { temperature: 0.7 },
                (event) => events.push(event)
            );

            // Simulate streaming SSE data
            mockStream.push('data: {"choices":[{"delta":{"content":"Test"}}]}\n\n');
            mockStream.push('data: {"choices":[{"delta":{"content":" response"}}]}\n\n');
            mockStream.push('data: [DONE]\n\n');
            mockStream.push(null); // End the stream

            await streamPromise;
            
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:1234/chat/completions',
                {
                    model: 'model1',
                    messages: [{ role: 'user', content: 'Hello' }],
                    temperature: 0.7,
                    max_tokens: undefined,
                    stream: true
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    responseType: 'stream'
                }
            );
            expect(events).toEqual([
                { content: 'Test', done: false },
                { content: ' response', done: false },
                { content: 'Test response', done: true }
            ]);
        });

        test('handles errors gracefully', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed'));
            
            const provider = new LMStudioProvider('http://localhost:1234');
            await expect(provider.isAvailable()).resolves.toBe(false);
        });

        test('handles completion with system prompt', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    choices: [{
                        message: { content: 'Test response' }
                    }],
                    usage: {
                        prompt_tokens: 15,
                        completion_tokens: 5,
                        total_tokens: 20
                    }
                }
            });

            const provider = new LMStudioProvider('http://localhost:1234');
            const response = await provider.generateCompletion(
                'model1',
                'Hello world',
                'You are a helpful assistant',
                { temperature: 0.7 }
            );
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:1234/chat/completions',
                {
                    model: 'model1',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant' },
                        { role: 'user', content: 'Hello world' }
                    ],
                    temperature: 0.7,
                    max_tokens: undefined,
                    stream: false
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            expect(response.content).toBe('Test response');
            expect(response.usage).toEqual({
                promptTokens: 15,
                completionTokens: 5,
                totalTokens: 20
            });
        });

        test('handles rate limiting gracefully', async () => {
            mockedAxios.post.mockRejectedValueOnce({ 
                response: { 
                    status: 429, 
                    data: { error: 'Rate limit exceeded' } 
                }
            });
                
            const provider = new LMStudioProvider('http://localhost:1234');
            await expect(provider.generateCompletion(
                'model1',
                'Hello world',
                undefined,
                { temperature: 0.7 }
            )).rejects.toThrow('Rate limit exceeded');
        });

        test('handles large responses efficiently', async () => {
            const largeResponse = {
                choices: [{
                    message: { content: 'A'.repeat(1000000) } // 1MB response
                }],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 500000,
                    total_tokens: 500010
                }
            };

            mockedAxios.post.mockResolvedValueOnce({ data: largeResponse });
            
            const provider = new LMStudioProvider('http://localhost:1234');
            const startHeap = process.memoryUsage().heapUsed;
            
            const response = await provider.generateChatCompletion(
                'model1',
                [{ role: 'user', content: 'Generate large response' }],
                { temperature: 0.7 }
            );
            
            const endHeap = process.memoryUsage().heapUsed;
            const heapIncrease = endHeap - startHeap;
            
            // Response should be received correctly
            expect(response.content).toHaveLength(1000000);
            
            // Memory increase should be reasonable (less than 5MB overhead)
            expect(heapIncrease).toBeLessThan(5 * 1024 * 1024);
        });

        test('handles streaming timeout gracefully', async () => {
            const provider = new LMStudioProvider('http://localhost:1234');
            const mockStream = new Readable({
                read() {} // No-op since we'll push data manually
            });

            mockedAxios.post.mockResolvedValueOnce({
                data: mockStream
            });

            const streamPromise = provider.streamCompletion(
                'model1',
                'Hello world',
                undefined,
                { temperature: 0.7 },
                () => {}
            );

            // Simulate timeout by not sending any data
            await expect(Promise.race([
                streamPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
            ])).rejects.toThrow('Timeout');
        });

        test('handles malformed streaming responses', async () => {
            const provider = new LMStudioProvider('http://localhost:1234');
            const mockStream = new Readable({
                read() {} // No-op since we'll push data manually
            });

            mockedAxios.post.mockResolvedValueOnce({
                data: mockStream
            });

            const events: { content: string, done: boolean }[] = [];
            const streamPromise = provider.streamCompletion(
                'model1',
                'Hello world',
                undefined,
                { temperature: 0.7 },
                (event) => events.push(event)
            );

            // Push malformed data
            mockStream.push('data: {invalid json}\n\n');
            mockStream.push('data: [DONE]\n\n');
            mockStream.push(null);

            await streamPromise;
            expect(events.length).toBe(1);
            expect(events[0]).toEqual({ content: '', done: true });
        });
    });
});
