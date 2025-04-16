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
exports.DataPrivacyManager = void 0;
const vscode = __importStar(require("vscode"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const WorkspaceManager_1 = require("./WorkspaceManager");
class DataPrivacyManager {
    constructor() {
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        this.storagePath = path.join(this.getExtensionPath(), 'secure-storage');
        this.encryptionKey = this.getOrCreateEncryptionKey();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new DataPrivacyManager();
        }
        return this.instance;
    }
    async storeConversation(id, data) {
        const encrypted = this.encrypt(JSON.stringify(data));
        const filePath = path.join(this.storagePath, `${id}.enc`);
        await this.workspaceManager.writeFile(filePath, encrypted);
    }
    async loadConversation(id) {
        try {
            const filePath = path.join(this.storagePath, `${id}.enc`);
            const encrypted = await this.workspaceManager.readFile(filePath);
            const decrypted = this.decrypt(encrypted);
            return JSON.parse(decrypted);
        }
        catch (error) {
            console.warn(`Failed to load conversation ${id}:`, error);
            return null;
        }
    }
    async cleanSensitiveData() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const retentionDays = config.get('dataRetentionDays', 30);
        const files = await this.workspaceManager.listFiles(this.storagePath);
        const now = Date.now();
        for (const file of files) {
            const stat = await vscode.workspace.fs.stat(vscode.Uri.file(file));
            const age = now - stat.mtime;
            if (age > retentionDays * 24 * 60 * 60 * 1000) {
                await this.workspaceManager.deleteFile(file);
            }
        }
    }
    validateDataPrivacy(data) {
        // Ensure no external URLs or sensitive patterns
        const dataStr = JSON.stringify(data);
        const sensitivePatterns = [
            /https?:\/\/(?!localhost|127\.0\.0\.1)/i,
            /password/i,
            /secret/i,
            /token/i,
        ];
        return !sensitivePatterns.some(pattern => pattern.test(dataStr));
    }
    getOrCreateEncryptionKey() {
        const keyPath = path.join(this.getExtensionPath(), '.key');
        try {
            return Buffer.from(this.workspaceManager.readFile(keyPath), 'hex');
        }
        catch {
            const key = crypto.randomBytes(32);
            this.workspaceManager.writeFile(keyPath, key.toString('hex'));
            return key;
        }
    }
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
    }
    decrypt(text) {
        const [ivHex, encryptedHex, tagHex] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final('utf8');
    }
    getExtensionPath() {
        const extension = vscode.extensions.getExtension('your-publisher.copilot-ppa');
        if (!extension) {
            throw new Error('Extension not found');
        }
        return extension.extensionPath;
    }
}
exports.DataPrivacyManager = DataPrivacyManager;
//# sourceMappingURL=DataPrivacyManager.js.map