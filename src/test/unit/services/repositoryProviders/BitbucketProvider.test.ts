import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { BitbucketProvider } from '../../../../services/repositoryProviders/BitbucketProvider';
import { Bitbucket } from 'bitbucket';

suite('BitbucketProvider Tests', () => {
    let provider: BitbucketProvider;
    let sandbox: sinon.SinonSandbox;
    let configurationStub: sinon.SinonStub;
    let createRepoStub: sinon.SinonStub;
    let listReposStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Stub VS Code configuration
        configurationStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        configurationStub.returns({
            get: sandbox.stub().callsFake((key: string) => {
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
        sandbox.stub(Bitbucket.prototype, 'repositories').value({
            create: createRepoStub,
            list: listReposStub
        });

        provider = new BitbucketProvider();
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
        provider = new BitbucketProvider();
        
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
        provider = new BitbucketProvider();

        await assert.rejects(
            () => provider.createRepository({ name: 'test-repo' }),
            /Bitbucket provider not configured/
        );
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
        provider = new BitbucketProvider();

        await assert.rejects(
            () => provider.getRepositories(),
            /Bitbucket provider not configured/
        );
    });
});