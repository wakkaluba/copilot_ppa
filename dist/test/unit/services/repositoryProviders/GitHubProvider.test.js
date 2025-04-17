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
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const vscode = __importStar(require("vscode"));
const GitHubProvider_1 = require("../../../../services/repositoryProviders/GitHubProvider");
suite('GitHubProvider Tests', () => {
    let provider;
    let sandbox;
    let configurationStub;
    let createRepoStub;
    let listReposStub;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Stub VS Code configuration
        configurationStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        configurationStub.returns({
            get: sandbox.stub().returns('test-token')
        });
        // Create stubs for Octokit methods
        createRepoStub = sandbox.stub().resolves({ data: {} });
        listReposStub = sandbox.stub().resolves({
            data: [
                {
                    name: 'test-repo',
                    html_url: 'https://github.com/user/test-repo',
                    private: true,
                    description: 'Test repository'
                }
            ]
        });
        // Mock Octokit constructor using sandbox replacement
        const mockRepos = { createForAuthenticatedUser: createRepoStub, listForAuthenticatedUser: listReposStub };
        const mockOctokit = function () { this.repos = mockRepos; };
        sandbox.replace(global, 'Octokit', mockOctokit);
        provider = new GitHubProvider_1.GitHubProvider();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('isConfigured should return true when token is configured', async () => {
        assert.strictEqual(await provider.isConfigured(), true);
    });
    test('isConfigured should return false when token is not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined token
        provider = new GitHubProvider_1.GitHubProvider();
        assert.strictEqual(await provider.isConfigured(), false);
    });
    test('createRepository should create repository with correct options', async () => {
        await provider.createRepository({
            name: 'test-repo',
            description: 'Test repository',
            private: true
        });
        assert.strictEqual(createRepoStub.calledOnce, true);
        const options = createRepoStub.firstCall.args[0];
        assert.strictEqual(options.name, 'test-repo');
        assert.strictEqual(options.description, 'Test repository');
        assert.strictEqual(options.private, true);
    });
    test('createRepository should throw error when not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined token
        provider = new GitHubProvider_1.GitHubProvider();
        await assert.rejects(() => provider.createRepository({ name: 'test-repo' }), /GitHub provider not configured/);
    });
    test('getRepositories should return list of repositories', async () => {
        const repos = await provider.getRepositories();
        assert.strictEqual(listReposStub.calledOnce, true);
        assert.strictEqual(repos.length, 1);
        assert.deepStrictEqual(repos[0], {
            name: 'test-repo',
            url: 'https://github.com/user/test-repo',
            private: true,
            description: 'Test repository'
        });
    });
    test('getRepositories should throw error when not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined token
        provider = new GitHubProvider_1.GitHubProvider();
        await assert.rejects(() => provider.getRepositories(), /GitHub provider not configured/);
    });
});
//# sourceMappingURL=GitHubProvider.test.js.map