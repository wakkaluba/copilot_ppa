// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\conversationImportCommand.test.ts
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ConversationService } from '../../services/conversation/ConversationService';
import { registerConversationImportCommand } from '../conversationImportCommand';

describe('Conversation Import Command', () => {
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
            showOpenDialog: sandbox.stub().resolves([vscode.Uri.parse('file:///test/import.json')])
        };
        sandbox.stub(vscode.window, 'showInformationMessage').value(mockWindow.showInformationMessage);
        sandbox.stub(vscode.window, 'showErrorMessage').value(mockWindow.showErrorMessage);
        sandbox.stub(vscode.window, 'showOpenDialog').value(mockWindow.showOpenDialog);

        // Mock workspace API
        mockWorkspace = {
            fs: {
                readFile: sandbox.stub().resolves(Buffer.from(JSON.stringify({
                    id: 'test-conversation',
                    title: 'Test Conversation',
                    messages: [
                        { id: 'msg1', role: 'user', content: 'Hello' },
                        { id: 'msg2', role: 'assistant', content: 'Hi there' }
                    ]
                })))
            }
        };
        sandbox.stub(vscode.workspace, 'fs').value(mockWorkspace.fs);

        // Mock the ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri')
        } as vscode.ExtensionContext;

        // Mock ConversationService
        mockConversationService = {
            importConversation: sandbox.stub().resolves(),
            importAllConversations: sandbox.stub().resolves()
        };

        sandbox.stub(ConversationService, 'getInstance').returns(mockConversationService);

        // Mock fs
        mockFs = {
            readFileSync: sandbox.stub().returns(JSON.stringify({
                id: 'test-conversation',
                title: 'Test Conversation',
                messages: [
                    { id: 'msg1', role: 'user', content: 'Hello' },
                    { id: 'msg2', role: 'assistant', content: 'Hi there' }
                ]
            }))
        };
        sandbox.stub(fs, 'readFileSync').value(mockFs.readFileSync);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerConversationImportCommand', () => {
        it('should register the importConversation command', () => {
            registerConversationImportCommand(mockContext);

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.importConversation',
                expect.any(Function)
            );
        });

        it('should register the importAllConversations command', () => {
            registerConversationImportCommand(mockContext);

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.importAllConversations',
                expect.any(Function)
            );
        });

        it('should add command disposables to context.subscriptions', () => {
            registerConversationImportCommand(mockContext);

            // There should be 2 commands registered
            expect(mockContext.subscriptions.length).toBe(2);
        });
    });

    describe('importConversation command', () => {
        it('should import a conversation when executed', async () => {
            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            await importCallback();

            // Verify the open dialog was shown
            expect(mockWindow.showOpenDialog).toHaveBeenCalledWith({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON Files': ['json']
                },
                title: 'Import Conversation'
            });

            // Verify the file was read
            expect(mockWorkspace.fs.readFile).toHaveBeenCalledWith(
                expect.any(Object)
            );

            // Verify the conversation was imported
            expect(mockConversationService.importConversation).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'test-conversation',
                    title: 'Test Conversation',
                    messages: expect.arrayContaining([
                        expect.objectContaining({ id: 'msg1', role: 'user', content: 'Hello' }),
                        expect.objectContaining({ id: 'msg2', role: 'assistant', content: 'Hi there' })
                    ])
                })
            );

            // Verify the success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Conversation imported successfully'
            );
        });

        it('should handle when no file is selected', async () => {
            mockWindow.showOpenDialog.resolves(undefined);

            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            await importCallback();

            // Verify the open dialog was shown
            expect(mockWindow.showOpenDialog).toHaveBeenCalled();

            // Verify no file was read
            expect(mockWorkspace.fs.readFile).not.toHaveBeenCalled();

            // Verify no conversation was imported
            expect(mockConversationService.importConversation).not.toHaveBeenCalled();

            // Verify no success message was shown
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle invalid JSON format', async () => {
            // Make the readFile return invalid JSON
            mockWorkspace.fs.readFile.resolves(Buffer.from('not valid json'));

            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            await importCallback();

            // Verify the error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                expect.stringMatching(/Failed to import conversation/)
            );

            // Verify no conversation was imported
            expect(mockConversationService.importConversation).not.toHaveBeenCalled();
        });

        it('should handle errors during import', async () => {
            // Make the importConversation throw an error
            mockConversationService.importConversation.rejects(new Error('Failed to import'));

            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importCallback = commandsMock.registerCommand.getCall(0).args[1];

            // Execute the callback
            await importCallback();

            // Verify the error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                expect.stringMatching(/Failed to import conversation/)
            );
        });
    });

    describe('importAllConversations command', () => {
        beforeEach(() => {
            // Mock the readFile to return an array of conversations
            mockWorkspace.fs.readFile.resolves(Buffer.from(JSON.stringify([
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
            ])));
        });

        it('should import all conversations when executed', async () => {
            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await importAllCallback();

            // Verify the open dialog was shown
            expect(mockWindow.showOpenDialog).toHaveBeenCalledWith({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON Files': ['json']
                },
                title: 'Import All Conversations'
            });

            // Verify the file was read
            expect(mockWorkspace.fs.readFile).toHaveBeenCalledWith(
                expect.any(Object)
            );

            // Verify all conversations were imported
            expect(mockConversationService.importAllConversations).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'test-conversation-1',
                        title: 'Test Conversation 1'
                    }),
                    expect.objectContaining({
                        id: 'test-conversation-2',
                        title: 'Test Conversation 2'
                    })
                ])
            );

            // Verify the success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'All conversations imported successfully'
            );
        });

        it('should handle when no file is selected', async () => {
            mockWindow.showOpenDialog.resolves(undefined);

            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await importAllCallback();

            // Verify the open dialog was shown
            expect(mockWindow.showOpenDialog).toHaveBeenCalled();

            // Verify no file was read
            expect(mockWorkspace.fs.readFile).not.toHaveBeenCalled();

            // Verify no conversations were imported
            expect(mockConversationService.importAllConversations).not.toHaveBeenCalled();

            // Verify no success message was shown
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle invalid JSON format', async () => {
            // Make the readFile return invalid JSON
            mockWorkspace.fs.readFile.resolves(Buffer.from('not valid json'));

            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await importAllCallback();

            // Verify the error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                expect.stringMatching(/Failed to import all conversations/)
            );

            // Verify no conversations were imported
            expect(mockConversationService.importAllConversations).not.toHaveBeenCalled();
        });

        it('should handle errors during import', async () => {
            // Make the importAllConversations throw an error
            mockConversationService.importAllConversations.rejects(new Error('Failed to import'));

            registerConversationImportCommand(mockContext);

            // Get the registered command callback
            const importAllCallback = commandsMock.registerCommand.getCall(1).args[1];

            // Execute the callback
            await importAllCallback();

            // Verify the error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                expect.stringMatching(/Failed to import all conversations/)
            );
        });
    });
});
