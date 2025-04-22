"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreAgent = void 0;
const PromptManager_1 = require("./PromptManager");
const ContextManager_1 = require("./ContextManager");
const CommandParser_1 = require("./CommandParser");
const ConversationManager_1 = require("./ConversationManager");
class CoreAgent {
    static instance;
    promptManager;
    contextManager;
    commandParser;
    conversationManager;
    status = 'idle';
    constructor() {
        this.promptManager = PromptManager_1.PromptManager.getInstance();
        this.contextManager = ContextManager_1.ContextManager.getInstance();
        this.commandParser = CommandParser_1.CommandParser.getInstance();
        this.conversationManager = ConversationManager_1.ConversationManager.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new CoreAgent();
        }
        return this.instance;
    }
    async processInput(input) {
        try {
            this.status = 'processing';
            // Get conversation context
            const context = await this.contextManager.buildContext('current', input);
            // Generate prompt based on input and context
            const prompt = this.promptManager.generatePrompt('agent-task', {
                input,
                context: context.join('\n')
            });
            // Process the response (assuming LLM response is received)
            await this.handleResponse(prompt);
            this.status = 'idle';
        }
        catch (error) {
            this.status = 'error';
            throw error;
        }
    }
    async handleResponse(response) {
        // Check for commands in response
        if (response.includes('#')) {
            const commands = response.match(/#\w+\([^)]+\)/g) || [];
            for (const command of commands) {
                await this.commandParser.parseAndExecute(command);
            }
        }
        // Update conversation history
        await this.conversationManager.addMessage('assistant', response);
    }
    async analyzeCode(code, context) {
        const prompt = this.promptManager.generatePrompt('analyze-code', {
            code,
            context: context || ''
        });
        // Process with LLM and return analysis
        return prompt; // Placeholder
    }
    async suggestImprovements(code) {
        const prompt = this.promptManager.generatePrompt('suggest-improvements', {
            code
        });
        // Process with LLM and return suggestions
        return prompt; // Placeholder
    }
    async continueCodingIteration() {
        try {
            this.status = 'processing';
            // Get the current conversation context
            const context = await this.contextManager.buildContext('current', 'continue iteration');
            // Generate continuation prompt
            const prompt = this.promptManager.generatePrompt('continue-iteration', {
                context: context.join('\n')
            });
            // Process the response
            await this.handleResponse(prompt);
            this.status = 'idle';
        }
        catch (error) {
            this.status = 'error';
            throw error;
        }
    }
    getStatus() {
        return this.status;
    }
}
exports.CoreAgent = CoreAgent;
//# sourceMappingURL=CoreAgent.js.map