export declare class AgentToolManager {
    private static instance;
    private workspaceManager;
    private constructor();
    static getInstance(): AgentToolManager;
    editFile(filePath: string, content: string, line?: number): Promise<boolean>;
    createFile(filePath: string, content: string): Promise<boolean>;
    deleteFile(filePath: string): Promise<boolean>;
    explainFile(filePath: string, line?: number): Promise<string>;
    searchWorkspace(query: string): Promise<string[]>;
    private confirmChange;
    private confirmDelete;
    private replaceLineContent;
}
