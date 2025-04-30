import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { ConversationHistory } from './ConversationHistory';
import { ChatMessage, Conversation, Chapter } from './types';
import { TestGeneratorService } from './TestGeneratorService';

export class ConversationInsightService implements vscode.Disposable {
    private readonly history: ConversationHistory;
    private readonly testGenerator: TestGeneratorService;
    private readonly onInsightGeneratedEmitter = new EventEmitter<string>();
    readonly onInsightGenerated = this.onInsightGeneratedEmitter.event;

    constructor(history: ConversationHistory) {
        this.history = history;
        this.testGenerator = new TestGeneratorService(history);
    }

    async generateIdeas(context: string): Promise<string[]> {
        const relevantMessages = await this.findRelevantMessages(context);
        const ideas = await this.analyzeConversations(relevantMessages);
        return ideas;
    }

    async generateCodeSuggestions(context: string): Promise<string[]> {
        const relevantMessages = await this.findRelevantMessages(context, 'code');
        return this.analyzeCodeContext(relevantMessages);
    }

    async generateDocumentation(context: string): Promise<string> {
        const relevantMessages = await this.findRelevantMessages(context, 'documentation');
        return this.analyzeForDocumentation(relevantMessages);
    }

    async generateTests(context: string): Promise<string[]> {
        const testCases = await this.testGenerator.generateTests(context);
        return testCases.map(testCase => {
            const prefix = `// ${testCase.type.toUpperCase()} test - Priority: ${testCase.priority}\n`;
            return prefix + testCase.testCode;
        });
    }

    private async findRelevantMessages(context: string, type?: string): Promise<ChatMessage[]> {
        const conversations = this.history.getAllConversations();
        const relevantMessages: ChatMessage[] = [];

        for (const conversation of conversations) {
            for (const message of conversation.messages) {
                if (this.isMessageRelevant(message, context, type)) {
                    relevantMessages.push(message);
                }
            }
        }

        return relevantMessages;
    }

    private isMessageRelevant(message: ChatMessage, context: string, type?: string): boolean {
        // Basic relevance check using content similarity
        const isContentRelevant = message.content.toLowerCase().includes(context.toLowerCase());
        
        // If type is specified, check for type-specific patterns
        if (type) {
            switch (type) {
                case 'code':
                    return isContentRelevant && (
                        message.content.includes('```') || // Code blocks
                        /\b(function|class|const|let|var|import|export)\b/.test(message.content)
                    );
                case 'documentation':
                    return isContentRelevant && (
                        message.content.includes('/**') || // JSDoc comments
                        message.content.includes('###') || // Markdown headers
                        /\b(documentation|docs|readme|api|reference)\b/i.test(message.content)
                    );
                case 'tests':
                    return isContentRelevant && (
                        /\b(test|describe|it|expect|assert|should)\b/.test(message.content) ||
                        message.content.includes('test cases')
                    );
                default:
                    return isContentRelevant;
            }
        }

        return isContentRelevant;
    }

    private async analyzeConversations(messages: ChatMessage[]): Promise<string[]> {
        const ideas: string[] = [];
        const patterns = new Set<string>();

        for (const message of messages) {
            // Extract patterns and potential ideas from messages
            const messagePatterns = this.extractPatterns(message.content);
            messagePatterns.forEach(pattern => {
                if (!patterns.has(pattern)) {
                    patterns.add(pattern);
                    ideas.push(this.generateIdeaFromPattern(pattern));
                }
            });
        }

        return ideas;
    }

    private extractPatterns(content: string): string[] {
        const patterns: string[] = [];
        
        // Look for common patterns in the content
        const featurePattern = /(?:could|should|would|may|might)\s+(?:be able to|want to)?\s+(\w+(?:\s+\w+){1,5})/gi;
        const improvementPattern = /(?:improve|enhance|optimize|better)\s+(\w+(?:\s+\w+){1,5})/gi;
        const problemPattern = /(?:issue|problem|bug|error)\s+(?:with|in|when)\s+(\w+(?:\s+\w+){1,5})/gi;

        // Extract matches
        let match;
        while ((match = featurePattern.exec(content)) !== null) {
            patterns.push(`feature: ${match[1]}`);
        }
        while ((match = improvementPattern.exec(content)) !== null) {
            patterns.push(`improvement: ${match[1]}`);
        }
        while ((match = problemPattern.exec(content)) !== null) {
            patterns.push(`fix: ${match[1]}`);
        }

        return patterns;
    }

    private generateIdeaFromPattern(pattern: string): string {
        const [type, description] = pattern.split(': ');
        
        switch (type) {
            case 'feature':
                return `Consider implementing ${description}`;
            case 'improvement':
                return `Look into improving ${description}`;
            case 'fix':
                return `Investigate and resolve issues with ${description}`;
            default:
                return `Consider working on ${description}`;
        }
    }

    private async analyzeCodeContext(messages: ChatMessage[]): Promise<string[]> {
        const suggestions: string[] = [];
        const codeBlocks = new Set<string>();

        for (const message of messages) {
            // Extract code blocks
            const blocks = message.content.match(/```[\s\S]+?```/g) || [];
            blocks.forEach(block => {
                const code = block.replace(/```(\w+)?\n/, '').replace(/```$/, '');
                codeBlocks.add(code.trim());
            });
        }

        // Analyze code blocks for patterns and generate suggestions
        codeBlocks.forEach(code => {
            const patterns = this.analyzeCodePatterns(code);
            suggestions.push(...patterns);
        });

        return suggestions;
    }

    private analyzeCodePatterns(code: string): string[] {
        const patterns: string[] = [];
        
        // Look for common code patterns
        if (code.includes('try') && !code.includes('catch')) {
            patterns.push('Add error handling to try blocks');
        }
        if (code.includes('async') && !code.includes('await')) {
            patterns.push('Check for missing await keywords in async functions');
        }
        if (code.includes('new Promise') && !code.includes('reject')) {
            patterns.push('Add proper error handling in Promise constructors');
        }
        
        return patterns;
    }

    private async analyzeForDocumentation(messages: ChatMessage[]): Promise<string> {
        let documentation = '';
        const sections = new Map<string, string[]>();

        // Categorize content from messages
        for (const message of messages) {
            this.categorizeContent(message.content, sections);
        }

        // Generate documentation sections
        if (sections.has('overview')) {
            documentation += '# Overview\n\n' + sections.get('overview')!.join('\n\n') + '\n\n';
        }
        if (sections.has('usage')) {
            documentation += '## Usage\n\n' + sections.get('usage')!.join('\n\n') + '\n\n';
        }
        if (sections.has('api')) {
            documentation += '## API Reference\n\n' + sections.get('api')!.join('\n\n') + '\n\n';
        }
        if (sections.has('examples')) {
            documentation += '## Examples\n\n' + sections.get('examples')!.join('\n\n') + '\n\n';
        }

        return documentation;
    }

    private categorizeContent(content: string, sections: Map<string, string[]>) {
        // Extract sections based on content patterns
        if (/overview|introduction|summary/i.test(content)) {
            this.addToSection('overview', content, sections);
        }
        if (/usage|how to|example/i.test(content)) {
            this.addToSection('usage', content, sections);
        }
        if (/api|method|function|parameter/i.test(content)) {
            this.addToSection('api', content, sections);
        }
        if (content.includes('```')) {
            this.addToSection('examples', content, sections);
        }
    }

    private addToSection(section: string, content: string, sections: Map<string, string[]>) {
        if (!sections.has(section)) {
            sections.set(section, []);
        }
        sections.get(section)!.push(content);
    }

    dispose(): void {
        this.onInsightGeneratedEmitter.removeAllListeners();
        this.testGenerator.dispose();
    }
}