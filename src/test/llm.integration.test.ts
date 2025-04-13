import * as assert from 'assert';
import { OllamaProvider } from '../llm/ollamaProvider';
import { LMStudioProvider } from '../llm/lmStudioProvider';

suite('LLM Integration Test Suite', () => {
    test('Ollama Provider Connection Test', async () => {
        const provider = new OllamaProvider();
        const result = await provider.testConnection();
        assert.strictEqual(result.success, true);
    });

    test('LM Studio Provider Connection Test', async () => {
        const provider = new LMStudioProvider();
        const result = await provider.testConnection();
        assert.strictEqual(result.success, true);
    });

    test('Message Exchange Test', async () => {
        const provider = new OllamaProvider();
        const response = await provider.sendMessage('test message');
        assert.ok(response !== null);
        assert.ok(response.length > 0);
    });

    test('Model Loading Test', async () => {
        const provider = new OllamaProvider();
        const models = await provider.getAvailableModels();
        assert.ok(Array.isArray(models));
        assert.ok(models.length > 0);
    });

    test('Error Handling Test', async () => {
        const provider = new OllamaProvider();
        try {
            await provider.sendMessage('');
            assert.fail('Should throw error for empty message');
        } catch (error) {
            assert.ok(error instanceof Error);
        }
    });

    test('Context Management Test', async () => {
        const provider = new OllamaProvider();
        const context = 'test context';
        await provider.setContext(context);
        const response = await provider.sendMessage('test with context');
        assert.ok(response.includes(context));
    });
});
