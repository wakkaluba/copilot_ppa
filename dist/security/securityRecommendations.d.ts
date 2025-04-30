import * as vscode from 'vscode';
import { CodeSecurityScanner } from './codeScanner';
/**
 * Entry point for generating and displaying security recommendations
 */
export declare class SecurityRecommendations {
    private context;
    private generator;
    constructor(context: vscode.ExtensionContext, codeScanner: CodeSecurityScanner);
    /**
     * Generate security recommendations
     */
    generateRecommendations(): Promise<any>;
    /**
     * Show recommendations in a webview
     */
    showRecommendations(result: import('./codeScanner').CodeScanResult): Promise<void>;
}
