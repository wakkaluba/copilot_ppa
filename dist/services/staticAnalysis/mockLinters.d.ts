/**
 * Mock ESLint implementation
 */
export declare class ESLintMock {
    /**
     * Mock lint files implementation
     * @param files Files to lint
     * @returns Array of lint results
     */
    lintFiles(files: string | string[]): Promise<{
        filePath: string;
        messages: {
            line: number;
            column: number;
            message: string;
            ruleId: string | null;
            severity: number;
        }[];
    }[]>;
}
/**
 * Mock Prettier implementation
 */
export declare const PrettierMock: {
    /**
     * Mock resolveConfig implementation
     * @param file File path
     * @returns File content
     */
    resolveConfig(file: string): Promise<string>;
    /**
     * Mock check implementation - simple formatting checks
     * @param content File content
     * @param options Options including filepath
     * @returns Whether the file is formatted correctly
     */
    check(content: string, options: {
        filepath: string;
    }): Promise<boolean>;
};
