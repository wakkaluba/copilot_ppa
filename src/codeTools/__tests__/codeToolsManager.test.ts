import * as vscode from 'vscode';
import { CodeToolsManager } from '../codeToolsManager';
import { ComplexityAnalyzer } from '../complexityAnalyzer';
import { LinterIntegration } from '../linterIntegration';
import { RefactoringTools } from '../refactoringTools';

// Mock dependencies
jest.mock('vscode');
jest.mock('../linterIntegration');
jest.mock('../complexityAnalyzer');
jest.mock('../refactoringTools');

describe('CodeToolsManager', () => {
    let codeToolsManager: CodeToolsManager;
    let mockContext: vscode.ExtensionContext;
    let mockSubscriptions: Array<{ dispose: jest.Mock }>;
    let mockLinterIntegration: jest.Mocked<LinterIntegration>;
    let mockComplexityAnalyzer: jest.Mocked<ComplexityAnalyzer>;
    let mockRefactoringTools: jest.Mocked<RefactoringTools>;

    beforeEach(() => {
        // Mock subscriptions
        mockSubscriptions = [];

        // Mock extension context
        mockContext = {
            subscriptions: mockSubscriptions as any,
        } as vscode.ExtensionContext;

        // Mock command registration
        (vscode.commands.registerCommand as jest.Mock) = jest.fn((command: string, callback: any) => {
            const disposable = { dispose: jest.fn() };
            return disposable;
        });

        // Create the manager with mocked dependencies
        codeToolsManager = new CodeToolsManager(mockContext);

        // Get references to the mocked dependencies
        mockLinterIntegration = (LinterIntegration as jest.MockedClass<typeof LinterIntegration>).mock.instances[0] as jest.Mocked<LinterIntegration>;
        mockComplexityAnalyzer = (ComplexityAnalyzer as jest.MockedClass<typeof ComplexityAnalyzer>).mock.instances[0] as jest.Mocked<ComplexityAnalyzer>;
        mockRefactoringTools = (RefactoringTools as jest.MockedClass<typeof RefactoringTools>).mock.instances[0] as jest.Mocked<RefactoringTools>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize all tools with the provided context', () => {
            expect(LinterIntegration).toHaveBeenCalledTimes(1);
            expect(ComplexityAnalyzer).toHaveBeenCalledTimes(1);
            expect(RefactoringTools).toHaveBeenCalledTimes(1);
        });
    });

    describe('initialize', () => {
        it('should initialize all tools and register commands', async () => {
            // Setup mock implementations
            mockLinterIntegration.initialize.mockResolvedValue();
            mockComplexityAnalyzer.initialize.mockResolvedValue();
            mockRefactoringTools.initialize.mockResolvedValue();

            await codeToolsManager.initialize();

            // Verify that all tool initialize methods were called
            expect(mockLinterIntegration.initialize).toHaveBeenCalledTimes(1);
            expect(mockComplexityAnalyzer.initialize).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.initialize).toHaveBeenCalledTimes(1);

            // Verify that commands were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(4);
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.runLinter', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.analyzeComplexity', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.simplifyCode', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.removeUnusedCode', expect.any(Function));
        });

        it('should propagate errors from tool initialization', async () => {
            // Setup mock implementations with an error
            const error = new Error('Initialization error');
            mockLinterIntegration.initialize.mockRejectedValue(error);
            mockComplexityAnalyzer.initialize.mockResolvedValue();
            mockRefactoringTools.initialize.mockResolvedValue();

            // Expect the initialize method to reject with the error
            await expect(codeToolsManager.initialize()).rejects.toThrow(error);

            // Verify that linter initialize was called and failed
            expect(mockLinterIntegration.initialize).toHaveBeenCalledTimes(1);

            // Other initializations shouldn't be called due to the error
            expect(mockComplexityAnalyzer.initialize).not.toHaveBeenCalled();
            expect(mockRefactoringTools.initialize).not.toHaveBeenCalled();

            // Commands should not be registered
            expect(vscode.commands.registerCommand).not.toHaveBeenCalled();
        });
    });

    describe('registerCommands', () => {
        it('should register all commands and add them to subscriptions', async () => {
            // Setup all initializations to succeed
            mockLinterIntegration.initialize.mockResolvedValue();
            mockComplexityAnalyzer.initialize.mockResolvedValue();
            mockRefactoringTools.initialize.mockResolvedValue();

            // Initialize to trigger registerCommands
            await codeToolsManager.initialize();

            // Verify that all commands were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.runLinter', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.analyzeComplexity', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.simplifyCode', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.removeUnusedCode', expect.any(Function));

            // Check that the disposables were added to context.subscriptions
            expect(mockContext.subscriptions.length).toBe(4);
        });

        it('should execute the corresponding tool method when a command is triggered', async () => {
            // Setup all initializations to succeed
            mockLinterIntegration.initialize.mockResolvedValue();
            mockComplexityAnalyzer.initialize.mockResolvedValue();
            mockRefactoringTools.initialize.mockResolvedValue();

            // Mock tool methods
            mockLinterIntegration.runLinter.mockResolvedValue();
            mockComplexityAnalyzer.analyzeFile.mockResolvedValue();
            mockRefactoringTools.simplifyCode.mockResolvedValue();
            mockRefactoringTools.removeUnusedCode.mockResolvedValue();

            await codeToolsManager.initialize();

            // Extract and call the registered command callbacks
            const calls = (vscode.commands.registerCommand as jest.Mock).mock.calls;
            const runLinterCallback = calls.find(call => call[0] === 'local-llm-agent.runLinter')[1];
            const analyzeComplexityCallback = calls.find(call => call[0] === 'local-llm-agent.analyzeComplexity')[1];
            const simplifyCodeCallback = calls.find(call => call[0] === 'local-llm-agent.simplifyCode')[1];
            const removeUnusedCodeCallback = calls.find(call => call[0] === 'local-llm-agent.removeUnusedCode')[1];

            // Execute each callback
            await runLinterCallback();
            await analyzeComplexityCallback();
            await simplifyCodeCallback();
            await removeUnusedCodeCallback();

            // Verify that each tool method was called
            expect(mockLinterIntegration.runLinter).toHaveBeenCalledTimes(1);
            expect(mockComplexityAnalyzer.analyzeFile).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.simplifyCode).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.removeUnusedCode).toHaveBeenCalledTimes(1);
        });
    });

    describe('dispose', () => {
        it('should dispose all tool instances', () => {
            // Setup mock dispose methods
            mockLinterIntegration.dispose.mockImplementation();
            mockComplexityAnalyzer.dispose.mockImplementation();
            mockRefactoringTools.dispose.mockImplementation();

            // Call dispose
            codeToolsManager.dispose();

            // Verify that all dispose methods were called
            expect(mockLinterIntegration.dispose).toHaveBeenCalledTimes(1);
            expect(mockComplexityAnalyzer.dispose).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.dispose).toHaveBeenCalledTimes(1);
        });
    });
});
