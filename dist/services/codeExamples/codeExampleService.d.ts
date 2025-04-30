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
export declare class CodeExampleService implements IDisposable {
    private githubApi;
    private searchIndex;
    private readonly _onDidUpdateExamples;
    private readonly disposables;
    constructor(githubApi: IGithubApiService, searchIndex: ISearchIndexService);
    searchExamples(query: string, language?: string): Promise<CodeExample[]>;
    refreshExamples(): Promise<void>;
    private processResults;
    private handleError;
    dispose(): void;
}
