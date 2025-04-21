import * as vscode from 'vscode';
import { CodeSecurityScanner } from './codeScanner';
import { RecommendationGenerator } from './recommendations/RecommendationGenerator';
import { HtmlRenderer } from './recommendations/HtmlRenderer';

/**
 * Entry point for generating and displaying security recommendations
 */
export class SecurityRecommendations {
    private generator: RecommendationGenerator;

    constructor(private context: vscode.ExtensionContext, codeScanner: CodeSecurityScanner) {
        this.generator = new RecommendationGenerator(codeScanner);
    }

    /**
     * Generate security recommendations
     */
    public async generateRecommendations() {
        return await this.generator.generateRecommendations();
    }

    /**
     * Show recommendations in a webview
     */
    public async showRecommendations(result: import('./codeScanner').CodeScanResult) {
        HtmlRenderer.showRecommendations(this.context, result);
    }
}
