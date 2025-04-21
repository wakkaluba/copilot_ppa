import * as vscode from 'vscode';
import { BuildScriptOptimization } from '../types';

export class UserInteractionService {
    public async selectPackageJson(files: string[]): Promise<string | undefined> {
        if (files.length === 1) {
            return files[0];
        }

        return vscode.window.showQuickPick(
            files.map(file => ({
                label: file.split('/').pop() || file,
                description: file,
                file
            })),
            {
                placeHolder: 'Select package.json to optimize',
                title: 'Select Package JSON'
            }
        ).then(selected => selected?.file);
    }

    public async selectOptimizations(optimizations: BuildScriptOptimization[]): Promise<BuildScriptOptimization[]> {
        if (optimizations.length === 0) {
            return [];
        }

        const items = optimizations.map((opt, index) => ({
            label: opt.title,
            description: `Complexity: ${opt.complexity}`,
            detail: opt.description,
            picked: opt.complexity === 'low',
            index
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select optimizations to apply',
            canPickMany: true,
            title: 'Select Build Script Optimizations'
        });

        if (!selected) {
            return [];
        }

        // Filter out any potential undefined values
        return selected.map(item => optimizations[item.index]).filter((opt): opt is BuildScriptOptimization => opt !== undefined);
    }

    public showInfo(message: string): void {
        vscode.window.showInformationMessage(message);
    }

    public showError(message: string): void {
        vscode.window.showErrorMessage(message);
    }

    public async confirmDependencyInstallation(packages: string[]): Promise<boolean> {
        const response = await vscode.window.showInformationMessage(
            `The selected optimizations require installing these packages: ${packages.join(', ')}. Install them?`,
            'Yes',
            'No'
        );
        return response === 'Yes';
    }
}