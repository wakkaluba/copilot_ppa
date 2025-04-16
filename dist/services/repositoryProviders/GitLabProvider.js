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
exports.GitLabProvider = void 0;
const vscode = __importStar(require("vscode"));
const node_1 = require("@gitbeaker/node");
class GitLabProvider {
    constructor() {
        this.name = 'GitLab';
        this.initialize();
    }
    async initialize() {
        const token = await this.getAuthToken();
        const url = await this.getGitLabUrl();
        if (token) {
            this.gitlab = new node_1.Gitlab({
                token,
                host: url || 'https://gitlab.com'
            });
        }
    }
    async getAuthToken() {
        return vscode.workspace.getConfiguration('copilot-ppa')
            .get('gitlab.personalAccessToken');
    }
    async getGitLabUrl() {
        return vscode.workspace.getConfiguration('copilot-ppa')
            .get('gitlab.url');
    }
    async isConfigured() {
        return !!this.gitlab;
    }
    async createRepository(options) {
        if (!this.gitlab) {
            throw new Error('GitLab provider not configured');
        }
        await this.gitlab.Projects.create({
            name: options.name,
            description: options.description,
            visibility: options.private ? 'private' : 'public'
        });
    }
    async getRepositories() {
        if (!this.gitlab) {
            throw new Error('GitLab provider not configured');
        }
        const projects = await this.gitlab.Projects.all({
            membership: true
        });
        return projects.map(project => ({
            name: project.name,
            url: project.web_url,
            private: project.visibility === 'private',
            description: project.description
        }));
    }
}
exports.GitLabProvider = GitLabProvider;
//# sourceMappingURL=GitLabProvider.js.map