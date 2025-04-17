import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { GitLabProvider } from '../../../../services/repositoryProviders/GitLabProvider';
import { Gitlab } from '@gitbeaker/node';

suite('GitLabProvider Tests', () => {
    let provider: GitLabProvider;
    let sandbox: sinon.SinonSandbox;
    let configurationStub: sinon.SinonStub;
    let createProjectStub: sinon.SinonStub;
    let listProjectsStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Stub VS Code configuration
        configurationStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        configurationStub.returns({
            get: sandbox.stub().callsFake((key: string) => {
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
        sandbox.stub(Gitlab.prototype, 'Projects').value({
            create: createProjectStub,
            all: listProjectsStub
        });

        provider = new GitLabProvider();
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
        provider = new GitLabProvider();
        
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
        provider = new GitLabProvider();

        await assert.rejects(
            () => provider.createRepository({ name: 'test-project' }),
            /GitLab provider not configured/
        );
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
        provider = new GitLabProvider();

        await assert.rejects(
            () => provider.getRepositories(),
            /GitLab provider not configured/
        );
    });
});