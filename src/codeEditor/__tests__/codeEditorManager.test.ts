import * as vscode from 'vscode';
import { CodeEditorManager } from '../codeEditorManager';
import { CodeExecutorService } from '../services/codeExecutor';
import { CodeLinkerService } from '../services/codeLinker';
import { CodeNavigatorService } from '../services/codeNavigator';

// Mock dependencies
jest.mock('vscode', () => ({
    EventEmitter: jest.fn().mockImplementation(() => ({
        fire: jest.fn(),
        dispose: jest.fn(),
        event: jest.fn()
    })),
    window: {
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn()
    },
    commands: {
        registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
        executeCommand: jest.fn()
    },
    Disposable: {
        from: jest.fn()
    }
}));

jest.mock('../services/codeExecutor');
jest.mock('../services/codeNavigator');
jest.mock('../services/codeLinker');

describe('CodeEditorManager', () => {
    let manager: CodeEditorManager;
    let mockContext: vscode.ExtensionContext;
    let mockExecutor: jest.Mocked<CodeExecutorService>;
    let mockNavigator: jest.Mocked<CodeNavigatorService>;
    let mockLinker: jest.Mocked<CodeLinkerService>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock context
        mockContext = {
            subscriptions: [],
            extensionPath: '',
            storagePath: '',
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn(),
                keys: jest.fn().mockReturnValue([])
            } as any,
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([])
            } as any,
            extensionUri: {} as any,
            globalStoragePath: '',
            logPath: '',
            asAbsolutePath: jest.fn().mockImplementation(path => path),
            environmentVariableCollection: {} as any,
            extension: {} as any,
            extensionMode: 1,
            storageUri: {} as any,
            globalStorageUri: {} as any,
            logUri: {} as any,
            secrets: {} as any
        };

        // Get the constructor mock implementations
        mockExecutor = new CodeExecutorService() as jest.Mocked<CodeExecutorService>;
        mockNavigator = new CodeNavigatorService() as jest.Mocked<CodeNavigatorService>;
        mockLinker = new CodeLinkerService() as jest.Mocked<CodeLinkerService>;

        // Mock the static getInstance method to return a new instance
        Object.defineProperty(CodeEditorManager, 'instance', { value: undefined, writable: true });

        // Get the instance (this will create a new one)
        manager = CodeEditorManager.getInstance(mockContext);

        // Replace the service instances with our mocks
        (manager as any).executor = mockExecutor;
        (manager as any).navigator = mockNavigator;
        (manager as any).linker = mockLinker;
    });

    afterEach(() => {
        manager.dispose();
        Object.defineProperty(CodeEditorManager, 'instance', { value: undefined });
    });

    describe('Singleton pattern', () => {
        it('should create only one instance', () => {
            const instance1 = CodeEditorManager.getInstance(mockContext);
            const instance2 = CodeEditorManager.getInstance(mockContext);
            expect(instance1).toBe(instance2);
        });
    });

    describe('Command registration', () => {
        it('should register all necessary commands', () => {
            // Commands should be registered in the constructor
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.executeCode', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.showOverview', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.findReferences', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.createLink', expect.any(Function));
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.navigateLink', expect.any(Function));
        });
    });

    describe('ICodeExecutor methods', () => {
        it('should execute selected code', async () => {
            // Setup
            mockExecutor.executeSelectedCode.mockResolvedValue();

            // Execute
            await manager.executeSelectedCode();

            // Verify
            expect(mockExecutor.executeSelectedCode).toHaveBeenCalled();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('setContext', 'copilot-ppa:hasActiveExecution', true);
        });

        it('should handle execution errors', async () => {
            // Setup
            const mockError = new Error('Execution error');
            mockExecutor.executeSelectedCode.mockRejectedValue(mockError);

            // Execute and expect rejection
            await expect(manager.executeSelectedCode()).rejects.toThrow('Execution failed');

            // Verify
            expect(mockExecutor.executeSelectedCode).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to execute code'));
        });
    });

    describe('ICodeNavigator methods', () => {
        it('should show code overview', async () => {
            // Setup
            mockNavigator.showCodeOverview.mockResolvedValue();

            // Execute
            await manager.showCodeOverview();

            // Verify
            expect(mockNavigator.showCodeOverview).toHaveBeenCalled();
        });

        it('should handle code overview errors', async () => {
            // Setup
            const mockError = new Error('Navigation error');
            mockNavigator.showCodeOverview.mockRejectedValue(mockError);

            // Execute and expect rejection
            await expect(manager.showCodeOverview()).rejects.toThrow('Navigation failed');

            // Verify
            expect(mockNavigator.showCodeOverview).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to show code overview'));
        });

        it('should find references', async () => {
            // Setup
            mockNavigator.findReferences.mockResolvedValue();

            // Execute
            await manager.findReferences();

            // Verify
            expect(mockNavigator.findReferences).toHaveBeenCalled();
        });

        it('should handle find references errors', async () => {
            // Setup
            const mockError = new Error('Reference search error');
            mockNavigator.findReferences.mockRejectedValue(mockError);

            // Execute and expect rejection
            await expect(manager.findReferences()).rejects.toThrow('Reference search failed');

            // Verify
            expect(mockNavigator.findReferences).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to find references'));
        });
    });

    describe('ICodeLinker methods', () => {
        it('should create code link', async () => {
            // Setup
            mockLinker.createCodeLink.mockResolvedValue();

            // Execute
            await manager.createCodeLink();

            // Verify
            expect(mockLinker.createCodeLink).toHaveBeenCalled();
        });

        it('should handle create link errors', async () => {
            // Setup
            const mockError = new Error('Link creation error');
            mockLinker.createCodeLink.mockRejectedValue(mockError);

            // Execute and expect rejection
            await expect(manager.createCodeLink()).rejects.toThrow('Link creation failed');

            // Verify
            expect(mockLinker.createCodeLink).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to create code link'));
        });

        it('should navigate code link', async () => {
            // Setup
            mockLinker.navigateCodeLink.mockResolvedValue();

            // Execute
            await manager.navigateCodeLink();

            // Verify
            expect(mockLinker.navigateCodeLink).toHaveBeenCalled();
        });

        it('should handle navigate link errors', async () => {
            // Setup
            const mockError = new Error('Link navigation error');
            mockLinker.navigateCodeLink.mockRejectedValue(mockError);

            // Execute and expect rejection
            await expect(manager.navigateCodeLink()).rejects.toThrow('Link navigation failed');

            // Verify
            expect(mockLinker.navigateCodeLink).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to navigate code link'));
        });
    });

    describe('Metrics tracking', () => {
        it('should initialize metrics correctly', () => {
            const metrics = manager.getMetrics();
            expect(metrics.get('executions')).toBe(0);
            expect(metrics.get('navigations')).toBe(0);
            expect(metrics.get('links')).toBe(0);
            expect(metrics.get('errors')).toBe(0);
        });

        it('should increment execution metrics', async () => {
            // Setup
            mockExecutor.executeSelectedCode.mockResolvedValue();

            // Execute
            await manager.executeSelectedCode();

            // Verify
            const metrics = manager.getMetrics();
            expect(metrics.get('executions')).toBe(1);
        });

        it('should increment navigation metrics', async () => {
            // Setup
            mockNavigator.showCodeOverview.mockResolvedValue();
            mockNavigator.findReferences.mockResolvedValue();

            // Execute
            await manager.showCodeOverview();
            await manager.findReferences();

            // Verify
            const metrics = manager.getMetrics();
            expect(metrics.get('navigations')).toBe(2);
        });

        it('should increment link metrics', async () => {
            // Setup
            mockLinker.createCodeLink.mockResolvedValue();

            // Execute
            await manager.createCodeLink();

            // Verify
            const metrics = manager.getMetrics();
            expect(metrics.get('links')).toBe(1);
        });

        it('should increment error metrics on errors', async () => {
            // Setup
            mockExecutor.executeSelectedCode.mockRejectedValue(new Error('Test error'));
            mockNavigator.findReferences.mockRejectedValue(new Error('Test error'));
            mockLinker.createCodeLink.mockRejectedValue(new Error('Test error'));

            // Execute (and catch expected errors)
            try { await manager.executeSelectedCode(); } catch {}
            try { await manager.findReferences(); } catch {}
            try { await manager.createCodeLink(); } catch {}

            // Verify
            const metrics = manager.getMetrics();
            expect(metrics.get('errors')).toBe(3);
        });
    });

    describe('Disposal', () => {
        it('should dispose all resources', () => {
            // Mock disposable services
            mockExecutor.dispose = jest.fn();
            mockNavigator.dispose = jest.fn();
            mockLinker.dispose = jest.fn();

            // Perform disposal
            manager.dispose();

            // Verify all services are disposed
            expect(mockExecutor.dispose).toHaveBeenCalled();
            expect(mockNavigator.dispose).toHaveBeenCalled();
            expect(mockLinker.dispose).toHaveBeenCalled();
        });
    });
});
