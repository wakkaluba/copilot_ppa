import * as assert from 'assert';
import * as sinon from 'sinon';
import { OllamaProvider } from '../../src/providers/ollamaProvider';
import { LMStudioProvider } from '../../src/providers/lmStudioProvider';

suite('LLM Provider Tests', () => {
	let sandbox: sinon.SinonSandbox;
	
	setup(() => {
		sandbox = sinon.createSandbox();
	});
	
	teardown(() => {
		sandbox.restore();
	});
	
	test('OllamaProvider - should initialize with correct settings', () => {
		const provider = new OllamaProvider({
			host: 'http://localhost',
			port: 11434,
			model: 'codellama'
		});
		
		assert.strictEqual(provider.getHost(), 'http://localhost');
		assert.strictEqual(provider.getPort(), 11434);
		assert.strictEqual(provider.getModel(), 'codellama');
	});
	
	test('OllamaProvider - should handle prompt correctly', async () => {
		const provider = new OllamaProvider({
			host: 'http://localhost',
			port: 11434,
			model: 'codellama'
		});
		
		const fetchStub = sandbox.stub(global, 'fetch').resolves({
			json: async () => ({ response: 'test response' }),
			ok: true
		} as Response);
		
		const response = await provider.sendPrompt('test prompt');
		assert.strictEqual(response, 'test response');
		assert.strictEqual(fetchStub.calledOnce, true);
	});
	
	test('LMStudioProvider - should initialize with correct settings', () => {
		const provider = new LMStudioProvider({
			host: 'http://localhost',
			port: 1234,
			model: 'phi-2'
		});
		
		assert.strictEqual(provider.getHost(), 'http://localhost');
		assert.strictEqual(provider.getPort(), 1234);
		assert.strictEqual(provider.getModel(), 'phi-2');
	});
	
	test('LMStudioProvider - should handle prompt correctly', async () => {
		const provider = new LMStudioProvider({
			host: 'http://localhost',
			port: 1234,
			model: 'phi-2'
		});
		
		const fetchStub = sandbox.stub(global, 'fetch').resolves({
			json: async () => ({ choices: [{ message: { content: 'test response' } }] }),
			ok: true
		} as Response);
		
		const response = await provider.sendPrompt('test prompt');
		assert.strictEqual(response, 'test response');
		assert.strictEqual(fetchStub.calledOnce, true);
	});
});
