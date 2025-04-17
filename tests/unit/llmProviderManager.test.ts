import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ConnectionState, ConnectionStatusService } from '../../src/status/connectionStatusService';
import { LLMProvider, LLMRequestOptions, LLMResponse, LLMMessage } from '../../src/llm/llm-provider';
import * as sinon from 'sinon';
import * as assert from 'assert';
import * as vscode from 'vscode';

class MockLLMProvider implements LLMProvider {
    readonly name = 'MockProvider';
    private _connected = false;
    public isAvailable = sinon.stub().resolves(true);
    public getAvailableModels = sinon.stub().resolves(['model1', 'model2']);
    public generateCompletion = sinon.stub().resolves({ content: 'Test response' });
    public generateChatCompletion = sinon.stub().resolves({ content: 'Test chat response' });
    public streamCompletion = sinon.stub().resolves();
    public streamChatCompletion = sinon.stub().resolves();
    public getProviderType = sinon.stub().returns('mock');
    public connect = sinon.stub().callsFake(() => { this._connected = true; return Promise.resolve(); });
    public disconnect = sinon.stub().callsFake(() => { this._connected = false; return Promise.resolve(); });
    public isConnected = sinon.stub().callsFake(() => this._connected);
    public getModelName = sinon.stub().returns('model1');
    
    // Test helper
    public setConnected(value: boolean) {
        this._connected = value;
    }
}

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

class MockConnectionStatusService extends ConnectionStatusService {
    private _mockState: ConnectionState = ConnectionState.Disconnected;
    private _mockModelName: string = '';
    private _mockProviderName: string = '';
    private readonly _mockStatusBarItem: vscode.StatusBarItem;
    private readonly _mockStateChangeEmitter: vscode.EventEmitter<ConnectionState>;

    constructor() {
        super();
        this._mockStatusBarItem = createMockStatusBarItem();
        this._mockStateChangeEmitter = new vscode.EventEmitter<ConnectionState>();
        // Create stubs for the methods we want to verify
        this.setState = sinon.stub();
        this.showNotification = sinon.stub();
    }

    // Override the getters to use our mock values
    get state(): ConnectionState {
        return this._mockState;
    }

    get activeModelName(): string {
        return this._mockModelName;
    }

    get providerName(): string {
        return this._mockProviderName;
    }
}

suite('LLMProviderManager Tests', () => {
    let providerManager: LLMProviderManager;
    let mockProvider: MockLLMProvider;
    let statusService: MockConnectionStatusService;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        mockProvider = new MockLLMProvider();
        statusService = new MockConnectionStatusService();
        providerManager = new LLMProviderManager(statusService);
        // Set up active provider
        (providerManager as any)._activeProvider = mockProvider;
    });

    teardown(() => {
        sandbox.restore();
    });

    test('connect should establish connection with active provider', async () => {
        await providerManager.connect();

        sinon.assert.calledOnce(mockProvider.connect);
        sinon.assert.calledWith(statusService.setState as sinon.SinonStub, 
            ConnectionState.Connected,
            {
                modelName: 'model1',
                providerName: 'mock'
            }
        );
    });

    test('connect should handle errors appropriately', async () => {
        mockProvider.connect.rejects(new Error('Connection failed'));

        await assert.rejects(async () => {
            await providerManager.connect();
        }, /Connection failed/);

        sinon.assert.calledWith(statusService.setState as sinon.SinonStub,
            ConnectionState.Error,
            { providerName: 'mock' }
        );
    });

    test('disconnect should properly disconnect active provider', async () => {
        mockProvider.setConnected(true);

        await providerManager.disconnect();

        sinon.assert.calledOnce(mockProvider.disconnect);
        sinon.assert.calledWith(statusService.setState as sinon.SinonStub,
            ConnectionState.Disconnected,
            {
                providerName: 'mock'
            }
        );
    });

    test('setActiveModel should update provider model', async () => {
        await providerManager.setActiveModel('model2');

        // Verify status was updated
        sinon.assert.calledWith(statusService.setState as sinon.SinonStub,
            ConnectionState.Connected,
            {
                modelName: 'model2',
                providerName: 'mock'
            }
        );
    });

    test('getActiveProvider should return current provider', () => {
        const provider = providerManager.getActiveProvider();
        assert.strictEqual(provider, mockProvider);
    });

    test('getActiveModelName should return current model name', () => {
        const modelName = providerManager.getActiveModelName();
        assert.strictEqual(modelName, 'model1');
    });

    test('dispose should clean up resources', () => {
        providerManager.dispose();
        
        // Verify the active provider is cleared
        assert.strictEqual((providerManager as any)._activeProvider, null);
    });
});