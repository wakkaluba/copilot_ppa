import * as vscode from 'vscode';
import { ThemeService } from '../../services/ui/themeManager';
export declare class RepositoryWebviewService {
    private readonly themeService;
    constructor(themeService: ThemeService);
    generateWebviewContent(webview: vscode.Webview): string;
}
