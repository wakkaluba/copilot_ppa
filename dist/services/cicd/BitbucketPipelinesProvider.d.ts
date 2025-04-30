import { ICICDProvider, WorkflowOptions, Workflow } from './ICICDProvider';
export declare class BitbucketPipelinesProvider implements ICICDProvider {
    private bitbucket?;
    private workspace?;
    private connectionState;
    private readonly logger;
    private disposables;
    name: string;
    constructor();
    dispose(): void;
    private initialize;
    private testConnection;
    private getCredentials;
    isConfigured(): Promise<boolean>;
    createWorkflow(options: WorkflowOptions): Promise<void>;
    private loadWorkflowTemplate;
    private replaceVariables;
    listWorkflows(): Promise<Workflow[]>;
    private getLastRunStatus;
    deleteWorkflow(name: string): Promise<void>;
}
