import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class PackageJsonFileService {
    public async findPackageJsonFiles(): Promise<string[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return [];
        }

        const files: string[] = [];
        for (const folder of workspaceFolders) {
            const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                files.push(packageJsonPath);
            }
        }
        return files;
    }

    public async readPackageJson(filePath: string): Promise<any> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to read package.json: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async writePackageJson(filePath: string, packageJson: any): Promise<void> {
        try {
            await fs.promises.writeFile(filePath, JSON.stringify(packageJson, null, 2), 'utf-8');
        } catch (error) {
            throw new Error(`Failed to write package.json: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}