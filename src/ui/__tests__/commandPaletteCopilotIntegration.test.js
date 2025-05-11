const vscode = require('vscode');
const { registerCopilotIntegrationCommands } = require('../commandPaletteCopilotIntegration');
const { CopilotIntegrationWebview } = require('../../copilot/copilotIntegrationWebview');
const { CopilotIntegrationProvider } = require('../../copilot/copilotIntegrationProvider');
const { CopilotIntegrationService } = require('../../copilot/copilotIntegrationService');
const { CopilotCommandRegistrationService } = require('../services/CopilotCommandRegistrationService');
const { CopilotStatusBarService } = require('../services/CopilotStatusBarService');
const { CopilotCodeProcessingService } = require('../services/CopilotCodeProcessingService');

// Mock dependencies
jest.mock('vscode');
jest.mock('../../copilot/copilotIntegrationWebview');
jest.mock('../../copilot/copilotIntegrationProvider');
jest.mock('../../copilot/copilotIntegrationService');
jest.mock('../services/CopilotCommandRegistrationService');
jest.mock('../services/CopilotStatusBarService');
jest.mock('../services/CopilotCodeProcessingService');

describe('commandPaletteCopilotIntegration JavaScript', () => {
    // Common mocks
    let mockContext;
    let mockProvider;
    let mockService;
    let mockCommandService;
    let mockStatusBarService;
    let mockCodeProcessingService;
    let mockWebview;
    let mockEditor;
    let mockDocument;
    let mockSelection;

    beforeEach(() => {
        // Reset all mocks
        jest.resetAllMocks();

        // Setup context mock
        mockContext = {
            subscriptions: []
        };

        // Setup provider and service mocks
        mockProvider = {};

        mockService = {
            isAvailable: jest.fn().mockReturnValue(true)
        };

        // Setup service mocks
        mockCommandService = new CopilotCommandRegistrationService(
            mockContext,
            mockService
        );

        mockStatusBarService = new CopilotStatusBarService(
            mockContext
        );

        mockCodeProcessingService = new CopilotCodeProcessingService(
            mockProvider
        );

        // Setup constructor mocks
        CopilotCommandRegistrationService.mockImplementation(() => mockCommandService);
        CopilotStatusBarService.mockImplementation(() => mockStatusBarService);
        CopilotCodeProcessingService.mockImplementation(() => mockCodeProcessingService);

        // Setup webview mock
        mockWebview = {
            show: jest.fn()
        };
        CopilotIntegrationWebview.mockImplementation(() => mockWebview);

        // Setup editor and document mocks
        mockSelection = {
            isEmpty: false,
        };

        mockDocument = {
            getText: jest.fn().mockReturnValue('const test = "Hello World";')
        };

        mockEditor = {
            selection: mockSelection,
            document: mockDocument
        };

        // Mock showInputBox
        vscode.window.showInputBox = jest.fn().mockResolvedValue('Explain this code');

        // Mock command registration
        jest.spyOn(mockCommandService, 'registerWebviewCommand').mockImplementation(cb => {
            // Store the callback so we can call it in tests
            mockCommandService.webviewCallback = cb;
            return { dispose: jest.fn() };
        });

        jest.spyOn(mockCommandService, 'registerProviderToggleCommand').mockImplementation(cb => {
            mockCommandService.toggleCallback = cb;
            return { dispose: jest.fn() };
        });

        jest.spyOn(mockCommandService, 'registerAvailabilityCheckCommand').mockImplementation(cb => {
            mockCommandService.availabilityCallback = cb;
            return { dispose: jest.fn() };
        });

        jest.spyOn(mockCommandService, 'registerCodeSelectionCommand').mockImplementation(cb => {
            mockCommandService.codeSelectionCallback = cb;
            return { dispose: jest.fn() };
        });

        // Mock status bar methods
        mockStatusBarService.updateStatusBar = jest.fn();
        mockStatusBarService.toggleProvider = jest.fn().mockResolvedValue('localLLM');

        // Mock code processing
        mockCodeProcessingService.processCode = jest.fn().mockResolvedValue({
            completion: 'This code creates a constant variable "test" with the value "Hello World".'
        });

        // Mock VS Code window functions
        vscode.window.showInformationMessage = jest.fn();
        vscode.window.showErrorMessage = jest.fn();
        vscode.window.withProgress = jest.fn().mockImplementation((_, cb) => cb());
        vscode.workspace.openTextDocument = jest.fn().mockResolvedValue({});
        vscode.window.showTextDocument = jest.fn().mockResolvedValue({});
    });

    // Tests specifically for JavaScript implementation
    describe('JavaScript-specific functionality', () => {
        it('should handle local LLM provider toggle correctly', async () => {
            // Arrange
            registerCopilotIntegrationCommands(mockContext, mockProvider, mockService);

            // Mock return value to be localLLM
            mockStatusBarService.toggleProvider = jest.fn().mockResolvedValue('localLLM');

            // Act
            await mockCommandService.toggleCallback();

            // Assert
            expect(mockStatusBarService.toggleProvider).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Switched to Local LLM as the provider.'
            );
        });

        it('should handle unavailable Copilot correctly', () => {
            // Arrange
            mockService.isAvailable = jest.fn().mockReturnValue(false);
            registerCopilotIntegrationCommands(mockContext, mockProvider, mockService);

            // Act
            const result = mockCommandService.availabilityCallback();

            // Assert
            expect(mockService.isAvailable).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('should handle error in code processing with specific error message', async () => {
            // Arrange
            registerCopilotIntegrationCommands(mockContext, mockProvider, mockService);
            mockCodeProcessingService.processCode = jest.fn().mockRejectedValue({
                message: 'Network error',
                stack: 'Error stack trace'
            });

            // Act
            await mockCommandService.codeSelectionCallback(mockEditor);

            // Assert
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Error processing with Copilot: [object Object]'
            );
        });
    });
});
