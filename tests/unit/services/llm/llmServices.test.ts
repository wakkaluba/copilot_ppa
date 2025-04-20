import * as vscode from 'vscode';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { 
    LLMConnectionManager, 
    LLMHostManager,
    LLMSessionManager,
    LLMFactory,
    ConnectionState,
    HostState
} from '../../../../src/services/llm';

// Mock fetch API
global.fetch = jest.fn();

describe('LLM Services', () => {
    let sandbox: sinon.SinonSandbox;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        // Reset fetch mock
        (global.fetch as jest.Mock).mockReset();
        
        // Mock VS Code API
        sandbox.stub(vscode.window, 'createStatusBarItem').returns({
            text: '',
            tooltip: '',
            show: sandbox.stub(),
            hide: sandbox.stub(),
            dispose: sandbox.stub()
        } as any);
        
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().callsFake((key, defaultValue) => defaultValue)
        } as any);
    });
    
    afterEach(() => {
        sandbox.restore();
    });
    
    describe('LLMConnectionManager', () => {
        let connectionManager: LLMConnectionManager;
        let hostManagerStub: sinon.SinonStubbedInstance<LLMHostManager>;
        
        beforeEach(() => {
            // Create stub for host manager
            hostManagerStub = {
                on: sandbox.stub(),
                emit: sandbox.stub(),
                isRunning: sandbox.stub().returns(false),
                startHost: sandbox.stub().resolves(),
                stopHost: sandbox.stub().resolves(),
                restartHost: sandbox.stub().resolves(),
                dispose: sandbox.stub(),
                hostState: HostState.STOPPED,
                getInstance: sandbox.stub()
            } as any;
            
            // Mock the static getInstance method
            sandbox.stub(LLMHostManager, 'getInstance').returns(hostManagerStub as any);
            
            // Get connection manager instance
            connectionManager = LLMConnectionManager.getInstance({
                maxRetries: 2,
                baseRetryDelay: 100,
                maxRetryDelay: 1000,
                connectionTimeout: 1000,
                healthEndpoint: 'http://test.endpoint/health'
            });
        });
        
        it('should initialize with disconnected state', () => {
            assert.strictEqual(connectionManager.connectionState, ConnectionState.DISCONNECTED);
        });
        
        it('should attempt to start host when connecting', async () => {
            // Mock successful connection test
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true
            });
            
            const result = await connectionManager.connectToLLM();
            
            assert.strictEqual(result, true);
            assert.strictEqual(connectionManager.connectionState, ConnectionState.CONNECTED);
            sinon.assert.calledOnce(hostManagerStub.startHost);
        });
        
        it('should retry on connection failure', async () => {
            // Mock failed connection test
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
            
            // Add clock to control timers
            const clock = sinon.useFakeTimers();
            
            // Start connect but don't await (it will wait on setTimeout)
            const connectPromise = connectionManager.connectToLLM();
            
            // State should be error after first attempt
            assert.strictEqual(connectionManager.connectionState, ConnectionState.ERROR);
            
            // Mock successful connection on retry
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true
            });
            
            // Fast-forward past retry delay
            await clock.tickAsync(200);
            
            // Now await the original promise
            const result = await connectPromise;
            
            assert.strictEqual(result, true);
            assert.strictEqual(connectionManager.connectionState, ConnectionState.CONNECTED);
            
            // Clean up
            clock.restore();
        });
    });
    
    describe('LLMFactory', () => {
        let factory: LLMFactory;
        
        beforeEach(() => {
            // Create the factory
            factory = LLMFactory.getInstance();
        });
        
        it('should provide access to all LLM services', () => {
            assert.ok(factory.connectionManager instanceof LLMConnectionManager);
            assert.ok(factory.hostManager instanceof LLMHostManager);
            assert.ok(factory.sessionManager instanceof LLMSessionManager);
        });
        
        it('should initialize and register commands', async () => {
            const commandRegisterStub = sandbox.stub(vscode.commands, 'registerCommand').returns({
                dispose: sandbox.stub()
            } as any);
            
            await factory.initialize();
            
            // Should register 3 commands
            assert.strictEqual(commandRegisterStub.callCount, 3);
            assert.ok(commandRegisterStub.calledWith('copilot-ppa.llm.connect'));
            assert.ok(commandRegisterStub.calledWith('copilot-ppa.llm.disconnect'));
            assert.ok(commandRegisterStub.calledWith('copilot-ppa.llm.restart'));
        });
    });
});