import * as vscode from 'vscode';
import { CoverageSummary } from './codeCoverageService';
/**
 * Provider for code coverage decorations in the editor
 */
export declare class CoverageDecorationProvider implements vscode.Disposable {
    private decorationService;
    private toggleService;
    constructor();
    /**
     * Set the current coverage data
     */
    setCoverage(coverage: CoverageSummary): void;
    /**
     * Refresh decorations in the active editor
     */
    private refresh;
    /**
     * Clean up resources
     */
    dispose(): void;
}
