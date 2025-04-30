import * as vscode from 'vscode';
import { CopilotIntegrationProvider } from '../copilot/copilotIntegrationProvider';
import { CopilotIntegrationService } from '../copilot/copilotIntegrationService';
export declare function registerCopilotIntegrationCommands(context: vscode.ExtensionContext, copilotProvider: CopilotIntegrationProvider, copilotService: CopilotIntegrationService): void;
