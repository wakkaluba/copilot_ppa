"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var logger_1 = require("../../../src/utils/logger");
var sinon = require("sinon");
describe('Logger', function () {
    var logger;
    var mockOutputChannel;
    var sandbox;
    var mockContext;
    var getConfigurationStub;
    beforeEach(function () {
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
            onDidChangeLogLevel: new vscode.EventEmitter().event,
            dispose: sandbox.stub(),
            trace: sandbox.stub(),
            debug: sandbox.stub(),
            info: sandbox.stub(),
            warn: sandbox.stub(),
            error: sandbox.stub()
        };
        // Create mock context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            // ... other required context properties
        };
        // Setup configuration stub for potential future use
        getConfigurationStub = sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: function () { return logger_1.LogLevel.INFO; },
            update: sandbox.stub()
        });
        // Get logger instance and inject mocks
        logger = logger_1.LoggerImpl.getInstance();
        // Access the private _outputChannel property - this is a bit hacky but works for tests
        logger._outputChannel = mockOutputChannel;
        logger.setLogLevel(logger_1.LogLevel.INFO);
        // Store context for potential use in future tests
        logger._context = mockContext;
    });
    afterEach(function () {
        sandbox.restore();
    });
    // ... rest of the tests
    it('should log messages with correct level', function () {
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');
        expect(mockOutputChannel.debug).toHaveBeenCalledWith('Debug message');
        expect(mockOutputChannel.info).toHaveBeenCalledWith('Info message');
        expect(mockOutputChannel.warn).toHaveBeenCalledWith('Warning message');
        expect(mockOutputChannel.error).toHaveBeenCalledWith('Error message');
    });
    it('should respect log level settings', function () {
        logger.setLogLevel(logger_1.LogLevel.WARN);
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
