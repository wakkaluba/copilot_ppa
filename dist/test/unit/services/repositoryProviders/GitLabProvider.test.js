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
const GitLabProvider_1 = require("../../../../services/repositoryProviders/GitLabProvider");
const node_1 = require("@gitbeaker/node");
suite('GitLabProvider Tests', () => {
    let provider;
    let sandbox;
    let configurationStub;
    let createProjectStub;
    let listProjectsStub;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Stub VS Code configuration
        configurationStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        configurationStub.returns({
            get: sandbox.stub().callsFake((key) => {
                switch (key) {
                    case 'gitlab.personalAccessToken':
                        return 'test-token';
                    case 'gitlab.url':
                        return 'https://gitlab.example.com';
                    default:
                        return undefined;
                }
            })
        });
        // Create stubs for GitLab methods
        createProjectStub = sandbox.stub().resolves();
        listProjectsStub = sandbox.stub().resolves([
            {
                name: 'test-project',
                web_url: 'https://gitlab.example.com/user/test-project',
                visibility: 'private',
                description: 'Test project'
            }
        ]);
        // Stub Gitlab constructor
        sandbox.stub(node_1.Gitlab.prototype, 'Projects').value({
            create: createProjectStub,
            all: listProjectsStub
        });
        provider = new GitLabProvider_1.GitLabProvider();
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
        provider = new GitLabProvider_1.GitLabProvider();
        assert.strictEqual(await provider.isConfigured(), false);
    });
    test('createRepository should create project with correct options', async () => {
        await provider.createRepository({
            name: 'test-project',
            description: 'Test project',
            private: true
        });
        assert.strictEqual(createProjectStub.calledOnce, true);
        const options = createProjectStub.firstCall.args[0];
        assert.strictEqual(options.name, 'test-project');
        assert.strictEqual(options.description, 'Test project');
        assert.strictEqual(options.visibility, 'private');
    });
    test('createRepository should handle public visibility', async () => {
        await provider.createRepository({
            name: 'test-project',
            description: 'Test project',
            private: false
        });
        assert.strictEqual(createProjectStub.calledOnce, true);
        const options = createProjectStub.firstCall.args[0];
        assert.strictEqual(options.visibility, 'public');
    });
    test('createRepository should throw error when not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined token
        provider = new GitLabProvider_1.GitLabProvider();
        await assert.rejects(() => provider.createRepository({ name: 'test-project' }), /GitLab provider not configured/);
    });
    test('getRepositories should return list of projects', async () => {
        const repos = await provider.getRepositories();
        assert.strictEqual(listProjectsStub.calledOnce, true);
        assert.strictEqual(repos.length, 1);
        assert.deepStrictEqual(repos[0], {
            name: 'test-project',
            url: 'https://gitlab.example.com/user/test-project',
            private: true,
            description: 'Test project'
        });
        // Verify membership parameter was passed
        const options = listProjectsStub.firstCall.args[0];
        assert.strictEqual(options.membership, true);
    });
    test('getRepositories should throw error when not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined token
        provider = new GitLabProvider_1.GitLabProvider();
        await assert.rejects(() => provider.getRepositories(), /GitLab provider not configured/);
    });
});
//# sourceMappingURL=GitLabProvider.test.js.map