import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Handles Webpack configuration files
 */
export class WebpackConfigHandler {
    private configFileNames = [
        'webpack.config.js',
        'webpack.common.js',
        'webpack.dev.js',
        'webpack.prod.js'
    ];

    /**
     * Checks if a Webpack configuration file exists in the workspace
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
     * Opens the Webpack configuration file in the editor
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
            const createNew = await vscode.window.showInformationMessage('No Webpack configuration files found. Create a new one?', 'Yes', 'No');
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
            placeHolder: 'Select a Webpack configuration file to open'
        });

        if (selected) {
            const document = await vscode.workspace.openTextDocument(selected.configPath);
            await vscode.window.showTextDocument(document);
        }
    }

    /**
     * Creates a new Webpack configuration file
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
        
        const template = this.getWebpackConfigTemplate();
        fs.writeFileSync(configPath, template);

        const document = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(document);
        
        vscode.window.showInformationMessage(`Created ${configName}`);
    }

    /**
     * Returns a template for a new Webpack configuration file
     */
    private getWebpackConfigTemplate(): string {
        return `const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
};
`;
    }

    /**
     * Provides suggestions for optimizing Webpack configuration
     */
    public async suggestOptimizations(configPath: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument(configPath);
        const text = document.getText();
        
        const suggestions = [];
        
        if (!text.includes('optimization')) {
            suggestions.push('Add code splitting with optimization.splitChunks');
        }
        
        if (!text.includes('terser-webpack-plugin')) {
            suggestions.push('Add minification with terser-webpack-plugin');
        }
        
        if (!text.includes('cache')) {
            suggestions.push('Enable caching for faster builds');
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
