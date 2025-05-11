import * as vscode from 'vscode';
import { CopilotIntegrationProvider } from '../../copilot/copilotIntegrationProvider';
import { CopilotIntegrationService } from '../../copilot/copilotIntegrationService';
import { CopilotIntegrationWebview } from '../../copilot/copilotIntegrationWebview';
import { registerCopilotIntegrationCommands } from '../commandPaletteCopilotIntegration';
import { CopilotCodeProcessingService } from '../services/CopilotCodeProcessingService';
import { CopilotCommandRegistrationService } from '../services/CopilotCommandRegistrationService';
import { CopilotStatusBarService } from '../services/CopilotStatusBarService';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../copilot/copilotIntegrationWebview');
jest.mock('../../copilot/copilotIntegrationProvider');
jest.mock('../../copilot/copilotIntegrationService');
jest.mock('../services/CopilotCommandRegistrationService');
jest.mock('../services/CopilotStatusBarService');
jest.mock('../services/CopilotCodeProcessingService');

describe('commandPaletteCopilotIntegration', () => {
    // Common mocks
    let mockContext: vscode.ExtensionContext;
    let mockProvider: jest.Mocked<CopilotIntegrationProvider>;
    let mockService: jest.Mocked<CopilotIntegrationService>;
    let mockCommandService: jest.Mocked<CopilotCommandRegistrationService>;
    let mockStatusBarService: jest.Mocked<CopilotStatusBarService>;
    let mockCodeProcessingService: jest.Mocked<CopilotCodeProcessingService>;
    let mockWebview: jest.Mocked<CopilotIntegrationWebview>;
    let mockEditor: vscode.TextEditor;
    let mockDocument: vscode.TextDocument;
    let mockSelection: vscode.Selection;

    beforeEach(() => {
        // Reset all mocks
        jest.resetAllMocks();

        // Setup context mock
        mockContext = {
            subscriptions: []
        } as unknown as vscode.ExtensionContext;

        // Setup provider and service mocks
        mockProvider = {
            // Add any required methods for tests
        } as unknown as jest.Mocked<CopilotIntegrationProvider>;

        mockService = {
            isAvailable: jest.fn().mockReturnValue(true)
        } as unknown as jest.Mocked<CopilotIntegrationService>;

        // Setup service mocks
        mockCommandService = new CopilotCommandRegistrationService(
            mockContext,
            mockService
        ) as jest.Mocked<CopilotCommandRegistrationService>;

        mockStatusBarService = new CopilotStatusBarService(
            mockContext
        ) as jest.Mocked<CopilotStatusBarService>;

        mockCodeProcessingService = new CopilotCodeProcessingService(
            mockProvider
        ) as jest.Mocked<CopilotCodeProcessingService>;

        // Setup constructor mocks
        (CopilotCommandRegistrationService as jest.Mock).mockImplementation(() => mockCommandService);
        (CopilotStatusBarService as jest.Mock).mockImplementation(() => mockStatusBarService);
        (CopilotCodeProcessingService as jest.Mock).mockImplementation(() => mockCodeProcessingService);

        // Setup webview mock
        mockWebview = {
            show: jest.fn()
        } as unknown as jest.Mocked<CopilotIntegrationWebview>;
        (CopilotIntegrationWebview as jest.Mock).mockImplementation(() => mockWebview);

        // Setup editor and document mocks
        mockSelection = {
            isEmpty: false,
        } as unknown as vscode.Selection;

        mockDocument = {
            getText: jest.fn().mockReturnValue('const test = "Hello World";')
        } as unknown as vscode.TextDocument;

        mockEditor = {
            selection: mockSelection,
            document: mockDocument
        } as unknown as vscode.TextEditor;

        // Mock showInputBox
        (vscode.window.showInputBox as jest.Mock).mockResolvedValue('Explain this code');

        // Mock command registration
        jest.spyOn(mockCommandService, 'registerWebviewCommand').mockImplementation(cb => {
            // Store the callback so we can call it in tests
            (mockCommandService as any).webviewCallback = cb;
            return { dispose: jest.fn() };
        });

        jest.spyOn(mockCommandService, 'registerProviderToggleCommand').mockImplementation(cb => {
            (mockCommandService as any).toggleCallback = cb;
            return { dispose: jest.fn() };
        });

        jest.spyOn(mockCommandService, 'registerAvailabilityCheckCommand').mockImplementation(cb => {
            (mockCommandService as any).availabilityCallback = cb;
            return { dispose: jest.fn() };
        });

        jest.spyOn(mockCommandService, 'registerCodeSelectionCommand').mockImplementation(cb => {
            (mockCommandService as any).codeSelectionCallback = cb;
            return { dispose: jest.fn() };
        });

        // Mock status bar methods
        mockStatusBarService.updateStatusBar = jest.fn();
        mockStatusBarService.toggleProvider = jest.fn().mockResolvedValue('copilot');

        // Mock code processing
        mockCodeProcessingService.processCode = jest.fn().mockResolvedValue({
            completion: 'This code creates a constant variable "test" with the value "Hello World".'
        });

        // Mock VS Code window functions
        (vscode.window.showInformationMessage as jest.Mock) = jest.fn();
        (vscode.window.showErrorMessage as jest.Mock) = jest.fn();
        (vscode.window.withProgress as jest.Mock) = jest.fn().mockImplementation((_, cb) => cb());
        (vscode.workspace.openTextDocument as jest.Mock) = jest.fn().mockResolvedValue({});
        (vscode.window.showTextDocument as jest.Mock) = jest.fn().mockResolvedValue({});
    });

    describe('registerCopilotIntegrationCommands', () => {
        it('should create services and register commands', () => {
            // Act
            registerCopilotIntegrationCommands(mockContext, mockProvider, mockService);

            // Assert
            expect(CopilotCommandRegistrationService).toHaveBeenCalledWith(mockContext, mockService);
            expect(CopilotStatusBarService).toHaveBeenCalledWith(mockContext);
            expect(CopilotCodeProcessingService).toHaveBeenCalledWith(mockProvider);

            expect(mockCommandService.registerWebviewCommand).toHaveBeenCalled();
            expect(mockCommandService.registerProviderToggleCommand).toHaveBeenCalled();
            expect(mockCommandService.registerAvailabilityCheckCommand).toHaveBeenCalled();
            expect(mockCommandService.registerCodeSelectionCommand).toHaveBeenCalled();

            // Verify status bar is set up
            expect(mockContext.subscriptions.push).toHaveBeenCalled();
            expect(mockStatusBarService.updateStatusBar).toHaveBeenCalled();
        });
    });

    describe('Command callbacks', () => {
        beforeEach(() => {
            registerCopilotIntegrationCommands(mockContext, mockProvider, mockService);
        });

        it('should show webview when webview command is triggered', () => {
            // Act
            (mockCommandService as any).webviewCallback();

            // Assert
            expect(CopilotIntegrationWebview).toHaveBeenCalledWith(mockContext, mockService);
            expect(mockWebview.show).toHaveBeenCalled();
        });

        it('should toggle provider when toggle command is triggered', async () => {
            // Act
            await (mockCommandService as any).toggleCallback();

            // Assert
            expect(mockStatusBarService.toggleProvider).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Switched to GitHub Copilot as the provider.'
            );
        });

        it('should show correct message when toggling to Local LLM provider', async () => {
            // Arrange
            mockStatusBarService.toggleProvider = jest.fn().mockResolvedValue('local');

            // Act
            await (mockCommandService as any).toggleCallback();

            // Assert
            expect(mockStatusBarService.toggleProvider).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Switched to Local LLM as the provider.'
            );
        });

        it('should check availability when availability command is triggered', () => {
            // Act
            const result = (mockCommandService as any).availabilityCallback();

            // Assert
            expect(mockService.isAvailable).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should show error message when Copilot is not available', () => {
            // Arrange
            mockService.isAvailable = jest.fn().mockReturnValue(false);

            // Act
            const result = (mockCommandService as any).availabilityCallback();

            // Assert
            expect(mockService.isAvailable).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('should handle code selection when code selection command is triggered', async () => {
            // Act
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert
            expect(mockDocument.getText).toHaveBeenCalledWith(mockSelection);
            expect(vscode.window.showInputBox).toHaveBeenCalled();
            expect(mockCodeProcessingService.processCode).toHaveBeenCalledWith(
                'const test = "Hello World";',
                'Explain this code'
            );
            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showTextDocument).toHaveBeenCalled();
        });

        it('should show error when selection is empty', async () => {
            // Arrange
            const emptyEditor = {
                selection: { isEmpty: true },
                document: mockDocument
            } as unknown as vscode.TextEditor;

            // Act
            await (mockCommandService as any).codeSelectionCallback(emptyEditor);

            // Assert
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'No text selected to send to Copilot.'
            );
            expect(mockCodeProcessingService.processCode).not.toHaveBeenCalled();
        });

        it('should not process when user cancels input', async () => {
            // Arrange
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(undefined);

            // Act
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert
            expect(mockCodeProcessingService.processCode).not.toHaveBeenCalled();
        });

        it('should handle errors during code processing', async () => {
            // Arrange
            mockCodeProcessingService.processCode = jest.fn().mockRejectedValue(new Error('Processing error'));
            (vscode.window.withProgress as jest.Mock) = jest.fn().mockImplementation((_, cb) => cb());

            // Act
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Error processing with Copilot: Error: Processing error'
            );
        });

        it('should format the response content correctly when processing code', async () => {
            // Arrange
            const mockResponse = {
                completion: 'This is a test completion response.'
            };
            mockCodeProcessingService.processCode = jest.fn().mockResolvedValue(mockResponse);

            const expectedContent = `# Copilot Response\n\n${mockResponse.completion}`;

            // Act
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith({
                content: expectedContent,
                language: 'markdown'
            });
        });

        it('should use the correct view column when opening response document', async () => {
            // Act
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert
            expect(vscode.window.showTextDocument).toHaveBeenCalledWith(
                expect.anything(),
                { viewColumn: vscode.ViewColumn.Beside }
            );
        });

        it('should handle processing with different prompt types', async () => {
            // Arrange
            const prompts = [
                'Explain this code',
                'Refactor this code',
                'Optimize this code',
                'Custom instruction with specific details'
            ];

            for (const prompt of prompts) {
                // Reset mocks for each prompt test
                jest.clearAllMocks();
                (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(prompt);

                // Act
                await (mockCommandService as any).codeSelectionCallback(mockEditor);

                // Assert
                expect(mockCodeProcessingService.processCode).toHaveBeenCalledWith(
                    'const test = "Hello World";',
                    prompt
                );
            }
        });
    });

    describe('Status bar updates', () => {
        it('should update status bar when configuration changes', () => {
            // Arrange
            let configChangeCallback: (e: vscode.ConfigurationChangeEvent) => void;
            mockContext.subscriptions.push = jest.fn().mockImplementation((disposable) => {
                configChangeCallback = (disposable as any).callback;
            });

            const mockEvent = {
                affectsConfiguration: jest.fn().mockReturnValue(true)
            } as unknown as vscode.ConfigurationChangeEvent;

            // Act
            registerCopilotIntegrationCommands(mockContext, mockProvider, mockService);
            configChangeCallback(mockEvent);

            // Assert
            expect(mockStatusBarService.updateStatusBar).toHaveBeenCalledTimes(2); // Once on init, once on config change
        });

        it('should not update status bar when unrelated configuration changes', () => {
            // Arrange
            let configChangeCallback: (e: vscode.ConfigurationChangeEvent) => void;
            mockContext.subscriptions.push = jest.fn().mockImplementation((disposable) => {
                configChangeCallback = (disposable as any).callback;
            });

            const mockEvent = {
                affectsConfiguration: jest.fn().mockReturnValue(false)
            } as unknown as vscode.ConfigurationChangeEvent;

            // Act
            registerCopilotIntegrationCommands(mockContext, mockProvider, mockService);
            configChangeCallback(mockEvent);

            // Assert
            expect(mockStatusBarService.updateStatusBar).toHaveBeenCalledTimes(1); // Only on init
        });
    });

    describe('Progress indication', () => {
        it('should display progress notification during processing', async () => {
            // Arrange
            let progressOptions: vscode.ProgressOptions;
            let progressCallback: () => Promise<void>;

            (vscode.window.withProgress as jest.Mock) = jest.fn().mockImplementation((options, callback) => {
                progressOptions = options;
                progressCallback = callback;
                return progressCallback();
            });

            // Act
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert
            expect(vscode.window.withProgress).toHaveBeenCalled();
            expect(progressOptions).toEqual({
                location: vscode.ProgressLocation.Notification,
                title: 'Processing with Copilot...',
                cancellable: false
            });
        });

        it('should handle null or undefined response from processCode', async () => {
            // Arrange
            mockCodeProcessingService.processCode = jest.fn().mockResolvedValue(null);

            // Act
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert
            expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
            expect(vscode.window.showTextDocument).not.toHaveBeenCalled();

            // Test with undefined response
            mockCodeProcessingService.processCode = jest.fn().mockResolvedValue(undefined);

            // Act again
            await (mockCommandService as any).codeSelectionCallback(mockEditor);

            // Assert again
            expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
            expect(vscode.window.showTextDocument).not.toHaveBeenCalled();
        });
    });
});
