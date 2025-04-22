declare module 'eslint' {
    export class ESLint {
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
}

declare module 'prettier' {
    export function resolveConfig(filePath: string): Promise<any>;
    export function check(source: any, options: { filepath: string }): Promise<boolean>;
}