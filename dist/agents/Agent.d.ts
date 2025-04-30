import * as vscode from 'vscode';
import { AgentResponseEnhancer } from './agentResponseEnhancer';
export declare class Agent implements vscode.Disposable {
    private readonly responseEnhancer;
    constructor(context: vscode.ExtensionContext, options: {
        llmService: any;
        conversationHistory: any[];
        responseEnhancer: AgentResponseEnhancer;
    });
    processMessage(message: string): Promise<string>;
    dispose(): void;
}
