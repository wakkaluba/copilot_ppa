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
const BitbucketProvider_1 = require("../../../../services/repositoryProviders/BitbucketProvider");
const bitbucket_1 = require("bitbucket");
suite('BitbucketProvider Tests', () => {
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
            get: sandbox.stub().callsFake((key) => {
                switch (key) {
                    case 'bitbucket.username':
                        return 'test-user';
                    case 'bitbucket.appPassword':
                        return 'test-password';
                    case 'bitbucket.workspace':
                        return 'test-workspace';
                    default:
                        return undefined;
                }
            })
        });
        // Create stubs for Bitbucket methods
        createRepoStub = sandbox.stub().resolves();
        listReposStub = sandbox.stub().resolves({
            data: {
                values: [
                    {
                        name: 'test-repo',
                        links: {
                            html: {
                                href: 'https://bitbucket.org/workspace/test-repo'
                            }
                        },
                        is_private: true,
                        description: 'Test repository'
                    }
                ]
            }
        });
        // Stub Bitbucket constructor
        sandbox.stub(bitbucket_1.Bitbucket.prototype, 'repositories').value({
            create: createRepoStub,
            list: listReposStub
        });
        provider = new BitbucketProvider_1.BitbucketProvider();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('isConfigured should return true when credentials are configured', async () => {
        assert.strictEqual(await provider.isConfigured(), true);
    });
    test('isConfigured should return false when credentials are not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined credentials
        provider = new BitbucketProvider_1.BitbucketProvider();
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
        assert.strictEqual(options.workspace, 'test-workspace');
        assert.deepStrictEqual(options._body, {
            name: 'test-repo',
            description: 'Test repository',
            is_private: true,
            scm: 'git'
        });
    });
    test('createRepository should throw error when not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined credentials
        provider = new BitbucketProvider_1.BitbucketProvider();
        await assert.rejects(() => provider.createRepository({ name: 'test-repo' }), /Bitbucket provider not configured/);
    });
    test('getRepositories should return list of repositories', async () => {
        const repos = await provider.getRepositories();
        assert.strictEqual(listReposStub.calledOnce, true);
        assert.strictEqual(repos.length, 1);
        assert.deepStrictEqual(repos[0], {
            name: 'test-repo',
            url: 'https://bitbucket.org/workspace/test-repo',
            private: true,
            description: 'Test repository'
        });
        // Verify workspace parameter was passed
        const options = listReposStub.firstCall.args[0];
        assert.strictEqual(options.workspace, 'test-workspace');
    });
    test('getRepositories should handle missing repository data', async () => {
        listReposStub.resolves({
            data: {
                values: [
                    {
                        // Missing optional fields
                        name: 'test-repo',
                        links: {
                            html: {
                                href: 'https://bitbucket.org/workspace/test-repo'
                            }
                        }
                    }
                ]
            }
        });
        const repos = await provider.getRepositories();
        assert.deepStrictEqual(repos[0], {
            name: 'test-repo',
            url: 'https://bitbucket.org/workspace/test-repo',
            private: false,
            description: undefined
        });
    });
    test('getRepositories should throw error when not configured', async () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });
        // Create new instance with undefined credentials
        provider = new BitbucketProvider_1.BitbucketProvider();
        await assert.rejects(() => provider.getRepositories(), /Bitbucket provider not configured/);
    });
});
//# sourceMappingURL=BitbucketProvider.test.js.map