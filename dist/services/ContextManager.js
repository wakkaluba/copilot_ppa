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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const vscode = __importStar(require("vscode"));
class ContextManager {
    constructor() {
        this.maxWindowSize = 10;
        this.relevanceThreshold = 0.5;
        this.disposables = [];
        this.contexts = new Map();
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(this.onWorkspaceFoldersChanged.bind(this)));
    }
    static getInstance() {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager();
        }
        return ContextManager.instance;
    }
    // For testing purposes
    static resetInstance() {
        ContextManager.instance = undefined;
    }
    createContext(id) {
        const context = {
            id,
            messages: [],
            preferences: {
                language: undefined,
                framework: undefined,
                fileExtensions: [],
                directories: [],
                namingPatterns: []
            }
        };
        this.contexts.set(id, context);
        return context;
    }
    getContext(id) {
        let context = this.contexts.get(id);
        if (!context) {
            context = this.createContext(id);
        }
        return context;
    }
    updateContext(id, update) {
        const context = this.getContext(id);
        if (update.messageContent) {
            this.addMessage({
                role: 'user',
                content: update.messageContent,
                timestamp: new Date()
            });
            // Extract preferences
            this.extractLanguagePreferences(update.messageContent);
            this.extractFilePreferences(update.messageContent);
        }
        if (update.activeFile) {
            this.trackActiveFile(update.activeFile);
        }
    }
    addMessage(message) {
        const context = this.getContext('default');
        context.messages.push(message);
        // Keep only the last N messages to limit context window
        if (context.messages.length > this.maxWindowSize) {
            context.messages.shift();
        }
        // Extract preferences
        this.extractLanguagePreferences(message.content);
        this.extractFilePreferences(message.content);
    }
    extractLanguagePreferences(content) {
        // Simplified language detection
        const languages = [
            { name: 'typescript', aliases: ['ts', 'typescript', 'tsx'] },
            { name: 'javascript', aliases: ['js', 'javascript', 'jsx'] },
            { name: 'python', aliases: ['py', 'python'] },
            { name: 'java', aliases: ['java'] },
            { name: 'csharp', aliases: ['c#', 'csharp', 'cs'] }
        ];
        for (const lang of languages) {
            if (lang.aliases.some(alias => content.toLowerCase().includes(alias))) {
                const context = this.getContext('default');
                context.preferences.language = lang.name;
                break;
            }
        }
        // Framework detection
        const frameworks = [
            { name: 'react', language: 'typescript', aliases: ['react', 'jsx', 'tsx'] },
            { name: 'angular', language: 'typescript', aliases: ['angular', 'ng'] },
            { name: 'vue', language: 'javascript', aliases: ['vue'] },
            { name: 'django', language: 'python', aliases: ['django'] },
            { name: 'laravel', language: 'php', aliases: ['laravel'] }
        ];
        for (const framework of frameworks) {
            if (framework.aliases.some(alias => content.toLowerCase().includes(alias))) {
                const context = this.getContext('default');
                context.preferences.framework = framework.name;
                context.preferences.language = framework.language;
                break;
            }
        }
    }
    extractFilePreferences(content) {
        const context = this.getContext('default');
        // Extract file extensions
        const extMatch = content.match(/\.(ts|js|py|java|cs|tsx|jsx|html|css|scss|json|md|yml|yaml)\b/g);
        if (extMatch) {
            extMatch.forEach(ext => {
                const cleanExt = ext.substring(1); // Remove the dot
                if (!context.preferences.fileExtensions.includes(cleanExt)) {
                    context.preferences.fileExtensions.push(cleanExt);
                }
            });
        }
        // Extract directories
        const dirMatch = content.match(/(?:^|\s)(src\/\w+|src\/\w+\/\w+|\w+\/\w+)\b/g);
        if (dirMatch) {
            dirMatch.forEach(dir => {
                const cleanDir = dir.trim();
                if (!context.preferences.directories.includes(cleanDir)) {
                    context.preferences.directories.push(cleanDir);
                }
            });
        }
        // Extract naming patterns
        const patternMatch = content.match(/\w+\.\w+\.\w+|\w+[-_]\w+[-_]\w+/g);
        if (patternMatch) {
            patternMatch.forEach(pattern => {
                if (!context.preferences.namingPatterns.includes(pattern)) {
                    context.preferences.namingPatterns.push(pattern);
                }
            });
        }
    }
    trackActiveFile(filePath) {
        const context = this.getContext('default');
        const extension = filePath.split('.').pop();
        if (extension && !context.preferences.fileExtensions.includes(extension)) {
            context.preferences.fileExtensions.push(extension);
        }
    }
    buildContextString() {
        const context = this.getContext('default');
        let contextString = '';
        if (context.preferences.language) {
            contextString += `Using ${context.preferences.language} language. `;
        }
        if (context.preferences.framework) {
            contextString += `Working with the ${context.preferences.framework} framework. `;
        }
        if (context.preferences.fileExtensions.length > 0) {
            contextString += `Working with files of types: ${context.preferences.fileExtensions.join(', ')}. `;
        }
        if (context.preferences.directories.length > 0) {
            contextString += `Relevant directories: ${context.preferences.directories.join(', ')}. `;
        }
        return contextString;
    }
    generateSuggestions(input) {
        const context = this.getContext('default');
        const suggestions = [];
        if (context.preferences.framework === 'react') {
            suggestions.push('Create a new component', 'Set up React Router', 'Add state management with Redux/Context');
        }
        else if (context.preferences.framework === 'angular') {
            suggestions.push('Generate a new service', 'Create a module', 'Add Angular Material');
        }
        else if (context.preferences.language === 'python') {
            suggestions.push('Create a new function', 'Set up virtual environment', 'Add unit tests');
        }
        return suggestions;
    }
    async clearAllContextData() {
        this.contexts.clear();
    }
    getConversationHistory() {
        return this.getContext('default').messages;
    }
    setMaxWindowSize(size) {
        this.maxWindowSize = size;
    }
    setRelevanceThreshold(threshold) {
        this.relevanceThreshold = threshold;
    }
    getPreferredLanguage() {
        return this.getContext('default').preferences.language;
    }
    getPreferredFramework() {
        return this.getContext('default').preferences.framework;
    }
    getRecentFileExtensions() {
        return this.getContext('default').preferences.fileExtensions;
    }
    getRecentDirectories() {
        return this.getContext('default').preferences.directories;
    }
    getFileNamingPatterns() {
        return this.getContext('default').preferences.namingPatterns;
    }
    onWorkspaceFoldersChanged() {
        // Handle workspace changes
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map