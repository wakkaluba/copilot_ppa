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
exports.repositoryManager = exports.RepositoryManager = void 0;
const vscode = __importStar(require("vscode"));
const github_1 = require("./providers/github");
const gitlab_1 = require("./providers/gitlab");
const bitbucket_1 = require("./providers/bitbucket");
class RepositoryManager {
    constructor() {
        this._isEnabled = false;
        this.providers = new Map();
        // Initialize providers
        this.providers.set('github', new github_1.GitHubProvider());
        this.providers.set('gitlab', new gitlab_1.GitLabProvider());
        this.providers.set('bitbucket', new bitbucket_1.BitbucketProvider());
    }
    get isEnabled() {
        return this._isEnabled;
    }
    setEnabled(value) {
        this._isEnabled = value;
        vscode.commands.executeCommand('setContext', 'copilotPPA.repositoryAccessEnabled', value);
    }
    getProviders() {
        return Array.from(this.providers.values());
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    async createRepository(provider, name, description = '', isPrivate = true) {
        if (!this.isEnabled) {
            throw new Error('Repository access is disabled. Enable it in settings first.');
        }
        const repoProvider = this.providers.get(provider);
        if (!repoProvider) {
            throw new Error(`Provider "${provider}" is not supported.`);
        }
        if (!repoProvider.isEnabled) {
            throw new Error(`Provider "${provider}" is not configured. Please check your settings.`);
        }
        return await repoProvider.createRepository(name, description, isPrivate);
    }
    async cloneRepository(provider, url, path) {
        if (!this.isEnabled) {
            throw new Error('Repository access is disabled. Enable it in settings first.');
        }
        const repoProvider = this.providers.get(provider);
        if (!repoProvider) {
            throw new Error(`Provider "${provider}" is not supported.`);
        }
        return await repoProvider.cloneRepository(url, path);
    }
}
exports.RepositoryManager = RepositoryManager;
// Singleton instance
exports.repositoryManager = new RepositoryManager();
//# sourceMappingURL=repositoryManagement.js.map