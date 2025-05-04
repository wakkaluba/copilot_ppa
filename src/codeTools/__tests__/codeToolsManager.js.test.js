const vscode = require('vscode');
const { CodeToolsManager } = require('../codeToolsManager');
const { LinterIntegration } = require('../linterIntegration');
const { ComplexityAnalyzer } = require('../complexityAnalyzer');
const { RefactoringTools } = require('../refactoringTools');
const { DocumentationGenerator } = require('../documentationGenerator');

// Mock dependencies
jest.mock('vscode');
jest.mock('../linterIntegration');
jest.mock('../complexityAnalyzer');
jest.mock('../refactoringTools');
jest.mock('../documentationGenerator');

describe('CodeToolsManager', () => {
    let codeToolsManager;
    let mockContext;
    let mockSubscriptions;
    let mockLinterIntegration;
    let mockComplexityAnalyzer;
    let mockRefactoringTools;
    let mockDocumentationGenerator;

    beforeEach(() => {
        // Mock subscriptions
        mockSubscriptions = [];

        // Mock extension context
        mockContext = {
            subscriptions: mockSubscriptions,
        };

        // Mock command registration
        vscode.commands.registerCommand = jest.fn((command, callback) => {
            const disposable = { dispose: jest.fn() };
            return disposable;
        });

        // Create the manager with mocked dependencies
        codeToolsManager = new CodeToolsManager(mockContext);

        // Get references to the mocked dependencies
        mockLinterIntegration = LinterIntegration.mock.instances[0];
        mockComplexityAnalyzer = ComplexityAnalyzer.mock.instances[0];
        mockRefactoringTools = RefactoringTools.mock.instances[0];
        mockDocumentationGenerator = DocumentationGenerator.mock.instances[0];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize all tools with the provided context', () => {
            expect(LinterIntegration).toHaveBeenCalledTimes(1);
            expect(ComplexityAnalyzer).toHaveBeenCalledTimes(1);
            expect(RefactoringTools).toHaveBeenCalledTimes(1);
            expect(DocumentationGenerator).toHaveBeenCalledTimes(1);
        });
    });

    describe('initialize', () => {
        it('should initialize all tools and register commands', async () => {
            // Setup mock implementations
            mockLinterIntegration.initialize = jest.fn().mockResolvedValue();
            mockComplexityAnalyzer.initialize = jest.fn().mockResolvedValue();
            mockRefactoringTools.initialize = jest.fn().mockResolvedValue();
            mockDocumentationGenerator.initialize = jest.fn().mockResolvedValue();

            await codeToolsManager.initialize();

            // Verify that all tool initialize methods were called
            expect(mockLinterIntegration.initialize).toHaveBeenCalledTimes(1);
            expect(mockComplexityAnalyzer.initialize).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.initialize).toHaveBeenCalledTimes(1);
            expect(mockDocumentationGenerator.initialize).toHaveBeenCalledTimes(1);

            // Verify that commands were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(5);
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.runLinter', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.analyzeComplexity', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.simplifyCode', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.removeUnusedCode', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.generateDocs', expect.any(Function));
        });

        it('should propagate errors from tool initialization', async () => {
            // Setup mock implementations with an error
            const error = new Error('Initialization error');
            mockLinterIntegration.initialize = jest.fn().mockRejectedValue(error);
            mockComplexityAnalyzer.initialize = jest.fn().mockResolvedValue();
            mockRefactoringTools.initialize = jest.fn().mockResolvedValue();
            mockDocumentationGenerator.initialize = jest.fn().mockResolvedValue();

            // Expect the initialize method to reject with the error
            await expect(codeToolsManager.initialize()).rejects.toThrow(error);

            // Verify that linter initialize was called and failed
            expect(mockLinterIntegration.initialize).toHaveBeenCalledTimes(1);

            // Other initializations shouldn't be called due to the error
            expect(mockComplexityAnalyzer.initialize).not.toHaveBeenCalled();
            expect(mockRefactoringTools.initialize).not.toHaveBeenCalled();
            expect(mockDocumentationGenerator.initialize).not.toHaveBeenCalled();

            // Commands should not be registered
            expect(vscode.commands.registerCommand).not.toHaveBeenCalled();
        });

        // Additional JavaScript-specific test: handling of non-Error rejections
        it('should handle non-Error rejection values', async () => {
            // Setup mock implementations with a non-Error rejection
            mockLinterIntegration.initialize = jest.fn().mockRejectedValue('Something went wrong');
            mockComplexityAnalyzer.initialize = jest.fn().mockResolvedValue();
            mockRefactoringTools.initialize = jest.fn().mockResolvedValue();
            mockDocumentationGenerator.initialize = jest.fn().mockResolvedValue();

            // Expect the initialize method to reject with the string
            await expect(codeToolsManager.initialize()).rejects.toBe('Something went wrong');

            // Verify that linter initialize was called and failed
            expect(mockLinterIntegration.initialize).toHaveBeenCalledTimes(1);
        });
    });

    describe('registerCommands', () => {
        it('should register all commands and add them to subscriptions', async () => {
            // Setup all initializations to succeed
            mockLinterIntegration.initialize = jest.fn().mockResolvedValue();
            mockComplexityAnalyzer.initialize = jest.fn().mockResolvedValue();
            mockRefactoringTools.initialize = jest.fn().mockResolvedValue();
            mockDocumentationGenerator.initialize = jest.fn().mockResolvedValue();

            // Initialize to trigger registerCommands
            await codeToolsManager.initialize();

            // Verify that all commands were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.runLinter', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.analyzeComplexity', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.simplifyCode', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.removeUnusedCode', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('local-llm-agent.generateDocs', expect.any(Function));

            // Check that the disposables were added to context.subscriptions
            expect(mockContext.subscriptions.length).toBe(5);
        });

        it('should execute the corresponding tool method when a command is triggered', async () => {
            // Setup all initializations to succeed
            mockLinterIntegration.initialize = jest.fn().mockResolvedValue();
            mockComplexityAnalyzer.initialize = jest.fn().mockResolvedValue();
            mockRefactoringTools.initialize = jest.fn().mockResolvedValue();
            mockDocumentationGenerator.initialize = jest.fn().mockResolvedValue();

            // Mock tool methods
            mockLinterIntegration.runLinter = jest.fn().mockResolvedValue();
            mockComplexityAnalyzer.analyzeFile = jest.fn().mockResolvedValue();
            mockRefactoringTools.simplifyCode = jest.fn().mockResolvedValue();
            mockRefactoringTools.removeUnusedCode = jest.fn().mockResolvedValue();
            mockDocumentationGenerator.generateDocs = jest.fn().mockResolvedValue();

            await codeToolsManager.initialize();

            // Extract and call the registered command callbacks
            const calls = vscode.commands.registerCommand.mock.calls;
            const runLinterCallback = calls.find(call => call[0] === 'local-llm-agent.runLinter')[1];
            const analyzeComplexityCallback = calls.find(call => call[0] === 'local-llm-agent.analyzeComplexity')[1];
            const simplifyCodeCallback = calls.find(call => call[0] === 'local-llm-agent.simplifyCode')[1];
            const removeUnusedCodeCallback = calls.find(call => call[0] === 'local-llm-agent.removeUnusedCode')[1];
            const generateDocsCallback = calls.find(call => call[0] === 'local-llm-agent.generateDocs')[1];

            // Execute each callback
            await runLinterCallback();
            await analyzeComplexityCallback();
            await simplifyCodeCallback();
            await removeUnusedCodeCallback();
            await generateDocsCallback();

            // Verify that each tool method was called
            expect(mockLinterIntegration.runLinter).toHaveBeenCalledTimes(1);
            expect(mockComplexityAnalyzer.analyzeFile).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.simplifyCode).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.removeUnusedCode).toHaveBeenCalledTimes(1);
            expect(mockDocumentationGenerator.generateDocs).toHaveBeenCalledTimes(1);
        });

        // JavaScript-specific test: dynamic command handling
        it('should handle commands dynamically without TypeScript type checking', async () => {
            // Setup all initializations to succeed
            mockLinterIntegration.initialize = jest.fn().mockResolvedValue();
            mockComplexityAnalyzer.initialize = jest.fn().mockResolvedValue();
            mockRefactoringTools.initialize = jest.fn().mockResolvedValue();
            mockDocumentationGenerator.initialize = jest.fn().mockResolvedValue();

            // Mock a new method at runtime
            mockLinterIntegration.customLintFunction = jest.fn().mockResolvedValue('custom result');

            await codeToolsManager.initialize();

            // Simulate adding a dynamic command at runtime
            const customDisposable = { dispose: jest.fn() };
            vscode.commands.registerCommand.mockReturnValueOnce(customDisposable);

            // Add a dynamic command manually
            mockContext.subscriptions.push(
                vscode.commands.registerCommand('local-llm-agent.customLint',
                    () => mockLinterIntegration.customLintFunction())
            );

            // Find and execute the dynamic command
            const calls = vscode.commands.registerCommand.mock.calls;
            const lastCall = calls[calls.length - 1];
            expect(lastCall[0]).toBe('local-llm-agent.customLint');

            const customCallback = lastCall[1];
            const result = await customCallback();

            // Verify the dynamic method was called
            expect(mockLinterIntegration.customLintFunction).toHaveBeenCalledTimes(1);
            expect(result).toBe('custom result');
        });
    });

    describe('dispose', () => {
        it('should dispose all tool instances', () => {
            // Setup mock dispose methods
            mockLinterIntegration.dispose = jest.fn();
            mockComplexityAnalyzer.dispose = jest.fn();
            mockRefactoringTools.dispose = jest.fn();
            mockDocumentationGenerator.dispose = jest.fn();

            // Call dispose
            codeToolsManager.dispose();

            // Verify that all dispose methods were called
            expect(mockLinterIntegration.dispose).toHaveBeenCalledTimes(1);
            expect(mockComplexityAnalyzer.dispose).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.dispose).toHaveBeenCalledTimes(1);
            expect(mockDocumentationGenerator.dispose).toHaveBeenCalledTimes(1);
        });

        // JavaScript-specific test: handling missing dispose methods
        it('should handle cases where dispose methods might be missing', () => {
            // Setup one missing dispose method
            mockLinterIntegration.dispose = jest.fn();
            mockComplexityAnalyzer.dispose = undefined; // Missing dispose
            mockRefactoringTools.dispose = jest.fn();
            mockDocumentationGenerator.dispose = jest.fn();

            // Call dispose - this should not throw an error
            expect(() => {
                codeToolsManager.dispose();
            }).not.toThrow();

            // Verify other dispose methods were still called
            expect(mockLinterIntegration.dispose).toHaveBeenCalledTimes(1);
            expect(mockRefactoringTools.dispose).toHaveBeenCalledTimes(1);
            expect(mockDocumentationGenerator.dispose).toHaveBeenCalledTimes(1);
        });
    });
});
