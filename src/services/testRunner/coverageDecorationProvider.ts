import * as vscode from 'vscode';
import * as path from 'path';
import { CoverageSummary, FileCoverage } from './codeCoverageService';
import { CoverageDecorationService } from './services/CoverageDecorationService';
import { CoverageToggleService } from './services/CoverageToggleService';

/**
 * Provider for code coverage decorations in the editor
 */
export class CoverageDecorationProvider implements vscode.Disposable {
    private decorationService: CoverageDecorationService;
    private toggleService: CoverageToggleService;

    constructor() {
        this.decorationService = new CoverageDecorationService();
        this.toggleService = new CoverageToggleService();
    }

    /**
     * Set the current coverage data
     */
    public setCoverage(coverage: CoverageSummary): void {
        this.decorationService.updateCoverageData(coverage);
        this.refresh();
    }

    /**
     * Refresh decorations in the active editor
     */
    private refresh(): void {
        if (!this.toggleService.isEnabled) {
            this.decorationService.clearDecorations();
            return;
        }
        this.decorationService.applyDecorations(vscode.window.activeTextEditor);
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.decorationService.dispose();
        this.toggleService.dispose();
    }
}
