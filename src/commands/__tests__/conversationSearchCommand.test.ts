// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\conversationSearchCommand.test.ts
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ConversationManager } from '../../services/conversationManager';
import { ConversationSearchService } from '../../services/conversationSearchService';
import { ConversationSearchCommand } from '../conversationSearchCommand';

describe('Conversation Search Command', () => {
    let sandbox: sinon.SinonSandbox;
    let mockContext: vscode.ExtensionContext;
    let mockConversationManager: any;
    let mockSearchService: any;
    let mockWindow: any;
    let mockCommands: any;
    let searchCommand: ConversationSearchCommand;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock extension context
        mockContext = {
            subscriptions: [],
            storageUri: { fsPath: '/mock/storage/path' } as any,
            globalStorageUri: { fsPath: '/mock/global/storage/path' } as any
        } as vscode.ExtensionContext;

        // Mock conversation manager
        mockConversationManager = {
            getConversationById: sandbox.stub().returns({
                id: 'conv-123',
                title: 'Test Conversation',
                messages: [
                    { role: 'user', content: 'Hello' },
                    { role: 'assistant', content: 'Hi there' }
                ],
                createdAt: Date.now(),
                updatedAt: Date.now()
            }),
            getAllConversations: sandbox.stub().returns([
                {
                    id: 'conv-123',
                    title: 'Test Conversation',
                    messages: [
                        { role: 'user', content: 'Hello' },
                        { role: 'assistant', content: 'Hi there' }
                    ],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },
                {
                    id: 'conv-456',
                    title: 'Another Conversation',
                    messages: [
                        { role: 'user', content: 'Testing' },
                        { role: 'assistant', content: 'It works' }
                    ],
                    createdAt: Date.now() - 86400000, // One day ago
                    updatedAt: Date.now() - 86400000
                }
            ])
        };

        // Mock search service
        mockSearchService = {
            search: sandbox.stub().resolves([
                {
                    conversation: {
                        id: 'conv-123',
                        title: 'Test Conversation',
                        messages: [
                            { role: 'user', content: 'Hello' },
                            { role: 'assistant', content: 'Hi there' }
                        ],
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    },
                    titleMatch: true,
                    matches: [
                        { messageIndex: 0, content: 'Hello' }
                    ]
                }
            ])
        };

        // Mock VS Code window API
        mockWindow = {
            showInputBox: sandbox.stub().resolves('search query'),
            showQuickPick: sandbox.stub().resolves({ label: 'Basic Search' }),
            showInformationMessage: sandbox.stub(),
            showErrorMessage: sandbox.stub()
        };

        // Mock VS Code commands API
        mockCommands = {
            registerCommand: sandbox.stub().callsFake((_: string, callback: Function) => {
                return { dispose: sandbox.stub(), callback };
            }),
            executeCommand: sandbox.stub().resolves()
        };

        // Apply mocks
        sandbox.stub(vscode.window, 'showInputBox').value(mockWindow.showInputBox);
        sandbox.stub(vscode.window, 'showQuickPick').value(mockWindow.showQuickPick);
        sandbox.stub(vscode.window, 'showInformationMessage').value(mockWindow.showInformationMessage);
        sandbox.stub(vscode.window, 'showErrorMessage').value(mockWindow.showErrorMessage);
        sandbox.stub(vscode.commands, 'registerCommand').value(mockCommands.registerCommand);
        sandbox.stub(vscode.commands, 'executeCommand').value(mockCommands.executeCommand);

        // Mock singleton instances
        sandbox.stub(ConversationManager, 'getInstance').returns(mockConversationManager);
        sandbox.stub(ConversationSearchService, 'getInstance').returns(mockSearchService);

        // Create the command instance
        searchCommand = new ConversationSearchCommand(mockContext);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('register', () => {
        it('should register the search command with VS Code', () => {
            const disposable = searchCommand.register();

            expect(mockCommands.registerCommand).toHaveBeenCalledWith(
                'copilotPPA.searchConversations',
                expect.any(Function)
            );
            expect(disposable).toBeDefined();
        });
    });

    describe('executeSearch', () => {
        it('should perform a basic search and open the selected conversation', async () => {
            // Set up quickPick to return a selected result for the search results picker
            const mockSelectedResult = {
                result: {
                    conversation: {
                        id: 'conv-123',
                        title: 'Test Conversation'
                    }
                }
            };

            // First call returns the search type, second call returns the selected result
            mockWindow.showQuickPick.onFirstCall().resolves({ label: 'Basic Search' });
            mockWindow.showQuickPick.onSecondCall().resolves(mockSelectedResult);

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify the input box was shown to get the search query
            expect(mockWindow.showInputBox).toHaveBeenCalledWith({
                placeHolder: 'Search in conversations...',
                prompt: 'Enter search term',
                ignoreFocusOut: true
            });

            // Verify options were presented
            expect(mockWindow.showQuickPick).toHaveBeenCalledWith(
                [
                    { label: 'Basic Search', description: 'Search with default options' },
                    { label: 'Advanced Search', description: 'Configure search options' }
                ],
                {
                    placeHolder: 'Search options',
                    ignoreFocusOut: true
                }
            );

            // Verify search was performed
            expect(mockSearchService.search).toHaveBeenCalledWith({
                query: 'search query'
            });

            // Verify search results were presented
            expect(mockWindow.showQuickPick).toHaveBeenCalledTimes(2);

            // Verify the selected conversation was opened
            expect(mockCommands.executeCommand).toHaveBeenCalledWith(
                'copilotPPA.openConversation',
                'conv-123'
            );
        });

        it('should handle when user cancels search query input', async () => {
            mockWindow.showInputBox.resolves(undefined);

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify the input box was shown
            expect(mockWindow.showInputBox).toHaveBeenCalled();

            // Verify no further actions were taken
            expect(mockWindow.showQuickPick).not.toHaveBeenCalled();
            expect(mockSearchService.search).not.toHaveBeenCalled();
        });

        it('should handle when user cancels search options', async () => {
            mockWindow.showQuickPick.resolves(undefined);

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify the quick pick was shown
            expect(mockWindow.showQuickPick).toHaveBeenCalled();

            // Verify no search was performed
            expect(mockSearchService.search).not.toHaveBeenCalled();
        });

        it('should handle advanced search options', async () => {
            mockWindow.showQuickPick.resetBehavior();

            // Mock the sequence of user inputs for advanced search
            // First call returns the search type (Advanced)
            mockWindow.showQuickPick.onFirstCall().resolves({ label: 'Advanced Search' });

            // Second call returns the advanced options
            mockWindow.showQuickPick.onSecondCall().resolves([
                { label: 'Search in titles' },
                { label: 'Case sensitive' },
                { label: 'Only user messages' }
            ]);

            // Third call returns the selected search result
            mockWindow.showQuickPick.onThirdCall().resolves({
                result: {
                    conversation: {
                        id: 'conv-123',
                        title: 'Test Conversation'
                    }
                }
            });

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify advanced options were requested
            expect(mockWindow.showQuickPick).toHaveBeenCalledWith(
                [
                    { label: 'Search in titles', picked: true },
                    { label: 'Search in content', picked: true },
                    { label: 'Case sensitive', picked: false },
                    { label: 'Use regular expression', picked: false },
                    { label: 'Only user messages', picked: false },
                    { label: 'Only assistant messages', picked: false }
                ],
                {
                    placeHolder: 'Select search options',
                    canPickMany: true,
                    ignoreFocusOut: true
                }
            );

            // Verify search was performed with correct options
            expect(mockSearchService.search).toHaveBeenCalledWith({
                query: 'search query',
                searchInTitles: true,
                searchInContent: false,
                caseSensitive: true,
                useRegex: false,
                onlyUserMessages: true,
                onlyAssistantMessages: false
            });

            // Verify the selected conversation was opened
            expect(mockCommands.executeCommand).toHaveBeenCalledWith(
                'copilotPPA.openConversation',
                'conv-123'
            );
        });

        it('should handle no search results', async () => {
            // Mock an empty search result
            mockSearchService.search.resolves([]);

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify search was performed
            expect(mockSearchService.search).toHaveBeenCalled();

            // Verify message was shown for no results
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith('No matching conversations found.');

            // Verify no results quickPick was shown
            expect(mockWindow.showQuickPick).toHaveBeenCalledOnce(); // Only for search options
        });

        it('should handle search errors', async () => {
            // Mock a search error
            mockSearchService.search.rejects(new Error('Search failed'));

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify search was attempted
            expect(mockSearchService.search).toHaveBeenCalled();

            // Verify error message was shown
            expect(mockWindow.showErrorMessage).toHaveBeenCalledWith('Search failed: Search failed');
        });

        it('should handle user cancellation after viewing results', async () => {
            // First call returns the search type
            mockWindow.showQuickPick.onFirstCall().resolves({ label: 'Basic Search' });

            // Second call simulates user cancelling after seeing results
            mockWindow.showQuickPick.onSecondCall().resolves(undefined);

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify search was performed
            expect(mockSearchService.search).toHaveBeenCalled();

            // Verify no conversation was opened
            expect(mockCommands.executeCommand).not.toHaveBeenCalled();
        });

        it('should handle advanced search with date range options', async () => {
            mockWindow.showQuickPick.resetBehavior();
            mockWindow.showInputBox.resetBehavior();

            // Mock the sequence of user inputs for advanced search with date range
            // First call returns the search type (Advanced)
            mockWindow.showQuickPick.onFirstCall().resolves({ label: 'Advanced Search' });

            // Second call returns the advanced options including 'Limit by date'
            mockWindow.showQuickPick.onSecondCall().resolves([
                { label: 'Search in titles' },
                { label: 'Limit by date' }
            ]);

            // Mock date range inputs
            mockWindow.showInputBox.onFirstCall().resolves('search query'); // Initial search query
            mockWindow.showInputBox.onSecondCall().resolves('2025-01-01'); // From date
            mockWindow.showInputBox.onThirdCall().resolves('2025-05-01');  // To date

            // Mock result selection
            mockWindow.showQuickPick.onThirdCall().resolves({
                result: {
                    conversation: {
                        id: 'conv-123',
                        title: 'Test Conversation'
                    }
                }
            });

            // Register and get the command callback
            const disposable = searchCommand.register();
            const commandCallback = mockCommands.registerCommand.args[0][1];

            // Execute the command
            await commandCallback();

            // Verify date range inputs were requested
            expect(mockWindow.showInputBox).toHaveBeenCalledWith({
                prompt: 'From date (YYYY-MM-DD), leave empty for no lower limit',
                placeHolder: 'YYYY-MM-DD'
            });

            expect(mockWindow.showInputBox).toHaveBeenCalledWith({
                prompt: 'To date (YYYY-MM-DD), leave empty for no upper limit',
                placeHolder: 'YYYY-MM-DD'
            });

            // Verify search was performed with correct date options
            // The expected timestamps should match the dates we provided
            const fromDateTimestamp = new Date('2025-01-01').getTime();
            const toDateTimestamp = new Date('2025-05-01').getTime() + 86400000; // Include the end date

            expect(mockSearchService.search).toHaveBeenCalledWith(
                expect.objectContaining({
                    query: 'search query',
                    searchInTitles: true,
                    dateFrom: fromDateTimestamp,
                    dateTo: toDateTimestamp
                })
            );
        });
    });
});
