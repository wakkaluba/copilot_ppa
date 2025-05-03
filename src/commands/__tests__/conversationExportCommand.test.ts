// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\conversationExportCommand.test.ts
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ConversationService } from '../../services/conversation/ConversationService';
import { registerConversationExportCommand } from '../conversationExportCommand';

describe('Conversation Export Command', () => {
    let mockContext: vscode.ExtensionContext;
    let commandsMock: any;
    let mockConversationService: any;
    let mockWindow: any;
    let mockWorkspace: any;
    let mockFs: any;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the VS Code Commands API
        commandsMock = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };
        sandbox.stub(vscode.commands, 'registerCommand').value(commandsMock.registerCommand);

        // Mock window API
        mockWindow = {
            showInformationMessage: sandbox.stub().resolves(),
            showErrorMessage: sandbox.stub().resolves(),
            showSaveDialog: sandbox.stub().resolves(vscode.Uri.parse('file:///test/export.json'))
        };
        sandbox.stub(vscode.window, 'showInformationMessage').value(mockWindow.showInformationMessage);
        sandbox.stub(vscode.window, 'showErrorMessage').value(mockWindow.showErrorMessage);
        sandbox.stub(vscode.window, 'showSaveDialog').value(mockWindow.showSaveDialog);

        // Mock workspace API
        mockWorkspace = {
            fs: {
                writeFile: sandbox.stub().resolves()
            }
        };
        sandbox.stub(vscode.workspace, 'fs').value(mockWorkspace.fs);

        // Mock the ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri')
        } as any;

        // Mock ConversationService
        mockConversationService = {
            getCurrentConversation: sandbox.stub().returns({
                id: 'test-conversation',
                title: 'Test Conversation',
                messages: [
                    { id: 'msg1', role: 'user', content: 'Hello' },
                    { id: 'msg2', role: 'assistant', content: 'Hi there' }
                ]
            }),
            getAllConversations: sandbox.stub().returns([
                {
                    id: 'test-conversation-1',
                    title: 'Test Conversation 1',
                    messages: [
                        { id: 'msg1', role: 'user', content: 'Hello' },
                        { id: 'msg2', role: 'assistant', content: 'Hi there' }
                    ]
                },
                {
                    id: 'test-conversation-2',
                    title: 'Test Conversation 2',
                    messages: [
                        { id: 'msg3', role: 'user', content: 'How are you?' },
                        { id: 'msg4', role: 'assistant', content: 'I am fine, thanks!' }
                    ]
                }
            ])
        };

        sandbox.stub(ConversationService, 'getInstance').returns(mockConversationService);

        // Mock fs
        mockFs = {
            writeFileSync: sandbox.stub()
        };
        sandbox.stub(fs, 'writeFileSync').value(mockFs.writeFileSync);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerConversationExportCommand', () => {
        it('should register the exportCurrentConversation command', () => {
            registerConversationExportCommand(mockContext);

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.exportCurrentConversation',
                expect.any(Function)
            );
        });

        it('should register the exportAllConversations command', () => {
            registerConversationExportCommand(mockContext);

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.exportAllConversations',
                expect.any(Function)
            );
        });

        it('should add command disposables to context.subscriptions', () => {
            registerConversationExportCommand(mockContext);

            // There should be 2 commands registered
            expect(mockContext.subscriptions.length).toBe(2);
        });
    });

    describe('exportCurrentConversation command', () => {
        it('should export the current conversation when executed', async () => {
            registerConversationExportCommand(mockContext);

            // Get the registered command callback
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            await exportCallback();

            // Verify the save dialog was shown
            expect(mockWindow.showSaveDialog).toHaveBeenCalledWith({
                defaultUri: expect.any(Object),
                filters: {
                    'JSON Files': ['json']
                },
                saveLabel: 'Export Conversation'
            });

            // Verify the conversation data was retrieved
            expect(mockConversationService.getCurrentConversation).toHaveBeenCalled();

            // Verify the file was written
            expect(mockWorkspace.fs.writeFile).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Uint8Array)
            );

            // Verify the success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Conversation exported successfully'
            );
        });

        it('should handle when no file path is selected', async () => {
            mockWindow.showSaveDialog.resolves(undefined);

            registerConversationExportCommand(mockContext);

            // Get the registered command callback
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            await exportCallback();

            // Verify the save dialog was shown
            expect(mockWindow.showSaveDialog).toHaveBeenCalled();

            // Verify no file was written
            expect(mockWorkspace.fs.writeFile).not.toHaveBeenCalled();

            // Verify no success message was shown
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during export', async () => {
            // Make the writeFile throw an error
            mockWorkspace.fs.writeFile.rejects(new Error('Failed to write file'));

            registerConversationExportCommand(mockContext);

            // Get the registered command callback
            const exportCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            await exportCallback();

            // Verify error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                'Failed to export conversation: Error: Failed to write file'
            );
        });
    });

    describe('exportAllConversations command', () => {
        it('should export all conversations when executed', async () => {
            registerConversationExportCommand(mockContext);

            // Get the registered command callback
            const exportAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await exportAllCallback();

            // Verify the save dialog was shown
            expect(mockWindow.showSaveDialog).toHaveBeenCalledWith({
                defaultUri: expect.any(Object),
                filters: {
                    'JSON Files': ['json']
                },
                saveLabel: 'Export All Conversations'
            });

            // Verify all conversations were retrieved
            expect(mockConversationService.getAllConversations).toHaveBeenCalled();

            // Verify the file was written
            expect(mockWorkspace.fs.writeFile).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Uint8Array)
            );

            // Verify the success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'All conversations exported successfully'
            );
        });

        it('should handle when no file path is selected', async () => {
            mockWindow.showSaveDialog.resolves(undefined);

            registerConversationExportCommand(mockContext);

            // Get the registered command callback
            const exportAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await exportAllCallback();

            // Verify the save dialog was shown
            expect(mockWindow.showSaveDialog).toHaveBeenCalled();

            // Verify no file was written
            expect(mockWorkspace.fs.writeFile).not.toHaveBeenCalled();

            // Verify no success message was shown
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during export', async () => {
            // Make the writeFile throw an error
            mockWorkspace.fs.writeFile.rejects(new Error('Failed to write file'));

            registerConversationExportCommand(mockContext);

            // Get the registered command callback
            const exportAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await exportAllCallback();

            // Verify error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                'Failed to export all conversations: Error: Failed to write file'
            );
        });
    });
});
