// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\codeFormatCommands.js.test.js
const vscode = require('vscode');
const sinon = require('sinon');
const { registerCodeFormatCommands } = require('../codeFormatCommands');
const { CodeFormatService } = require('../../services/codeFormatService');

// Mock the CodeFormatService
jest.mock('../../services/codeFormatService');

describe('Code Format Commands', () => {
    let sandbox;
    let mockContext;
    let mockCommandsRegister;
    let mockCodeFormatService;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create a mock for vscode.commands.registerCommand
        mockCommandsRegister = sandbox.stub();
        sandbox.stub(vscode.commands, 'registerCommand').value(mockCommandsRegister);

        // Create a mock for ExtensionContext
        mockContext = {
            subscriptions: [],
            workspaceState: {},
            globalState: {},
            extensionPath: '',
            storagePath: '',
            globalStoragePath: '',
            logPath: '',
            extensionUri: {},
            environmentVariableCollection: {},
            extensionMode: vscode.ExtensionMode.Development,
            asAbsolutePath: sandbox.stub()
        };

        // Reset the CodeFormatService mock
        CodeFormatService.mockClear();
        mockCodeFormatService = new CodeFormatService();

        // Setup mock methods on CodeFormatService
        mockCodeFormatService.formatCode = jest.fn().mockResolvedValue(true);
        mockCodeFormatService.optimizeImports = jest.fn().mockResolvedValue(true);
        mockCodeFormatService.applyCodeStyle = jest.fn().mockResolvedValue(true);
        mockCodeFormatService.optimizeCode = jest.fn().mockResolvedValue(true);

        // Make the mock instance return when constructor is called
        CodeFormatService.mockImplementation(() => mockCodeFormatService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerCodeFormatCommands', () => {
        it('should register all code format commands', () => {
            registerCodeFormatCommands(mockContext);

            // Verify 4 commands were registered
            expect(mockCommandsRegister.callCount).toBe(4);

            // Verify the command IDs are correct
            expect(mockCommandsRegister.getCall(0).args[0]).toBe('localLLMAgent.formatCode');
            expect(mockCommandsRegister.getCall(1).args[0]).toBe('localLLMAgent.optimizeImports');
            expect(mockCommandsRegister.getCall(2).args[0]).toBe('localLLMAgent.applyCodeStyle');
            expect(mockCommandsRegister.getCall(3).args[0]).toBe('localLLMAgent.optimizeCode');

            // Verify all registered commands were added to context.subscriptions
            expect(mockContext.subscriptions.length).toBe(4);
        });

        it('should create and use a CodeFormatService instance', () => {
            registerCodeFormatCommands(mockContext);

            // Verify CodeFormatService constructor was called
            expect(CodeFormatService).toHaveBeenCalledTimes(1);
        });
    });

    describe('formatCode command', () => {
        it('should call CodeFormatService.formatCode when command is executed', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the formatCode command callback
            const formatCodeCallback = mockCommandsRegister.getCall(0).args[1];

            // Execute the command callback
            await formatCodeCallback();

            // Verify formatCode was called
            expect(mockCodeFormatService.formatCode).toHaveBeenCalledTimes(1);
        });

        it('should return the result from CodeFormatService.formatCode', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the formatCode command callback
            const formatCodeCallback = mockCommandsRegister.getCall(0).args[1];

            // Execute the command callback and check the result
            const result = await formatCodeCallback();
            expect(result).toBe(true);

            // Test with a different return value
            mockCodeFormatService.formatCode.mockResolvedValueOnce(false);
            const result2 = await formatCodeCallback();
            expect(result2).toBe(false);
        });
    });

    describe('optimizeImports command', () => {
        it('should call CodeFormatService.optimizeImports when command is executed', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the optimizeImports command callback
            const optimizeImportsCallback = mockCommandsRegister.getCall(1).args[1];

            // Execute the command callback
            await optimizeImportsCallback();

            // Verify optimizeImports was called
            expect(mockCodeFormatService.optimizeImports).toHaveBeenCalledTimes(1);
        });

        it('should return the result from CodeFormatService.optimizeImports', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the optimizeImports command callback
            const optimizeImportsCallback = mockCommandsRegister.getCall(1).args[1];

            // Execute the command callback and check the result
            const result = await optimizeImportsCallback();
            expect(result).toBe(true);

            // Test with a different return value
            mockCodeFormatService.optimizeImports.mockResolvedValueOnce(false);
            const result2 = await optimizeImportsCallback();
            expect(result2).toBe(false);
        });
    });

    describe('applyCodeStyle command', () => {
        it('should call CodeFormatService.applyCodeStyle when command is executed', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the applyCodeStyle command callback
            const applyCodeStyleCallback = mockCommandsRegister.getCall(2).args[1];

            // Execute the command callback
            await applyCodeStyleCallback();

            // Verify applyCodeStyle was called
            expect(mockCodeFormatService.applyCodeStyle).toHaveBeenCalledTimes(1);
        });

        it('should return the result from CodeFormatService.applyCodeStyle', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the applyCodeStyle command callback
            const applyCodeStyleCallback = mockCommandsRegister.getCall(2).args[1];

            // Execute the command callback and check the result
            const result = await applyCodeStyleCallback();
            expect(result).toBe(true);

            // Test with a different return value
            mockCodeFormatService.applyCodeStyle.mockResolvedValueOnce(false);
            const result2 = await applyCodeStyleCallback();
            expect(result2).toBe(false);
        });
    });

    describe('optimizeCode command', () => {
        it('should call CodeFormatService.optimizeCode when command is executed', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the optimizeCode command callback
            const optimizeCodeCallback = mockCommandsRegister.getCall(3).args[1];

            // Execute the command callback
            await optimizeCodeCallback();

            // Verify optimizeCode was called
            expect(mockCodeFormatService.optimizeCode).toHaveBeenCalledTimes(1);
        });

        it('should return the result from CodeFormatService.optimizeCode', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the optimizeCode command callback
            const optimizeCodeCallback = mockCommandsRegister.getCall(3).args[1];

            // Execute the command callback and check the result
            const result = await optimizeCodeCallback();
            expect(result).toBe(true);

            // Test with a different return value
            mockCodeFormatService.optimizeCode.mockResolvedValueOnce(false);
            const result2 = await optimizeCodeCallback();
            expect(result2).toBe(false);
        });
    });
});
