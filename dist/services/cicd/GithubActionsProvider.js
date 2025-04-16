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
exports.GitHubActionsProvider = void 0;
const vscode = __importStar(require("vscode"));
const rest_1 = require("@octokit/rest");
const yaml = __importStar(require("yaml"));
class GitHubActionsProvider {
    constructor() {
        this.name = 'GitHub Actions';
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
    async createWorkflow(options) {
        const workflowPath = options.path || `.github/workflows/${options.name}.yml`;
        const template = await this.loadWorkflowTemplate(options.template);
        const content = this.replaceVariables(template, options.variables);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(workflowPath), Buffer.from(content));
    }
    async loadWorkflowTemplate(templateName) {
        const templatePath = vscode.Uri.file(`templates/github/${templateName}.yml`);
        const content = await vscode.workspace.fs.readFile(templatePath);
        return content.toString();
    }
    replaceVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
        }
        return result;
    }
    async listWorkflows() {
        const workflowFiles = await vscode.workspace.findFiles('.github/workflows/*.{yml,yaml}', '**/node_modules/**');
        return Promise.all(workflowFiles.map(async (file) => {
            const content = await vscode.workspace.fs.readFile(file);
            const workflow = yaml.parse(content.toString());
            return {
                name: workflow.name || file.fsPath.split('/').pop()?.replace('.yml', ''),
                path: file.fsPath,
                status: workflow.on ? 'active' : 'disabled',
                lastRun: undefined // Would need GitHub API call to get this
            };
        }));
    }
    async deleteWorkflow(name) {
        const workflows = await this.listWorkflows();
        const workflow = workflows.find(w => w.name === name);
        if (workflow) {
            await vscode.workspace.fs.delete(vscode.Uri.file(workflow.path));
        }
    }
}
exports.GitHubActionsProvider = GitHubActionsProvider;
//# sourceMappingURL=GithubActionsProvider.js.map