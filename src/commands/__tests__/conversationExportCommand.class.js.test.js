// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\conversationExportCommand.class.js.test.js
const sinon = require('sinon');
const vscode = require('vscode');
const { ConversationExportCommand } = require('../conversationExportCommand');
const { ConversationManager } = require('../../services/conversationManager');
const { ConversationExportService } = require('../../services/conversation/ConversationExportService');
const { FileDialogService } = require('../../services/dialog/FileDialogService');
const { ConversationSelectionService } = require('../../services/conversation/ConversationSelectionService');

describe('ConversationExportCommand Class (JavaScript)', () => {
    let mockContext;
    let mockConversationManager;
    let mockExportService;
    let mockFileDialogService;
    let mockSelectionService;
    let commandsMock;
    let mockWindow;
    let exportCommand;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock ConversationManager
        mockConversationManager = {
            getInstance: sandbox.stub()
        };
        mockConversationManager.getInstance.returns(mockConversationManager);
        sandbox.stub(ConversationManager, 'getInstance').value(mockConversationManager.getInstance);

        // Mock ConversationExportService
        mockExportService = {
            exportConversation: sandbox.stub().resolves(),
            exportAllConversations: sandbox.stub().resolves()
        };
        sandbox.stub(global, 'ConversationExportService').value(function() {
            return mockExportService;
        });

        // Mock FileDialogService
        mockFileDialogService = {
            getSaveFilePath: sandbox.stub().resolves('/path/to/file.json')
        };
        sandbox.stub(global, 'FileDialogService').value(function() {
            return mockFileDialogService;
        });

        // Mock ConversationSelectionService
        mockSelectionService = {
            selectConversation: sandbox.stub().resolves('test-conversation-id')
        };
        sandbox.stub(global, 'ConversationSelectionService').value(function() {
            return mockSelectionService;
        });

        // Mock VS Code Commands API
        commandsMock = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };
        sandbox.stub(vscode.commands, 'registerCommand').value(commandsMock.registerCommand);

        // Mock window API
        mockWindow = {
            showInformationMessage: sandbox.stub().resolves(),
            showErrorMessage: sandbox.stub().resolves()
        };
        sandbox.stub(vscode.window, 'showInformationMessage').value(mockWindow.showInformationMessage);
        sandbox.stub(vscode.window, 'showErrorMessage').value(mockWindow.showErrorMessage);

        // Mock the ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri')
        };

        // Create the command instance
        exportCommand = new ConversationExportCommand(mockContext);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with required services', () => {
            expect(mockConversationManager.getInstance).toHaveBeenCalledWith(mockContext);
            expect(ConversationExportService).toHaveBeenCalledWith(mockConversationManager);
            expect(FileDialogService).toHaveBeenCalled();
            expect(ConversationSelectionService).toHaveBeenCalledWith(mockConversationManager);
        });
    });

    describe('register', () => {
        it('should register both commands', () => {
            const disposables = exportCommand.register();

            expect(commandsMock.registerCommand).toHaveBeenCalledTimes(2);
            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                ConversationExportCommand.commandId,
                expect.any(Function)
            );
            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                ConversationExportCommand.exportAllCommandId,
                expect.any(Function)
            );
            expect(disposables.length).toBe(2);
        });

        it('should return disposables for both commands', () => {
            const disposables = exportCommand.register();
            expect(disposables.length).toBe(2);
            expect(disposables[0]).toBeDefined();
            expect(disposables[1]).toBeDefined();
        });
    });

    describe('exportConversation', () => {
        it('should export a conversation when ID is provided', async () => {
            const disposables = exportCommand.register();
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            await exportCallback('provided-conversation-id');

            // Should not try to select a conversation when ID is provided
            expect(mockSelectionService.selectConversation).not.toHaveBeenCalled();

            // Should get file path
            expect(mockFileDialogService.getSaveFilePath).toHaveBeenCalledWith('conversation.json', ['json']);

            // Should export the conversation
            expect(mockExportService.exportConversation).toHaveBeenCalledWith(
                'provided-conversation-id',
                '/path/to/file.json'
            );

            // Should show success message
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Conversation exported successfully'
            );
        });

        it('should prompt for conversation selection when ID is not provided', async () => {
            const disposables = exportCommand.register();
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            await exportCallback();

            // Should try to select a conversation
            expect(mockSelectionService.selectConversation).toHaveBeenCalledWith('Select a conversation to export');

            // Should get file path
            expect(mockFileDialogService.getSaveFilePath).toHaveBeenCalledWith('conversation.json', ['json']);

            // Should export the conversation with the selected ID
            expect(mockExportService.exportConversation).toHaveBeenCalledWith(
                'test-conversation-id',
                '/path/to/file.json'
            );

            // Should show success message
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Conversation exported successfully'
            );
        });

        it('should exit early if conversation selection is cancelled', async () => {
            mockSelectionService.selectConversation.resolves(undefined);

            const disposables = exportCommand.register();
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            await exportCallback();

            // Should try to select a conversation
            expect(mockSelectionService.selectConversation).toHaveBeenCalled();

            // Should not try to get file path or export
            expect(mockFileDialogService.getSaveFilePath).not.toHaveBeenCalled();
            expect(mockExportService.exportConversation).not.toHaveBeenCalled();
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should exit early if file dialog is cancelled', async () => {
            mockFileDialogService.getSaveFilePath.resolves(undefined);

            const disposables = exportCommand.register();
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            await exportCallback('conversation-id');

            // Should try to get file path
            expect(mockFileDialogService.getSaveFilePath).toHaveBeenCalled();

            // Should not try to export
            expect(mockExportService.exportConversation).not.toHaveBeenCalled();
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during export', async () => {
            const error = new Error('Export failed');
            mockExportService.exportConversation.rejects(error);

            const disposables = exportCommand.register();
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            await exportCallback('conversation-id');

            // Should show error message
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(`Export failed: ${error.message}`);
        });
    });

    describe('exportAllConversations', () => {
        it('should export all conversations', async () => {
            const disposables = exportCommand.register();
            const exportAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            await exportAllCallback();

            // Should get file path
            expect(mockFileDialogService.getSaveFilePath).toHaveBeenCalledWith('all_conversations.json', ['json']);

            // Should export all conversations
            expect(mockExportService.exportAllConversations).toHaveBeenCalledWith('/path/to/file.json');

            // Should show success message
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'All conversations exported successfully'
            );
        });

        it('should exit early if file dialog is cancelled', async () => {
            mockFileDialogService.getSaveFilePath.resolves(undefined);

            const disposables = exportCommand.register();
            const exportAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            await exportAllCallback();

            // Should try to get file path
            expect(mockFileDialogService.getSaveFilePath).toHaveBeenCalled();

            // Should not try to export
            expect(mockExportService.exportAllConversations).not.toHaveBeenCalled();
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during export', async () => {
            const error = new Error('Export failed');
            mockExportService.exportAllConversations.rejects(error);

            const disposables = exportCommand.register();
            const exportAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            await exportAllCallback();

            // Should show error message
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(`Export failed: ${error.message}`);
        });
    });
});
