// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\ConversationImportCommand.class.js.test.js
const vscode = require('vscode');
const sinon = require('sinon');
const { ConversationImportCommand } = require('../conversationImportCommand');
const { ConversationManager } = require('../../services/conversationManager');

describe('ConversationImportCommand class', () => {
    let mockContext;
    let mockConversationManager;
    let mockWindow;
    let commandsMock;
    let sandbox;
    let conversationImportCommand;
    let disposableMock;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock conversation manager
        mockConversationManager = {
            importConversations: sandbox.stub().resolves([{ id: 'test-id', title: 'Test Conversation' }])
        };
        sandbox.stub(ConversationManager, 'getInstance').returns(mockConversationManager);

        // Mock window API
        mockWindow = {
            showInformationMessage: sandbox.stub().resolves(),
            showWarningMessage: sandbox.stub().resolves(),
            showErrorMessage: sandbox.stub().resolves(),
            showOpenDialog: sandbox.stub().resolves([{ fsPath: '/test/path.json' }]),
            showQuickPick: sandbox.stub().resolves({ label: 'Yes' })
        };
        sandbox.stub(vscode.window, 'showInformationMessage').value(mockWindow.showInformationMessage);
        sandbox.stub(vscode.window, 'showWarningMessage').value(mockWindow.showWarningMessage);
        sandbox.stub(vscode.window, 'showErrorMessage').value(mockWindow.showErrorMessage);
        sandbox.stub(vscode.window, 'showOpenDialog').value(mockWindow.showOpenDialog);
        sandbox.stub(vscode.window, 'showQuickPick').value(mockWindow.showQuickPick);

        // Mock commands API
        disposableMock = { dispose: sandbox.stub() };
        commandsMock = {
            registerCommand: sandbox.stub().returns(disposableMock)
        };
        sandbox.stub(vscode.commands, 'registerCommand').value(commandsMock.registerCommand);

        // Mock context
        mockContext = {
            subscriptions: [],
            extensionUri: vscode.Uri.parse('file:///extension/uri')
        };

        // Create instance of ConversationImportCommand
        conversationImportCommand = new ConversationImportCommand(mockContext);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should get the ConversationManager instance with the given context', () => {
            expect(ConversationManager.getInstance).toHaveBeenCalledWith(mockContext);
        });
    });

    describe('register', () => {
        it('should register the command with the correct ID', () => {
            const result = conversationImportCommand.register();

            expect(commandsMock.registerCommand).toHaveBeenCalledWith(
                'copilotPPA.importConversation',
                expect.any(Function)
            );
            expect(result).toBe(disposableMock);
        });

        it('should return a disposable object', () => {
            const result = conversationImportCommand.register();

            expect(result).toHaveProperty('dispose');
            expect(result.dispose).toBeInstanceOf(Function);
        });

        it('should register a command that calls importConversation method', async () => {
            // Spy on the importConversation method
            const importSpy = sandbox.spy(conversationImportCommand, 'importConversation');

            // Register the command
            conversationImportCommand.register();

            // Get the callback function and execute it
            const callback = commandsMock.registerCommand.firstCall.args[1];
            await callback();

            // Verify importConversation was called
            expect(importSpy.calledOnce).toBe(true);
        });
    });

    describe('importConversation', () => {
        let importConversationMethod;

        beforeEach(() => {
            // Get reference to the private importConversation method
            importConversationMethod = conversationImportCommand.importConversation.bind(conversationImportCommand);
        });

        it('should open a file dialog to select import file', async () => {
            await importConversationMethod();

            expect(mockWindow.showOpenDialog).toHaveBeenCalledWith({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON Files': ['json'],
                    'All Files': ['*']
                },
                openLabel: 'Import'
            });
        });

        it('should ask if existing conversations should be replaced', async () => {
            await importConversationMethod();

            expect(mockWindow.showQuickPick).toHaveBeenCalledWith(
                [
                    { label: 'Yes', description: 'Replace existing conversations with the same ID' },
                    { label: 'No', description: 'Generate new IDs for imported conversations with duplicate IDs' }
                ],
                {
                    placeHolder: 'Replace existing conversations?'
                }
            );
        });

        it('should import conversations with the selected file and replace option', async () => {
            await importConversationMethod();

            expect(mockConversationManager.importConversations).toHaveBeenCalledWith(
                '/test/path.json',
                true
            );
        });

        it('should show success message when conversations are imported', async () => {
            await importConversationMethod();

            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
                'Successfully imported 1 conversation(s)'
            );
        });

        it('should show warning when no conversations are imported', async () => {
            mockConversationManager.importConversations.resolves([]);

            await importConversationMethod();

            expect(mockWindow.showWarningMessage).toHaveBeenCalledWith(
                'No conversations were imported'
            );
        });

        it('should show error message when import fails', async () => {
            const errorMessage = 'Import failed due to file format';
            mockConversationManager.importConversations.rejects(new Error(errorMessage));

            await importConversationMethod();

            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
                `Import failed: ${errorMessage}`
            );
        });

        it('should do nothing if no file is selected', async () => {
            mockWindow.showOpenDialog.resolves(undefined);

            await importConversationMethod();

            expect(mockConversationManager.importConversations).not.toHaveBeenCalled();
            expect(mockWindow.showInformationMessage).not.toHaveBeenCalled();
            expect(mockWindow.showWarningMessage).not.toHaveBeenCalled();
            expect(mockWindow.showErrorMessage).not.toHaveBeenCalled();
        });

        it('should do nothing if user cancels file selection', async () => {
            mockWindow.showOpenDialog.resolves([]);

            await importConversationMethod();

            expect(mockConversationManager.importConversations).not.toHaveBeenCalled();
        });
    });

    describe('getOpenFilePath', () => {
        let getOpenFilePathMethod;

        beforeEach(() => {
            // Get reference to the private getOpenFilePath method
            getOpenFilePathMethod = conversationImportCommand.getOpenFilePath.bind(conversationImportCommand);
        });

        it('should open a file dialog with correct options', async () => {
            await getOpenFilePathMethod();

            expect(mockWindow.showOpenDialog).toHaveBeenCalledWith({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON Files': ['json'],
                    'All Files': ['*']
                },
                openLabel: 'Import'
            });
        });

        it('should return the file path when a file is selected', async () => {
            const result = await getOpenFilePathMethod();

            expect(result).toBe('/test/path.json');
        });

        it('should return undefined when no file is selected', async () => {
            mockWindow.showOpenDialog.resolves(undefined);

            const result = await getOpenFilePathMethod();

            expect(result).toBeUndefined();
        });

        it('should return undefined when file selection is empty', async () => {
            mockWindow.showOpenDialog.resolves([]);

            const result = await getOpenFilePathMethod();

            expect(result).toBeUndefined();
        });
    });

    describe('shouldReplaceExisting', () => {
        let shouldReplaceExistingMethod;

        beforeEach(() => {
            // Get reference to the private shouldReplaceExisting method
            shouldReplaceExistingMethod = conversationImportCommand.shouldReplaceExisting.bind(conversationImportCommand);
        });

        it('should show quick pick with correct options', async () => {
            await shouldReplaceExistingMethod();

            expect(mockWindow.showQuickPick).toHaveBeenCalledWith(
                [
                    { label: 'Yes', description: 'Replace existing conversations with the same ID' },
                    { label: 'No', description: 'Generate new IDs for imported conversations with duplicate IDs' }
                ],
                {
                    placeHolder: 'Replace existing conversations?'
                }
            );
        });

        it('should return true when "Yes" is selected', async () => {
            mockWindow.showQuickPick.resolves({ label: 'Yes' });

            const result = await shouldReplaceExistingMethod();

            expect(result).toBe(true);
        });

        it('should return false when "No" is selected', async () => {
            mockWindow.showQuickPick.resolves({ label: 'No' });

            const result = await shouldReplaceExistingMethod();

            expect(result).toBe(false);
        });

        it('should return false when nothing is selected', async () => {
            mockWindow.showQuickPick.resolves(undefined);

            const result = await shouldReplaceExistingMethod();

            expect(result).toBe(false);
        });
    });
});
