import * as vscode from 'vscode';
import { SecurityScanResult } from '../../types/security';
export declare class SecurityWebviewService {
    private readonly logger;
    constructor();
    generateWebviewContent(webview: vscode.Webview, result?: SecurityScanResult): string;
}
