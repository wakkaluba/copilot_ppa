"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndoManager = void 0;
const WorkspaceManager_1 = require("./WorkspaceManager");
class UndoManager {
    static instance;
    workspaceManager;
    changes = new Map();
    maxHistoryPerFile = 10;
    constructor() {
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new UndoManager();
        }
        return this.instance;
    }
    async recordChange(filePath, type) {
        let originalContent = null;
        if (type !== 'create') {
            try {
                originalContent = await this.workspaceManager.readFile(filePath);
            }
            catch {
                originalContent = null;
            }
        }
        const record = {
            filePath,
            originalContent,
            timestamp: Date.now(),
            type
        };
        const fileHistory = this.changes.get(filePath) || [];
        fileHistory.unshift(record);
        // Maintain history limit
        if (fileHistory.length > this.maxHistoryPerFile) {
            fileHistory.pop();
        }
        this.changes.set(filePath, fileHistory);
    }
    async undoLastChange(filePath) {
        const fileHistory = this.changes.get(filePath);
        if (!fileHistory || fileHistory.length === 0) {
            return false;
        }
        const lastChange = fileHistory[0];
        try {
            switch (lastChange.type) {
                case 'create':
                    await this.workspaceManager.deleteFile(filePath);
                    break;
                case 'modify':
                    if (lastChange.originalContent !== null) {
                        await this.workspaceManager.writeFile(filePath, lastChange.originalContent);
                    }
                    break;
                case 'delete':
                    if (lastChange.originalContent !== null) {
                        await this.workspaceManager.writeFile(filePath, lastChange.originalContent);
                    }
                    break;
            }
            fileHistory.shift();
            if (fileHistory.length === 0) {
                this.changes.delete(filePath);
            }
            return true;
        }
        catch (error) {
            console.error(`Failed to undo change: ${error}`);
            return false;
        }
    }
    getChangeHistory(filePath) {
        return this.changes.get(filePath) || [];
    }
    clearHistory(filePath) {
        this.changes.delete(filePath);
    }
}
exports.UndoManager = UndoManager;
//# sourceMappingURL=UndoManager.js.map