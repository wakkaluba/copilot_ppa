import * as vscode from 'vscode';
import { ConversationHistory, ChatMessage } from './ConversationHistory';
import { ConversationManager } from './ConversationManager';
import { PromptManager } from './PromptManager';

export interface Context {
    conversationId: string;
    activeFile?: string;
    selectedCode?: string;
    codeLanguage?: string;
    lastCommand?: string;
    relevantFiles: string[];
    systemPrompt: string;
}

interface ContextWindow {
    messages: string[];
    relevance: number;
    timestamp: number;
}

export class ContextManager {
    private static instance: ContextManager;
    private contexts: Map<string, Context> = new Map();
    private history: ConversationHistory;
    private contextWindows: Map<string, ContextWindow>;
    private maxWindowSize: number = 10;
    private relevanceThreshold: number = 0.5;

    private constructor(history: ConversationHistory) {
        this.history = history;
        this.contextWindows = new Map();
    }

    static getInstance(history: ConversationHistory): ContextManager {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager(history);
        }
        return ContextManager.instance;
    }

    createContext(conversationId: string): Context {
        const context: Context = {
            conversationId,
            relevantFiles: [],
            systemPrompt: this.getDefaultSystemPrompt()
        };
        this.contexts.set(conversationId, context);
        return context;
    }

    updateContext(conversationId: string, updates: Partial<Context>): void {
        const context = this.contexts.get(conversationId);
        if (!context) {
            throw new Error(`Context not found for conversation: ${conversationId}`);
        }
        Object.assign(context, updates);
    }

    getContext(conversationId: string): Context {
        const context = this.contexts.get(conversationId);
        if (!context) {
            return this.createContext(conversationId);
        }
        return context;
    }

    async buildPrompt(conversationId: string, userInput: string): Promise<string> {
        const context = this.getContext(conversationId);
        const conversation = this.history.getConversation(conversationId);
        
        let prompt = context.systemPrompt + '\n\n';

        if (context.activeFile) {
            prompt += `Current file: ${context.activeFile}\n`;
        }
        if (context.selectedCode) {
            prompt += `Selected code:\n\`\`\`${context.codeLanguage || ''}\n${context.selectedCode}\n\`\`\`\n`;
        }

        // Add recent conversation history
        if (conversation) {
            const recentMessages = conversation.messages.slice(-5);
            for (const msg of recentMessages) {
                prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            }
        }

        prompt += `User: ${userInput}\nAssistant: `;
        return prompt;
    }

    private getDefaultSystemPrompt(): string {
        return `You are a helpful VS Code extension assistant.
You can help with coding tasks, explain code, and suggest improvements.
You have access to the current file and workspace context.
Always provide clear and concise responses.`;
    }

    async buildContext(conversationId: string, currentPrompt: string): Promise<string[]> {
        const conversationManager = ConversationManager.getInstance();
        const promptManager = PromptManager.getInstance();
        const context = await this.getRelevantContext(conversationId, currentPrompt);
        
        // Combine conversation history with relevant context
        const history = conversationManager.getCurrentContext(this.maxWindowSize);
        return [...context, ...history.map(msg => msg.content)];
    }

    async updateContext(conversationId: string, message: string, relevance: number): Promise<void> {
        const window = this.contextWindows.get(conversationId) || {
            messages: [],
            relevance: 0,
            timestamp: Date.now()
        };

        // Add new message to context window
        window.messages.push(message);
        if (window.messages.length > this.maxWindowSize) {
            window.messages.shift();
        }

        // Update relevance score
        window.relevance = (window.relevance + relevance) / 2;
        window.timestamp = Date.now();

        this.contextWindows.set(conversationId, window);
        await this.pruneOldContexts();
    }

    private async getRelevantContext(conversationId: string, currentPrompt: string): Promise<string[]> {
        const window = this.contextWindows.get(conversationId);
        if (!window || window.relevance < this.relevanceThreshold) {
            return [];
        }

        // Filter context by semantic similarity to current prompt
        const relevantMessages = await this.filterByRelevance(window.messages, currentPrompt);
        return relevantMessages;
    }

    private async filterByRelevance(messages: string[], prompt: string): Promise<string[]> {
        // Simple relevance filtering based on time for now
        // TODO: Implement semantic similarity checking
        const recentMessages = messages.slice(-5);
        return recentMessages;
    }

    private async pruneOldContexts(): Promise<void> {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [id, window] of this.contextWindows.entries()) {
            if (now - window.timestamp > maxAge) {
                this.contextWindows.delete(id);
            }
        }
    }

    setMaxWindowSize(size: number): void {
        this.maxWindowSize = size;
    }

    setRelevanceThreshold(threshold: number): void {
        this.relevanceThreshold = threshold;
    }
}
