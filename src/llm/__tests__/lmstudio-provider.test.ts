import axios from 'axios';
import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';
import { Config } from '../../config';
import { LLMMessage } from '../../llm/llm-provider';
import { LMStudioProvider } from '../../llm/lmstudio-provider';

describe('LMStudioProvider', () => {
    let lmStudioProvider: LMStudioProvider;
    let axiosStub: sinon.SinonStub;
    const testUrl = 'http://test-lmstudio-api';

    beforeEach(() => {
        // Stub the axios methods we'll use
        axiosStub = sinon.stub(axios, 'post');
        sinon.stub(axios, 'get');

        // Create provider instance with test URL
        lmStudioProvider = new LMStudioProvider(testUrl);
    });

    afterEach(() => {
        // Restore all stubs
        sinon.restore();
    });

    describe('constructor', () => {
        it('should initialize with the provided base URL', () => {
            expect(lmStudioProvider.baseUrl).to.equal(testUrl);
        });

        it('should use the default URL from Config if none provided', () => {
            // Stub the Config object
            const configStub = sinon.stub(Config, 'lmStudioApiUrl').value('http://default-url');

            // Create new provider instance without URL parameter
            const defaultProvider = new LMStudioProvider();

            expect(defaultProvider.baseUrl).to.equal('http://default-url');
        });

        it('should have the correct provider name', () => {
            expect(lmStudioProvider.name).to.equal('LM Studio');
        });
    });

    describe('isAvailable', () => {
        it('should return true when LM Studio API is available', async () => {
            // Stub successful API response
            (axios.get as sinon.SinonStub).resolves({ data: {} });

            const result = await lmStudioProvider.isAvailable();

            expect(result).to.be.true;
            expect((axios.get as sinon.SinonStub).calledWith(`${testUrl}/models`)).to.be.true;
        });

        it('should return false when LM Studio API is not available', async () => {
            // Stub failed API response
            (axios.get as sinon.SinonStub).rejects(new Error('Connection failed'));

            const result = await lmStudioProvider.isAvailable();

            expect(result).to.be.false;
            expect((axios.get as sinon.SinonStub).calledWith(`${testUrl}/models`)).to.be.true;
        });
    });

    describe('getAvailableModels', () => {
        it('should return list of models from API', async () => {
            // Stub successful API response with models
            (axios.get as sinon.SinonStub).resolves({
                data: {
                    data: [
                        { id: 'model1', name: 'Model One' },
                        { id: 'model2', name: 'Model Two' }
                    ]
                }
            });

            const models = await lmStudioProvider.getAvailableModels();

            expect(models).to.deep.equal(['model1', 'model2']);
            expect((axios.get as sinon.SinonStub).calledWith(`${testUrl}/models`)).to.be.true;
        });

        it('should return default model when API returns no models', async () => {
            // Stub API response with empty or invalid data
            (axios.get as sinon.SinonStub).resolves({
                data: {}
            });

            const models = await lmStudioProvider.getAvailableModels();

            expect(models).to.deep.equal(['local-model']);
        });

        it('should return default model when API call fails', async () => {
            // Stub failed API response
            (axios.get as sinon.SinonStub).rejects(new Error('Failed to get models'));

            const models = await lmStudioProvider.getAvailableModels();

            expect(models).to.deep.equal(['local-model']);
        });
    });

    describe('generateCompletion', () => {
        it('should call generateChatCompletion when system prompt is provided', async () => {
            // Create spy on generateChatCompletion
            const chatCompletionSpy = sinon.spy(lmStudioProvider, 'generateChatCompletion');

            // Stub successful chat completion response
            const mockResponse = {
                content: 'Generated response',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            };

            chatCompletionSpy.resolves(mockResponse);

            const result = await lmStudioProvider.generateCompletion(
                'test-model',
                'Test prompt',
                'System instructions',
                { temperature: 0.7 }
            );

            expect(result).to.deep.equal(mockResponse);
            expect(chatCompletionSpy.calledOnce).to.be.true;

            // Verify the correct parameters were passed
            const expectedMessages: LLMMessage[] = [
                { role: 'system', content: 'System instructions' },
                { role: 'user', content: 'Test prompt' }
            ];

            expect(chatCompletionSpy.firstCall.args[0]).to.equal('test-model');
            expect(chatCompletionSpy.firstCall.args[1]).to.deep.equal(expectedMessages);
            expect(chatCompletionSpy.firstCall.args[2]).to.deep.equal({ temperature: 0.7 });
        });

        it('should generate text completion when no system prompt is provided', async () => {
            // Stub successful API response
            const mockResponse = {
                id: 'cmpl-test123',
                object: 'text_completion',
                created: 1677858242,
                model: 'test-model',
                choices: [
                    {
                        text: 'Generated text',
                        index: 0,
                        finish_reason: 'stop'
                    }
                ],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 20,
                    total_tokens: 30
                }
            };

            axiosStub.resolves({ data: mockResponse });

            const result = await lmStudioProvider.generateCompletion(
                'test-model',
                'Test prompt',
                undefined,
                { temperature: 0.7, maxTokens: 100 }
            );

            expect(result).to.deep.equal({
                content: 'Generated text',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            });

            // Verify the correct request was made
            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equal(`${testUrl}/completions`);
            expect(axiosStub.firstCall.args[1]).to.deep.equal({
                model: 'test-model',
                prompt: 'Test prompt',
                temperature: 0.7,
                max_tokens: 100,
                stream: false
            });
        });

        it('should handle errors during text completion', async () => {
            // Stub failed API response
            axiosStub.rejects(new Error('API error'));

            try {
                await lmStudioProvider.generateCompletion('test-model', 'Test prompt');
                expect.fail('Expected method to throw');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect((error as Error).message).to.include('Failed to generate completion');
            }
        });
    });

    describe('generateChatCompletion', () => {
        it('should generate chat completion successfully', async () => {
            // Stub successful API response
            const mockResponse = {
                id: 'chatcmpl-test123',
                object: 'chat.completion',
                created: 1677858242,
                model: 'test-model',
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: 'Generated chat response'
                        },
                        finish_reason: 'stop'
                    }
                ],
                usage: {
                    prompt_tokens: 15,
                    completion_tokens: 25,
                    total_tokens: 40
                }
            };

            axiosStub.resolves({ data: mockResponse });

            const messages: LLMMessage[] = [
                { role: 'system', content: 'You are a helpful assistant' },
                { role: 'user', content: 'Hello, how are you?' }
            ];

            const result = await lmStudioProvider.generateChatCompletion(
                'test-model',
                messages,
                { temperature: 0.8, maxTokens: 150 }
            );

            expect(result).to.deep.equal({
                content: 'Generated chat response',
                usage: {
                    promptTokens: 15,
                    completionTokens: 25,
                    totalTokens: 40
                }
            });

            // Verify the correct request was made
            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equal(`${testUrl}/chat/completions`);
            expect(axiosStub.firstCall.args[1]).to.deep.equal({
                model: 'test-model',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant' },
                    { role: 'user', content: 'Hello, how are you?' }
                ],
                temperature: 0.8,
                max_tokens: 150,
                stream: false
            });
        });

        it('should handle errors during chat completion', async () => {
            // Stub failed API response
            axiosStub.rejects(new Error('Chat API error'));

            const messages: LLMMessage[] = [
                { role: 'user', content: 'Hello' }
            ];

            try {
                await lmStudioProvider.generateChatCompletion('test-model', messages);
                expect.fail('Expected method to throw');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect((error as Error).message).to.include('Failed to generate chat completion');
            }
        });
    });

    describe('streamCompletion', () => {
        it('should call streamChatCompletion when system prompt is provided', async () => {
            // Create spy on streamChatCompletion
            const streamChatSpy = sinon.spy(lmStudioProvider, 'streamChatCompletion');

            // Mock implementation to resolve immediately
            streamChatSpy.resolves();

            const callback = sinon.spy();

            await lmStudioProvider.streamCompletion(
                'test-model',
                'Test prompt',
                'System instructions',
                { temperature: 0.7 },
                callback
            );

            expect(streamChatSpy.calledOnce).to.be.true;

            // Verify the correct parameters were passed
            const expectedMessages: LLMMessage[] = [
                { role: 'system', content: 'System instructions' },
                { role: 'user', content: 'Test prompt' }
            ];

            expect(streamChatSpy.firstCall.args[0]).to.equal('test-model');
            expect(streamChatSpy.firstCall.args[1]).to.deep.equal(expectedMessages);
            expect(streamChatSpy.firstCall.args[2]).to.deep.equal({ temperature: 0.7 });
            expect(streamChatSpy.firstCall.args[3]).to.equal(callback);
        });

        it('should stream text completion when no system prompt is provided', async () => {
            // Mock the stream behavior
            const mockStream = {
                on: sinon.stub()
            };

            // Setup stream event handlers
            const dataHandler = sinon.stub();
            const endHandler = sinon.stub();
            const errorHandler = sinon.stub();

            mockStream.on.withArgs('data').callsFake((event: string, handler: (chunk: Buffer) => void) => {
                dataHandler.callsFake(handler);
                return mockStream;
            });

            mockStream.on.withArgs('end').callsFake((event: string, handler: () => void) => {
                endHandler.callsFake(handler);
                return mockStream;
            });

            mockStream.on.withArgs('error').callsFake((event: string, handler: (err: Error) => void) => {
                errorHandler.callsFake(handler);
                return mockStream;
            });

            // Stub axios to return mock stream
            axiosStub.resolves({ data: mockStream });

            const callback = sinon.spy();

            // Start streaming
            const streamPromise = lmStudioProvider.streamCompletion(
                'test-model',
                'Test prompt',
                undefined,
                { temperature: 0.7 },
                callback
            );

            // Verify the correct request was made
            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equal(`${testUrl}/completions`);
            expect(axiosStub.firstCall.args[1]).to.deep.equal({
                model: 'test-model',
                prompt: 'Test prompt',
                temperature: 0.7,
                max_tokens: undefined,
                stream: true
            });

            // Simulate receiving data chunks
            dataHandler(Buffer.from('data: {"choices":[{"text":"Hello","index":0}]}\n\n'));
            dataHandler(Buffer.from('data: {"choices":[{"text":" world","index":0}]}\n\n'));
            dataHandler(Buffer.from('data: [DONE]\n\n'));

            // Complete the stream
            endHandler();

            // Wait for streaming to complete
            await streamPromise;

            // Verify callback was called with correct data
            expect(callback.calledThrice).to.be.true;
            expect(callback.firstCall.args[0]).to.deep.equal({ content: 'Hello', done: false });
            expect(callback.secondCall.args[0]).to.deep.equal({ content: ' world', done: false });
            expect(callback.thirdCall.args[0]).to.deep.equal({ content: 'Hello world', done: true });
        });

        it('should handle errors during text completion streaming', async () => {
            // Stub failed API response
            axiosStub.rejects(new Error('Streaming API error'));

            try {
                await lmStudioProvider.streamCompletion('test-model', 'Test prompt');
                expect.fail('Expected method to throw');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect((error as Error).message).to.include('Failed to stream completion');
            }
        });
    });

    describe('streamChatCompletion', () => {
        it('should stream chat completion', async () => {
            // Mock the stream behavior
            const mockStream = {
                on: sinon.stub()
            };

            // Setup stream event handlers
            const dataHandler = sinon.stub();
            const endHandler = sinon.stub();
            const errorHandler = sinon.stub();

            mockStream.on.withArgs('data').callsFake((event: string, handler: (chunk: Buffer) => void) => {
                dataHandler.callsFake(handler);
                return mockStream;
            });

            mockStream.on.withArgs('end').callsFake((event: string, handler: () => void) => {
                endHandler.callsFake(handler);
                return mockStream;
            });

            mockStream.on.withArgs('error').callsFake((event: string, handler: (err: Error) => void) => {
                errorHandler.callsFake(handler);
                return mockStream;
            });

            // Stub axios to return mock stream
            axiosStub.resolves({ data: mockStream });

            const callback = sinon.spy();
            const messages: LLMMessage[] = [
                { role: 'system', content: 'You are a helpful assistant' },
                { role: 'user', content: 'Tell me a joke' }
            ];

            // Start streaming
            const streamPromise = lmStudioProvider.streamChatCompletion(
                'test-model',
                messages,
                { temperature: 0.8 },
                callback
            );

            // Verify the correct request was made
            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equal(`${testUrl}/chat/completions`);
            expect(axiosStub.firstCall.args[1]).to.deep.equal({
                model: 'test-model',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant' },
                    { role: 'user', content: 'Tell me a joke' }
                ],
                temperature: 0.8,
                max_tokens: undefined,
                stream: true
            });

            // Simulate receiving data chunks - delta format for chat
            dataHandler(Buffer.from('data: {"choices":[{"delta":{"content":"Why"}}]}\n\n'));
            dataHandler(Buffer.from('data: {"choices":[{"delta":{"content":" did"}}]}\n\n'));
            dataHandler(Buffer.from('data: {"choices":[{"delta":{"content":" the"}}]}\n\n'));
            dataHandler(Buffer.from('data: {"choices":[{"delta":{"content":" chicken"}}]}\n\n'));
            dataHandler(Buffer.from('data: [DONE]\n\n'));

            // Complete the stream
            endHandler();

            // Wait for streaming to complete
            await streamPromise;

            // Verify callback was called with correct data
            expect(callback.callCount).to.equal(5);
            expect(callback.getCall(0).args[0]).to.deep.equal({ content: 'Why', done: false });
            expect(callback.getCall(1).args[0]).to.deep.equal({ content: ' did', done: false });
            expect(callback.getCall(2).args[0]).to.deep.equal({ content: ' the', done: false });
            expect(callback.getCall(3).args[0]).to.deep.equal({ content: ' chicken', done: false });
            expect(callback.getCall(4).args[0]).to.deep.equal({ content: 'Why did the chicken', done: true });
        });

        it('should handle malformed data in the stream', async () => {
            // Mock the stream behavior
            const mockStream = {
                on: sinon.stub()
            };

            // Setup stream event handlers
            const dataHandler = sinon.stub();
            mockStream.on.withArgs('data').callsFake((event: string, handler: (chunk: Buffer) => void) => {
                dataHandler.callsFake(handler);
                return mockStream;
            });

            mockStream.on.withArgs('end').returns(mockStream);
            mockStream.on.withArgs('error').returns(mockStream);

            // Stub axios to return mock stream
            axiosStub.resolves({ data: mockStream });

            const callback = sinon.spy();
            const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];

            // Start streaming
            const streamPromise = lmStudioProvider.streamChatCompletion(
                'test-model',
                messages,
                {},
                callback
            );

            // Simulate receiving malformed data
            dataHandler(Buffer.from('data: {malformed json}\n\n'));

            // Wait for streaming to complete (shouldn't throw)
            await streamPromise;

            // Callback shouldn't be called with malformed data
            expect(callback.callCount).to.equal(0);
        });

        it('should handle errors during chat completion streaming', async () => {
            // Stub failed API response
            axiosStub.rejects(new Error('Chat streaming API error'));

            const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];

            try {
                await lmStudioProvider.streamChatCompletion('test-model', messages);
                expect.fail('Expected method to throw');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect((error as Error).message).to.include('Failed to stream chat completion');
            }
        });
    });

    describe('error handling', () => {
        it('should handle missing data in completion response', async () => {
            // Stub successful API response but with missing data
            const mockResponse = {
                id: 'cmpl-test123',
                object: 'text_completion',
                created: 1677858242,
                model: 'test-model',
                choices: []  // Empty choices array
            };

            axiosStub.resolves({ data: mockResponse });

            try {
                await lmStudioProvider.generateCompletion('test-model', 'Test prompt');
                expect.fail('Expected method to throw');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('should handle network errors gracefully', async () => {
            // Stub network error
            axiosStub.rejects(new Error('Network timeout'));

            try {
                await lmStudioProvider.generateChatCompletion(
                    'test-model',
                    [{ role: 'user', content: 'Hello' }]
                );
                expect.fail('Expected method to throw');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect((error as Error).message).to.include('Failed to generate chat completion');
            }
        });
    });
});
