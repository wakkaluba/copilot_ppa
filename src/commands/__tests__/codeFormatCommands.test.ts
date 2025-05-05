// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\codeFormatCommands.test.ts
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeFormatService } from '../../services/codeFormatService';
import { registerCodeFormatCommands } from '../codeFormatCommands';

// Mock the CodeFormatService
jest.mock('../../services/codeFormatService');

describe('Code Format Commands', () => {
    let sandbox: sinon.SinonSandbox;
    let mockContext: vscode.ExtensionContext;
    let mockCommandsRegister: sinon.SinonStub;
    let mockCodeFormatService: jest.Mocked<CodeFormatService>;
    let mockDisposable: vscode.Disposable;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create mock disposable
        mockDisposable = { dispose: sandbox.stub() };

        // Create a mock for vscode.commands.registerCommand
        mockCommandsRegister = sandbox.stub().returns(mockDisposable);
        sandbox.stub(vscode.commands, 'registerCommand').value(mockCommandsRegister);

        // Create a mock for ExtensionContext
        mockContext = {
            subscriptions: [],
            workspaceState: {} as any,
            globalState: {} as any,
            extensionPath: '',
            storagePath: '',
            globalStoragePath: '',
            logPath: '',
            extensionUri: {} as any,
            environmentVariableCollection: {} as any,
            extensionMode: vscode.ExtensionMode.Development,
            asAbsolutePath: sandbox.stub()
        };

        // Reset the CodeFormatService mock
        (CodeFormatService as jest.Mock).mockClear();
        mockCodeFormatService = new CodeFormatService() as jest.Mocked<CodeFormatService>;

        // Setup mock methods on CodeFormatService
        mockCodeFormatService.formatCode = jest.fn().mockResolvedValue(true);
        mockCodeFormatService.optimizeImports = jest.fn().mockResolvedValue(true);
        mockCodeFormatService.applyCodeStyle = jest.fn().mockResolvedValue(true);
        mockCodeFormatService.optimizeCode = jest.fn().mockResolvedValue(true);

        // Make the mock instance return when constructor is called
        (CodeFormatService as jest.Mock).mockImplementation(() => mockCodeFormatService);
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

        it('should add command disposables to context subscriptions', () => {
            registerCodeFormatCommands(mockContext);

            // Verify disposables were added to context.subscriptions
            expect(mockContext.subscriptions).toContain(mockDisposable);
            expect(mockContext.subscriptions.length).toBe(4);
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

        it('should handle errors from CodeFormatService.formatCode', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the formatCode command callback
            const formatCodeCallback = mockCommandsRegister.getCall(0).args[1];

            // Setup error mock
            const testError = new Error('Format code error');
            mockCodeFormatService.formatCode.mockRejectedValueOnce(testError);

            // Execute the command callback and check that error is propagated
            await expect(formatCodeCallback()).rejects.toThrow('Format code error');
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

        it('should handle errors from CodeFormatService.optimizeImports', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the optimizeImports command callback
            const optimizeImportsCallback = mockCommandsRegister.getCall(1).args[1];

            // Setup error mock
            const testError = new Error('Optimize imports error');
            mockCodeFormatService.optimizeImports.mockRejectedValueOnce(testError);

            // Execute the command callback and check that error is propagated
            await expect(optimizeImportsCallback()).rejects.toThrow('Optimize imports error');
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

        it('should handle errors from CodeFormatService.applyCodeStyle', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the applyCodeStyle command callback
            const applyCodeStyleCallback = mockCommandsRegister.getCall(2).args[1];

            // Setup error mock
            const testError = new Error('Apply code style error');
            mockCodeFormatService.applyCodeStyle.mockRejectedValueOnce(testError);

            // Execute the command callback and check that error is propagated
            await expect(applyCodeStyleCallback()).rejects.toThrow('Apply code style error');
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

        it('should handle errors from CodeFormatService.optimizeCode', async () => {
            registerCodeFormatCommands(mockContext);

            // Get the optimizeCode command callback
            const optimizeCodeCallback = mockCommandsRegister.getCall(3).args[1];

            // Setup error mock
            const testError = new Error('Optimize code error');
            mockCodeFormatService.optimizeCode.mockRejectedValueOnce(testError);

            // Execute the command callback and check that error is propagated
            await expect(optimizeCodeCallback()).rejects.toThrow('Optimize code error');
        });
    });

    describe('command disposal', () => {
        it('should provide disposable objects that call dispose when invoked', () => {
            registerCodeFormatCommands(mockContext);

            // Check that the disposables were created and added to subscriptions
            expect(mockContext.subscriptions.length).toBe(4);

            // Simulate VS Code calling dispose() on the registered command
            const disposable = mockContext.subscriptions[0];
            if (disposable && typeof disposable.dispose === 'function') {
                disposable.dispose();
                expect(mockDisposable.dispose).toHaveBeenCalled();
            }
        });
    });
});
