// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\conversationManagementCommand.js.test.js
const vscode = require('vscode');
const sinon = require('sinon');
const { registerConversationManagementCommand } = require('../conversationManagementCommand');
const { ConversationService } = require('../../services/conversation/ConversationService');

describe('Conversation Management Command', () => {
    let mockContext;
    let commandsMock;
    let mockConversationService;
    let mockWindow;
    let sandbox;

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
            showInputBox: sandbox.stub().resolves('New Conversation Title'),
            showQuickPick: sandbox.stub().resolves({ label: 'Test Conversation', id: 'test-id' })
        };
        sandbox.stub(vscode.window, 'showInformationMessage').value(mockWindow.showInformationMessage);
        sandbox.stub(vscode.window, 'showErrorMessage').value(mockWindow.showErrorMessage);
        sandbox.stub(vscode.window, 'showInputBox').value(mockWindow.showInputBox);
        sandbox.stub(vscode.window, 'showQuickPick').value(mockWindow.showQuickPick);

        // Mock the ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri')
        };

        // Mock ConversationService
        mockConversationService = {
            createNewConversation: sandbox.stub().returns({ id: 'new-id', title: 'New Conversation Title' }),
            getCurrentConversation: sandbox.stub().returns({ id: 'current-id', title: 'Current Conversation' }),
            switchToConversation: sandbox.stub(),
            deleteConversation: sandbox.stub(),
            getAllConversations: sandbox.stub().returns([
                { id: 'conv1', title: 'Conversation 1' },
                { id: 'conv2', title: 'Conversation 2' }
            ]),
            renameConversation: sandbox.stub()
        };

        sandbox.stub(ConversationService, 'getInstance').returns(mockConversationService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerConversationManagementCommand', () => {
        it('should register all conversation management commands', () => {
            registerConversationManagementCommand(mockContext);

            // Verify all expected commands are registered
            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.newConversation',
                expect.any(Function)
            );

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.switchConversation',
                expect.any(Function)
            );

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.deleteConversation',
                expect.any(Function)
            );

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.renameConversation',
                expect.any(Function)
            );
        });

        it('should add command disposables to context.subscriptions', () => {
            registerConversationManagementCommand(mockContext);

            // There should be 4 commands registered
            expect(mockContext.subscriptions.length).toBe(4);
        });
    });

    describe('newConversation command', () => {
        it('should create a new conversation when executed', async () => {
            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const newConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.newConversation'
            ).args[1];

            // Execute the callback
            await newConversationCallback();

            // Verify the input box was shown
            expect(mockWindow.showInputBox).toHaveBeenCalledWith({
                prompt: 'Enter a title for the new conversation',
                placeHolder: 'New Conversation'
            });

            // Verify a new conversation was created
            expect(mockConversationService.createNewConversation).toHaveBeenCalledWith('New Conversation Title');

            // Verify success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'New conversation created: New Conversation Title'
            );
        });

        it('should handle when no title is provided', async () => {
            mockWindow.showInputBox.resolves(undefined);

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const newConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.newConversation'
            ).args[1];

            // Execute the callback
            await newConversationCallback();

            // Verify the input box was shown
            expect(mockWindow.showInputBox).toHaveBeenCalled();

            // Verify no new conversation was created
            expect(mockConversationService.createNewConversation).not.toHaveBeenCalled();

            // Verify no success message was shown
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during creation', async () => {
            mockConversationService.createNewConversation.throws(new Error('Failed to create conversation'));

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const newConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.newConversation'
            ).args[1];

            // Execute the callback
            await newConversationCallback();

            // Verify error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                'Failed to create new conversation: Error: Failed to create conversation'
            );
        });
    });

    describe('switchConversation command', () => {
        it('should switch to selected conversation when executed', async () => {
            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const switchConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.switchConversation'
            ).args[1];

            // Execute the callback
            await switchConversationCallback();

            // Verify the quick pick was shown with all conversations
            expect(mockWindow.showQuickPick).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ label: 'Conversation 1', id: 'conv1' }),
                    expect.objectContaining({ label: 'Conversation 2', id: 'conv2' })
                ]),
                expect.objectContaining({
                    placeHolder: 'Select a conversation to switch to'
                })
            );

            // Verify switch to the selected conversation
            expect(mockConversationService.switchToConversation).toHaveBeenCalledWith('test-id');

            // Verify success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Switched to conversation: Test Conversation'
            );
        });

        it('should handle when no conversation is selected', async () => {
            mockWindow.showQuickPick.resolves(undefined);

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const switchConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.switchConversation'
            ).args[1];

            // Execute the callback
            await switchConversationCallback();

            // Verify the quick pick was shown
            expect(mockWindow.showQuickPick).toHaveBeenCalled();

            // Verify no switch happened
            expect(mockConversationService.switchToConversation).not.toHaveBeenCalled();

            // Verify no success message was shown
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during switching', async () => {
            mockConversationService.switchToConversation.throws(new Error('Failed to switch conversation'));

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const switchConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.switchConversation'
            ).args[1];

            // Execute the callback
            await switchConversationCallback();

            // Verify error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                'Failed to switch conversation: Error: Failed to switch conversation'
            );
        });
    });

    describe('deleteConversation command', () => {
        it('should delete the selected conversation when executed', async () => {
            // Mock confirmation dialog
            mockWindow.showInformationMessage = sandbox.stub().resolves('Yes');

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const deleteConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.deleteConversation'
            ).args[1];

            // Execute the callback
            await deleteConversationCallback();

            // Verify the quick pick was shown with all conversations
            expect(mockWindow.showQuickPick).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ label: 'Conversation 1', id: 'conv1' }),
                    expect.objectContaining({ label: 'Conversation 2', id: 'conv2' })
                ]),
                expect.objectContaining({
                    placeHolder: 'Select a conversation to delete'
                })
            );

            // Verify confirmation dialog was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Are you sure you want to delete the conversation "Test Conversation"?',
                'Yes',
                'No'
            );

            // Verify delete of the selected conversation
            expect(mockConversationService.deleteConversation).toHaveBeenCalledWith('test-id');

            // Verify success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Conversation deleted: Test Conversation'
            );
        });

        it('should handle cancellation of confirmation', async () => {
            // Mock confirmation dialog with 'No' response
            mockWindow.showInformationMessage = sandbox.stub().resolves('No');

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const deleteConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.deleteConversation'
            ).args[1];

            // Execute the callback
            await deleteConversationCallback();

            // Verify the confirmation dialog was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalled();

            // Verify no deletion occurred
            expect(mockConversationService.deleteConversation).not.toHaveBeenCalled();
        });

        it('should handle when no conversation is selected', async () => {
            mockWindow.showQuickPick.resolves(undefined);

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const deleteConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.deleteConversation'
            ).args[1];

            // Execute the callback
            await deleteConversationCallback();

            // Verify the quick pick was shown
            expect(mockWindow.showQuickPick).toHaveBeenCalled();

            // Verify no confirmation dialog or deletion
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalledWith(
                expect.stringMatching(/Are you sure/)
            );
            expect(mockConversationService.deleteConversation).not.toHaveBeenCalled();
        });

        it('should handle errors during deletion', async () => {
            // Mock confirmation dialog
            mockWindow.showInformationMessage = sandbox.stub().resolves('Yes');

            mockConversationService.deleteConversation.throws(new Error('Failed to delete conversation'));

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const deleteConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.deleteConversation'
            ).args[1];

            // Execute the callback
            await deleteConversationCallback();

            // Verify error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                'Failed to delete conversation: Error: Failed to delete conversation'
            );
        });
    });

    describe('renameConversation command', () => {
        it('should rename the current conversation when executed', async () => {
            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const renameConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.renameConversation'
            ).args[1];

            // Execute the callback
            await renameConversationCallback();

            // Verify the input box was shown with current title as default
            expect(mockWindow.showInputBox).toHaveBeenCalledWith({
                prompt: 'Enter a new title for the conversation',
                value: 'Current Conversation',
                placeHolder: 'New title'
            });

            // Verify rename was called with current conversation ID and new title
            expect(mockConversationService.renameConversation).toHaveBeenCalledWith(
                'current-id',
                'New Conversation Title'
            );

            // Verify success message was shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Conversation renamed to: New Conversation Title'
            );
        });

        it('should handle when no new title is provided', async () => {
            mockWindow.showInputBox.resolves(undefined);

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const renameConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.renameConversation'
            ).args[1];

            // Execute the callback
            await renameConversationCallback();

            // Verify the input box was shown
            expect(mockWindow.showInputBox).toHaveBeenCalled();

            // Verify no rename occurred
            expect(mockConversationService.renameConversation).not.toHaveBeenCalled();

            // Verify no success message was shown
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalledWith(
                expect.stringMatching(/Conversation renamed/)
            );
        });

        it('should handle errors during renaming', async () => {
            mockConversationService.renameConversation.throws(new Error('Failed to rename conversation'));

            registerConversationManagementCommand(mockContext);

            // Get the registered command callback
            const renameConversationCallback = commandsMock.registerCommand.getCalls().find(
                call => call.args[0] === 'copilot-ppa.renameConversation'
            ).args[1];

            // Execute the callback
            await renameConversationCallback();

            // Verify error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                'Failed to rename conversation: Error: Failed to rename conversation'
            );
        });
    });
});
