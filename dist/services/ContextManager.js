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
exports.ContextManager = void 0;
const vscode = __importStar(require("vscode"));
const ConversationService_1 = require("./conversation/ConversationService");
const FileStorageService_1 = require("./storage/FileStorageService");
const WorkspaceStateService_1 = require("./workspace/WorkspaceStateService");
/**
 * Manages context across the application with proper state management and persistence
 */
class ContextManager {
    constructor(context, options = {}) {
        this.context = context;
        this.options = options;
        this.contextCache = new Map();
        this.eventEmitter = new vscode.EventEmitter();
        this.onDidChangeContext = this.eventEmitter.event;
        this.conversationService = new ConversationService_1.ConversationService(context);
        this.fileStorage = new FileStorageService_1.FileStorageService(context);
        this.workspaceState = new WorkspaceStateService_1.WorkspaceStateService(context);
        this.setupEventHandlers();
    }
    static getInstance(context, options) {
        if (!ContextManager.instance && context) {
            ContextManager.instance = new ContextManager(context, options);
        }
        return ContextManager.instance;
    }
    setupEventHandlers() {
        vscode.workspace.onDidChangeWorkspaceFolders(() => this.handleWorkspaceChange());
        vscode.window.onDidChangeActiveTextEditor(() => this.handleActiveFileChange());
    }
    async initialize() {
        try {
            await Promise.all([
                this.conversationService.initialize(),
                this.fileStorage.initialize(),
                this.workspaceState.initialize()
            ]);
            await this.loadPersistedContext();
        }
        catch (error) {
            console.error('Failed to initialize ContextManager:', error);
            throw new Error('Context initialization failed');
        }
    }
    async getContext(id) {
        if (!this.contextCache.has(id)) {
            const persisted = await this.fileStorage.loadContext(id);
            if (persisted) {
                this.contextCache.set(id, persisted);
            }
        }
        return this.contextCache.get(id);
    }
    async updateContext(id, data) {
        const existing = await this.getContext(id) || {};
        const updated = { ...existing, ...data, updatedAt: Date.now() };
        this.contextCache.set(id, updated);
        await this.fileStorage.saveContext(id, updated);
        this.eventEmitter.fire(updated);
    }
    async getWorkspaceContext(workspaceId) {
        return this.workspaceState.getWorkspaceContext(workspaceId);
    }
    async updateWorkspaceContext(workspaceId, context) {
        await this.workspaceState.updateWorkspaceContext(workspaceId, context);
    }
    async handleWorkspaceChange() {
        const workspaces = vscode.workspace.workspaceFolders || [];
        await Promise.all(workspaces.map(workspace => this.workspaceState.initializeWorkspace(workspace.uri.toString())));
    }
    async handleActiveFileChange() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fileContext = {
                path: editor.document.uri.toString(),
                language: editor.document.languageId,
                lastAccessed: Date.now()
            };
            await this.workspaceState.updateActiveFile(fileContext);
        }
    }
    async loadPersistedContext() {
        const contexts = await this.fileStorage.loadAllContexts();
        contexts.forEach(({ id, data }) => this.contextCache.set(id, data));
    }
    async getAllContextMetadata() {
        return Array.from(this.contextCache.entries()).map(([id, data]) => ({
            id,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            type: data.type
        }));
    }
    async clearContext(id) {
        this.contextCache.delete(id);
        await this.fileStorage.deleteContext(id);
    }
    async clearAllContexts() {
        this.contextCache.clear();
        await this.fileStorage.clearAllContexts();
        await this.workspaceState.clearAllWorkspaces();
    }
    dispose() {
        this.eventEmitter.dispose();
        this.conversationService.dispose();
        this.fileStorage.dispose();
        this.workspaceState.dispose();
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map