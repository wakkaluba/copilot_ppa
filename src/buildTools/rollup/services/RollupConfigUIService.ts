import * as vscode from 'vscode';
import { ILogger } from '../../../services/logging/ILogger';
import { IRollupConfigManager } from '../types';

/**
 * Service responsible for UI interactions related to Rollup configuration
 */
export class RollupConfigUIService {
    constructor(
        private readonly logger: ILogger,
        private readonly configManager: IRollupConfigManager
    ) {}

    /**
     * Opens the Rollup configuration file in the editor
     * @throws {Error} If no config files exist
     */
    public async openConfig(): Promise<void> {
        try {
            // Get all workspace folders
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                throw new Error('No workspace folders are open');
            }

            // Get all available configs from all workspace folders
            const allConfigFiles: vscode.QuickPickItem[] = [];
            
            for (const folder of workspaceFolders) {
                try {
                    const configs = await this.configManager.detectConfigs(folder.uri.fsPath);
                    
                    configs.forEach(configPath => {
                        const relativePath = vscode.workspace.asRelativePath(configPath);
                        allConfigFiles.push({
                            label: `${relativePath} (${folder.name})`,
                            description: configPath,
                            detail: `Full path: ${configPath}`
                        });
                    });
                } catch (error) {
                    this.logger.warn(`Failed to detect configs in ${folder.name}:`, error);
                }
            }

            // Handle case when no configs are found
            if (allConfigFiles.length === 0) {
                const createNew = await vscode.window.showInformationMessage(
                    'No Rollup configuration files found. Create a new one?',
                    'Yes',
                    'No'
                );

                if (createNew === 'Yes') {
                    await this.createNewConfig();
                }
                return;
            }

            // Handle single config case
            if (allConfigFiles.length === 1) {
                const document = await vscode.workspace.openTextDocument(allConfigFiles[0].description!);
                await vscode.window.showTextDocument(document);
                return;
            }

            // Let user select which config to open
            const selected = await vscode.window.showQuickPick(allConfigFiles, {
                placeHolder: 'Select a Rollup configuration file to open'
            });

            if (selected) {
                const document = await vscode.workspace.openTextDocument(selected.description!);
                await vscode.window.showTextDocument(document);
            }
        } catch (error) {
            this.logger.error('Error opening config:', error);
            vscode.window.showErrorMessage(`Failed to open Rollup config: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Creates a new Rollup configuration file
     */
    public async createNewConfig(): Promise<void> {
        try {
            // Get workspace folder to create config in
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                throw new Error('No workspace folders are open');
            }

            let targetFolder: string;
            if (workspaceFolders.length === 1) {
                targetFolder = workspaceFolders[0].uri.fsPath;
            } else {
                const selected = await vscode.window.showQuickPick(
                    workspaceFolders.map(folder => ({
                        label: folder.name,
                        description: folder.uri.fsPath
                    })),
                    { placeHolder: 'Select a workspace folder for the new config' }
                );
                if (!selected) {
                    return;
                }
                targetFolder = selected.description!;
            }

            // Create the file
            const configUri = vscode.Uri.file(`${targetFolder}/rollup.config.js`);
            await vscode.workspace.fs.writeFile(
                configUri,
                Buffer.from(this.getRollupConfigTemplate())
            );

            // Open the new file
            const document = await vscode.workspace.openTextDocument(configUri);
            await vscode.window.showTextDocument(document);
            
            this.logger.info(`Created new Rollup configuration file at ${configUri.fsPath}`);
            await vscode.window.showInformationMessage('Created new Rollup configuration file');
        } catch (error) {
            this.logger.error('Error creating new config:', error);
            vscode.window.showErrorMessage(`Failed to create Rollup config: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Provides suggestions for optimizing Rollup configuration
     */
    public async suggestOptimizations(configPath: string): Promise<void> {
        try {
            const optimizations = await this.configManager.generateOptimizations(configPath);
            
            if (optimizations.length === 0) {
                await vscode.window.showInformationMessage('No optimization suggestions available');
                return;
            }

            const items = optimizations.map(opt => ({
                label: opt.title,
                description: opt.description,
                detail: opt.code
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select optimizations to apply',
                canPickMany: true
            });
            
            if (!selected || selected.length === 0) {
                return;
            }

            // Apply the selected optimizations
            const document = await vscode.workspace.openTextDocument(configPath);
            const edit = new vscode.WorkspaceEdit();
            
            // Insert the optimizations at appropriate positions - this is a simplified approach
            // In a real implementation, we should parse the document and make more precise edits
            const lastLine = document.lineCount - 1;
            edit.insert(document.uri, new vscode.Position(lastLine, 0), '\n' + 
                selected.map(s => s.detail).join('\n'));
            
            await vscode.workspace.applyEdit(edit);
            await document.save();
            
            this.logger.info(`Applied optimizations to ${configPath}: ${selected.map(s => s.label).join(', ')}`);
            await vscode.window.showInformationMessage(`Applied optimizations: ${selected.map(s => s.label).join(', ')}`);
        } catch (error) {
            this.logger.error('Error suggesting optimizations:', error);
            vscode.window.showErrorMessage(`Failed to suggest optimizations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Returns a template for a new Rollup configuration file
     */
    private getRollupConfigTemplate(): string {
        return `import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/bundle.cjs.js',
            format: 'cjs',
            sourcemap: true
        },
        {
            file: 'dist/bundle.esm.js',
            format: 'es',
            sourcemap: true
        }
    ],
    plugins: [
        resolve({
            browser: true
        }),
        commonjs(),
        typescript({
            sourceMap: true,
            inlineSources: !production
        }),
        production && terser()
    ].filter(Boolean),
    watch: {
        clearScreen: false
    }
};`;
    }
}