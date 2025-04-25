import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ConnectionState, ConnectionStatusService } from '../../src/status/connectionStatusService';
import { LLMProvider, LLMRequestOptions, LLMResponse, LLMMessage } from '../../src/llm/llm-provider';
import * as sinon from 'sinon';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { MockConnectionStatusService } from '../__testUtils__/MockConnectionStatusService';
import { MockLLMProvider } from '../__testUtils__/MockLLMProvider';

// Create mock status bar item factory
const createMockStatusBarItem = (): vscode.StatusBarItem => ({
    id: 'mock-status-bar',
    name: 'Mock Status Bar',
    tooltip: '',
    text: '',
    command: undefined,
    color: undefined,
    backgroundColor: undefined,
    alignment: vscode.StatusBarAlignment.Left,
    priority: 0,
    accessibilityInformation: { label: 'Mock Status', role: 'Status' },
    show: () => {},
    hide: () => {},
    dispose: () => {}
});

suite('LLMProviderManager Tests', () => {
    let providerManager: LLMProviderManager;
    let mockProvider: MockLLMProvider;
    let statusService: MockConnectionStatusService;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        mockProvider = new MockLLMProvider();
        statusService = new MockConnectionStatusService();
        
        // Stub the status service methods to track calls
        sinon.stub(statusService, 'setState');
        sinon.stub(statusService, 'showNotification');
        
        providerManager = new LLMProviderManager(statusService);
        
        // Set up active provider
        (providerManager as any)._activeProvider = mockProvider;
    });

    teardown(() => {
        sandbox.restore();
    });

    test('connect should establish connection with active provider', async () => {
        // Stub the connect method to inspect calls
        const connectStub = sinon.stub(mockProvider, 'connect').resolves();
        
        await providerManager.connect();

        assert.strictEqual(connectStub.calledOnce, true);
        sinon.assert.calledWith(
            statusService.setState as sinon.SinonStub, 
            ConnectionState.Connected,
            sinon.match.object
        );
    });

    test('connect should handle errors appropriately', async () => {
        // Make connect throw an error
        const connectStub = sinon.stub(mockProvider, 'connect').rejects(new Error('Connection failed'));

        await assert.rejects(async () => {
            await providerManager.connect();
        }, /Connection failed/);

        sinon.assert.calledWith(
            statusService.setState as sinon.SinonStub,
            ConnectionState.Error,
            sinon.match.object
        );
    });

    test('disconnect should properly disconnect active provider', async () => {
        // Set provider as connected
        mockProvider.connect(); // This will set the isConnected status to true
        
        // Stub the disconnect method
        const disconnectStub = sinon.stub(mockProvider, 'disconnect').resolves();

        await providerManager.disconnect();

        assert.strictEqual(disconnectStub.calledOnce, true);
        sinon.assert.calledWith(
            statusService.setState as sinon.SinonStub,
            ConnectionState.Disconnected
        );
    });

    test('setActiveModel should update provider model', async () => {
        await providerManager.setActiveModel('model2');

        // Verify status was updated
        sinon.assert.calledWith(
            statusService.setState as sinon.SinonStub,
            ConnectionState.Connected,
            {
                modelName: 'model2',
                providerName: 'MockProvider' // From our mock provider
            }
        );
    });

    test('getActiveProvider should return current provider', () => {
        const provider = providerManager.getActiveProvider();
        assert.strictEqual(provider, mockProvider);
    });

    test('getActiveModelName should return current model name', () => {
        // Set a model name in the provider status
        (mockProvider as any).status = { 
            ...mockProvider.getStatus(), 
            activeModel: 'model1' 
        };
        
        const modelName = providerManager.getActiveModelName();
        assert.strictEqual(modelName, 'model1');
    });

    test('dispose should clean up resources', () => {
        providerManager.dispose();
        
        // Verify the active provider is cleared
        assert.strictEqual((providerManager as any)._activeProvider, null);
    });
});