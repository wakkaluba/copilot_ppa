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
exports.BitbucketProvider = void 0;
const vscode = __importStar(require("vscode"));
const bitbucket_1 = require("bitbucket");
class BitbucketProvider {
    bitbucket;
    workspace;
    name = 'Bitbucket';
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
    async createRepository(options) {
        if (!this.bitbucket || !this.workspace) {
            throw new Error('Bitbucket provider not configured');
        }
        await this.bitbucket.repositories.create({
            workspace: this.workspace,
            _body: {
                name: options.name,
                description: options.description,
                is_private: options.private,
                scm: 'git'
            }
        });
    }
    async getRepositories() {
        if (!this.bitbucket || !this.workspace) {
            throw new Error('Bitbucket provider not configured');
        }
        const { data } = await this.bitbucket.repositories.list({
            workspace: this.workspace
        });
        return data.values?.map(repo => ({
            name: repo.name || '',
            url: repo.links?.html?.href || '',
            private: repo.is_private || false,
            description: repo.description || undefined
        })) || [];
    }
}
exports.BitbucketProvider = BitbucketProvider;
//# sourceMappingURL=BitbucketProvider.js.map