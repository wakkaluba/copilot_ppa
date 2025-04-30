import { IDisposable } from '../types';
interface FileChange {
    fileName: string;
    newContent: string;
    oldContent?: string;
}
export declare class ApprovalManager implements IDisposable {
    private static instance;
    private workspaceManager;
    private trustManager;
    private logger;
    private constructor();
    static getInstance(): ApprovalManager;
    requestApproval(changes: FileChange[]): Promise<boolean>;
    dispose(): void;
}
export {};
