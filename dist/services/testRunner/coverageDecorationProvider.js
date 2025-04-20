"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageDecorationProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Provider for code coverage decorations in the editor
 */
class CoverageDecorationProvider {
    decorations;
    coverage;
    enabled = false;
    disposables = [];
    constructor() {
        // Create decoration types
        this.decorations = {
            covered: vscode.window.createTextEditorDecorationType({
                backgroundColor: 'rgba(0, 150, 0, 0.1)',
                isWholeLine: true,
                overviewRulerColor: 'rgba(0, 150, 0, 0.5)',
                overviewRulerLane: vscode.OverviewRulerLane.Right
            }),
            uncovered: vscode.window.createTextEditorDecorationType({
                backgroundColor: 'rgba(150, 0, 0, 0.1)',
                isWholeLine: true,
                overviewRulerColor: 'rgba(150, 0, 0, 0.5)',
                overviewRulerLane: vscode.OverviewRulerLane.Right
            }),
            partial: vscode.window.createTextEditorDecorationType({
                backgroundColor: 'rgba(150, 150, 0, 0.1)',
                isWholeLine: true,
                overviewRulerColor: 'rgba(150, 150, 0, 0.5)',
                overviewRulerLane: vscode.OverviewRulerLane.Right
            })
        };
        // Register for editor changes
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(() => this.updateDecorations()), vscode.workspace.onDidChangeTextDocument(() => this.updateDecorations()));
        // Register commands
        this.disposables.push(vscode.commands.registerCommand('localLLMAgent.toggleCoverageHighlight', () => {
            this.enabled = !this.enabled;
            this.updateDecorations();
            vscode.window.showInformationMessage(`Coverage highlighting ${this.enabled ? 'enabled' : 'disabled'}`);
        }));
    }
    /**
     * Set the current coverage data
     */
    setCoverage(coverage) {
        this.coverage = coverage;
        this.updateDecorations();
    }
    /**
     * Update decorations in the active editor
     */
    updateDecorations() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.coverage || !this.enabled) {
            // Clear all decorations if not enabled
            if (!this.enabled && editor) {
                editor.setDecorations(this.decorations.covered, []);
                editor.setDecorations(this.decorations.uncovered, []);
                editor.setDecorations(this.decorations.partial, []);
            }
            return;
        }
        // Find coverage for the current file
        const currentFilePath = editor.document.uri.fsPath;
        const fileCoverage = this.findFileCoverage(currentFilePath);
        if (!fileCoverage || !fileCoverage.lineDetails) {
            // No coverage data for this file
            editor.setDecorations(this.decorations.covered, []);
            editor.setDecorations(this.decorations.uncovered, []);
            editor.setDecorations(this.decorations.partial, []);
            return;
        }
        // Create decorations for covered lines
        const coveredRanges = fileCoverage.lineDetails.covered.map(line => new vscode.Range(line - 1, 0, line - 1, Number.MAX_VALUE));
        // Create decorations for uncovered lines
        const uncoveredRanges = fileCoverage.lineDetails.uncovered.map(line => new vscode.Range(line - 1, 0, line - 1, Number.MAX_VALUE));
        // Create decorations for partially covered lines
        const partialRanges = fileCoverage.lineDetails.partial.map(line => new vscode.Range(line - 1, 0, line - 1, Number.MAX_VALUE));
        // Apply decorations
        editor.setDecorations(this.decorations.covered, coveredRanges);
        editor.setDecorations(this.decorations.uncovered, uncoveredRanges);
        editor.setDecorations(this.decorations.partial, partialRanges);
    }
    /**
     * Find coverage data for a specific file
     */
    findFileCoverage(filePath) {
        if (!this.coverage || !this.coverage.files) {
            return undefined;
        }
        // Try to find exact match
        let coverage = this.coverage.files.find(f => f.path === filePath);
        // If not found, try to normalize paths and compare
        if (!coverage) {
            const normalizedPath = filePath.replace(/\\/g, '/');
            coverage = this.coverage.files.find(f => {
                const normalizedFilePath = f.path.replace(/\\/g, '/');
                return normalizedFilePath === normalizedPath;
            });
        }
        // If still not found, try to match by basename
        if (!coverage) {
            const basename = path.basename(filePath);
            coverage = this.coverage.files.find(f => path.basename(f.path) === basename);
        }
        return coverage;
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.decorations.covered.dispose();
        this.decorations.uncovered.dispose();
        this.decorations.partial.dispose();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
}
exports.CoverageDecorationProvider = CoverageDecorationProvider;
//# sourceMappingURL=coverageDecorationProvider.js.map