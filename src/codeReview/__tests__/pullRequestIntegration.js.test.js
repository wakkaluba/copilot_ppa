// GitHub, GitLab, and Bitbucket provider imports
const { BitbucketProvider } = require('../../repository/bitbucketProvider');
const { GitHubProvider } = require('../../repository/githubProvider');
const { GitLabProvider } = require('../../repository/gitlabProvider');
const { PullRequestIntegration } = require('../pullRequestIntegration');

// Mock dependencies
jest.mock('vscode');
jest.mock('../../repository/githubProvider');
jest.mock('../../repository/gitlabProvider');
jest.mock('../../repository/bitbucketProvider');

describe('PullRequestIntegration', () => {
    let pullRequestIntegration;

    // Set up mock implementations for provider methods
    const mockGitHubProvider = {
        isConnected: jest.fn(),
        getOpenPullRequests: jest.fn(),
        createPullRequest: jest.fn(),
        addReviewComment: jest.fn(),
        submitReview: jest.fn(),
        getChangedFiles: jest.fn(),
    };

    const mockGitLabProvider = {
        isConnected: jest.fn(),
        getOpenPullRequests: jest.fn(),
        createPullRequest: jest.fn(),
        addReviewComment: jest.fn(),
        submitReview: jest.fn(),
        getChangedFiles: jest.fn(),
    };

    const mockBitbucketProvider = {
        isConnected: jest.fn(),
        getOpenPullRequests: jest.fn(),
        createPullRequest: jest.fn(),
        addReviewComment: jest.fn(),
        submitReview: jest.fn(),
        getChangedFiles: jest.fn(),
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Set up mock implementations
        GitHubProvider.mockImplementation(() => mockGitHubProvider);
        GitLabProvider.mockImplementation(() => mockGitLabProvider);
        BitbucketProvider.mockImplementation(() => mockBitbucketProvider);

        // Create a new instance for each test
        pullRequestIntegration = new PullRequestIntegration();
    });

    describe('detectProvider', () => {
        it('should detect GitHub provider if connected', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(true);
            mockGitLabProvider.isConnected.mockResolvedValue(false);
            mockBitbucketProvider.isConnected.mockResolvedValue(false);

            const result = await pullRequestIntegration.detectProvider();

            expect(result).toBe(true);
            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitLabProvider.isConnected).not.toHaveBeenCalled();
            expect(mockBitbucketProvider.isConnected).not.toHaveBeenCalled();
            expect(pullRequestIntegration.activeProvider).toBe('github');
        });

        it('should detect GitLab provider if GitHub not connected', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(false);
            mockGitLabProvider.isConnected.mockResolvedValue(true);
            mockBitbucketProvider.isConnected.mockResolvedValue(false);

            const result = await pullRequestIntegration.detectProvider();

            expect(result).toBe(true);
            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitLabProvider.isConnected).toHaveBeenCalled();
            expect(mockBitbucketProvider.isConnected).not.toHaveBeenCalled();
            expect(pullRequestIntegration.activeProvider).toBe('gitlab');
        });

        it('should detect Bitbucket provider if GitHub and GitLab not connected', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(false);
            mockGitLabProvider.isConnected.mockResolvedValue(false);
            mockBitbucketProvider.isConnected.mockResolvedValue(true);

            const result = await pullRequestIntegration.detectProvider();

            expect(result).toBe(true);
            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitLabProvider.isConnected).toHaveBeenCalled();
            expect(mockBitbucketProvider.isConnected).toHaveBeenCalled();
            expect(pullRequestIntegration.activeProvider).toBe('bitbucket');
        });

        it('should return false if no provider is connected', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(false);
            mockGitLabProvider.isConnected.mockResolvedValue(false);
            mockBitbucketProvider.isConnected.mockResolvedValue(false);

            const result = await pullRequestIntegration.detectProvider();

            expect(result).toBe(false);
            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitLabProvider.isConnected).toHaveBeenCalled();
            expect(mockBitbucketProvider.isConnected).toHaveBeenCalled();
            expect(pullRequestIntegration.activeProvider).toBeNull();
        });
    });

    describe('getOpenPullRequests', () => {
        it('should detect provider if not already active', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(true);
            mockGitHubProvider.getOpenPullRequests.mockResolvedValue([{ id: 'pr1' }]);

            const result = await pullRequestIntegration.getOpenPullRequests();

            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitHubProvider.getOpenPullRequests).toHaveBeenCalled();
            expect(result).toEqual([{ id: 'pr1' }]);
        });

        it('should use GitHub provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'github';
            mockGitHubProvider.getOpenPullRequests.mockResolvedValue([{ id: 'pr1' }]);

            const result = await pullRequestIntegration.getOpenPullRequests();

            expect(mockGitHubProvider.isConnected).not.toHaveBeenCalled();
            expect(mockGitHubProvider.getOpenPullRequests).toHaveBeenCalled();
            expect(result).toEqual([{ id: 'pr1' }]);
        });

        it('should use GitLab provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'gitlab';
            mockGitLabProvider.getOpenPullRequests.mockResolvedValue([{ id: 'mr1' }]);

            const result = await pullRequestIntegration.getOpenPullRequests();

            expect(mockGitLabProvider.getOpenPullRequests).toHaveBeenCalled();
            expect(result).toEqual([{ id: 'mr1' }]);
        });

        it('should use Bitbucket provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'bitbucket';
            mockBitbucketProvider.getOpenPullRequests.mockResolvedValue([{ id: 'pr1' }]);

            const result = await pullRequestIntegration.getOpenPullRequests();

            expect(mockBitbucketProvider.getOpenPullRequests).toHaveBeenCalled();
            expect(result).toEqual([{ id: 'pr1' }]);
        });

        it('should throw error if no provider is detected', async () => {
            // Mock detectProvider to return false
            jest.spyOn(pullRequestIntegration, 'detectProvider').mockResolvedValue(false);

            await expect(pullRequestIntegration.getOpenPullRequests()).rejects.toThrow('No active Git provider detected');
        });
    });

    describe('createPullRequest', () => {
        const title = 'Test PR';
        const description = 'Test description';
        const sourceBranch = 'feature/test';
        const targetBranch = 'main';

        it('should detect provider if not already active', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(true);
            mockGitHubProvider.createPullRequest.mockResolvedValue({ id: 'pr1', title });

            const result = await pullRequestIntegration.createPullRequest(title, description, sourceBranch, targetBranch);

            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitHubProvider.createPullRequest).toHaveBeenCalledWith(title, description, sourceBranch, targetBranch);
            expect(result).toEqual({ id: 'pr1', title });
        });

        it('should use GitHub provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'github';
            mockGitHubProvider.createPullRequest.mockResolvedValue({ id: 'pr1', title });

            const result = await pullRequestIntegration.createPullRequest(title, description, sourceBranch, targetBranch);

            expect(mockGitHubProvider.isConnected).not.toHaveBeenCalled();
            expect(mockGitHubProvider.createPullRequest).toHaveBeenCalledWith(title, description, sourceBranch, targetBranch);
            expect(result).toEqual({ id: 'pr1', title });
        });

        it('should use GitLab provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'gitlab';
            mockGitLabProvider.createPullRequest.mockResolvedValue({ id: 'mr1', title });

            const result = await pullRequestIntegration.createPullRequest(title, description, sourceBranch, targetBranch);

            expect(mockGitLabProvider.createPullRequest).toHaveBeenCalledWith(title, description, sourceBranch, targetBranch);
            expect(result).toEqual({ id: 'mr1', title });
        });

        it('should use Bitbucket provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'bitbucket';
            mockBitbucketProvider.createPullRequest.mockResolvedValue({ id: 'pr1', title });

            const result = await pullRequestIntegration.createPullRequest(title, description, sourceBranch, targetBranch);

            expect(mockBitbucketProvider.createPullRequest).toHaveBeenCalledWith(title, description, sourceBranch, targetBranch);
            expect(result).toEqual({ id: 'pr1', title });
        });

        it('should throw error if no provider is detected', async () => {
            // Mock detectProvider to return false
            jest.spyOn(pullRequestIntegration, 'detectProvider').mockResolvedValue(false);

            await expect(pullRequestIntegration.createPullRequest(title, description, sourceBranch, targetBranch))
                .rejects.toThrow('No active Git provider detected');
        });
    });

    describe('addReviewComment', () => {
        const pullRequestId = 'pr1';
        const filePath = 'src/test.ts';
        const lineNumber = 42;
        const comment = 'This could be improved';

        it('should detect provider if not already active', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(true);
            mockGitHubProvider.addReviewComment.mockResolvedValue(undefined);

            await pullRequestIntegration.addReviewComment(pullRequestId, filePath, lineNumber, comment);

            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitHubProvider.addReviewComment).toHaveBeenCalledWith(pullRequestId, filePath, lineNumber, comment);
        });

        it('should use GitHub provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'github';
            mockGitHubProvider.addReviewComment.mockResolvedValue(undefined);

            await pullRequestIntegration.addReviewComment(pullRequestId, filePath, lineNumber, comment);

            expect(mockGitHubProvider.isConnected).not.toHaveBeenCalled();
            expect(mockGitHubProvider.addReviewComment).toHaveBeenCalledWith(pullRequestId, filePath, lineNumber, comment);
        });

        it('should use GitLab provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'gitlab';
            mockGitLabProvider.addReviewComment.mockResolvedValue(undefined);

            await pullRequestIntegration.addReviewComment(pullRequestId, filePath, lineNumber, comment);

            expect(mockGitLabProvider.addReviewComment).toHaveBeenCalledWith(pullRequestId, filePath, lineNumber, comment);
        });

        it('should use Bitbucket provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'bitbucket';
            mockBitbucketProvider.addReviewComment.mockResolvedValue(undefined);

            await pullRequestIntegration.addReviewComment(pullRequestId, filePath, lineNumber, comment);

            expect(mockBitbucketProvider.addReviewComment).toHaveBeenCalledWith(pullRequestId, filePath, lineNumber, comment);
        });

        it('should throw error if no provider is detected', async () => {
            // Mock detectProvider to return false
            jest.spyOn(pullRequestIntegration, 'detectProvider').mockResolvedValue(false);

            await expect(pullRequestIntegration.addReviewComment(pullRequestId, filePath, lineNumber, comment))
                .rejects.toThrow('No active Git provider detected');
        });
    });

    describe('submitReview', () => {
        const pullRequestId = 'pr1';
        const reviewState = 'approve'; // Using string literal instead of const assertion
        const summary = 'LGTM';

        it('should detect provider if not already active', async () => {
            mockGitHubProvider.isConnected.mockResolvedValue(true);
            mockGitHubProvider.submitReview.mockResolvedValue(undefined);

            await pullRequestIntegration.submitReview(pullRequestId, reviewState, summary);

            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitHubProvider.submitReview).toHaveBeenCalledWith(pullRequestId, reviewState, summary);
        });

        it('should use GitHub provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'github';
            mockGitHubProvider.submitReview.mockResolvedValue(undefined);

            await pullRequestIntegration.submitReview(pullRequestId, reviewState, summary);

            expect(mockGitHubProvider.isConnected).not.toHaveBeenCalled();
            expect(mockGitHubProvider.submitReview).toHaveBeenCalledWith(pullRequestId, reviewState, summary);
        });

        it('should use GitLab provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'gitlab';
            mockGitLabProvider.submitReview.mockResolvedValue(undefined);

            await pullRequestIntegration.submitReview(pullRequestId, reviewState, summary);

            expect(mockGitLabProvider.submitReview).toHaveBeenCalledWith(pullRequestId, reviewState, summary);
        });

        it('should use Bitbucket provider if active', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'bitbucket';
            mockBitbucketProvider.submitReview.mockResolvedValue(undefined);

            await pullRequestIntegration.submitReview(pullRequestId, reviewState, summary);

            expect(mockBitbucketProvider.submitReview).toHaveBeenCalledWith(pullRequestId, reviewState, summary);
        });

        it('should throw error if no provider is detected', async () => {
            // Mock detectProvider to return false
            jest.spyOn(pullRequestIntegration, 'detectProvider').mockResolvedValue(false);

            await expect(pullRequestIntegration.submitReview(pullRequestId, reviewState, summary))
                .rejects.toThrow('No active Git provider detected');
        });
    });

    describe('checkPullRequestQuality', () => {
        const pullRequestId = 'pr1';
        const changedFiles = ['src/file1.ts', 'src/file2.ts'];

        it('should check quality of all changed files', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'github';
            mockGitHubProvider.getChangedFiles.mockResolvedValue(changedFiles);

            // Mock private method
            const mockCheckFileQuality = jest.spyOn(pullRequestIntegration, 'checkFileQuality');
            mockCheckFileQuality.mockResolvedValueOnce([]);
            mockCheckFileQuality.mockResolvedValueOnce(['Issue in file2']);

            const result = await pullRequestIntegration.checkPullRequestQuality(pullRequestId);

            expect(mockGitHubProvider.getChangedFiles).toHaveBeenCalledWith(pullRequestId);
            expect(mockCheckFileQuality).toHaveBeenCalledTimes(2);
            expect(mockCheckFileQuality).toHaveBeenCalledWith(changedFiles[0]);
            expect(mockCheckFileQuality).toHaveBeenCalledWith(changedFiles[1]);
            expect(result).toEqual({
                passed: false,
                issues: ['Issue in file2']
            });
        });

        it('should pass if no issues found', async () => {
            // Set active provider
            pullRequestIntegration.activeProvider = 'github';
            mockGitHubProvider.getChangedFiles.mockResolvedValue(changedFiles);

            // Mock private method
            const mockCheckFileQuality = jest.spyOn(pullRequestIntegration, 'checkFileQuality');
            mockCheckFileQuality.mockResolvedValue([]);

            const result = await pullRequestIntegration.checkPullRequestQuality(pullRequestId);

            expect(result).toEqual({
                passed: true,
                issues: []
            });
        });

        it('should use the correct provider to get changed files', async () => {
            // Test with GitLab provider
            pullRequestIntegration.activeProvider = 'gitlab';
            mockGitLabProvider.getChangedFiles.mockResolvedValue(changedFiles);

            // Mock private method
            const mockCheckFileQuality = jest.spyOn(pullRequestIntegration, 'checkFileQuality');
            mockCheckFileQuality.mockResolvedValue([]);

            await pullRequestIntegration.checkPullRequestQuality(pullRequestId);

            expect(mockGitLabProvider.getChangedFiles).toHaveBeenCalledWith(pullRequestId);

            // Test with Bitbucket provider
            pullRequestIntegration.activeProvider = 'bitbucket';
            mockBitbucketProvider.getChangedFiles.mockResolvedValue(changedFiles);

            await pullRequestIntegration.checkPullRequestQuality(pullRequestId);

            expect(mockBitbucketProvider.getChangedFiles).toHaveBeenCalledWith(pullRequestId);
        });

        it('should detect a provider if none is active', async () => {
            pullRequestIntegration.activeProvider = null;
            mockGitHubProvider.isConnected.mockResolvedValue(true);
            mockGitHubProvider.getChangedFiles.mockResolvedValue(changedFiles);

            // Mock private method
            const mockCheckFileQuality = jest.spyOn(pullRequestIntegration, 'checkFileQuality');
            mockCheckFileQuality.mockResolvedValue([]);

            await pullRequestIntegration.checkPullRequestQuality(pullRequestId);

            expect(mockGitHubProvider.isConnected).toHaveBeenCalled();
            expect(mockGitHubProvider.getChangedFiles).toHaveBeenCalledWith(pullRequestId);
        });

        it('should throw error if no provider is detected', async () => {
            // Mock detectProvider to return false
            jest.spyOn(pullRequestIntegration, 'detectProvider').mockResolvedValue(false);

            await expect(pullRequestIntegration.checkPullRequestQuality(pullRequestId))
                .rejects.toThrow('No active Git provider detected');
        });
    });
});
