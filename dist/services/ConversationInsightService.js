"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationInsightService = void 0;
const events_1 = require("events");
const TestGeneratorService_1 = require("./TestGeneratorService");
class ConversationInsightService {
    history;
    testGenerator;
    onInsightGeneratedEmitter = new events_1.EventEmitter();
    onInsightGenerated = this.onInsightGeneratedEmitter.event;
    constructor(history) {
        this.history = history;
        this.testGenerator = new TestGeneratorService_1.TestGeneratorService(history);
    }
    async generateIdeas(context) {
        const relevantMessages = await this.findRelevantMessages(context);
        const ideas = await this.analyzeConversations(relevantMessages);
        return ideas;
    }
    async generateCodeSuggestions(context) {
        const relevantMessages = await this.findRelevantMessages(context, 'code');
        return this.analyzeCodeContext(relevantMessages);
    }
    async generateDocumentation(context) {
        const relevantMessages = await this.findRelevantMessages(context, 'documentation');
        return this.analyzeForDocumentation(relevantMessages);
    }
    async generateTests(context) {
        const testCases = await this.testGenerator.generateTests(context);
        return testCases.map(testCase => {
            const prefix = `// ${testCase.type.toUpperCase()} test - Priority: ${testCase.priority}\n`;
            return prefix + testCase.testCode;
        });
    }
    async findRelevantMessages(context, type) {
        const conversations = this.history.getAllConversations();
        const relevantMessages = [];
        for (const conversation of conversations) {
            for (const message of conversation.messages) {
                if (this.isMessageRelevant(message, context, type)) {
                    relevantMessages.push(message);
                }
            }
        }
        return relevantMessages;
    }
    isMessageRelevant(message, context, type) {
        // Basic relevance check using content similarity
        const isContentRelevant = message.content.toLowerCase().includes(context.toLowerCase());
        // If type is specified, check for type-specific patterns
        if (type) {
            switch (type) {
                case 'code':
                    return isContentRelevant && (message.content.includes('```') || // Code blocks
                        /\b(function|class|const|let|var|import|export)\b/.test(message.content));
                case 'documentation':
                    return isContentRelevant && (message.content.includes('/**') || // JSDoc comments
                        message.content.includes('###') || // Markdown headers
                        /\b(documentation|docs|readme|api|reference)\b/i.test(message.content));
                case 'tests':
                    return isContentRelevant && (/\b(test|describe|it|expect|assert|should)\b/.test(message.content) ||
                        message.content.includes('test cases'));
                default:
                    return isContentRelevant;
            }
        }
        return isContentRelevant;
    }
    async analyzeConversations(messages) {
        const ideas = [];
        const patterns = new Set();
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
    extractPatterns(content) {
        const patterns = [];
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
    generateIdeaFromPattern(pattern) {
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
    async analyzeCodeContext(messages) {
        const suggestions = [];
        const codeBlocks = new Set();
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
    analyzeCodePatterns(code) {
        const patterns = [];
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
    async analyzeForDocumentation(messages) {
        let documentation = '';
        const sections = new Map();
        // Categorize content from messages
        for (const message of messages) {
            this.categorizeContent(message.content, sections);
        }
        // Generate documentation sections
        if (sections.has('overview')) {
            documentation += '# Overview\n\n' + sections.get('overview').join('\n\n') + '\n\n';
        }
        if (sections.has('usage')) {
            documentation += '## Usage\n\n' + sections.get('usage').join('\n\n') + '\n\n';
        }
        if (sections.has('api')) {
            documentation += '## API Reference\n\n' + sections.get('api').join('\n\n') + '\n\n';
        }
        if (sections.has('examples')) {
            documentation += '## Examples\n\n' + sections.get('examples').join('\n\n') + '\n\n';
        }
        return documentation;
    }
    categorizeContent(content, sections) {
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
    addToSection(section, content, sections) {
        if (!sections.has(section)) {
            sections.set(section, []);
        }
        sections.get(section).push(content);
    }
    dispose() {
        this.onInsightGeneratedEmitter.removeAllListeners();
        this.testGenerator.dispose();
    }
}
exports.ConversationInsightService = ConversationInsightService;
//# sourceMappingURL=ConversationInsightService.js.map