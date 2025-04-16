"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSearchCommand = void 0;
const vscode = __importStar(require("vscode"));
const conversationManager_1 = require("../services/conversationManager");
const conversationSearchService_1 = require("../services/conversationSearchService");
class ConversationSearchCommand {
    constructor(context) {
        this.conversationManager = conversationManager_1.ConversationManager.getInstance(context);
        this.searchService = conversationSearchService_1.ConversationSearchService.getInstance(this.conversationManager);
    }
    register() {
        return vscode.commands.registerCommand(ConversationSearchCommand.commandId, async () => {
            await this.executeSearch();
        });
    }
    async executeSearch() {
        // Get search query from user
        const query = await vscode.window.showInputBox({
            placeHolder: 'Search in conversations...',
            prompt: 'Enter search term',
            ignoreFocusOut: true
        });
        if (!query) {
            return; // User cancelled
        }
        // Show additional search options
        const searchOptions = await this.getSearchOptions(query);
        if (!searchOptions) {
            return; // User cancelled
        }
        try {
            // Perform the search
            const results = await this.searchService.search(searchOptions);
            if (results.length === 0) {
                vscode.window.showInformationMessage('No matching conversations found.');
                return;
            }
            // Display results in a QuickPick
            const selectedResult = await this.showSearchResults(results);
            if (selectedResult) {
                // Open the selected conversation
                vscode.commands.executeCommand('copilotPPA.openConversation', selectedResult.conversation.id);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Search failed: ${error.message}`);
        }
    }
    async getSearchOptions(query) {
        const options = [
            { label: 'Basic Search', description: 'Search with default options' },
            { label: 'Advanced Search', description: 'Configure search options' }
        ];
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Search options',
            ignoreFocusOut: true
        });
        if (!selected) {
            return undefined; // User cancelled
        }
        if (selected.label === 'Basic Search') {
            return { query };
        }
        // Advanced search options
        const advancedOptions = [
            { label: 'Search in titles', picked: true },
            { label: 'Search in content', picked: true },
            { label: 'Case sensitive', picked: false },
            { label: 'Use regular expression', picked: false },
            { label: 'Only user messages', picked: false },
            { label: 'Only assistant messages', picked: false }
        ];
        const selectedOptions = await vscode.window.showQuickPick(advancedOptions, {
            placeHolder: 'Select search options',
            canPickMany: true,
            ignoreFocusOut: true
        });
        if (!selectedOptions) {
            return undefined; // User cancelled
        }
        // Build search options
        const searchOptions = {
            query,
            searchInTitles: selectedOptions.some(opt => opt.label === 'Search in titles'),
            searchInContent: selectedOptions.some(opt => opt.label === 'Search in content'),
            caseSensitive: selectedOptions.some(opt => opt.label === 'Case sensitive'),
            useRegex: selectedOptions.some(opt => opt.label === 'Use regular expression'),
            onlyUserMessages: selectedOptions.some(opt => opt.label === 'Only user messages'),
            onlyAssistantMessages: selectedOptions.some(opt => opt.label === 'Only assistant messages')
        };
        // Date range options
        if (selectedOptions.some(opt => opt.label === 'Limit by date')) {
            const fromDateStr = await vscode.window.showInputBox({
                prompt: 'From date (YYYY-MM-DD), leave empty for no lower limit',
                placeHolder: 'YYYY-MM-DD'
            });
            const toDateStr = await vscode.window.showInputBox({
                prompt: 'To date (YYYY-MM-DD), leave empty for no upper limit',
                placeHolder: 'YYYY-MM-DD'
            });
            if (fromDateStr) {
                const fromDate = new Date(fromDateStr);
                if (!isNaN(fromDate.getTime())) {
                    searchOptions.dateFrom = fromDate.getTime();
                }
            }
            if (toDateStr) {
                const toDate = new Date(toDateStr);
                if (!isNaN(toDate.getTime())) {
                    searchOptions.dateTo = toDate.getTime() + 86400000; // Include the end date (add one day)
                }
            }
        }
        return searchOptions;
    }
    async showSearchResults(results) {
        const items = results.map(result => {
            const conversation = result.conversation;
            // Format the match information
            let matchInfo = '';
            if (result.titleMatch) {
                matchInfo += 'Title match';
            }
            if (result.matches.length > 0) {
                if (matchInfo) {
                    matchInfo += ', ';
                }
                matchInfo += `${result.matches.length} message match(es)`;
            }
            return {
                label: conversation.title,
                description: matchInfo,
                detail: `Last updated: ${new Date(conversation.updatedAt).toLocaleString()} · ${conversation.messages.length} messages`,
                result
            };
        });
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a conversation to open',
            matchOnDescription: true,
            matchOnDetail: true
        });
        return selected?.result;
    }
}
exports.ConversationSearchCommand = ConversationSearchCommand;
ConversationSearchCommand.commandId = 'copilotPPA.searchConversations';
//# sourceMappingURL=conversationSearchCommand.js.map