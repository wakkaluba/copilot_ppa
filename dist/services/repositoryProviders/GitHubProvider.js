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
exports.GitHubProvider = void 0;
const vscode = __importStar(require("vscode"));
const rest_1 = require("@octokit/rest");
class GitHubProvider {
    constructor() {
        this.name = 'GitHub';
        this.initialize();
    }
    async initialize() {
        const token = await this.getAuthToken();
        if (token) {
            this.octokit = new rest_1.Octokit({ auth: token });
        }
    }
    async getAuthToken() {
        return vscode.workspace.getConfiguration('copilot-ppa')
            .get('github.personalAccessToken');
    }
    async isConfigured() {
        return !!this.octokit;
    }
    async createRepository(options) {
        if (!this.octokit) {
            throw new Error('GitHub provider not configured');
        }
        await this.octokit.repos.createForAuthenticatedUser({
            name: options.name,
            description: options.description,
            private: options.private ?? false,
        });
    }
    async getRepositories() {
        if (!this.octokit) {
            throw new Error('GitHub provider not configured');
        }
        const { data } = await this.octokit.repos.listForAuthenticatedUser();
        return data.map(repo => ({
            name: repo.name,
            url: repo.html_url,
            private: repo.private,
            description: repo.description || undefined
        }));
    }
}
exports.GitHubProvider = GitHubProvider;
//# sourceMappingURL=GitHubProvider.js.map