import { ICICDProvider, WorkflowOptions, Workflow } from './ICICDProvider';
export declare class GitHubActionsProvider implements ICICDProvider {
    private octokit?;
    name: string;
    constructor();
    private initialize;
    private getAuthToken;
    isConfigured(): Promise<boolean>;
    createWorkflow(options: WorkflowOptions): Promise<void>;
    private loadWorkflowTemplate;
    private replaceVariables;
    listWorkflows(): Promise<Workflow[]>;
    deleteWorkflow(name: string): Promise<void>;
}
