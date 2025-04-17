import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { GitHubProvider } from '../../../../services/repositoryProviders/GitHubProvider';
import { Octokit } from '@octokit/rest';

suite('GitHubProvider Tests', () => {
    let provider: GitHubProvider;
    let sandbox: sinon.SinonSandbox;
    let configurationStub: sinon.SinonStub;
    let createRepoStub: sinon.SinonStub;
    let listReposStub: sinon.SinonStub;

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
        const mockOctokit = function(this: any) { this.repos = mockRepos; };
        sandbox.replace(global as any, 'Octokit', mockOctokit);

        provider = new GitHubProvider();
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
        provider = new GitHubProvider();
        
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
        provider = new GitHubProvider();

        await assert.rejects(
            () => provider.createRepository({ name: 'test-repo' }),
            /GitHub provider not configured/
        );
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
        provider = new GitHubProvider();

        await assert.rejects(
            () => provider.getRepositories(),
            /GitHub provider not configured/
        );
    });
});