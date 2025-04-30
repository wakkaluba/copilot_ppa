import * as vscode from 'vscode';
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
export declare class GitHubApiService {
    private context;
    private readonly baseUrl;
    private readonly cacheExpiry;
    private codeExamplesCache;
    constructor(context: vscode.ExtensionContext);
    /**
     * Search for code examples on GitHub based on query
     * @param query Search query
     * @param language Programming language to filter by
     * @param maxResults Maximum number of results to return
     * @returns Array of code examples
     */
    searchCodeExamples(query: string, language?: string, maxResults?: number): Promise<GitHubCodeItem[]>;
    /**
     * Get file content from GitHub
     * @param url GitHub URL for the file
     * @returns File content as string
     */
    getFileContent(url: string): Promise<string>;
    /**
     * Clear the code examples cache
     */
    clearCache(): void;
}
export {};
