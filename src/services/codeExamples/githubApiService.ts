import * as vscode from 'vscode';
import axios from 'axios';

interface GitHubSearchResult {
    total_count: number;
    incomplete_results: boolean;
    items: GitHubCodeItem[];
}

interface GitHubCodeItem {
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    repository: {
        full_name: string;
        html_url: string;
        description: string;
        stargazers_count: number;
        watchers_count: number;
        language: string;
    };
    score: number;
}

export class GitHubApiService {
    private readonly baseUrl = 'https://api.github.com';
    private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    private codeExamplesCache: Map<string, { examples: GitHubCodeItem[], timestamp: number }> = new Map();
    
    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Search for code examples on GitHub based on query
     * @param query Search query
     * @param language Programming language to filter by
     * @param maxResults Maximum number of results to return
     * @returns Array of code examples
     */
    public async searchCodeExamples(
        query: string, 
        language?: string, 
        maxResults: number = 10
    ): Promise<GitHubCodeItem[]> {
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
            const response = await axios.get<GitHubSearchResult>(
                `${this.baseUrl}/search/code?q=${searchQuery}&per_page=${maxResults}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'VSCode-Local-LLM-Agent'
                    }
                }
            );
            
            // Cache results
            this.codeExamplesCache.set(cacheKey, {
                examples: response.data.items,
                timestamp: new Date()
            });
            
            return response.data.items;
        } catch (error) {
            console.error('Error searching GitHub code examples:', error);
            throw new Error(`Failed to search GitHub code examples: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Get file content from GitHub
     * @param url GitHub URL for the file
     * @returns File content as string
     */
    public async getFileContent(url: string): Promise<string> {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3.raw',
                    'User-Agent': 'VSCode-Local-LLM-Agent'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching file content from GitHub:', error);
            throw new Error(`Failed to fetch file content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Clear the code examples cache
     */
    public clearCache(): void {
        this.codeExamplesCache.clear();
    }
}
