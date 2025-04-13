import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as path from 'path';
import { WorkspaceManager } from './WorkspaceManager';

export class DataPrivacyManager {
    private static instance: DataPrivacyManager;
    private workspaceManager: WorkspaceManager;
    private storagePath: string;
    private encryptionKey: Buffer;

    private constructor() {
        this.workspaceManager = WorkspaceManager.getInstance();
        this.storagePath = path.join(this.getExtensionPath(), 'secure-storage');
        this.encryptionKey = this.getOrCreateEncryptionKey();
    }

    static getInstance(): DataPrivacyManager {
        if (!this.instance) {
            this.instance = new DataPrivacyManager();
        }
        return this.instance;
    }

    async storeConversation(id: string, data: any): Promise<void> {
        const encrypted = this.encrypt(JSON.stringify(data));
        const filePath = path.join(this.storagePath, `${id}.enc`);
        await this.workspaceManager.writeFile(filePath, encrypted);
    }

    async loadConversation(id: string): Promise<any> {
        try {
            const filePath = path.join(this.storagePath, `${id}.enc`);
            const encrypted = await this.workspaceManager.readFile(filePath);
            const decrypted = this.decrypt(encrypted);
            return JSON.parse(decrypted);
        } catch (error) {
            console.warn(`Failed to load conversation ${id}:`, error);
            return null;
        }
    }

    async cleanSensitiveData(): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const retentionDays = config.get<number>('dataRetentionDays', 30);
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

    validateDataPrivacy(data: any): boolean {
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

    private getOrCreateEncryptionKey(): Buffer {
        const keyPath = path.join(this.getExtensionPath(), '.key');
        try {
            return Buffer.from(this.workspaceManager.readFile(keyPath), 'hex');
        } catch {
            const key = crypto.randomBytes(32);
            this.workspaceManager.writeFile(keyPath, key.toString('hex'));
            return key;
        }
    }

    private encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
    }

    private decrypt(text: string): string {
        const [ivHex, encryptedHex, tagHex] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final('utf8');
    }

    private getExtensionPath(): string {
        const extension = vscode.extensions.getExtension('your-publisher.copilot-ppa');
        if (!extension) {
            throw new Error('Extension not found');
        }
        return extension.extensionPath;
    }
}
