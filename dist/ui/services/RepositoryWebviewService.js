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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryWebviewService = void 0;
const vscode = __importStar(require("vscode"));
const themeManager_1 = require("../../services/ui/themeManager");
class RepositoryWebviewService {
    constructor(themeService) {
        this.themeService = themeService;
    }
    generateWebviewContent(webview) {
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(themeManager_1.ThemeService.extensionUri, 'media', 'repository-panel.css'));
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Repository Panel</title>
                <link rel="stylesheet" href="${styleUri}">
            </head>
            <body>
                <div class="container">
                    <div class="repository-status"></div>
                    <div class="repository-info"></div>
                    <div class="repository-actions"></div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                </script>
            </body>
            </html>
        `;
    }
}
exports.RepositoryWebviewService = RepositoryWebviewService;
//# sourceMappingURL=RepositoryWebviewService.js.map