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
exports.ApprovalManager = void 0;
const vscode = __importStar(require("vscode"));
const WorkspaceManager_1 = require("./WorkspaceManager");
const TrustManager_1 = require("./TrustManager");
const logger_1 = require("../utils/logger");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ApprovalManager {
    static instance;
    workspaceManager;
    trustManager;
    logger;
    constructor() {
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        this.trustManager = TrustManager_1.TrustManager.getInstance();
        this.logger = logger_1.Logger.getInstance();
    }
    static getInstance() {
        if (!ApprovalManager.instance) {
            ApprovalManager.instance = new ApprovalManager();
        }
        return ApprovalManager.instance;
    }
    async requestApproval(changes) {
        // Check if we have workspace trust
        if (!await this.trustManager.requireTrust('File modifications require workspace trust.')) {
            this.logger.warn('User declined workspace trust, cannot proceed with changes');
            return false;
        }
        // Show preview dialog
        const previewResult = await vscode.window.showInformationMessage(`The operation will modify ${changes.length} file(s).`, 'Preview Changes', 'Apply Changes', 'Cancel');
        if (previewResult === 'Cancel') {
            this.logger.info('User cancelled changes');
            return false;
        }
        if (previewResult === 'Preview Changes') {
            // Show diff view for each change
            for (const change of changes) {
                try {
                    // Load current content if file exists
                    let oldContent = '';
                    try {
                        if (await this.workspaceManager.fileExists(change.fileName)) {
                            oldContent = await this.workspaceManager.readFile(change.fileName);
                        }
                    }
                    catch (error) {
                        this.logger.warn(`Could not read existing file: ${change.fileName}`);
                    }
                    // Create temp files for diff view
                    const tmpDir = path.join(path.dirname(require.main?.filename || ''), 'tmp');
                    await fs.promises.mkdir(tmpDir, { recursive: true });
                    const oldFile = path.join(tmpDir, `old_${path.basename(change.fileName)}`);
                    const newFile = path.join(tmpDir, `new_${path.basename(change.fileName)}`);
                    await fs.promises.writeFile(oldFile, oldContent);
                    await fs.promises.writeFile(newFile, change.newContent);
                    // Show diff
                    await vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(oldFile), vscode.Uri.file(newFile), `Changes to ${path.basename(change.fileName)}`);
                }
                catch (error) {
                    this.logger.error(`Error showing diff for ${change.fileName}`, error instanceof Error ? error : new Error(String(error)));
                }
            }
            // After preview, ask for confirmation
            const confirmResult = await vscode.window.showInformationMessage('Do you want to apply these changes?', 'Apply Changes', 'Cancel');
            if (confirmResult !== 'Apply Changes') {
                this.logger.info('User cancelled changes after preview');
                return false;
            }
        }
        // Apply all changes
        for (const change of changes) {
            try {
                await this.workspaceManager.writeFile(change.fileName, change.newContent);
                this.logger.info(`Applied changes to ${change.fileName}`);
            }
            catch (error) {
                this.logger.error(`Failed to apply changes to ${change.fileName}`, error instanceof Error ? error : new Error(String(error)));
                const errorResult = await vscode.window.showErrorMessage(`Failed to apply changes to ${change.fileName}. Continue with remaining changes?`, 'Continue', 'Cancel');
                if (errorResult === 'Cancel') {
                    return false;
                }
            }
        }
        return true;
    }
    dispose() {
        // Any cleanup needed
    }
}
exports.ApprovalManager = ApprovalManager;
//# sourceMappingURL=ApprovalManager.js.map