import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigValidationError } from './errors/ConfigValidationError';

/**
 * Handles Rollup configuration files
 */
export class RollupConfigHandler {
    private readonly configFileNames = [
        'rollup.config.js',
        'rollup.config.mjs',
        'rollup.config.ts'
    ];

    /**
     * Checks if a Rollup configuration file exists in the workspace
     * @throws {ConfigValidationError} If no workspace folders are open
     */
    public async isConfigPresent(): Promise<boolean> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new ConfigValidationError('No workspace folders are open');
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
     * @throws {ConfigValidationError} If no workspace folders are open or no config files exist
     */
    public async openConfig(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new ConfigValidationError('No workspace folders are open');
        }

        const configFiles: vscode.QuickPickItem[] = [];

        for (const folder of workspaceFolders) {
            for (const configName of this.configFileNames) {
                const configPath = path.join(folder.uri.fsPath, configName);
                if (fs.existsSync(configPath)) {
                    configFiles.push({
                        label: `${configName} (${folder.name})`,
                        description: configPath,
                        detail: `Full path: ${configPath}`
                    });
                }
            }
        }

        if (configFiles.length === 0) {
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

        if (configFiles.length === 1) {
            const document = await vscode.workspace.openTextDocument(configFiles[0].description!);
            await vscode.window.showTextDocument(document);
            return;
        }

        const selected = await vscode.window.showQuickPick(configFiles, {
            placeHolder: 'Select a Rollup configuration file to open'
        });

        if (selected) {
            const document = await vscode.workspace.openTextDocument(selected.description!);
            await vscode.window.showTextDocument(document);
        }
    }

    /**
     * Creates a new Rollup configuration file
     * @throws {ConfigValidationError} If no workspace folders are open or file already exists
     */
    private async createNewConfig(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new ConfigValidationError('No workspace folders are open');
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

        const configPath = path.join(targetFolder, 'rollup.config.js');
        if (fs.existsSync(configPath)) {
            throw new ConfigValidationError(`Configuration file already exists at ${configPath}`);
        }

        try {
            fs.writeFileSync(configPath, this.getRollupConfigTemplate());
            const document = await vscode.workspace.openTextDocument(configPath);
            await vscode.window.showTextDocument(document);
            await vscode.window.showInformationMessage('Created new Rollup configuration file');
        } catch (error) {
            throw new Error(`Failed to create configuration file: ${error instanceof Error ? error.message : String(error)}`);
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

    /**
     * Provides suggestions for optimizing Rollup configuration
     * @throws {ConfigValidationError} If the config file doesn't exist
     */
    public async suggestOptimizations(configPath: string): Promise<void> {
        if (!fs.existsSync(configPath)) {
            throw new ConfigValidationError(`Configuration file not found: ${configPath}`);
        }

        const document = await vscode.workspace.openTextDocument(configPath);
        const text = document.getText();
        
        const suggestions: string[] = [];
        
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
                placeHolder: 'Select optimizations to apply',
                canPickMany: true
            });
            
            if (selected && selected.length > 0) {
                // Create an edit to apply the selected optimizations
                const workspaceEdit = new vscode.WorkspaceEdit();
                const importStatements: string[] = [];
                const pluginStatements: string[] = [];

                for (const suggestion of selected) {
                    if (suggestion.includes('terser')) {
                        importStatements.push("import { terser } from 'rollup-plugin-terser';");
                        pluginStatements.push('production && terser()');
                    }
                    if (suggestion.includes('filesize')) {
                        importStatements.push("import filesize from 'rollup-plugin-filesize';");
                        pluginStatements.push('filesize()');
                    }
                    if (suggestion.includes('visualizer')) {
                        importStatements.push("import visualizer from 'rollup-plugin-visualizer';");
                        pluginStatements.push('visualizer()');
                    }
                }

                // Find the right positions to insert the imports and plugins
                const lines = text.split('\n');
                const lastImportLine = lines.findIndex(line => !line.trim().startsWith('import'));
                const pluginsLine = lines.findIndex(line => line.includes('plugins:'));

                if (lastImportLine !== -1 && pluginsLine !== -1) {
                    // Add imports after the last import
                    workspaceEdit.insert(
                        document.uri,
                        new vscode.Position(lastImportLine, 0),
                        importStatements.join('\n') + '\n'
                    );

                    // Add plugins before the closing bracket
                    const pluginsClosingLine = lines.findIndex((line, i) => i > pluginsLine && line.includes(']'));
                    if (pluginsClosingLine !== -1) {
                        workspaceEdit.insert(
                            document.uri,
                            new vscode.Position(pluginsClosingLine, 0),
                            '    ' + pluginStatements.join(',\n    ') + ',\n'
                        );
                    }
                }

                await vscode.workspace.applyEdit(workspaceEdit);
                await document.save();
                await vscode.window.showInformationMessage(`Applied optimizations: ${selected.join(', ')}`);
            }
        } else {
            await vscode.window.showInformationMessage('No optimization suggestions available');
        }
    }
}
