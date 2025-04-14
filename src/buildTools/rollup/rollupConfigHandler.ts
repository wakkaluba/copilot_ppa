import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Handles Rollup configuration files
 */
export class RollupConfigHandler {
    private configFileNames = [
        'rollup.config.js',
        'rollup.config.mjs',
        'rollup.config.ts'
    ];

    /**
     * Checks if a Rollup configuration file exists in the workspace
     */
    public async isConfigPresent(): Promise<boolean> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return false;
        }

        for (const folder of workspaceFolders) {
            for (const configName of this.configFileNames) {
                const configPath = path.join(folder.uri.fsPath, configName);
                if (fs.existsSync(configPath)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Opens the Rollup configuration file in the editor
     */
    public async openConfig(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }

        const configFiles = [];
        for (const folder of workspaceFolders) {
            for (const configName of this.configFileNames) {
                const configPath = path.join(folder.uri.fsPath, configName);
                if (fs.existsSync(configPath)) {
                    configFiles.push({
                        label: `${configName} (${folder.name})`,
                        detail: configPath,
                        configPath
                    });
                }
            }
        }

        if (configFiles.length === 0) {
            const createNew = await vscode.window.showInformationMessage('No Rollup configuration files found. Create a new one?', 'Yes', 'No');
            if (createNew === 'Yes') {
                await this.createNewConfig();
            }
            return;
        }

        if (configFiles.length === 1) {
            const document = await vscode.workspace.openTextDocument(configFiles[0].configPath);
            await vscode.window.showTextDocument(document);
            return;
        }

        const selected = await vscode.window.showQuickPick(configFiles, {
            placeHolder: 'Select a Rollup configuration file to open'
        });

        if (selected) {
            const document = await vscode.workspace.openTextDocument(selected.configPath);
            await vscode.window.showTextDocument(document);
        }
    }

    /**
     * Creates a new Rollup configuration file
     */
    private async createNewConfig(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }

        let targetFolder;
        if (workspaceFolders.length === 1) {
            targetFolder = workspaceFolders[0].uri.fsPath;
        } else {
            const selected = await vscode.window.showQuickPick(
                workspaceFolders.map(folder => ({
                    label: folder.name,
                    detail: folder.uri.fsPath,
                    folderPath: folder.uri.fsPath
                })),
                { placeHolder: 'Select a workspace folder' }
            );

            if (!selected) {
                return;
            }

            targetFolder = selected.folderPath;
        }

        const configName = await vscode.window.showQuickPick(this.configFileNames, {
            placeHolder: 'Select a configuration file name'
        });

        if (!configName) {
            return;
        }

        const configPath = path.join(targetFolder, configName);
        
        const template = this.getRollupConfigTemplate();
        fs.writeFileSync(configPath, template);

        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
        
        vscode.window.showInformationMessage(`Created ${configName}`);
    }

    /**
     * Returns a template for a new Rollup configuration file
     */
    private getRollupConfigTemplate(): string {
        return `import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
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
  ],
  watch: {
    clearScreen: false
  }
};
`;
    }

    /**
     * Provides suggestions for optimizing Rollup configuration
     */
    public async suggestOptimizations(configPath: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument(configPath);
        const text = document.getText();
        
        const suggestions = [];
        
        if (!text.includes('terser')) {
            suggestions.push('Add minification with rollup-plugin-terser');
        }
        
        if (!text.includes('filesize')) {
            suggestions.push('Add bundle size reporting with rollup-plugin-filesize');
        }
        
        if (!text.includes('visualizer')) {
            suggestions.push('Add bundle visualization with rollup-plugin-visualizer');
        }
        
        if (suggestions.length > 0) {
            const selected = await vscode.window.showQuickPick(suggestions, {
                placeHolder: 'Select an optimization to apply',
                canPickMany: true
            });
            
            if (selected && selected.length > 0) {
                vscode.window.showInformationMessage(`Selected optimizations: ${selected.join(', ')}`);
                // Here we would apply the selected optimizations
            }
        } else {
            vscode.window.showInformationMessage('No optimization suggestions available');
        }
    }
}
