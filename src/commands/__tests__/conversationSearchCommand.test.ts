// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\conversationSearchCommand.test.ts
import * as vscode from 'vscode';
import { ConversationManager } from '../../services/conversationManager';
import { ConversationSearchService } from '../../services/conversationSearchService';
import { Conversation } from '../../types/conversation';
import { ConversationSearchCommand } from '../conversationSearchCommand';

// Mock the VS Code APIs
jest.mock('vscode', () => {
    return {
        commands: {
            registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            executeCommand: jest.fn()
        },
        window: {
            showInputBox: jest.fn(),
            showQuickPick: jest.fn(),
            showInformationMessage: jest.fn(),
            showErrorMessage: jest.fn()
        },
        ExtensionContext: jest.fn(),
        Disposable: {
            from: jest.fn()
        },
        EventEmitter: jest.fn().mockImplementation(() => ({
            event: jest.fn(),
            fire: jest.fn(),
            dispose: jest.fn()
        }))
    };
});

// Mock the ConversationManager and ConversationSearchService
jest.mock('../../services/conversationManager');
jest.mock('../../services/conversationSearchService');

describe('ConversationSearchCommand', () => {
    let command: ConversationSearchCommand;
    let mockContext: vscode.ExtensionContext;
    let mockConversationManager: ConversationManager;
    let mockSearchService: ConversationSearchService;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock context
        mockContext = {} as vscode.ExtensionContext;

        // Setup mock for ConversationManager
        mockConversationManager = {
            getConversations: jest.fn().mockReturnValue([])
        } as unknown as ConversationManager;
        (ConversationManager.getInstance as jest.Mock).mockReturnValue(mockConversationManager);

        // Setup mock for ConversationSearchService
        mockSearchService = {
            search: jest.fn().mockResolvedValue([]),
            getLastResults: jest.fn().mockReturnValue([])
        } as unknown as ConversationSearchService;
        (ConversationSearchService.getInstance as jest.Mock).mockReturnValue(mockSearchService);

        // Create command instance
        command = new ConversationSearchCommand(mockContext);
    });

    describe('constructor', () => {
        it('should initialize correctly with the conversation manager and search service', () => {
            expect(ConversationManager.getInstance).toHaveBeenCalledWith(mockContext);
            expect(ConversationSearchService.getInstance).toHaveBeenCalledWith(mockConversationManager);
        });
    });

    describe('register', () => {
        it('should register the command with VS Code', () => {
            const disposable = command.register();

            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilotPPA.searchConversations',
                expect.any(Function)
            );
            expect(disposable).toBeDefined();
        });
    });

    describe('executeSearch', () => {
        it('should handle user cancellation at search query input', async () => {
            // Mock user cancelling the input box
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce(undefined);

            // Get access to private method
            const executeSearch = (command as any).executeSearch.bind(command);
            await executeSearch();

            expect(vscode.window.showInputBox).toHaveBeenCalledWith({
                placeHolder: 'Search in conversations...',
                prompt: 'Enter search term',
                ignoreFocusOut: true
            });
            expect(mockSearchService.search).not.toHaveBeenCalled();
        });

        it('should handle user cancellation at search options selection', async () => {
            // Mock user entering a search query but cancelling options
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('test query');
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(undefined);

            // Get access to private method
            const executeSearch = (command as any).executeSearch.bind(command);
            await executeSearch();

            expect(vscode.window.showInputBox).toHaveBeenCalled();
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(mockSearchService.search).not.toHaveBeenCalled();
        });

        it('should display message when no results found', async () => {
            // Mock successful search but with no results
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('test query');
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({ label: 'Basic Search' });
            (mockSearchService.search as jest.Mock).mockResolvedValueOnce([]);

            // Get access to private method
            const executeSearch = (command as any).executeSearch.bind(command);
            await executeSearch();

            expect(vscode.window.showInputBox).toHaveBeenCalled();
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(mockSearchService.search).toHaveBeenCalledWith({ query: 'test query' });
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('No matching conversations found.');
        });

        it('should handle error during search', async () => {
            // Mock search throwing an error
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('test query');
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({ label: 'Basic Search' });
            const error = new Error('Search failed test error');
            (mockSearchService.search as jest.Mock).mockRejectedValueOnce(error);

            // Get access to private method
            const executeSearch = (command as any).executeSearch.bind(command);
            await executeSearch();

            expect(mockSearchService.search).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Search failed: Search failed test error');
        });

        it('should open selected conversation when user selects a result', async () => {
            // Mock successful search with results
            const mockConversation = { id: 'conv123', title: 'Test Conversation', messages: [] } as Conversation;
            const mockResult = {
                conversation: mockConversation,
                matches: [{ messageIndex: 0, content: 'Hello', highlights: [] }],
                titleMatch: true
            };

            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('test query');
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce({ label: 'Basic Search' }) // First for search options
                .mockResolvedValueOnce({ result: mockResult }); // Second for selecting result
            (mockSearchService.search as jest.Mock).mockResolvedValueOnce([mockResult]);

            // Get access to private method
            const executeSearch = (command as any).executeSearch.bind(command);
            await executeSearch();

            expect(mockSearchService.search).toHaveBeenCalled();
            expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(2);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'copilotPPA.openConversation',
                'conv123'
            );
        });
    });

    describe('getSearchOptions', () => {
        it('should return basic search options when Basic Search is selected', async () => {
            // Mock user selecting Basic Search
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({ label: 'Basic Search' });

            // Get access to private method
            const getSearchOptions = (command as any).getSearchOptions.bind(command);
            const result = await getSearchOptions('test query');

            expect(result).toEqual({ query: 'test query' });
        });

        it('should return undefined when user cancels search options selection', async () => {
            // Mock user cancelling selection
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(undefined);

            // Get access to private method
            const getSearchOptions = (command as any).getSearchOptions.bind(command);
            const result = await getSearchOptions('test query');

            expect(result).toBeUndefined();
        });

        it('should return undefined when user cancels advanced options selection', async () => {
            // Mock user selecting Advanced Search but cancelling advanced options
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce({ label: 'Advanced Search' })
                .mockResolvedValueOnce(undefined);

            // Get access to private method
            const getSearchOptions = (command as any).getSearchOptions.bind(command);
            const result = await getSearchOptions('test query');

            expect(result).toBeUndefined();
        });

        it('should return correct advanced search options', async () => {
            // Mock user selecting Advanced Search and picking options
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce({ label: 'Advanced Search' })
                .mockResolvedValueOnce([
                    { label: 'Search in titles' },
                    { label: 'Case sensitive' }
                ]);

            // Get access to private method
            const getSearchOptions = (command as any).getSearchOptions.bind(command);
            const result = await getSearchOptions('test query');

            expect(result).toEqual({
                query: 'test query',
                searchInTitles: true,
                searchInContent: false,
                caseSensitive: true,
                useRegex: false,
                onlyUserMessages: false,
                onlyAssistantMessages: false
            });
        });

        it('should handle date range options correctly', async () => {
            // Mock date inputs
            const fromDate = '2025-01-01';
            const toDate = '2025-01-31';

            // Mock user selecting Advanced Search with date limit and entering dates
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce({ label: 'Advanced Search' })
                .mockResolvedValueOnce([
                    { label: 'Search in titles' },
                    { label: 'Limit by date' }
                ]);

            (vscode.window.showInputBox as jest.Mock)
                .mockResolvedValueOnce(fromDate) // From date
                .mockResolvedValueOnce(toDate);  // To date

            // Get access to private method
            const getSearchOptions = (command as any).getSearchOptions.bind(command);
            const result = await getSearchOptions('test query');

            // Calculate expected timestamps
            const fromTimestamp = new Date(fromDate).getTime();
            const toTimestamp = new Date(toDate).getTime() + 86400000; // Adding one day in milliseconds

            expect(result).toEqual({
                query: 'test query',
                searchInTitles: true,
                searchInContent: false,
                caseSensitive: false,
                useRegex: false,
                onlyUserMessages: false,
                onlyAssistantMessages: false,
                dateFrom: fromTimestamp,
                dateTo: toTimestamp
            });
        });

        it('should handle invalid date inputs', async () => {
            // Mock user selecting Advanced Search with date limit and entering invalid dates
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce({ label: 'Advanced Search' })
                .mockResolvedValueOnce([
                    { label: 'Search in titles' },
                    { label: 'Limit by date' }
                ]);

            (vscode.window.showInputBox as jest.Mock)
                .mockResolvedValueOnce('invalid-date') // Invalid from date
                .mockResolvedValueOnce('invalid-date'); // Invalid to date

            // Get access to private method
            const getSearchOptions = (command as any).getSearchOptions.bind(command);
            const result = await getSearchOptions('test query');

            // Should not include date properties
            expect(result).toEqual({
                query: 'test query',
                searchInTitles: true,
                searchInContent: false,
                caseSensitive: false,
                useRegex: false,
                onlyUserMessages: false,
                onlyAssistantMessages: false
            });
        });
    });

    describe('showSearchResults', () => {
        it('should format and display search results correctly', async () => {
            // Create mock search results
            const now = Date.now();
            const mockConversation1 = {
                id: 'conv1',
                title: 'Test Conversation 1',
                messages: [{ role: 'user', content: 'Hello' }],
                updatedAt: now
            } as Conversation;

            const mockConversation2 = {
                id: 'conv2',
                title: 'Test Conversation 2',
                messages: [{ role: 'user', content: 'World' }, { role: 'assistant', content: 'Hello' }],
                updatedAt: now - 1000000 // Older
            } as Conversation;

            const mockResults = [
                {
                    conversation: mockConversation1,
                    titleMatch: true,
                    matches: [{ messageIndex: 0, content: 'Hello' }]
                },
                {
                    conversation: mockConversation2,
                    titleMatch: false,
                    matches: [{ messageIndex: 0, content: 'World' }, { messageIndex: 1, content: 'Hello' }]
                }
            ];

            // Mock user selecting the first result
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({
                label: 'Test Conversation 1',
                result: mockResults[0]
            });

            // Get access to private method
            const showSearchResults = (command as any).showSearchResults.bind(command);
            const result = await showSearchResults(mockResults);

            expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        label: 'Test Conversation 1',
                        description: 'Title match, 1 message match(es)',
                        detail: expect.stringContaining('Last updated')
                    }),
                    expect.objectContaining({
                        label: 'Test Conversation 2',
                        description: '2 message match(es)',
                        detail: expect.stringContaining('Last updated')
                    })
                ]),
                expect.objectContaining({
                    placeHolder: 'Select a conversation to open',
                    matchOnDescription: true,
                    matchOnDetail: true
                })
            );

            expect(result).toEqual(mockResults[0]);
        });

        it('should return undefined when user cancels result selection', async () => {
            // Create mock search results
            const mockResults = [{
                conversation: {
                    id: 'conv1',
                    title: 'Test Conversation',
                    messages: [{ role: 'user', content: 'Hello' }],
                    updatedAt: Date.now()
                } as Conversation,
                titleMatch: true,
                matches: [{ messageIndex: 0, content: 'Hello' }]
            }];

            // Mock user cancelling selection
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(undefined);

            // Get access to private method
            const showSearchResults = (command as any).showSearchResults.bind(command);
            const result = await showSearchResults(mockResults);

            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});
