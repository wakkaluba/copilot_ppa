import * as vscode from 'vscode';
import { LoggerImpl, LogLevel } from '../../../src/utils/logger';
import * as sinon from 'sinon';

describe('Logger', () => {
    let logger: LoggerImpl;
    let mockOutputChannel: vscode.LogOutputChannel;
    let sandbox: sinon.SinonSandbox;
    let mockContext: vscode.ExtensionContext;
    let getConfigurationStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        // Create mock output channel
        mockOutputChannel = {
            name: 'Mock Log Channel',
            logLevel: vscode.LogLevel.Info,
            appendLine: sandbox.stub(),
            append: sandbox.stub(),
            clear: sandbox.stub(),
            hide: sandbox.stub(),
            show: sandbox.stub(),
            onDidChangeLogLevel: new vscode.EventEmitter<vscode.LogLevel>().event,
            dispose: sandbox.stub(),
            trace: sandbox.stub(),
            debug: sandbox.stub(),
            info: sandbox.stub(),
            warn: sandbox.stub(),
            error: sandbox.stub()
        } as unknown as vscode.LogOutputChannel;

        // Create mock context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            // ... other required context properties
        } as unknown as vscode.ExtensionContext;

        // Setup configuration stub for potential future use
        getConfigurationStub = sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: () => LogLevel.INFO,
            update: sandbox.stub()
        } as any);

        // Get logger instance and inject mocks
        logger = LoggerImpl.getInstance();
        // Access the private _outputChannel property - this is a bit hacky but works for tests
        (logger as any)._outputChannel = mockOutputChannel;
        logger.setLogLevel(LogLevel.INFO);
        
        // Store context for potential use in future tests
        (logger as any)._context = mockContext;
    });

    afterEach(() => {
        sandbox.restore();
    });

    // ... rest of the tests
    it('should log messages with correct level', () => {
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');

        expect(mockOutputChannel.debug).toHaveBeenCalledWith('Debug message');
        expect(mockOutputChannel.info).toHaveBeenCalledWith('Info message');
        expect(mockOutputChannel.warn).toHaveBeenCalledWith('Warning message');
        expect(mockOutputChannel.error).toHaveBeenCalledWith('Error message');
    });

    it('should respect log level settings', () => {
        logger.setLogLevel(LogLevel.WARN);
        
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');

        expect(mockOutputChannel.debug).not.toHaveBeenCalled();
        expect(mockOutputChannel.info).not.toHaveBeenCalled();
        expect(mockOutputChannel.warn).toHaveBeenCalledWith('Warning message');
        expect(mockOutputChannel.error).toHaveBeenCalledWith('Error message');
    });

    // ... rest of tests
});