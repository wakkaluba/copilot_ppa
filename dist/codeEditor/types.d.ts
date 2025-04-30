export interface ICodeExecutor {
    executeSelectedCode(): Promise<void>;
}
export interface ICodeNavigator {
    showCodeOverview(): Promise<void>;
    findReferences(): Promise<void>;
}
export interface ICodeLinker {
    createCodeLink(): Promise<void>;
    navigateCodeLink(): Promise<void>;
}
export interface CodeLink {
    source: {
        uri: string;
        position: {
            line: number;
            character: number;
        };
        text: string;
    };
    target: {
        uri: string;
        position?: {
            line: number;
            character: number;
        };
    };
}
