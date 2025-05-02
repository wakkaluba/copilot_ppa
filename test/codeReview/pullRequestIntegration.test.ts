import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PullRequestIntegration } from '../../src/codeReview/pullRequestIntegration';
import { Logger } from '../../src/common/logging';
import { GitService } from '../../src/services/gitService';

describe('PullRequestIntegration', () => {
    let pullRequestIntegration: PullRequestIntegration;
    let mockLogger: Logger;
    let mockGitService: GitService;

    beforeEach(() => {
        mockLogger = {
            info: sinon.spy(),
            error: sinon.spy(),
            warning: sinon.spy(),
            debug: sinon.spy()
        } as unknown as Logger;

        mockGitService = {
            getRepositoryInfo: sinon.stub().resolves({
                owner: 'testOwner',
                repo: 'testRepo',
                branch: 'main'
            }),
            getCurrentBranch: sinon.stub().resolves('feature-branch'),
            getDefaultBranch: sinon.stub().resolves('main'),
            getRemoteUrl: sinon.stub().resolves('https://github.com/testOwner/testRepo.git')
        } as unknown as GitService;

        pullRequestIntegration = new PullRequestIntegration(mockLogger, mockGitService);

        // GitHub setup
        pullRequestIntegration.getGitHubClient = sinon.stub().returns({
            pulls: {
                list: sinon.stub().resolves({
                    data: [
                        { number: 1, title: 'PR 1', html_url: 'https://github.com/testOwner/testRepo/pull/1' },
                        { number: 2, title: 'PR 2', html_url: 'https://github.com/testOwner/testRepo/pull/2' }
                    ]
                }),
                create: sinon.stub().resolves({
                    data: { number: 3, html_url: 'https://github.com/testOwner/testRepo/pull/3' }
                }),
                listFiles: sinon.stub().resolves({
                    data: [
                        { filename: 'file1.js', status: 'modified', additions: 10, deletions: 5 },
                        { filename: 'file2.js', status: 'added', additions: 20, deletions: 0 }
                    ]
                }),
                createReview: sinon.stub().resolves({
                    data: { id: 123 }
                })
            }
        });

        // GitLab setup
        pullRequestIntegration.getGitLabClient = sinon.stub().returns({
            MergeRequests: {
                all: sinon.stub().resolves([
                    { iid: 1, title: 'MR 1', web_url: 'https://gitlab.com/testOwner/testRepo/-/merge_requests/1' },
                    { iid: 2, title: 'MR 2', web_url: 'https://gitlab.com/testOwner/testRepo/-/merge_requests/2' }
                ]),
                create: sinon.stub().resolves({
                    iid: 3, web_url: 'https://gitlab.com/testOwner/testRepo/-/merge_requests/3'
                }),
                changes: sinon.stub().resolves({
                    changes: [
                        { new_path: 'file1.js', deleted_file: false, new_file: false },
                        { new_path: 'file2.js', deleted_file: false, new_file: true }
                    ]
                })
            },
            MergeRequestApprovals: {
                approve: sinon.stub().resolves({ id: 123 })
            },
            MergeRequestNotes: {
                create: sinon.stub().resolves({ id: 456 })
            }
        });

        // Bitbucket setup
        pullRequestIntegration.getBitbucketClient = sinon.stub().returns({
            pullrequests: {
                list: sinon.stub().resolves({
                    data: {
                        values: [
                            { id: 1, title: 'PR 1', links: { html: { href: 'https://bitbucket.org/testOwner/testRepo/pull-requests/1' } } },
                            { id: 2, title: 'PR 2', links: { html: { href: 'https://bitbucket.org/testOwner/testRepo/pull-requests/2' } } }
                        ]
                    }
                }),
                create: sinon.stub().resolves({
                    data: {
                        id: 3, links: { html: { href: 'https://bitbucket.org/testOwner/testRepo/pull-requests/3' } }
                    }
                }),
                listFiles: sinon.stub().resolves({
                    data: {
                        values: [
                            { path: 'file1.js', type: 'modified' },
                            { path: 'file2.js', type: 'added' }
                        ]
                    }
                }),
                createComment: sinon.stub().resolves({
                    data: { id: 789 }
                })
            }
        });
    });

    describe('fetchPullRequests', () => {
        it('should fetch GitHub pull requests', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const pullRequests = await pullRequestIntegration.fetchPullRequests();

            assert.strictEqual(pullRequests.length, 2);
            assert.strictEqual(pullRequests[0].number, 1);
            assert.strictEqual(pullRequests[0].title, 'PR 1');
            assert.strictEqual(pullRequests[0].url, 'https://github.com/testOwner/testRepo/pull/1');
            assert(pullRequestIntegration.getGitHubClient.calledOnce);
        });

        it('should fetch GitLab merge requests', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('gitlab');

            const pullRequests = await pullRequestIntegration.fetchPullRequests();

            assert.strictEqual(pullRequests.length, 2);
            assert.strictEqual(pullRequests[0].number, 1);
            assert.strictEqual(pullRequests[0].title, 'MR 1');
            assert.strictEqual(pullRequests[0].url, 'https://gitlab.com/testOwner/testRepo/-/merge_requests/1');
            assert(pullRequestIntegration.getGitLabClient.calledOnce);
        });

        it('should fetch Bitbucket pull requests', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('bitbucket');

            const pullRequests = await pullRequestIntegration.fetchPullRequests();

            assert.strictEqual(pullRequests.length, 2);
            assert.strictEqual(pullRequests[0].number, 1);
            assert.strictEqual(pullRequests[0].title, 'PR 1');
            assert.strictEqual(pullRequests[0].url, 'https://bitbucket.org/testOwner/testRepo/pull-requests/1');
            assert(pullRequestIntegration.getBitbucketClient.calledOnce);
        });

        it('should handle errors when fetching pull requests', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    list: sinon.stub().rejects(new Error('Failed to fetch pull requests'))
                }
            });

            await assert.rejects(async () => {
                await pullRequestIntegration.fetchPullRequests();
            }, /Failed to fetch pull requests/);
            assert((mockLogger.error as sinon.SinonSpy).calledOnce);
        });

        it('should handle unsupported git providers', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('unknown');

            await assert.rejects(async () => {
                await pullRequestIntegration.fetchPullRequests();
            }, /Unsupported Git provider/);
            assert((mockLogger.error as sinon.SinonSpy).calledOnce);
        });
    });

    describe('createPullRequest', () => {
        it('should create a GitHub pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const result = await pullRequestIntegration.createPullRequest('Test PR Description');

            assert.strictEqual(result.number, 3);
            assert.strictEqual(result.url, 'https://github.com/testOwner/testRepo/pull/3');
            assert(pullRequestIntegration.getGitHubClient.calledOnce);
            const githubClient = pullRequestIntegration.getGitHubClient();
            assert(githubClient.pulls.create.calledWith({
                owner: 'testOwner',
                repo: 'testRepo',
                title: 'Test PR Title',
                body: 'Test PR Description',
                head: 'feature-branch',
                base: 'main'
            }));
        });

        it('should create a GitLab merge request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('gitlab');

            const result = await pullRequestIntegration.createPullRequest('Test MR Description');

            assert.strictEqual(result.number, 3);
            assert.strictEqual(result.url, 'https://gitlab.com/testOwner/testRepo/-/merge_requests/3');
            assert(pullRequestIntegration.getGitLabClient.calledOnce);
            const gitlabClient = pullRequestIntegration.getGitLabClient();
            assert(gitlabClient.MergeRequests.create.calledWith({
                projectId: 'testOwner/testRepo',
                title: 'Test PR Title',
                description: 'Test MR Description',
                source_branch: 'feature-branch',
                target_branch: 'main'
            }));
        });

        it('should create a Bitbucket pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('bitbucket');

            const result = await pullRequestIntegration.createPullRequest('Test PR Description');

            assert.strictEqual(result.number, 3);
            assert.strictEqual(result.url, 'https://bitbucket.org/testOwner/testRepo/pull-requests/3');
            assert(pullRequestIntegration.getBitbucketClient.calledOnce);
            const bitbucketClient = pullRequestIntegration.getBitbucketClient();
            assert(bitbucketClient.pullrequests.create.calledWith({
                workspace: 'testOwner',
                repo_slug: 'testRepo',
                title: 'Test PR Title',
                description: 'Test PR Description',
                source: {
                    branch: { name: 'feature-branch' }
                },
                destination: {
                    branch: { name: 'main' }
                }
            }));
        });

        it('should handle errors when creating pull requests', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');
            mockGitService.getCurrentBranch = sinon.stub().resolves('feature-branch');
            mockGitService.getDefaultBranch = sinon.stub().resolves('main');

            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    create: sinon.stub().rejects(new Error('Failed to create PR'))
                }
            });

            await assert.rejects(async () => {
                await pullRequestIntegration.createPullRequest('Test PR Description');
            }, /Failed to create PR/);
            assert((mockLogger.error as sinon.SinonSpy).calledOnce);
        });
    });

    // Additional test sections for submitReview, getChangedFiles, checkPullRequestQuality
    describe('submitReview', () => {
        it('should submit a review for a GitHub pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const result = await pullRequestIntegration.submitReview(1, 'APPROVE', 'LGTM!');

            assert.strictEqual(result.id, 123);
            const githubClient = pullRequestIntegration.getGitHubClient();
            assert(githubClient.pulls.createReview.calledWith({
                owner: 'testOwner',
                repo: 'testRepo',
                pull_number: 1,
                event: 'APPROVE',
                body: 'LGTM!'
            }));
        });

        it('should submit a review for a GitLab merge request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('gitlab');

            const result = await pullRequestIntegration.submitReview(1, 'APPROVE', 'LGTM!');

            assert.strictEqual(result.id, 123);
            const gitlabClient = pullRequestIntegration.getGitLabClient();
            assert(gitlabClient.MergeRequestApprovals.approve.calledWith({
                projectId: 'testOwner/testRepo',
                mergeRequestIid: 1
            }));

            assert(gitlabClient.MergeRequestNotes.create.calledWith({
                projectId: 'testOwner/testRepo',
                mergeRequestIid: 1,
                body: 'LGTM!'
            }));
        });

        it('should handle errors when submitting reviews', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    createReview: sinon.stub().rejects(new Error('Failed to submit review'))
                }
            });

            await assert.rejects(async () => {
                await pullRequestIntegration.submitReview(1, 'APPROVE', 'LGTM!');
            }, /Failed to submit review/);
            assert((mockLogger.error as sinon.SinonSpy).calledOnce);
        });
    });

    describe('getChangedFiles', () => {
        it('should get changed files from GitHub pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const files = await pullRequestIntegration.getChangedFiles(1);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].filename, 'file1.js');
            assert.strictEqual(files[0].status, 'modified');
        });

        it('should handle errors when getting changed files', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    listFiles: sinon.stub().rejects(new Error('Failed to get changed files'))
                }
            });

            await assert.rejects(async () => {
                await pullRequestIntegration.getChangedFiles(1);
            }, /Failed to get changed files/);
            assert((mockLogger.error as sinon.SinonSpy).calledOnce);
        });
    });

    describe('checkPullRequestQuality', () => {
        let mockReviewChecklist: any;

        beforeEach(() => {
            mockReviewChecklist = {
                checkFile: sinon.stub().resolves({
                    issues: [
                        { type: 'warning', message: 'Missing tests', line: 10, column: 1 },
                        { type: 'error', message: 'Security vulnerability', line: 20, column: 5 }
                    ],
                    score: 75
                })
            };

            (pullRequestIntegration as any).reviewChecklist = mockReviewChecklist;
        });

        it('should check pull request quality', async () => {
            sinon.stub(pullRequestIntegration, 'getChangedFiles').resolves([
                { filename: 'file1.js', status: 'modified' },
                { filename: 'file2.js', status: 'added' }
            ]);

            const openTextDocumentStub = sinon.stub(vscode.workspace, 'openTextDocument').resolves({
                getText: () => 'const x = 1;'
            } as any);

            const report = await pullRequestIntegration.checkPullRequestQuality(1);

            assert.strictEqual(report.files.length, 2);
            assert.strictEqual(report.files[0].filename, 'file1.js');
            assert.strictEqual(report.files[0].issues.length, 2);
            assert.strictEqual(report.averageScore, 75);

            openTextDocumentStub.restore();
        });
    });

    describe('detectGitProvider', () => {
        it('should detect GitHub provider', async () => {
            (mockGitService.getRemoteUrl as sinon.SinonStub).resolves('https://github.com/owner/repo.git');

            const provider = await pullRequestIntegration.detectGitProvider();

            assert.strictEqual(provider, 'github');
        });

        it('should detect GitLab provider', async () => {
            (mockGitService.getRemoteUrl as sinon.SinonStub).resolves('https://gitlab.com/owner/repo.git');

            const provider = await pullRequestIntegration.detectGitProvider();

            assert.strictEqual(provider, 'gitlab');
        });
    });
});
