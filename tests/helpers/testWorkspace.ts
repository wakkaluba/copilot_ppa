import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

/**
 * TestWorkspace provides a temporary workspace for testing
 * with utility methods for file operations
 */
export class TestWorkspace {
  private workspacePath: string;

  constructor() {
    this.workspacePath = '';
  }

  /**
   * Sets up a temporary workspace for testing
   */
  async setup(): Promise<void> {
    // Create temp directory
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'copilot-ppa-test-'));
    this.workspacePath = tmpDir;

    // Create basic workspace structure
    await fs.mkdir(path.join(this.workspacePath, 'src'));
    await fs.mkdir(path.join(this.workspacePath, 'test'));
    
    // Create a basic package.json
    await this.writeFile('package.json', JSON.stringify({
      name: 'test-workspace',
      version: '1.0.0',
      private: true
    }, null, 2));

    // Create tsconfig.json
    await this.writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      }
    }, null, 2));
  }

  /**
   * Cleans up the temporary workspace
   */
  async cleanup(): Promise<void> {
    if (this.workspacePath) {
      await fs.rm(this.workspacePath, { recursive: true, force: true });
    }
  }

  /**
   * Creates a new file in the workspace
   */
  async createFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
  }

  /**
   * Writes content to a file in the workspace
   */
  private async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
  }

  /**
   * Reads the content of a file in the workspace
   */
  async fileContent(relativePath: string): Promise<string> {
    const fullPath = path.join(this.workspacePath, relativePath);
    return await fs.readFile(fullPath, 'utf8');
  }

  /**
   * Checks if a file exists in the workspace
   */
  async fileExists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.workspacePath, relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists files in a directory in the workspace
   */
  async listFiles(relativePath: string = '.'): Promise<string[]> {
    const fullPath = path.join(this.workspacePath, relativePath);
    const files = await fs.readdir(fullPath);
    return files.filter(f => !f.startsWith('.'));
  }

  /**
   * Gets the absolute path of a file in the workspace
   */
  getFilePath(relativePath: string): string {
    return path.join(this.workspacePath, relativePath);
  }

  /**
   * Gets the workspace path
   */
  getWorkspacePath(): string {
    return this.workspacePath;
  }

  /**
   * Gets a VS Code URI for a file in the workspace
   */
  getFileUri(relativePath: string): vscode.Uri {
    return vscode.Uri.file(this.getFilePath(relativePath));
  }

  /**
   * Deletes a file from the workspace
   */
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, relativePath);
    await fs.unlink(fullPath);
  }
}