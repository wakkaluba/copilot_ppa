export interface ICICDProvider {
    name: string;
    isConfigured(): Promise<boolean>;
    createWorkflow(options: WorkflowOptions): Promise<void>;
    listWorkflows(): Promise<Workflow[]>;
    deleteWorkflow(name: string): Promise<void>;
}
export interface WorkflowOptions {
    name: string;
    template: string;
    variables: {
        [key: string]: string;
    };
    path?: string;
}
export interface Workflow {
    name: string;
    path: string;
    status: 'active' | 'disabled';
    lastRun?: Date;
}
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export declare class CICDError extends Error {
    code: string;
    constructor(code: string, message: string);
}
