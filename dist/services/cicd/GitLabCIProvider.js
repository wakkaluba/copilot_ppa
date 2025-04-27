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
exports.GitLabCIProvider = void 0;
const vscode = __importStar(require("vscode"));
const node_1 = require("@gitbeaker/node");
const yaml = __importStar(require("yaml"));
class GitLabCIProvider {
    constructor() {
        this.name = 'GitLab CI/CD';
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
    async createWorkflow(options) {
        const workflowPath = options.path || '.gitlab-ci.yml';
        const template = await this.loadWorkflowTemplate(options.template);
        const content = this.replaceVariables(template, options.variables);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(workflowPath), Buffer.from(content));
    }
    async loadWorkflowTemplate(templateName) {
        const templatePath = vscode.Uri.file(`templates/gitlab/${templateName}.yml`);
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
        const ciFile = await vscode.workspace.findFiles('.gitlab-ci.yml', '**/node_modules/**');
        if (ciFile.length === 0) {
            return [];
        }
        const content = await vscode.workspace.fs.readFile(ciFile[0]);
        const config = yaml.parse(content.toString());
        return [{
                name: '.gitlab-ci.yml',
                path: ciFile[0].fsPath,
                status: config.workflow?.rules ? 'active' : 'disabled'
            }];
    }
    async deleteWorkflow(name) {
        const workflows = await this.listWorkflows();
        const workflow = workflows.find(w => w.name === name);
        if (workflow) {
            await vscode.workspace.fs.delete(vscode.Uri.file(workflow.path));
        }
    }
}
exports.GitLabCIProvider = GitLabCIProvider;
//# sourceMappingURL=GitLabCIProvider.js.map