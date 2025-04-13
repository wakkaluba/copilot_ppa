import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export class OfflineCache {
    private cachePath: string;
    private memoryCache: Map<string, any>;

    constructor() {
        this.cachePath = path.join(vscode.workspace.rootPath || '', '.llm-cache');
        this.memoryCache = new Map();
    }

    async initialize(): Promise<void> {
        await fs.mkdir(this.cachePath, { recursive: true });
        await this.loadCache();
    }

    private async loadCache(): Promise<void> {
        const files = await fs.readdir(this.cachePath);
        for (const file of files) {
            const content = await fs.readFile(path.join(this.cachePath, file), 'utf-8');
            this.memoryCache.set(file.replace('.json', ''), JSON.parse(content));
        }
    }

    async get(key: string): Promise<any | null> {
        return this.memoryCache.get(this.hashKey(key)) || null;
    }

    async set(key: string, value: any): Promise<void> {
        const hashedKey = this.hashKey(key);
        this.memoryCache.set(hashedKey, value);
        await fs.writeFile(
            path.join(this.cachePath, `${hashedKey}.json`),
            JSON.stringify(value)
        );
    }

    private hashKey(key: string): string {
        return crypto.createHash('md5').update(key).digest('hex');
    }
}
