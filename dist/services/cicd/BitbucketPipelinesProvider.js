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
exports.BitbucketPipelinesProvider = void 0;
const vscode = __importStar(require("vscode"));
const bitbucket_1 = require("bitbucket");
const yaml = __importStar(require("yaml"));
class BitbucketPipelinesProvider {
    bitbucket;
    workspace;
    name = 'Bitbucket Pipelines';
    constructor() {
        this.initialize();
    }
    async initialize() {
        const credentials = await this.getCredentials();
        if (credentials) {
            this.bitbucket = new bitbucket_1.Bitbucket({
                auth: {
                    username: credentials.username,
                    password: credentials.appPassword
                }
            });
            this.workspace = credentials.workspace;
        }
    }
    async getCredentials() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const username = config.get('bitbucket.username');
        const appPassword = config.get('bitbucket.appPassword');
        const workspace = config.get('bitbucket.workspace');
        if (username && appPassword && workspace) {
            return { username, appPassword, workspace };
        }
        return undefined;
    }
    async isConfigured() {
        return !!(this.bitbucket && this.workspace);
    }
    async createWorkflow(options) {
        const workflowPath = options.path || 'bitbucket-pipelines.yml';
        const template = await this.loadWorkflowTemplate(options.template);
        const content = this.replaceVariables(template, options.variables);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(workflowPath), Buffer.from(content));
    }
    async loadWorkflowTemplate(templateName) {
        const templatePath = vscode.Uri.file(`templates/bitbucket/${templateName}.yml`);
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
        const pipelineFile = await vscode.workspace.findFiles('bitbucket-pipelines.yml', '**/node_modules/**');
        if (pipelineFile.length === 0) {
            return [];
        }
        const content = await vscode.workspace.fs.readFile(pipelineFile[0]);
        const config = yaml.parse(content.toString());
        return [{
                name: 'bitbucket-pipelines.yml',
                path: pipelineFile[0].fsPath,
                status: config.pipelines ? 'active' : 'disabled'
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
exports.BitbucketPipelinesProvider = BitbucketPipelinesProvider;
//# sourceMappingURL=BitbucketPipelinesProvider.js.map