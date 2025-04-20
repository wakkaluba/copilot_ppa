"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExampleService = void 0;
const githubApiService_1 = require("./githubApiService");
class CodeExampleService {
    githubApiService;
    constructor(context) {
        this.githubApiService = new githubApiService_1.GitHubApiService(context);
    }
    /**
     * Search for code examples based on the current context
     * @param query Search query
     * @param contextInfo Additional context information
     * @returns Array of code examples
     */
    async searchExamples(query, contextInfo) {
        try {
            // Get raw examples from GitHub
            const githubItems = await this.githubApiService.searchCodeExamples(query, contextInfo?.language, contextInfo?.maxResults || 5);
            // Transform GitHub items to CodeExample format
            const examples = [];
            for (const item of githubItems) {
                try {
                    // Get file content
                    const fileContent = await this.githubApiService.getFileContent(item.git_url);
                    examples.push({
                        title: item.path.split('/').pop() || '',
                        description: `From repository: ${item.repository.full_name}`,
                        language: item.repository.language || this.detectLanguageFromFilename(item.name),
                        code: fileContent,
                        source: {
                            name: item.repository.full_name,
                            url: item.html_url
                        },
                        stars: item.repository.stargazers_count
                    });
                }
                catch (error) {
                    console.error(`Error processing GitHub item ${item.html_url}:`, error);
                    // Continue with next item
                }
            }
            return examples;
        }
        catch (error) {
            console.error('Error searching for code examples:', error);
            throw new Error(`Failed to search for code examples: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Filter examples by relevance based on current context
     * @param examples Array of code examples
     * @param context Current context
     * @returns Filtered examples
     */
    filterExamplesByRelevance(examples, context) {
        return examples
            .filter(example => {
            // Filter by language if specified
            if (context.language && example.language) {
                const exampleLang = example.language.toLowerCase();
                const contextLang = context.language.toLowerCase();
                // If languages don't match, lower relevance
                if (exampleLang !== contextLang) {
                    // Allow some exceptions (e.g. typescript/javascript)
                    if (!(exampleLang === 'typescript' && contextLang === 'javascript') &&
                        !(exampleLang === 'javascript' && contextLang === 'typescript')) {
                        return false;
                    }
                }
            }
            return true;
        })
            .sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;
            // Higher stars means better example
            scoreA += (a.stars || 0) / 100;
            scoreB += (b.stars || 0) / 100;
            // Check how many keywords match in the code
            for (const keyword of context.keywords) {
                if (a.code.includes(keyword))
                    scoreA += 1;
                if (b.code.includes(keyword))
                    scoreB += 1;
            }
            return scoreB - scoreA;
        });
    }
    /**
     * Detect programming language from filename
     * @param filename Filename to analyze
     * @returns Detected language or 'text'
     */
    detectLanguageFromFilename(filename) {
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        const extensionMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'java': 'java',
            'rb': 'ruby',
            'php': 'php',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'c': 'c',
            'cpp': 'cpp',
            'html': 'html',
            'css': 'css',
            'md': 'markdown',
            'json': 'json',
            'yml': 'yaml',
            'yaml': 'yaml',
            'sh': 'shell',
            'bat': 'batch',
            'ps1': 'powershell'
        };
        return extensionMap[extension] || 'text';
    }
}
exports.CodeExampleService = CodeExampleService;
//# sourceMappingURL=codeExampleService.js.map