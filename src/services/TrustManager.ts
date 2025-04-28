import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

export class TrustManager {
  private static instance: TrustManager;
  private logger: Logger;
  
  private constructor() {
    this.logger = Logger.getInstance();
  }
  
  public static getInstance(): TrustManager {
    if (!TrustManager.instance) {
      TrustManager.instance = new TrustManager();
    }
    return TrustManager.instance;
  }
  
  public isWorkspaceTrusted(): boolean {
    // In recent versions of VS Code, workspace trust is available as a property
    if ('isTrusted' in vscode.workspace) {
      return vscode.workspace.isTrusted;
    }
    
    // For older versions or environments where trust isn't supported
    return true;
  }
  
  public async requestWorkspaceTrust(): Promise<boolean> {
    try {
      // If the workspace is already trusted, return true
      if (this.isWorkspaceTrusted()) {
        return true;
      }
      
      // If the workspace trust API is available, use it
      // Check if the method exists on the workspace object in a type-safe way
      const workspace = vscode.workspace as any;
      if (workspace.requestWorkspaceTrust && typeof workspace.requestWorkspaceTrust === 'function') {
        this.logger.info('Requesting workspace trust from the user');
        const isTrusted = await workspace.requestWorkspaceTrust();
        return isTrusted;
      }
      
      // If the workspace trust API is not available, ask the user
      const result = await vscode.window.showWarningMessage(
        'This extension requires trust to modify workspace files. Do you trust this workspace?',
        'Yes, I trust this workspace',
        'No'
      );
      
      return result === 'Yes, I trust this workspace';
    } catch (error) {
      this.logger.error('Error requesting workspace trust', 
                        error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
  
  public async requireTrust(message?: string): Promise<boolean> {
    // If the workspace is already trusted, return true immediately
    if (this.isWorkspaceTrusted()) {
      return true;
    }
    
    // Show a warning and ask for trust
    const warningMessage = message || 
      'This operation requires workspace trust. Please trust this workspace to continue.';
    
    const result = await vscode.window.showWarningMessage(
      warningMessage,
      'Trust Workspace',
      'Cancel'
    );
    
    // If the user clicked "Trust Workspace", request trust
    if (result === 'Trust Workspace') {
      return await this.requestWorkspaceTrust();
    }
    
    return false;
  }
}
