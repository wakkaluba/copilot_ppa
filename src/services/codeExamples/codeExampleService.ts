import * as vscode from 'vscode';
import { GitHubApiService } from './githubApiService';
import { EventEmitter } from 'vscode';
import { inject, injectable } from 'inversify';
import { IDisposable } from '../../interfaces';

export interface CodeExample {
    title: string;
    description: string;
    language: string;
    code: string;
    source: {
        name: string;
        url: string;
    };
    stars?: number;
}

@injectable()
export class CodeExampleService implements IDisposable {
    private readonly _onDidUpdateExamples = new EventEmitter<void>();
    private readonly disposables: IDisposable[] = [];

    constructor(
        @inject('GithubApiService') private githubApi: IGithubApiService,
        @inject('SearchIndexService') private searchIndex: ISearchIndexService
    ) {
        this.disposables.push(this._onDidUpdateExamples);
    }

    public async searchExamples(query: string, language?: string): Promise<CodeExample[]> {
        try {
            const results = await this.searchIndex.search(query, language);
            return this.processResults(results);
        } catch (error) {
            this.handleError('Failed to search code examples', error);
            return [];
        }
    }

    public async refreshExamples(): Promise<void> {
        try {
            await this.searchIndex.rebuild();
            this._onDidUpdateExamples.fire();
        } catch (error) {
            this.handleError('Failed to refresh code examples', error);
        }
    }

    private processResults(results: SearchResult[]): CodeExample[] {
        return results.map(result => ({
            id: result.id,
            title: result.title,
            code: result.content,
            language: result.language,
            source: result.source
        }));
    }

    private handleError(message: string, error: unknown): void {
        console.error(message, error);
        // Add telemetry/logging here
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
