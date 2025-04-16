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
exports.LLMCacheService = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
class LLMCacheService {
    constructor() {
        this.cacheDir = path.join(this.getExtensionPath(), 'cache');
        this.ensureCacheDirectory();
        this.cacheTTL = this.getCacheTTLFromConfig();
        this.cacheEnabled = this.getCacheEnabledFromConfig();
        this.todoPath = path.join(this.getExtensionPath(), 'zzztodo.md');
        this.finishedPath = path.join(this.getExtensionPath(), 'finished.md');
        // Listen to configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('localLLMAgent.cache')) {
                this.cacheTTL = this.getCacheTTLFromConfig();
                this.cacheEnabled = this.getCacheEnabledFromConfig();
            }
        });
    }
    getExtensionPath() {
        const extension = vscode.extensions.getExtension('vscode-local-llm-agent');
        if (!extension) {
            throw new Error('Extension not found');
        }
        return extension.extensionPath;
    }
    ensureCacheDirectory() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }
    getCacheTTLFromConfig() {
        const config = vscode.workspace.getConfiguration('localLLMAgent.cache');
        // Default to 1 hour (in milliseconds)
        return (config.get('ttlMinutes') || 60) * 60 * 1000;
    }
    getCacheEnabledFromConfig() {
        const config = vscode.workspace.getConfiguration('localLLMAgent.cache');
        return config.get('enabled') || true;
    }
    generateCacheKey(prompt, model, params) {
        const data = JSON.stringify({ prompt, model, params });
        return crypto.createHash('md5').update(data).digest('hex');
    }
    getCacheFilePath(key) {
        return path.join(this.cacheDir, `${key}.json`);
    }
    async get(prompt, model, params) {
        if (!this.cacheEnabled) {
            return null;
        }
        const cacheKey = this.generateCacheKey(prompt, model, params);
        const cacheFilePath = this.getCacheFilePath(cacheKey);
        if (!fs.existsSync(cacheFilePath)) {
            return null;
        }
        try {
            const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
            // Check if cache entry is still valid
            if (Date.now() - cacheData.timestamp > this.cacheTTL) {
                // Cache expired
                fs.unlinkSync(cacheFilePath);
                return null;
            }
            return cacheData.response;
        }
        catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }
    set(prompt, model, params, response) {
        if (!this.cacheEnabled) {
            return;
        }
        const cacheKey = this.generateCacheKey(prompt, model, params);
        const cacheFilePath = this.getCacheFilePath(cacheKey);
        const cacheEntry = {
            timestamp: Date.now(),
            response
        };
        try {
            fs.writeFileSync(cacheFilePath, JSON.stringify(cacheEntry), 'utf8');
        }
        catch (error) {
            console.error('Error writing to cache:', error);
        }
    }
    clearCache() {
        try {
            const files = fs.readdirSync(this.cacheDir);
            for (const file of files) {
                fs.unlinkSync(path.join(this.cacheDir, file));
            }
        }
        catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
    clearExpiredCache() {
        try {
            const files = fs.readdirSync(this.cacheDir);
            for (const file of files) {
                const filePath = path.join(this.cacheDir, file);
                try {
                    const cacheData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (Date.now() - cacheData.timestamp > this.cacheTTL) {
                        fs.unlinkSync(filePath);
                    }
                }
                catch (error) {
                    // If there's an error reading the file, remove it
                    fs.unlinkSync(filePath);
                }
            }
        }
        catch (error) {
            console.error('Error clearing expired cache:', error);
        }
    }
    updateTaskProgress(taskDescription, status, percentage) {
        try {
            if (!fs.existsSync(this.todoPath)) {
                return;
            }
            let todoContent = fs.readFileSync(this.todoPath, 'utf8');
            const taskLines = todoContent.split('\n');
            for (let i = 0; i < taskLines.length; i++) {
                const line = taskLines[i];
                if (line.includes(taskDescription)) {
                    // Extract task description without status prefix or percentage suffix
                    const cleanedDescription = this.extractTaskDescription(line);
                    // Create updated task line with new status and percentage
                    const statusPrefix = this.getStatusPrefix(status);
                    const updatedLine = `${statusPrefix} ${cleanedDescription} (${percentage}%)`;
                    taskLines[i] = updatedLine;
                    // If task is completed, move to finished.md
                    if (status === 'completed' && percentage === 100) {
                        this.moveTaskToFinished(updatedLine);
                        taskLines.splice(i, 1);
                        i--;
                    }
                    break;
                }
            }
            todoContent = taskLines.join('\n');
            fs.writeFileSync(this.todoPath, todoContent, 'utf8');
        }
        catch (error) {
            console.error('Error updating task progress:', error);
        }
    }
    extractTaskDescription(taskLine) {
        // Remove status prefix
        let description = taskLine.replace(/^- \[[^\]]*\]\s*/, '');
        // Remove percentage suffix
        description = description.replace(/\s*\(\d+%\)\s*$/, '');
        return description.trim();
    }
    getStatusPrefix(status) {
        switch (status) {
            case 'not-started':
                return '- [ ]';
            case 'in-progress':
                return '- [/]';
            case 'completed':
                return '- [X]';
            case 'do-not-touch':
                return '- [-]';
            default:
                return '- [ ]';
        }
    }
    moveTaskToFinished(taskLine) {
        try {
            if (!fs.existsSync(this.finishedPath)) {
                fs.writeFileSync(this.finishedPath, '', 'utf8');
            }
            let finishedContent = fs.readFileSync(this.finishedPath, 'utf8');
            finishedContent += `\n${taskLine}`;
            fs.writeFileSync(this.finishedPath, finishedContent, 'utf8');
        }
        catch (error) {
            console.error('Error moving task to finished:', error);
        }
    }
    getTaskProgress(taskDescription) {
        try {
            if (!fs.existsSync(this.todoPath)) {
                return null;
            }
            const todoContent = fs.readFileSync(this.todoPath, 'utf8');
            const taskLines = todoContent.split('\n');
            for (const line of taskLines) {
                if (line.includes(taskDescription)) {
                    // Extract status
                    const statusMatch = line.match(/^- \[([^\]]*)\]/);
                    let status = 'not-started';
                    if (statusMatch) {
                        const statusChar = statusMatch[1];
                        if (statusChar === '/')
                            status = 'in-progress';
                        else if (statusChar === 'X')
                            status = 'completed';
                        else if (statusChar === '-')
                            status = 'do-not-touch';
                        else
                            status = 'not-started';
                    }
                    // Extract percentage
                    const percentageMatch = line.match(/\((\d+)%\)$/);
                    const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 0;
                    return { status, percentage };
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error getting task progress:', error);
            return null;
        }
    }
}
exports.LLMCacheService = LLMCacheService;
//# sourceMappingURL=llmCacheService.js.map