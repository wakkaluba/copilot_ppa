const sinon = require('sinon');
const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const { PullRequestIntegration } = require('../../src/codeReview/pullRequestIntegration');

describe('PullRequestIntegration', () => {
    let pullRequestIntegration;
    let mockGitService;
    let mockLogger;
    let mockVscode;

    beforeEach(() => {
        mockGitService = {
            getRepositoryInfo: sinon.stub().resolves({ provider: 'github', owner: 'testOwner', repo: 'testRepo' }),
            getRemoteUrl: sinon.stub().resolves('https://github.com/testOwner/testRepo.git')
        };

        mockLogger = {
            info: sinon.stub(),
            error: sinon.stub(),
            debug: sinon.stub(),
            warn: sinon.stub()
        };

        mockVscode = {
            window: {
                showInformationMessage: sinon.stub(),
                showErrorMessage: sinon.stub(),
                showInputBox: sinon.stub().resolves('Test PR Title')
            },
            ProgressLocation: {
                Notification: 1
            },
            workspace: {
                getConfiguration: sinon.stub().returns({
                    get: sinon.stub().returns('token123')
                })
            }
        };

        // Create a new instance of PullRequestIntegration for each test
        pullRequestIntegration = new PullRequestIntegration(mockGitService, mockLogger);

        // Replace vscode API with mock
        global.vscode = mockVscode;
    });

    afterEach(() => {
        sinon.restore();
        delete global.vscode;
    });

    describe('detectGitProvider', () => {
        it('should detect GitHub provider from remote URL', async () => {
            const result = await pullRequestIntegration.detectGitProvider();
            assert.strictEqual(result, 'github');
            assert(mockGitService.getRemoteUrl.calledOnce);
        });

        it('should detect GitLab provider from remote URL', async () => {
            mockGitService.getRemoteUrl.resolves('https://gitlab.com/testOwner/testRepo.git');
            const result = await pullRequestIntegration.detectGitProvider();
            assert.strictEqual(result, 'gitlab');
        });

        it('should detect Bitbucket provider from remote URL', async () => {
            mockGitService.getRemoteUrl.resolves('https://bitbucket.org/testOwner/testRepo.git');
            const result = await pullRequestIntegration.detectGitProvider();
            assert.strictEqual(result, 'bitbucket');
        });

        it('should handle unknown git providers', async () => {
            mockGitService.getRemoteUrl.resolves('https://unknown.com/testOwner/testRepo.git');
            const result = await pullRequestIntegration.detectGitProvider();
            assert.strictEqual(result, 'unknown');
        });

        it('should handle errors when detecting provider', async () => {
            mockGitService.getRemoteUrl.rejects(new Error('Failed to get remote URL'));
            await assert.rejects(async () => {
                await pullRequestIntegration.detectGitProvider();
            }, /Failed to get remote URL/);
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('fetchPullRequests', () => {
        beforeEach(() => {
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    list: sinon.stub().resolves({
                        data: [
                            { number: 1, title: 'PR 1', html_url: 'https://github.com/testOwner/testRepo/pull/1' },
                            { number: 2, title: 'PR 2', html_url: 'https://github.com/testOwner/testRepo/pull/2' }
                        ]
                    })
                }
            });

            pullRequestIntegration.getGitLabClient = sinon.stub().returns({
                MergeRequests: {
                    all: sinon.stub().resolves([
                        { iid: 1, title: 'MR 1', web_url: 'https://gitlab.com/testOwner/testRepo/-/merge_requests/1' },
                        { iid: 2, title: 'MR 2', web_url: 'https://gitlab.com/testOwner/testRepo/-/merge_requests/2' }
                    ])
                }
            });

            pullRequestIntegration.getBitbucketClient = sinon.stub().returns({
                pullrequests: {
                    list: sinon.stub().resolves({
                        data: {
                            values: [
                                { id: 1, title: 'PR 1', links: { html: { href: 'https://bitbucket.org/testOwner/testRepo/pull-requests/1' } } },
                                { id: 2, title: 'PR 2', links: { html: { href: 'https://bitbucket.org/testOwner/testRepo/pull-requests/2' } } }
                            ]
                        }
                    })
                }
            });
        });

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
            assert(mockLogger.error.calledOnce);
        });

        it('should handle unsupported git providers', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('unknown');

            await assert.rejects(async () => {
                await pullRequestIntegration.fetchPullRequests();
            }, /Unsupported Git provider/);
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('createPullRequest', () => {
        beforeEach(() => {
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    create: sinon.stub().resolves({
                        data: { number: 3, html_url: 'https://github.com/testOwner/testRepo/pull/3' }
                    })
                }
            });

            pullRequestIntegration.getGitLabClient = sinon.stub().returns({
                MergeRequests: {
                    create: sinon.stub().resolves({
                        iid: 3, web_url: 'https://gitlab.com/testOwner/testRepo/-/merge_requests/3'
                    })
                }
            });

            pullRequestIntegration.getBitbucketClient = sinon.stub().returns({
                pullrequests: {
                    create: sinon.stub().resolves({
                        data: {
                            id: 3, links: { html: { href: 'https://bitbucket.org/testOwner/testRepo/pull-requests/3' } }
                        }
                    })
                }
            });
        });

        it('should create a GitHub pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');
            mockGitService.getCurrentBranch = sinon.stub().resolves('feature-branch');
            mockGitService.getDefaultBranch = sinon.stub().resolves('main');

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
            mockGitService.getCurrentBranch = sinon.stub().resolves('feature-branch');
            mockGitService.getDefaultBranch = sinon.stub().resolves('main');

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
            mockGitService.getCurrentBranch = sinon.stub().resolves('feature-branch');
            mockGitService.getDefaultBranch = sinon.stub().resolves('main');

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

            const githubClient = {
                pulls: {
                    create: sinon.stub().rejects(new Error('Failed to create pull request'))
                }
            };
            pullRequestIntegration.getGitHubClient = sinon.stub().returns(githubClient);

            await assert.rejects(async () => {
                await pullRequestIntegration.createPullRequest('Test PR Description');
            }, /Failed to create pull request/);
            assert(mockLogger.error.calledOnce);
        });

        it('should handle unsupported git providers', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('unknown');

            await assert.rejects(async () => {
                await pullRequestIntegration.createPullRequest('Test PR Description');
            }, /Unsupported Git provider/);
            assert(mockLogger.error.calledOnce);
        });

        it('should handle empty description', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');
            mockGitService.getCurrentBranch = sinon.stub().resolves('feature-branch');
            mockGitService.getDefaultBranch = sinon.stub().resolves('main');

            const result = await pullRequestIntegration.createPullRequest('');

            assert.strictEqual(result.number, 3);
            const githubClient = pullRequestIntegration.getGitHubClient();
            const callArgs = githubClient.pulls.create.firstCall.args[0];
            assert.strictEqual(callArgs.body, '');
        });
    });

    describe('addReviewComment', () => {
        beforeEach(() => {
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    createReviewComment: sinon.stub().resolves({
                        data: { id: 101, html_url: 'https://github.com/testOwner/testRepo/pull/1/comments/101' }
                    })
                }
            });

            pullRequestIntegration.getGitLabClient = sinon.stub().returns({
                MergeRequestNotes: {
                    create: sinon.stub().resolves({
                        id: 101, body: 'Test comment'
                    })
                }
            });

            pullRequestIntegration.getBitbucketClient = sinon.stub().returns({
                pullrequests: {
                    createComment: sinon.stub().resolves({
                        data: { id: 101 }
                    })
                }
            });
        });

        it('should add a review comment to a GitHub pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const result = await pullRequestIntegration.addReviewComment({
                prNumber: 1,
                body: 'Test comment',
                path: 'src/test.js',
                position: 10
            });

            assert.strictEqual(result.id, 101);
            assert.strictEqual(result.url, 'https://github.com/testOwner/testRepo/pull/1/comments/101');
            assert(pullRequestIntegration.getGitHubClient.calledOnce);
            const githubClient = pullRequestIntegration.getGitHubClient();
            assert(githubClient.pulls.createReviewComment.calledWith({
                owner: 'testOwner',
                repo: 'testRepo',
                pull_number: 1,
                body: 'Test comment',
                path: 'src/test.js',
                position: 10
            }));
        });

        it('should add a review comment to a GitLab merge request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('gitlab');

            const result = await pullRequestIntegration.addReviewComment({
                prNumber: 1,
                body: 'Test comment',
                path: 'src/test.js',
                position: 10
            });

            assert.strictEqual(result.id, 101);
            assert.strictEqual(result.body, 'Test comment');
            assert(pullRequestIntegration.getGitLabClient.calledOnce);
            const gitlabClient = pullRequestIntegration.getGitLabClient();
            assert(gitlabClient.MergeRequestNotes.create.calledWith({
                projectId: 'testOwner/testRepo',
                mergeRequestIid: 1,
                body: 'Test comment'
            }));
        });

        it('should add a review comment to a Bitbucket pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('bitbucket');

            const result = await pullRequestIntegration.addReviewComment({
                prNumber: 1,
                body: 'Test comment',
                path: 'src/test.js',
                position: 10
            });

            assert.strictEqual(result.id, 101);
            assert(pullRequestIntegration.getBitbucketClient.calledOnce);
            const bitbucketClient = pullRequestIntegration.getBitbucketClient();
            assert(bitbucketClient.pullrequests.createComment.calledWith({
                workspace: 'testOwner',
                repo_slug: 'testRepo',
                pull_request_id: 1,
                content: {
                    raw: 'Test comment'
                }
            }));
        });

        it('should handle errors when adding review comments', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const githubClient = {
                pulls: {
                    createReviewComment: sinon.stub().rejects(new Error('Failed to add review comment'))
                }
            };
            pullRequestIntegration.getGitHubClient = sinon.stub().returns(githubClient);

            await assert.rejects(async () => {
                await pullRequestIntegration.addReviewComment({
                    prNumber: 1,
                    body: 'Test comment',
                    path: 'src/test.js',
                    position: 10
                });
            }, /Failed to add review comment/);
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('submitReview', () => {
        beforeEach(() => {
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    createReview: sinon.stub().resolves({
                        data: { id: 201, state: 'APPROVED' }
                    })
                }
            });

            pullRequestIntegration.getGitLabClient = sinon.stub().returns({
                MergeRequestApprovals: {
                    approve: sinon.stub().resolves({
                        id: 201, state: 'approved'
                    })
                }
            });

            pullRequestIntegration.getBitbucketClient = sinon.stub().returns({
                pullrequests: {
                    approve: sinon.stub().resolves({
                        data: { approved: true }
                    })
                }
            });
        });

        it('should submit a review for a GitHub pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const result = await pullRequestIntegration.submitReview({
                prNumber: 1,
                event: 'APPROVE',
                body: 'LGTM!'
            });

            assert.strictEqual(result.id, 201);
            assert.strictEqual(result.state, 'APPROVED');
            assert(pullRequestIntegration.getGitHubClient.calledOnce);
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

            const result = await pullRequestIntegration.submitReview({
                prNumber: 1,
                event: 'APPROVE'
            });

            assert.strictEqual(result.id, 201);
            assert.strictEqual(result.state, 'approved');
            assert(pullRequestIntegration.getGitLabClient.calledOnce);
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

        it('should submit a review for a Bitbucket pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('bitbucket');

            const result = await pullRequestIntegration.submitReview({
                prNumber: 1,
                event: 'APPROVE',
                body: 'LGTM!'
            });

            assert.strictEqual(result.id, 789);
            const bitbucketClient = pullRequestIntegration.getBitbucketClient();
            assert(bitbucketClient.pullrequests.createComment.calledWith({
                workspace: 'testOwner',
                repo_slug: 'testRepo',
                pull_request_id: 1,
                content: { raw: 'LGTM!' }
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
                await pullRequestIntegration.submitReview({
                    pullRequestNumber: 1,
                    state: 'approve',
                    comment: 'LGTM!'
                });
            }, /Failed to submit review/);
            assert(mockLogger.error.calledOnce);
        });

        it('should handle unsupported git providers', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('unknown');

            await assert.rejects(async () => {
                await pullRequestIntegration.submitReview({
                    pullRequestNumber: 1,
                    state: 'approve',
                    comment: 'LGTM!'
                });
            }, /Unsupported Git provider/);
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('getChangedFiles', () => {
        beforeEach(() => {
            pullRequestIntegration.getGitHubClient = sinon.stub().returns({
                pulls: {
                    listFiles: sinon.stub().resolves({
                        data: [
                            { filename: 'src/test1.js', status: 'modified' },
                            { filename: 'src/test2.js', status: 'added' }
                        ]
                    })
                }
            });

            pullRequestIntegration.getGitLabClient = sinon.stub().returns({
                MergeRequests: {
                    changes: sinon.stub().resolves({
                        changes: [
                            { new_path: 'src/test1.js', old_path: 'src/test1.js' },
                            { new_path: 'src/test2.js', old_path: null }
                        ]
                    })
                }
            });

            pullRequestIntegration.getBitbucketClient = sinon.stub().returns({
                pullrequests: {
                    listFiles: sinon.stub().resolves({
                        data: {
                            values: [
                                { path: 'src/test1.js', type: 'modified' },
                                { path: 'src/test2.js', type: 'added' }
                            ]
                        }
                    })
                }
            });
        });

        it('should get changed files from GitHub', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const files = await pullRequestIntegration.getChangedFiles(1);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].path, 'src/test1.js');
            assert.strictEqual(files[0].status, 'modified');
            assert.strictEqual(files[1].path, 'src/test2.js');
            assert.strictEqual(files[1].status, 'added');
            assert(pullRequestIntegration.getGitHubClient.calledOnce);
        });

        it('should get changed files from GitLab', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('gitlab');

            const files = await pullRequestIntegration.getChangedFiles(1);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].path, 'src/test1.js');
            assert.strictEqual(files[0].status, 'modified');
            assert.strictEqual(files[1].path, 'src/test2.js');
            assert.strictEqual(files[1].status, 'added');
            assert(pullRequestIntegration.getGitLabClient.calledOnce);
        });

        it('should get changed files from Bitbucket', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('bitbucket');

            const files = await pullRequestIntegration.getChangedFiles(1);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].path, 'src/test1.js');
            assert.strictEqual(files[0].status, 'modified');
            assert.strictEqual(files[1].path, 'src/test2.js');
            assert.strictEqual(files[1].status, 'added');
            assert(pullRequestIntegration.getBitbucketClient.calledOnce);
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
            assert(mockLogger.error.calledOnce);
        });

        it('should handle unsupported git providers', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('unknown');

            await assert.rejects(async () => {
                await pullRequestIntegration.getChangedFiles(1);
            }, /Unsupported Git provider/);
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('checkPullRequestQuality', () => {
        beforeEach(() => {
            sinon.stub(pullRequestIntegration, 'getChangedFiles').resolves([
                { path: 'src/test1.js', status: 'modified' },
                { path: 'src/test2.js', status: 'added' }
            ]);
        });

        it('should perform quality check on pull request files', async () => {
            const mockQualityChecker = {
                checkFile: sinon.stub().resolves({
                    issues: [{ severity: 'warning', message: 'Test issue', line: 10 }],
                    score: 85
                })
            };

            const result = await pullRequestIntegration.checkPullRequestQuality(1, mockQualityChecker);

            assert.strictEqual(result.overallScore, 85);
            assert.strictEqual(result.fileResults.length, 2);
            assert.strictEqual(result.fileResults[0].path, 'src/test1.js');
            assert.strictEqual(result.fileResults[0].issues.length, 1);
            assert.strictEqual(result.fileResults[0].score, 85);
            assert.strictEqual(mockQualityChecker.checkFile.callCount, 2);
        });

        it('should handle empty file list', async () => {
            pullRequestIntegration.getChangedFiles.resolves([]);
            const mockQualityChecker = {
                checkFile: sinon.stub()
            };

            const result = await pullRequestIntegration.checkPullRequestQuality(1, mockQualityChecker);

            assert.strictEqual(result.overallScore, 100);
            assert.strictEqual(result.fileResults.length, 0);
            assert.strictEqual(mockQualityChecker.checkFile.callCount, 0);
        });

        it('should handle errors during quality checking', async () => {
            const mockQualityChecker = {
                checkFile: sinon.stub().rejects(new Error('Failed to check file quality'))
            };

            await assert.rejects(async () => {
                await pullRequestIntegration.checkPullRequestQuality(1, mockQualityChecker);
            }, /Failed to check file quality/);
            assert(mockLogger.error.calledOnce);
        });
    });

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

        it('should submit a review for a Bitbucket pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('bitbucket');

            const result = await pullRequestIntegration.submitReview(1, 'APPROVE', 'LGTM!');

            assert.strictEqual(result.id, 789);
            const bitbucketClient = pullRequestIntegration.getBitbucketClient();
            assert(bitbucketClient.pullrequests.createComment.calledWith({
                workspace: 'testOwner',
                repo_slug: 'testRepo',
                pull_request_id: 1,
                content: { raw: 'LGTM!' }
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
            assert(mockLogger.error.calledOnce);
        });

        it('should handle unsupported git providers', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('unknown');

            await assert.rejects(async () => {
                await pullRequestIntegration.submitReview(1, 'APPROVE', 'LGTM!');
            }, /Unsupported Git provider/);
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('getChangedFiles', () => {
        it('should get changed files from GitHub pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('github');

            const files = await pullRequestIntegration.getChangedFiles(1);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].filename, 'file1.js');
            assert.strictEqual(files[0].status, 'modified');
            assert.strictEqual(files[1].filename, 'file2.js');
            assert.strictEqual(files[1].status, 'added');
        });

        it('should get changed files from GitLab merge request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('gitlab');

            const files = await pullRequestIntegration.getChangedFiles(1);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].filename, 'file1.js');
            assert.strictEqual(files[0].status, 'modified');
            assert.strictEqual(files[1].filename, 'file2.js');
            assert.strictEqual(files[1].status, 'added');
        });

        it('should get changed files from Bitbucket pull request', async () => {
            sinon.stub(pullRequestIntegration, 'detectGitProvider').resolves('bitbucket');

            const files = await pullRequestIntegration.getChangedFiles(1);

            assert.strictEqual(files.length, 2);
            assert.strictEqual(files[0].filename, 'file1.js');
            assert.strictEqual(files[0].status, 'modified');
            assert.strictEqual(files[1].filename, 'file2.js');
            assert.strictEqual(files[1].status, 'added');
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
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('checkPullRequestQuality', () => {
        let mockReviewChecklist;

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

            pullRequestIntegration.reviewChecklist = mockReviewChecklist;
        });

        it('should check pull request quality', async () => {
            sinon.stub(pullRequestIntegration, 'getChangedFiles').resolves([
                { filename: 'file1.js', status: 'modified' },
                { filename: 'file2.js', status: 'added' }
            ]);

            sinon.stub(vscode.workspace, 'openTextDocument').resolves({
                getText: () => 'const x = 1;'
            });

            const report = await pullRequestIntegration.checkPullRequestQuality(1);

            assert.strictEqual(report.files.length, 2);
            assert.strictEqual(report.files[0].filename, 'file1.js');
            assert.strictEqual(report.files[0].issues.length, 2);
            assert.strictEqual(report.files[0].score, 75);
            assert.strictEqual(report.averageScore, 75);

            vscode.workspace.openTextDocument.restore();
        });

        it('should handle errors when checking quality', async () => {
            sinon.stub(pullRequestIntegration, 'getChangedFiles').rejects(new Error('Failed to get files'));

            await assert.rejects(async () => {
                await pullRequestIntegration.checkPullRequestQuality(1);
            }, /Failed to get files/);
            assert(mockLogger.error.calledOnce);
        });
    });

    describe('detectGitProvider', () => {
        it('should detect GitHub provider', async () => {
            mockGitService.getRemoteUrl.resolves('https://github.com/owner/repo.git');

            const provider = await pullRequestIntegration.detectGitProvider();

            assert.strictEqual(provider, 'github');
        });

        it('should detect GitLab provider', async () => {
            mockGitService.getRemoteUrl.resolves('https://gitlab.com/owner/repo.git');

            const provider = await pullRequestIntegration.detectGitProvider();

            assert.strictEqual(provider, 'gitlab');
        });

        it('should detect Bitbucket provider', async () => {
            mockGitService.getRemoteUrl.resolves('https://bitbucket.org/owner/repo.git');

            const provider = await pullRequestIntegration.detectGitProvider();

            assert.strictEqual(provider, 'bitbucket');
        });

        it('should handle unknown git provider', async () => {
            mockGitService.getRemoteUrl.resolves('https://unknown.com/owner/repo.git');

            const provider = await pullRequestIntegration.detectGitProvider();

            assert.strictEqual(provider, 'unknown');
        });

        it('should handle git service errors', async () => {
            mockGitService.getRemoteUrl.rejects(new Error('Git service error'));

            await assert.rejects(async () => {
                await pullRequestIntegration.detectGitProvider();
            }, /Git service error/);
            assert(mockLogger.error.calledOnce);
        });
    });
});
