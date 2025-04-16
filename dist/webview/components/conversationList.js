"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationListHtml = getConversationListHtml;
exports.getConversationListStyles = getConversationListStyles;
exports.getConversationListScript = getConversationListScript;
function getConversationListHtml(conversations, currentConversationId) {
    return `
    <div class="conversation-list">
        <div class="conversation-list-header">
            <h3>Conversations</h3>
            <div class="search-container">
                <input type="text" id="conversation-search" placeholder="Search conversations..." />
                <button id="advanced-search-btn" title="Advanced Search">
                    <i class="codicon codicon-filter"></i>
                </button>
            </div>
            <div class="conversation-actions">
                <button id="new-conversation-btn" title="New Conversation">
                    <i class="codicon codicon-add"></i>
                </button>
                <button id="import-conversation-btn" title="Import Conversations">
                    <i class="codicon codicon-folder-opened"></i>
                </button>
                <button id="export-all-conversations-btn" title="Export All Conversations">
                    <i class="codicon codicon-save-all"></i>
                </button>
            </div>
        </div>
        
        <div id="conversation-filters" class="conversation-filters" style="display: none;">
            <div class="filter-group">
                <label>
                    <input type="checkbox" id="filter-today" />
                    Today
                </label>
                <label>
                    <input type="checkbox" id="filter-week" />
                    This week
                </label>
                <label>
                    <input type="checkbox" id="filter-month" />
                    This month
                </label>
            </div>
            <div class="filter-group">
                <label>
                    <input type="checkbox" id="filter-user-messages" />
                    Has user messages
                </label>
                <label>
                    <input type="checkbox" id="filter-assistant-messages" />
                    Has assistant messages
                </label>
            </div>
            <div class="filter-actions">
                <button id="apply-filters-btn">Apply Filters</button>
                <button id="reset-filters-btn">Reset</button>
            </div>
        </div>
        
        <div class="conversation-items">
            ${renderConversationItems(conversations, currentConversationId)}
        </div>
    </div>
    `;
}
function getConversationListStyles() {
    return `
    .conversation-list {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .conversation-list-header {
        display: flex;
        flex-direction: column;
        padding: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .conversation-list-header h3 {
        margin: 0 0 8px 0;
    }
    
    .search-container {
        display: flex;
        margin-bottom: 8px;
    }
    
    .search-container input {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid var(--vscode-input-border);
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
    }
    
    .search-container button {
        margin-left: 4px;
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: var(--vscode-editor-foreground);
    }
    
    .conversation-actions {
        display: flex;
        justify-content: flex-end;
    }
    
    .conversation-actions button {
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: var(--vscode-editor-foreground);
        margin-left: 8px;
    }
    
    .conversation-filters {
        padding: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
        background-color: var(--vscode-editor-background);
    }
    
    .filter-group {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 8px;
    }
    
    .filter-group label {
        margin-right: 12px;
        display: flex;
        align-items: center;
    }
    
    .filter-group input {
        margin-right: 4px;
    }
    
    .filter-actions {
        display: flex;
        justify-content: flex-end;
    }
    
    .filter-actions button {
        margin-left: 8px;
        padding: 4px 8px;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        cursor: pointer;
    }
    
    .conversation-items {
        flex: 1;
        overflow-y: auto;
    }
    
    /* ...existing styles... */
    `;
}
function getConversationListScript() {
    return `
    document.addEventListener('DOMContentLoaded', () => {
        setupConversationListListeners();
    });
    
    function setupConversationListListeners() {
        // New conversation button
        document.getElementById('new-conversation-btn')?.addEventListener('click', () => {
            vscode.postMessage({
                command: 'newConversation'
            });
        });
        
        // Import conversation button
        document.getElementById('import-conversation-btn')?.addEventListener('click', () => {
            vscode.postMessage({
                command: 'importConversation'
            });
        });
        
        // Export all conversations button
        document.getElementById('export-all-conversations-btn')?.addEventListener('click', () => {
            vscode.postMessage({
                command: 'exportAllConversations'
            });
        });
        
        // Advanced search button
        document.getElementById('advanced-search-btn')?.addEventListener('click', () => {
            const filtersElement = document.getElementById('conversation-filters');
            if (filtersElement) {
                const isVisible = filtersElement.style.display !== 'none';
                filtersElement.style.display = isVisible ? 'none' : 'block';
            }
        });
        
        // Search input
        const searchInput = document.getElementById('conversation-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                const query = e.target.value;
                vscode.postMessage({
                    command: 'searchConversations',
                    query
                });
            }, 300));
        }
        
        // Apply filters button
        document.getElementById('apply-filters-btn')?.addEventListener('click', () => {
            const filters = {
                today: document.getElementById('filter-today')?.checked,
                week: document.getElementById('filter-week')?.checked,
                month: document.getElementById('filter-month')?.checked,
                userMessages: document.getElementById('filter-user-messages')?.checked,
                assistantMessages: document.getElementById('filter-assistant-messages')?.checked
            };
            
            vscode.postMessage({
                command: 'filterConversations',
                filters
            });
        });
        
        // Reset filters button
        document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
            // Reset all checkboxes
            document.querySelectorAll('#conversation-filters input[type="checkbox"]')
                .forEach(checkbox => {
                    checkbox.checked = false;
                });
            
            // Clear search input
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Reset to show all conversations
            vscode.postMessage({
                command: 'resetConversationFilters'
            });
        });
        
        // Conversation item click
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.getAttribute('data-id');
                if (conversationId) {
                    vscode.postMessage({
                        command: 'openConversation',
                        conversationId
                    });
                }
            });
        });
        
        // Helper function for debouncing
        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }
    }
    `;
}
function renderConversationItems(conversations, currentConversationId) {
    if (!conversations || conversations.length === 0) {
        return `
        <div class="empty-state">
            <p>No conversations yet</p>
            <button id="start-conversation-btn">Start a new conversation</button>
        </div>
        `;
    }
    return conversations.map(conversation => {
        const isActive = conversation.id === currentConversationId;
        const date = new Date(conversation.updatedAt).toLocaleString();
        const messageCount = conversation.messages.length;
        return `
        <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conversation.id}">
            <div class="conversation-item-content">
                <div class="conversation-title">${escapeHtml(conversation.title)}</div>
                <div class="conversation-meta">
                    <span class="conversation-date">${date}</span>
                    <span class="conversation-message-count">${messageCount} message${messageCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
//# sourceMappingURL=conversationList.js.map