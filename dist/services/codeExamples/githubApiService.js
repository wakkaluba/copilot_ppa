"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class GitHubApiService {
    constructor(context) {
        this.context = context;
        this.baseUrl = 'https://api.github.com';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.codeExamplesCache = new Map();
    }
    /**
     * Search for code examples on GitHub based on query
     * @param query Search query
     * @param language Programming language to filter by
     * @param maxResults Maximum number of results to return
     * @returns Array of code examples
     */
    async searchCodeExamples(query, language, maxResults = 10) {
        try {
            // Build cache key
            const cacheKey = `${query}-${language || 'all'}-${maxResults}`;
            // Check cache first
            const cachedResult = this.codeExamplesCache.get(cacheKey);
            if (cachedResult && (Date.now() - cachedResult.timestamp) < this.cacheExpiry) {
                return cachedResult.examples;
            }
            // Build search query
            let searchQuery = encodeURIComponent(query);
            if (language) {
                searchQuery += `+language:${language}`;
            }
            // Make request to GitHub API
            const response = await axios_1.default.get(`${this.baseUrl}/search/code?q=${searchQuery}&per_page=${maxResults}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'VSCode-Local-LLM-Agent'
                }
            });
            // Cache results
            this.codeExamplesCache.set(cacheKey, {
                examples: response.data.items,
                timestamp: new Date()
            });
            return response.data.items;
        }
        catch (error) {
            console.error('Error searching GitHub code examples:', error);
            throw new Error(`Failed to search GitHub code examples: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get file content from GitHub
     * @param url GitHub URL for the file
     * @returns File content as string
     */
    async getFileContent(url) {
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3.raw',
                    'User-Agent': 'VSCode-Local-LLM-Agent'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching file content from GitHub:', error);
            throw new Error(`Failed to fetch file content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Clear the code examples cache
     */
    clearCache() {
        this.codeExamplesCache.clear();
    }
}
exports.GitHubApiService = GitHubApiService;
//# sourceMappingURL=githubApiService.js.map