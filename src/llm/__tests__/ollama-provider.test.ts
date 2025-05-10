import axios, { AxiosInstance } from 'axios';
import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { LLMProviderError } from '../../llm/llm-provider';
import { OllamaProvider } from '../../llm/ollama-provider';

describe('OllamaProvider (TypeScript)', () => {
    let ollamaProvider: OllamaProvider;
    let axiosCreateStub: sinon.SinonStub;
    let axiosInstance: { get: sinon.SinonStub; post: sinon.SinonStub };

    beforeEach(() => {
        // Mock axios instance
        axiosInstance = {
            get: sinon.stub(),
            post: sinon.stub()
        };

        // Stub axios.create to return our mock instance
        axiosCreateStub = sinon.stub(axios, 'create').returns(axiosInstance as unknown as AxiosInstance);

        // Create provider instance
        ollamaProvider = new OllamaProvider('http://test-ollama-api');
    });

    afterEach(() => {
        // Restore all stubs
        sinon.restore();
    });

    describe('constructor', () => {
        it('should initialize with the provided base URL', () => {
            expect(axiosCreateStub.calledOnce).to.be.true;
            expect(axiosCreateStub.firstCall.args[0]).to.deep.include({
                baseURL: 'http://test-ollama-api',
                timeout: 30000
            });
        });

        it('should have the correct provider name', () => {
            expect(ollamaProvider.name).to.equal('Ollama');
        });
    });

    describe('isAvailable', () => {
        it('should return true when the API is available', async () => {
            axiosInstance.get.resolves({ data: {} });

            const result = await ollamaProvider.isAvailable();

            expect(result).to.be.true;
            expect(axiosInstance.get.calledOnceWith('/api/tags')).to.be.true;
        });

        it('should return false when the API is not available', async () => {
            axiosInstance.get.rejects(new Error('Connection failed'));

            const result = await ollamaProvider.isAvailable();

            expect(result).to.be.false;
            expect(axiosInstance.get.calledOnceWith('/api/tags')).to.be.true;
        });
    });

    describe('connect', () => {
        it('should connect successfully when API is available', async () => {
            axiosInstance.get.resolves({ data: {} });

            await ollamaProvider.connect();

            expect(axiosInstance.get.calledOnceWith('/api/tags')).to.be.true;
        });

        it('should throw error when API is not available', async () => {
            axiosInstance.get.rejects(new Error('Connection failed'));

            try {
                await ollamaProvider.connect();
                expect.fail('Expected connect to throw an error');
            } catch (error) {
                expect(error).to.be.instanceOf(LLMProviderError);
                expect((error as LLMProviderError).code).to.equal('CONNECTION_FAILED');
            }
        });
    });

    describe('getAvailableModels', () => {
        it('should return list of available models', async () => {
            const mockModels = {
                models: [
                    { name: 'model1' },
                    { name: 'model2' }
                ]
            };

            const mockModelInfo1 = {
                name: 'model1',
                details: {
                    parameter_size: '7B',
                    capabilities: ['text-generation']
                }
            };

            const mockModelInfo2 = {
                name: 'model2',
                details: {
                    parameter_size: '13B',
                    capabilities: ['text-generation', 'chat']
                }
            };

            axiosInstance.get.resolves({ data: mockModels });
            axiosInstance.post.onFirstCall().resolves({ data: mockModelInfo1 });
            axiosInstance.post.onSecondCall().resolves({ data: mockModelInfo2 });

            const models = await ollamaProvider.getAvailableModels();

            expect(models).to.have.length(2);
            expect(models[0].id).to.equal('model1');
            expect(models[1].id).to.equal('model2');
            expect(axiosInstance.get.calledOnceWith('/api/tags')).to.be.true;
            expect(axiosInstance.post.calledTwice).to.be.true;
        });

        it('should handle errors when fetching models', async () => {
            axiosInstance.get.rejects(new Error('Failed to fetch models'));

            const models = await ollamaProvider.getAvailableModels();

            expect(models).to.deep.equal([]);
        });
    });

    describe('getModelInfo', () => {
        it('should return model information', async () => {
            const mockModelInfo = {
                name: 'test-model',
                details: {
                    parameter_size: '7B',
                    capabilities: ['text-generation'],
                    quantization_level: '4bit'
                },
                license: 'MIT'
            };

            axiosInstance.post.resolves({ data: mockModelInfo });

            const modelInfo = await ollamaProvider.getModelInfo('test-model');

            expect(modelInfo.id).to.equal('test-model');
            expect(modelInfo.name).to.equal('test-model');
            expect(modelInfo.provider).to.equal('ollama');
            expect(modelInfo.capabilities).to.deep.equal(['text-generation']);
            expect(modelInfo.parameters).to.equal(7);
            expect(modelInfo.quantization).to.equal('4bit');
            expect(modelInfo.license).to.equal('MIT');

            expect(axiosInstance.post.calledOnceWith('/api/show', { name: 'test-model' })).to.be.true;
        });

        it('should use cached model info when available', async () => {
            const mockModelInfo = {
                name: 'test-model',
                details: {
                    parameter_size: '7B',
                    capabilities: ['text-generation']
                }
            };

            // First call to cache the model
            axiosInstance.post.resolves({ data: mockModelInfo });
            await ollamaProvider.getModelInfo('test-model');

            // Reset the stub to verify it's not called again
            axiosInstance.post.resetHistory();

            // Second call should use cached data
            const modelInfo = await ollamaProvider.getModelInfo('test-model');

            expect(modelInfo.id).to.equal('test-model');
            expect(axiosInstance.post.called).to.be.false;
        });

        it('should handle errors when fetching model info', async () => {
            axiosInstance.post.rejects(new Error('Failed to fetch model info'));

            const modelInfo = await ollamaProvider.getModelInfo('test-model');

            expect(modelInfo).to.deep.equal({
                id: 'unknown',
                name: 'Unknown Model',
                provider: 'unknown'
            });
        });
    });

    describe('generateCompletion', () => {
        it('should generate text completion successfully', async () => {
            const mockResponse = {
                data: {
                    response: 'Generated text response',
                    prompt_eval_count: 10,
                    eval_count: 20
                }
            };

            axiosInstance.post.resolves(mockResponse);

            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt', 'System prompt', {
                temperature: 0.7,
                maxTokens: 100
            });

            expect(result.content).to.equal('Generated text response');
            expect(result.usage).to.deep.equal({
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30
            });

            expect(axiosInstance.post.calledOnce).to.be.true;
            const postArgs = axiosInstance.post.firstCall.args;
            expect(postArgs[0]).to.equal('/api/generate');
            expect(postArgs[1]).to.deep.include({
                model: 'test-model',
                prompt: 'Test prompt',
                system: 'System prompt',
            });
            expect(postArgs[1].options).to.deep.include({
                temperature: 0.7,
                num_predict: 100
            });
        });

        it('should handle errors during text completion', async () => {
            axiosInstance.post.rejects(new Error('Generation failed'));

            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            expect(result).to.deep.equal({
                content: 'Error: Generation failed',
                error: true
            });
        });

        it('should use cached response in offline mode', async () => {
            // Enable offline mode
            ollamaProvider.offlineMode = true;

            // Mock cache
            const useCachedResponseStub = sinon.stub(ollamaProvider, 'useCachedResponse' as any);
            useCachedResponseStub.resolves('Cached response');

            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            expect(result.content).to.equal('Cached response');
            expect(axiosInstance.post.called).to.be.false;
        });
    });

    describe('generateChatCompletion', () => {
        it('should generate chat completion successfully', async () => {
            const mockResponse = {
                data: {
                    message: {
                        content: 'Generated chat response'
                    },
                    prompt_eval_count: 15,
                    eval_count: 25
                }
            };

            axiosInstance.post.resolves(mockResponse);

            const messages = [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there' },
                { role: 'user', content: 'How are you?' }
            ];

            const result = await ollamaProvider.generateChatCompletion('test-model', messages, {
                temperature: 0.8
            });

            expect(result.content).to.equal('Generated chat response');
            expect(result.usage).to.deep.equal({
                promptTokens: 15,
                completionTokens: 25,
                totalTokens: 40
            });

            expect(axiosInstance.post.calledOnce).to.be.true;
            const postArgs = axiosInstance.post.firstCall.args;
            expect(postArgs[0]).to.equal('/api/chat');
            expect(postArgs[1].model).to.equal('test-model');
            expect(postArgs[1].messages).to.deep.equal(messages);
            expect(postArgs[1].options.temperature).to.equal(0.8);
        });

        it('should handle errors during chat completion', async () => {
            axiosInstance.post.rejects(new Error('Chat generation failed'));

            const messages = [
                { role: 'user', content: 'Hello' }
            ];

            const result = await ollamaProvider.generateChatCompletion('test-model', messages);

            expect(result).to.deep.equal({
                content: 'Error: Chat generation failed',
                error: true
            });
        });
    });

    describe('streamCompletion', () => {
        it('should stream text completion', async () => {
            // Mock streaming response
            const mockStream = [
                Buffer.from(JSON.stringify({ response: 'Part 1', done: false })),
                Buffer.from(JSON.stringify({ response: 'Part 2', done: false })),
                Buffer.from(JSON.stringify({ response: 'Part 3', done: true }))
            ];

            // Mock axios stream response
            axiosInstance.post.resolves({
                data: {
                    [Symbol.asyncIterator]: async function* () {
                        for (const chunk of mockStream) {
                            yield chunk;
                        }
                    }
                }
            });

            const callback = sinon.spy();

            await ollamaProvider.streamCompletion('test-model', 'Test prompt', 'System prompt', {}, callback);

            expect(axiosInstance.post.calledOnce).to.be.true;
            expect(axiosInstance.post.firstCall.args[0]).to.equal('/api/generate');
            expect(axiosInstance.post.firstCall.args[1].stream).to.be.true;

            expect(callback.callCount).to.equal(3);
            expect(callback.firstCall.args[0]).to.deep.equal({ content: 'Part 1', isComplete: false });
            expect(callback.secondCall.args[0]).to.deep.equal({ content: 'Part 2', isComplete: false });
            expect(callback.thirdCall.args[0]).to.deep.equal({ content: 'Part 3', isComplete: true });
        });

        it('should handle errors during streaming', async () => {
            axiosInstance.post.rejects(new Error('Streaming failed'));

            const callback = sinon.spy();
            const handleErrorSpy = sinon.spy(ollamaProvider, 'handleError' as any);

            await ollamaProvider.streamCompletion('test-model', 'Test prompt', undefined, {}, callback);

            expect(handleErrorSpy.calledOnce).to.be.true;
            expect(handleErrorSpy.firstCall.args[1]).to.equal('STREAM_FAILED');
            expect(callback.called).to.be.false;
        });
    });

    describe('streamChatCompletion', () => {
        it('should stream chat completion', async () => {
            // Mock streaming response
            const mockStream = [
                Buffer.from(JSON.stringify({ message: { content: 'Part 1' }, done: false })),
                Buffer.from(JSON.stringify({ message: { content: 'Part 2' }, done: false })),
                Buffer.from(JSON.stringify({ message: { content: 'Part 3' }, done: true }))
            ];

            // Mock axios stream response
            axiosInstance.post.resolves({
                data: {
                    [Symbol.asyncIterator]: async function* () {
                        for (const chunk of mockStream) {
                            yield chunk;
                        }
                    }
                }
            });

            const callback = sinon.spy();
            const messages = [
                { role: 'user', content: 'Hello' }
            ];

            await ollamaProvider.streamChatCompletion('test-model', messages, {}, callback);

            expect(axiosInstance.post.calledOnce).to.be.true;
            expect(axiosInstance.post.firstCall.args[0]).to.equal('/api/chat');
            expect(axiosInstance.post.firstCall.args[1].stream).to.be.true;

            expect(callback.callCount).to.equal(3);
            expect(callback.firstCall.args[0]).to.deep.equal({ content: 'Part 1', isComplete: false });
            expect(callback.secondCall.args[0]).to.deep.equal({ content: 'Part 2', isComplete: false });
            expect(callback.thirdCall.args[0]).to.deep.equal({ content: 'Part 3', isComplete: true });
        });

        it('should handle errors during chat streaming', async () => {
            axiosInstance.post.rejects(new Error('Chat streaming failed'));

            const callback = sinon.spy();
            const handleErrorSpy = sinon.spy(ollamaProvider, 'handleError' as any);
            const messages = [
                { role: 'user', content: 'Hello' }
            ];

            await ollamaProvider.streamChatCompletion('test-model', messages, {}, callback);

            expect(handleErrorSpy.calledOnce).to.be.true;
            expect(handleErrorSpy.firstCall.args[1]).to.equal('STREAM_CHAT_FAILED');
            expect(callback.called).to.be.false;
        });
    });

    describe('disconnect', () => {
        it('should update the connection status', async () => {
            const updateStatusSpy = sinon.spy(ollamaProvider, 'updateStatus' as any);

            await ollamaProvider.disconnect();

            expect(updateStatusSpy.calledOnce).to.be.true;
            expect(updateStatusSpy.firstCall.args[0]).to.deep.include({
                isConnected: false
            });
        });
    });

    describe('error handling', () => {
        it('should handle network errors correctly', async () => {
            axiosInstance.post.rejects(new Error('Network timeout'));
            const handleErrorSpy = sinon.spy(ollamaProvider, 'handleError' as any);

            await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            expect(handleErrorSpy.calledOnce).to.be.true;
            expect(handleErrorSpy.firstCall.args[1]).to.equal('GENERATE_FAILED');
        });

        it('should handle malformed response data', async () => {
            axiosInstance.post.resolves({ data: { invalid: 'structure' } });

            const result = await ollamaProvider.generateChatCompletion('test-model', [{ role: 'user', content: 'hello' }]);

            expect(result).to.have.property('error', true);
        });
    });

    describe('offline mode', () => {
        beforeEach(() => {
            ollamaProvider.offlineMode = true;
        });

        afterEach(() => {
            ollamaProvider.offlineMode = false;
        });

        it('should try to use cached response in offline mode', async () => {
            const useCachedResponseStub = sinon.stub(ollamaProvider, 'useCachedResponse' as any).resolves(null);
            const cacheResponseStub = sinon.stub(ollamaProvider, 'cacheResponse' as any).resolves();

            axiosInstance.post.resolves({
                data: {
                    response: 'Test response',
                    prompt_eval_count: 5,
                    eval_count: 10
                }
            });

            await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            expect(useCachedResponseStub.calledOnce).to.be.true;
            expect(cacheResponseStub.calledOnce).to.be.true;
            expect(axiosInstance.post.calledOnce).to.be.true;
        });

        it('should return cached response without API call when available', async () => {
            const useCachedResponseStub = sinon.stub(ollamaProvider, 'useCachedResponse' as any).resolves('Cached content');

            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            expect(result.content).to.equal('Cached content');
            expect(axiosInstance.post.called).to.be.false;
        });
    });

    describe('model handling with unusual parameter formats', () => {
        it('should handle unusual parameter size formats', async () => {
            expect(ollamaProvider['parseParameterSize']('3B')).to.equal(3);
            expect(ollamaProvider['parseParameterSize']('300M')).to.equal(0.3);
            expect(ollamaProvider['parseParameterSize']('1.5B')).to.be.undefined;
            expect(ollamaProvider['parseParameterSize']('NotASize')).to.be.undefined;
        });

        it('should handle models with missing capability information', async () => {
            const mockModelInfo = {
                name: 'limited-model',
                details: {
                    parameter_size: '7B'
                    // capabilities field missing
                }
            };

            axiosInstance.post.resolves({ data: mockModelInfo });

            const modelInfo = await ollamaProvider.getModelInfo('limited-model');

            expect(modelInfo.capabilities).to.deep.equal([]);
        });
    });

    describe('option handling', () => {
        it('should properly map options to Ollama format', async () => {
            axiosInstance.post.resolves({
                data: {
                    response: 'Test response',
                    prompt_eval_count: 5,
                    eval_count: 10
                }
            });

            const options = {
                temperature: 0.5,
                maxTokens: 100,
                topP: 0.9,
                frequencyPenalty: 0.7,
                presencePenalty: 0.3,
                stop: ['STOP']
            };

            await ollamaProvider.generateCompletion('test-model', 'Test prompt', 'System prompt', options);

            const requestBody = axiosInstance.post.firstCall.args[1];
            expect(requestBody.options).to.deep.include({
                temperature: 0.5,
                num_predict: 100,
                top_p: 0.9,
                frequency_penalty: 0.7,
                presence_penalty: 0.3,
                stop: ['STOP']
            });
        });

        it('should handle missing options gracefully', async () => {
            axiosInstance.post.resolves({
                data: {
                    response: 'Test response'
                }
            });

            await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            const requestBody = axiosInstance.post.firstCall.args[1];
            expect(requestBody.options).to.not.be.undefined;
            // Check that all options properties are undefined
            Object.values(requestBody.options).forEach(value => {
                expect(value).to.be.undefined;
            });
        });
    });

    describe('stream handling', () => {
        it('should handle stream interruption gracefully', async () => {
            const mockStream = {
                [Symbol.asyncIterator]: async function* () {
                    yield Buffer.from(JSON.stringify({ response: 'Part 1', done: false }));
                    // Simulate stream interruption by throwing an error
                    throw new Error('Stream interrupted');
                }
            };

            axiosInstance.post.resolves({
                data: mockStream
            });

            const callback = sinon.spy();
            const handleErrorSpy = sinon.spy(ollamaProvider, 'handleError' as any);

            await ollamaProvider.streamCompletion('test-model', 'Test prompt', undefined, {}, callback);

            expect(callback.calledOnce).to.be.true;
            expect(callback.firstCall.args[0]).to.deep.equal({ content: 'Part 1', isComplete: false });
            // The error should be caught internally
            expect(handleErrorSpy.called).to.be.false;
        });

        it('should handle malformed stream data', async () => {
            const mockStream = {
                [Symbol.asyncIterator]: async function* () {
                    yield Buffer.from('{ malformed json');
                }
            };

            axiosInstance.post.resolves({
                data: mockStream
            });

            const callback = sinon.spy();

            try {
                await ollamaProvider.streamCompletion('test-model', 'Test prompt', undefined, {}, callback);
                expect.fail('Expected an error to be thrown');
            } catch (error) {
                // The error should propagate since it's a JSON parsing error
                expect(error).to.be.instanceOf(Error);
                expect(callback.called).to.be.false;
            }
        });
    });

    describe('parseParameterSize', () => {
        it('should parse billion parameter size', () => {
            const result = ollamaProvider['parseParameterSize']('7B');
            expect(result).to.equal(7);
        });

        it('should parse million parameter size', () => {
            const result = ollamaProvider['parseParameterSize']('70M');
            expect(result).to.equal(0.07);
        });

        it('should return undefined for invalid format', () => {
            const result = ollamaProvider['parseParameterSize']('invalid');
            expect(result).to.be.undefined;
        });

        it('should return undefined for undefined input', () => {
            const result = ollamaProvider['parseParameterSize'](undefined);
            expect(result).to.be.undefined;
        });
    });

    describe('Advanced Error Handling', () => {
        describe('API rate limiting', () => {
            it('should handle 429 Too Many Requests errors during model fetch', async () => {
                const rateLimitError = new Error('Too Many Requests');
                rateLimitError.name = 'Error';
                (rateLimitError as any).response = { status: 429, data: { message: 'Rate limit exceeded' } };

                axiosInstance.get.rejects(rateLimitError);

                const models = await ollamaProvider.getAvailableModels();

                expect(models).to.deep.equal([]);
                expect(axiosInstance.get.calledOnceWith('/api/tags')).to.be.true;
            });

            it('should handle 429 Too Many Requests errors during model info fetch', async () => {
                const rateLimitError = new Error('Too Many Requests');
                rateLimitError.name = 'Error';
                (rateLimitError as any).response = { status: 429, data: { message: 'Rate limit exceeded' } };

                axiosInstance.post.rejects(rateLimitError);

                const modelInfo = await ollamaProvider.getModelInfo('test-model');

                expect(modelInfo).to.deep.equal({
                    id: 'unknown',
                    name: 'Unknown Model',
                    provider: 'unknown'
                });
            });

            it('should handle 429 Too Many Requests errors during text generation', async () => {
                const rateLimitError = new Error('Too Many Requests');
                rateLimitError.name = 'Error';
                (rateLimitError as any).response = { status: 429, data: { message: 'Rate limit exceeded' } };

                axiosInstance.post.rejects(rateLimitError);

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Rate limit exceeded');
            });
        });

        describe('Authentication errors', () => {
            it('should handle 401 Unauthorized errors', async () => {
                const authError = new Error('Unauthorized');
                authError.name = 'Error';
                (authError as any).response = { status: 401, data: { message: 'Authentication required' } };

                axiosInstance.get.rejects(authError);

                const result = await ollamaProvider.isAvailable();

                expect(result).to.be.false;
                expect(ollamaProvider.status.error).to.include('Authentication required');
            });

            it('should handle 403 Forbidden errors', async () => {
                const forbiddenError = new Error('Forbidden');
                forbiddenError.name = 'Error';
                (forbiddenError as any).response = { status: 403, data: { message: 'Access denied' } };

                axiosInstance.post.rejects(forbiddenError);

                const result = await ollamaProvider.generateChatCompletion('test-model', [{ role: 'user', content: 'Hello' }]);

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Access denied');
            });
        });

        describe('Timeout errors', () => {
            it('should handle timeout during API connection', async () => {
                const timeoutError = new Error('Timeout');
                timeoutError.name = 'Error';
                timeoutError.message = 'timeout of 30000ms exceeded';
                (timeoutError as any).code = 'ECONNABORTED';

                axiosInstance.get.rejects(timeoutError);

                const result = await ollamaProvider.isAvailable();

                expect(result).to.be.false;
                expect(ollamaProvider.status.error).to.include('timeout');
            });

            it('should handle timeout during generation request', async () => {
                const timeoutError = new Error('Timeout');
                timeoutError.name = 'Error';
                timeoutError.message = 'timeout of 30000ms exceeded';
                (timeoutError as any).code = 'ECONNABORTED';

                axiosInstance.post.rejects(timeoutError);

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('timeout');
            });

            it('should handle timeout during streaming', async () => {
                const timeoutError = new Error('Timeout');
                timeoutError.name = 'Error';
                timeoutError.message = 'timeout of 30000ms exceeded';
                (timeoutError as any).code = 'ECONNABORTED';

                axiosInstance.post.rejects(timeoutError);

                const callback = sinon.spy();
                const handleErrorSpy = sinon.spy(ollamaProvider, 'handleError');

                await ollamaProvider.streamCompletion('test-model', 'Test prompt', undefined, {}, callback);

                expect(handleErrorSpy.calledOnce).to.be.true;
                expect(handleErrorSpy.firstCall.args[0].message).to.include('timeout');
                expect(callback.called).to.be.false;
            });
        });

        describe('Network errors', () => {
            it('should handle ECONNREFUSED errors', async () => {
                const connectionError = new Error('Connection refused');
                connectionError.name = 'Error';
                (connectionError as any).code = 'ECONNREFUSED';

                axiosInstance.get.rejects(connectionError);

                const result = await ollamaProvider.isAvailable();

                expect(result).to.be.false;
                expect(ollamaProvider.status.error).to.include('Connection refused');
            });

            it('should handle ENOTFOUND errors', async () => {
                const notFoundError = new Error('Host not found');
                notFoundError.name = 'Error';
                (notFoundError as any).code = 'ENOTFOUND';

                axiosInstance.get.rejects(notFoundError);

                const result = await ollamaProvider.isAvailable();

                expect(result).to.be.false;
                expect(ollamaProvider.status.error).to.include('Host not found');
            });

            it('should handle ECONNRESET errors', async () => {
                const resetError = new Error('Connection reset');
                resetError.name = 'Error';
                (resetError as any).code = 'ECONNRESET';

                axiosInstance.post.rejects(resetError);

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Connection reset');
            });
        });

        describe('Malformed response handling', () => {
            it('should handle malformed response in getAvailableModels', async () => {
                // Missing models array
                axiosInstance.get.resolves({ data: { incorrect: 'structure' } });

                const models = await ollamaProvider.getAvailableModels();

                expect(models).to.deep.equal([]);
            });

            it('should handle empty response in getAvailableModels', async () => {
                axiosInstance.get.resolves({ data: null });

                const models = await ollamaProvider.getAvailableModels();

                expect(models).to.deep.equal([]);
            });

            it('should handle malformed response in generateCompletion', async () => {
                // Missing response field
                axiosInstance.post.resolves({ data: { incorrect: 'structure' } });

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('content');
                expect(result.content).to.equal('');
                expect(result.usage).to.deep.equal({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
            });

            it('should handle malformed response in generateChatCompletion', async () => {
                // Missing message content field
                axiosInstance.post.resolves({ data: { message: { incorrect: 'structure' } } });

                const result = await ollamaProvider.generateChatCompletion('test-model', [{ role: 'user', content: 'Hello' }]);

                expect(result).to.have.property('content');
                expect(result.content).to.equal('');
            });
        });

        describe('Server errors', () => {
            it('should handle 500 Internal Server Error', async () => {
                const serverError = new Error('Internal Server Error');
                serverError.name = 'Error';
                (serverError as any).response = { status: 500, data: { message: 'Server error' } };

                axiosInstance.post.rejects(serverError);

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Server error');
            });

            it('should handle 503 Service Unavailable', async () => {
                const unavailableError = new Error('Service Unavailable');
                unavailableError.name = 'Error';
                (unavailableError as any).response = { status: 503, data: { message: 'Service is currently unavailable' } };

                axiosInstance.post.rejects(unavailableError);

                const result = await ollamaProvider.generateChatCompletion('test-model', [{ role: 'user', content: 'Hello' }]);

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Service is currently unavailable');
            });
        });

        describe('Invalid model errors', () => {
            it('should handle model not found errors', async () => {
                const modelError = new Error('Model not found');
                modelError.name = 'Error';
                (modelError as any).response = { status: 404, data: { message: 'Model "nonexistent-model" not found' } };

                axiosInstance.post.rejects(modelError);

                const result = await ollamaProvider.generateCompletion('nonexistent-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Model "nonexistent-model" not found');
            });

            it('should handle model loading errors', async () => {
                const loadingError = new Error('Model loading error');
                loadingError.name = 'Error';
                (loadingError as any).response = { status: 500, data: { message: 'Failed to load model' } };

                axiosInstance.post.rejects(loadingError);

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Failed to load model');
            });

            it('should handle model format errors during loading', async () => {
                const formatError = new Error('Model format not supported');
                formatError.name = 'Error';
                (formatError as any).response = {
                    status: 400,
                    data: { message: 'Unsupported model format. Please ensure the model is compatible with Ollama.' }
                };

                axiosInstance.post.rejects(formatError);

                const result = await ollamaProvider.generateCompletion('incompatible-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Unsupported model format');
            });

            it('should handle incomplete model files', async () => {
                const incompleteError = new Error('Model files incomplete');
                incompleteError.name = 'Error';
                (incompleteError as any).response = {
                    status: 500,
                    data: { message: 'Model files incomplete or corrupted. Try reinstalling the model.' }
                };

                axiosInstance.post.rejects(incompleteError);

                const result = await ollamaProvider.generateCompletion('corrupted-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Model files incomplete or corrupted');
            });
        });

        describe('Memory allocation errors', () => {
            it('should handle out of memory errors', async () => {
                const memoryError = new Error('Out of memory');
                memoryError.name = 'Error';
                (memoryError as any).response = {
                    status: 507,
                    data: { message: 'Insufficient memory to load or run the model' }
                };

                axiosInstance.post.rejects(memoryError);

                const result = await ollamaProvider.generateCompletion('large-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('Insufficient memory');
            });

            it('should handle CUDA errors when GPU is unavailable', async () => {
                const cudaError = new Error('CUDA error');
                cudaError.name = 'Error';
                (cudaError as any).response = {
                    status: 500,
                    data: { message: 'CUDA error: no CUDA-capable device is detected' }
                };

                axiosInstance.post.rejects(cudaError);

                const result = await ollamaProvider.generateCompletion('gpu-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('CUDA error');
            });
        });

        describe('Content filtering and safety', () => {
            it('should handle content filtering rejections', async () => {
                const safetyError = new Error('Content filtered');
                safetyError.name = 'Error';
                (safetyError as any).response = {
                    status: 422,
                    data: { message: 'The prompt was rejected by the model safety filters' }
                };

                axiosInstance.post.rejects(safetyError);

                const result = await ollamaProvider.generateCompletion('safe-model', 'Test prompt with questionable content');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('rejected by the model safety filters');
            });
        });

        describe('Complex network scenarios', () => {
            it('should handle partial responses before connection drops', async () => {
                // First create successful response
                axiosInstance.post.resolves({
                    data: {
                        response: 'Partial response',
                        prompt_eval_count: 5,
                        eval_count: 10
                    }
                });

                // Get the first response
                const result1 = await ollamaProvider.generateCompletion('test-model', 'Test prompt');
                expect(result1.content).to.equal('Partial response');

                // Then simulate network drop on the next request
                const networkDropError = new Error('Network connection interrupted');
                networkDropError.name = 'Error';
                (networkDropError as any).code = 'ECONNABORTED';
                axiosInstance.post.rejects(networkDropError);

                // Second request should fail gracefully
                const result2 = await ollamaProvider.generateCompletion('test-model', 'Test prompt continuation');
                expect(result2).to.have.property('error', true);
                expect(result2.content).to.include('Network connection interrupted');
            });

            it('should handle DNS resolution failures', async () => {
                const dnsError = new Error('getaddrinfo ENOTFOUND invalid-ollama-host');
                dnsError.name = 'Error';
                (dnsError as any).code = 'ENOTFOUND';
                (dnsError as any).hostname = 'invalid-ollama-host';

                axiosInstance.post.rejects(dnsError);

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('getaddrinfo ENOTFOUND invalid-ollama-host');
            });

            it('should handle connection errors due to port conflicts', async () => {
                const portError = new Error('connect EADDRINUSE 127.0.0.1:11434');
                portError.name = 'Error';
                (portError as any).code = 'EADDRINUSE';
                (portError as any).address = '127.0.0.1';
                (portError as any).port = 11434;

                axiosInstance.post.rejects(portError);

                const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

                expect(result).to.have.property('error', true);
                expect(result.content).to.include('EADDRINUSE');
                expect(result.content).to.include('11434');
            });
        });
    });

    describe('Complex streaming scenarios', () => {
        it('should handle streaming with incremental content', async () => {
            // Simulate streaming with incremental content where each chunk adds to the previous
            const mockStream = [
                Buffer.from(JSON.stringify({ response: 'Hello', done: false })),
                Buffer.from(JSON.stringify({ response: ' world', done: false })),
                Buffer.from(JSON.stringify({ response: '!', done: true }))
            ];

            axiosInstance.post.resolves({
                data: {
                    [Symbol.asyncIterator]: async function* () {
                        for (const chunk of mockStream) {
                            yield chunk;
                        }
                    }
                }
            });

            const callback = sinon.spy();
            let combinedResponse = '';
            const customCallback = (event: any) => {
                combinedResponse += event.content;
                callback(event);
            };

            await ollamaProvider.streamCompletion('test-model', 'Tell me hello', undefined, {}, customCallback);

            expect(callback.callCount).to.equal(3);
            expect(combinedResponse).to.equal('Hello world!');
        });

        it('should handle streaming with content backtracking', async () => {
            // Simulate streaming with backtracking where the model revises its output
            // This tests the client's ability to handle content that includes backspace characters
            const mockStream = [
                Buffer.from(JSON.stringify({ response: 'Hello worle', done: false })),
                Buffer.from(JSON.stringify({ response: '\b\bld', done: false })), // Backspace and correction
                Buffer.from(JSON.stringify({ response: '!', done: true }))
            ];

            axiosInstance.post.resolves({
                data: {
                    [Symbol.asyncIterator]: async function* () {
                        for (const chunk of mockStream) {
                            yield chunk;
                        }
                    }
                }
            });

            const callback = sinon.spy();

            await ollamaProvider.streamCompletion('test-model', 'Tell me hello', undefined, {}, callback);

            expect(callback.callCount).to.equal(3);
            expect(callback.firstCall.args[0].content).to.equal('Hello worle');
            expect(callback.secondCall.args[0].content).to.equal('\b\bld');
            expect(callback.thirdCall.args[0].content).to.equal('!');
        });

        it('should handle streaming that times out mid-response', async () => {
            // Create a stream that emits a few chunks and then times out
            const mockStream = {
                [Symbol.asyncIterator]: async function* () {
                    yield Buffer.from(JSON.stringify({ response: 'Part 1', done: false }));
                    yield Buffer.from(JSON.stringify({ response: 'Part 2', done: false }));
                    // Simulate timeout by throwing a specific error
                    const timeoutError = new Error('timeout of 30000ms exceeded');
                    (timeoutError as any).code = 'ECONNABORTED';
                    throw timeoutError;
                }
            };

            axiosInstance.post.resolves({
                data: mockStream
            });

            const callback = sinon.spy();
            const handleErrorSpy = sinon.spy(ollamaProvider, 'handleError' as any);

            await ollamaProvider.streamCompletion('test-model', 'Test prompt', undefined, {}, callback);

            expect(callback.callCount).to.equal(2);
            expect(callback.firstCall.args[0].content).to.equal('Part 1');
            expect(callback.secondCall.args[0].content).to.equal('Part 2');
            // Should call handleError with the timeout error
            expect(handleErrorSpy.calledOnce).to.be.true;
            expect(handleErrorSpy.firstCall.args[0].message).to.include('timeout');
            expect(handleErrorSpy.firstCall.args[0].code).to.equal('ECONNABORTED');
        });
    });

    describe('Model information handling edge cases', () => {
        it('should handle models with unusual capability formats', async () => {
            const mockModelInfo = {
                name: 'special-model',
                details: {
                    parameter_size: '7B',
                    capabilities: {
                        // Non-standard format - object instead of array
                        text: true,
                        vision: false,
                        audio: false
                    }
                }
            };

            axiosInstance.post.resolves({ data: mockModelInfo });

            const modelInfo = await ollamaProvider.getModelInfo('special-model');

            // Should gracefully handle non-array capabilities by converting to empty array
            expect(modelInfo.capabilities).to.deep.equal([]);
        });

        it('should handle model info with nested details structure', async () => {
            const mockModelInfo = {
                name: 'nested-model',
                details: {
                    parameter_size: '13B',
                    details: {
                        // Nested structure
                        capabilities: ['text-generation', 'embedding']
                    }
                }
            };

            axiosInstance.post.resolves({ data: mockModelInfo });

            const modelInfo = await ollamaProvider.getModelInfo('nested-model');

            // Should handle missing capabilities when they're nested differently
            expect(modelInfo.capabilities).to.deep.equal([]);
            expect(modelInfo.parameters).to.equal(13);
        });

        it('should handle models with empty details', async () => {
            const mockModelInfo = {
                name: 'minimal-model',
                // No details object at all
                license: 'MIT'
            };

            axiosInstance.post.resolves({ data: mockModelInfo });

            const modelInfo = await ollamaProvider.getModelInfo('minimal-model');

            // Should handle missing details gracefully
            expect(modelInfo.capabilities).to.deep.equal([]);
            expect(modelInfo.parameters).to.be.undefined;
            expect(modelInfo.license).to.equal('MIT');
        });
    });

    describe('Offline mode caching behavior', () => {
        beforeEach(() => {
            ollamaProvider.offlineMode = true;
        });

        afterEach(() => {
            ollamaProvider.offlineMode = false;
        });

        it('should cache different prompts with different responses', async () => {
            const cacheResponseStub = sinon.stub(ollamaProvider, 'cacheResponse' as any).resolves();
            const useCachedResponseStub = sinon.stub(ollamaProvider, 'useCachedResponse' as any);

            // No cached response for first prompt
            useCachedResponseStub.onFirstCall().resolves(null);

            // First API response
            axiosInstance.post.onFirstCall().resolves({
                data: {
                    response: 'Response 1',
                    prompt_eval_count: 5,
                    eval_count: 10
                }
            });

            // Get first response which should be cached
            const result1 = await ollamaProvider.generateCompletion('test-model', 'Prompt 1');
            expect(result1.content).to.equal('Response 1');
            expect(cacheResponseStub.calledOnce).to.be.true;
            expect(cacheResponseStub.firstCall.args[0]).to.equal('Prompt 1');
            expect(cacheResponseStub.firstCall.args[1]).to.equal('Response 1');

            // Return cached response for first prompt on subsequent calls
            useCachedResponseStub.onSecondCall().resolves('Cached Response 1');

            // Second call with same prompt should use cache
            const result2 = await ollamaProvider.generateCompletion('test-model', 'Prompt 1');
            expect(result2.content).to.equal('Cached Response 1');
            expect(axiosInstance.post.calledOnce).to.be.true; // API not called again

            // No cached response for second prompt
            useCachedResponseStub.onThirdCall().resolves(null);

            // Second API response for different prompt
            axiosInstance.post.onSecondCall().resolves({
                data: {
                    response: 'Response 2',
                    prompt_eval_count: 6,
                    eval_count: 12
                }
            });

            // Get response for different prompt
            const result3 = await ollamaProvider.generateCompletion('test-model', 'Prompt 2');
            expect(result3.content).to.equal('Response 2');
            expect(cacheResponseStub.calledTwice).to.be.true;
            expect(cacheResponseStub.secondCall.args[0]).to.equal('Prompt 2');
            expect(cacheResponseStub.secondCall.args[1]).to.equal('Response 2');
            expect(axiosInstance.post.calledTwice).to.be.true;
        });

        it('should handle failures to write to cache', async () => {
            // No cached response
            const useCachedResponseStub = sinon.stub(ollamaProvider, 'useCachedResponse' as any).resolves(null);

            // Cache writing fails
            const cacheResponseStub = sinon.stub(ollamaProvider, 'cacheResponse' as any)
                .rejects(new Error('Failed to write to cache'));

            // API responds normally
            axiosInstance.post.resolves({
                data: {
                    response: 'Test response despite cache failure',
                    prompt_eval_count: 5,
                    eval_count: 10
                }
            });

            // Should still get response even if caching fails
            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            expect(result.content).to.equal('Test response despite cache failure');
            expect(useCachedResponseStub.calledOnce).to.be.true;
            expect(cacheResponseStub.calledOnce).to.be.true;
            expect(axiosInstance.post.calledOnce).to.be.true;
        });

        it('should handle corrupted cache data', async () => {
            // Simulate corrupted cache data
            const useCachedResponseStub = sinon.stub(ollamaProvider, 'useCachedResponse' as any)
                .throws(new Error('Corrupted cache data'));

            const cacheResponseStub = sinon.stub(ollamaProvider, 'cacheResponse' as any).resolves();

            // API responds normally
            axiosInstance.post.resolves({
                data: {
                    response: 'Fallback to API response',
                    prompt_eval_count: 5,
                    eval_count: 10
                }
            });

            // Should gracefully fall back to API despite cache error
            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt');

            expect(result.content).to.equal('Fallback to API response');
            expect(useCachedResponseStub.calledOnce).to.be.true;
            expect(cacheResponseStub.calledOnce).to.be.true;
            expect(axiosInstance.post.calledOnce).to.be.true;
        });
    });

    describe('Output formatting and control characters', () => {
        it('should handle responses with control characters', async () => {
            const mockResponse = {
                data: {
                    response: 'Line 1\nLine 2\tTabbed text\rCarriage return',
                    prompt_eval_count: 10,
                    eval_count: 20
                }
            };

            axiosInstance.post.resolves(mockResponse);

            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt with control chars');

            expect(result.content).to.equal('Line 1\nLine 2\tTabbed text\rCarriage return');
        });

        it('should handle responses with unicode and emoji characters', async () => {
            const mockResponse = {
                data: {
                    response: 'Unicode: 你好 世界 and Emoji: 🚀🔥👍',
                    prompt_eval_count: 10,
                    eval_count: 20
                }
            };

            axiosInstance.post.resolves(mockResponse);

            const result = await ollamaProvider.generateCompletion('test-model', 'Test prompt with unicode');

            expect(result.content).to.equal('Unicode: 你好 世界 and Emoji: 🚀🔥👍');
        });

        it('should handle streaming with unicode characters', async () => {
            const mockStream = [
                Buffer.from(JSON.stringify({ response: 'Hello ', done: false })),
                Buffer.from(JSON.stringify({ response: '世界', done: false })),
                Buffer.from(JSON.stringify({ response: ' 🚀', done: true }))
            ];

            axiosInstance.post.resolves({
                data: {
                    [Symbol.asyncIterator]: async function* () {
                        for (const chunk of mockStream) {
                            yield chunk;
                        }
                    }
                }
            });

            const callback = sinon.spy();

            await ollamaProvider.streamCompletion('test-model', 'Say hello world in Chinese', undefined, {}, callback);

            expect(callback.callCount).to.equal(3);
            expect(callback.firstCall.args[0].content).to.equal('Hello ');
            expect(callback.secondCall.args[0].content).to.equal('世界');
            expect(callback.thirdCall.args[0].content).to.equal(' 🚀');
        });
    });
});
