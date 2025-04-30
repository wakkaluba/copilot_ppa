import { ICICDProvider, WorkflowOptions, Workflow } from './ICICDProvider';
export declare class GitLabCIProvider implements ICICDProvider {
    private gitlab?;
    name: string;
    constructor();
    private initialize;
    private getAuthToken;
    private getGitLabUrl;
    isConfigured(): Promise<boolean>;
    createWorkflow(options: WorkflowOptions): Promise<void>;
    private loadWorkflowTemplate;
    private replaceVariables;
    listWorkflows(): Promise<Workflow[]>;
    deleteWorkflow(name: string): Promise<void>;
}
