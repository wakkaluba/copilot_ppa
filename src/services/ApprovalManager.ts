import * as vscode from 'vscode';
import { WorkspaceManager } from './WorkspaceManager';
import { TrustManager } from './TrustManager';
import { Logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';
import { IDisposable } from '../types';

interface FileChange {
  fileName: string;
  newContent: string;
  oldContent?: string;
}

export class ApprovalManager implements IDisposable {
  private static instance: ApprovalManager;
  private workspaceManager: WorkspaceManager;
  private trustManager: TrustManager;
  private logger: Logger;
  
  private constructor() {
    this.workspaceManager = WorkspaceManager.getInstance();
    this.trustManager = TrustManager.getInstance();
    this.logger = Logger.getInstance();
  }
  
  public static getInstance(): ApprovalManager {
    if (!ApprovalManager.instance) {
      ApprovalManager.instance = new ApprovalManager();
    }
    return ApprovalManager.instance;
  }
  
  public async requestApproval(changes: FileChange[]): Promise<boolean> {
    // Check if we have workspace trust
    if (!await this.trustManager.requireTrust('File modifications require workspace trust.')) {
      this.logger.warn('User declined workspace trust, cannot proceed with changes');
      return false;
    }
    
    // Show preview dialog
    const previewResult = await vscode.window.showInformationMessage(
      `The operation will modify ${changes.length} file(s).`,
      'Preview Changes',
      'Apply Changes',
      'Cancel'
    );
    
    if (previewResult === 'Cancel') {
      this.logger.info('User cancelled changes');
      return false;
    }
    
    if (previewResult === 'Preview Changes') {
      // Show diff view for each change
      for (const change of changes) {
        try {
          // Load current content if file exists
          let oldContent = '';
          try {
            if (await this.workspaceManager.fileExists(change.fileName)) {
              oldContent = await this.workspaceManager.readFile(change.fileName);
            }
          } catch (error) {
            this.logger.warn(`Could not read existing file: ${change.fileName}`);
          }
          
          // Create temp files for diff view
          const tmpDir = path.join(path.dirname(require.main?.filename || ''), 'tmp');
          await fs.promises.mkdir(tmpDir, { recursive: true });
          
          const oldFile = path.join(tmpDir, `old_${path.basename(change.fileName)}`);
          const newFile = path.join(tmpDir, `new_${path.basename(change.fileName)}`);
          
          await fs.promises.writeFile(oldFile, oldContent);
          await fs.promises.writeFile(newFile, change.newContent);
          
          // Show diff
          await vscode.commands.executeCommand(
            'vscode.diff',
            vscode.Uri.file(oldFile),
            vscode.Uri.file(newFile),
            `Changes to ${path.basename(change.fileName)}`
          );
        } catch (error) {
          this.logger.error(`Error showing diff for ${change.fileName}`, 
                           error instanceof Error ? error : new Error(String(error)));
        }
      }
      
      // After preview, ask for confirmation
      const confirmResult = await vscode.window.showInformationMessage(
        'Do you want to apply these changes?',
        'Apply Changes',
        'Cancel'
      );
      
      if (confirmResult !== 'Apply Changes') {
        this.logger.info('User cancelled changes after preview');
        return false;
      }
    }
    
    // Apply all changes
    for (const change of changes) {
      try {
        await this.workspaceManager.writeFile(change.fileName, change.newContent);
        this.logger.info(`Applied changes to ${change.fileName}`);
      } catch (error) {
        this.logger.error(`Failed to apply changes to ${change.fileName}`, 
                         error instanceof Error ? error : new Error(String(error)));
        
        const errorResult = await vscode.window.showErrorMessage(
          `Failed to apply changes to ${change.fileName}. Continue with remaining changes?`,
          'Continue',
          'Cancel'
        );
        
        if (errorResult === 'Cancel') {
          return false;
        }
      }
    }
    
    return true;
  }
  
  public dispose(): void {
    // Any cleanup needed
  }
}
