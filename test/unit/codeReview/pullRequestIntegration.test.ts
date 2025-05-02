import { expect } from 'chai';
import * as sinon from 'sinon';
import { PullRequestIntegration } from '../../../src/codeReview/pullRequestIntegration';

describe('PullRequestIntegration - TypeScript', () => {
  let pullRequestIntegration: PullRequestIntegration;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    pullRequestIntegration = new PullRequestIntegration();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('detectProvider', () => {
    it('should detect GitHub provider if .git/config contains github.com URL', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(true),
        readFileSync: sandbox.stub().returns('url = https://github.com/user/repo.git')
      };

      // Replace file system module using stubbing
      const originalFs = require('fs');
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.detectProvider();

      expect(result).to.equal('github');
      expect(mockFs.existsSync.calledOnce).to.be.true;
      expect(mockFs.readFileSync.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should detect GitLab provider if .git/config contains gitlab.com URL', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(true),
        readFileSync: sandbox.stub().returns('url = https://gitlab.com/user/repo.git')
      };

      // Replace file system module using stubbing
      const originalFs = require('fs');
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.detectProvider();

      expect(result).to.equal('gitlab');
      expect(mockFs.existsSync.calledOnce).to.be.true;
      expect(mockFs.readFileSync.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should detect Bitbucket provider if .git/config contains bitbucket.org URL', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(true),
        readFileSync: sandbox.stub().returns('url = https://bitbucket.org/user/repo.git')
      };

      // Replace file system module using stubbing
      const originalFs = require('fs');
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.detectProvider();

      expect(result).to.equal('bitbucket');
      expect(mockFs.existsSync.calledOnce).to.be.true;
      expect(mockFs.readFileSync.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should return unknown if no recognized provider is found', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(true),
        readFileSync: sandbox.stub().returns('url = https://unknown-git.com/user/repo.git')
      };

      // Replace file system module using stubbing
      const originalFs = require('fs');
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.detectProvider();

      expect(result).to.equal('unknown');
      expect(mockFs.existsSync.calledOnce).to.be.true;
      expect(mockFs.readFileSync.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should return unknown if .git folder does not exist', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(false)
      };

      // Replace file system module using stubbing
      const originalFs = require('fs');
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.detectProvider();

      expect(result).to.equal('unknown');
      expect(mockFs.existsSync.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });
  });

  describe('getOpenPullRequests', () => {
    it('should return GitHub pull requests when provider is GitHub', async () => {
      // Mock axios for API calls
      const mockAxios = {
        get: sandbox.stub().resolves({
          data: [
            { number: 1, title: 'PR 1', user: { login: 'user1' } },
            { number: 2, title: 'PR 2', user: { login: 'user2' } }
          ]
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('github');

      const pullRequests = await pullRequestIntegration.getOpenPullRequests();

      expect(pullRequests).to.be.an('array');
      expect(pullRequests.length).to.equal(2);
      expect(pullRequests[0]).to.have.property('id', 1);
      expect(pullRequests[0]).to.have.property('title', 'PR 1');
      expect(pullRequests[0]).to.have.property('author', 'user1');

      // Restore stub
      requireStub.restore();
    });

    it('should return GitLab merge requests when provider is GitLab', async () => {
      // Mock axios for API calls
      const mockAxios = {
        get: sandbox.stub().resolves({
          data: [
            { iid: 1, title: 'MR 1', author: { username: 'user1' } },
            { iid: 2, title: 'MR 2', author: { username: 'user2' } }
          ]
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('gitlab');

      const pullRequests = await pullRequestIntegration.getOpenPullRequests();

      expect(pullRequests).to.be.an('array');
      expect(pullRequests.length).to.equal(2);
      expect(pullRequests[0]).to.have.property('id', 1);
      expect(pullRequests[0]).to.have.property('title', 'MR 1');
      expect(pullRequests[0]).to.have.property('author', 'user1');

      // Restore stub
      requireStub.restore();
    });

    it('should return Bitbucket pull requests when provider is Bitbucket', async () => {
      // Mock axios for API calls
      const mockAxios = {
        get: sandbox.stub().resolves({
          data: {
            values: [
              { id: 1, title: 'PR 1', author: { display_name: 'User 1' } },
              { id: 2, title: 'PR 2', author: { display_name: 'User 2' } }
            ]
          }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('bitbucket');

      const pullRequests = await pullRequestIntegration.getOpenPullRequests();

      expect(pullRequests).to.be.an('array');
      expect(pullRequests.length).to.equal(2);
      expect(pullRequests[0]).to.have.property('id', 1);
      expect(pullRequests[0]).to.have.property('title', 'PR 1');
      expect(pullRequests[0]).to.have.property('author', 'User 1');

      // Restore stub
      requireStub.restore();
    });

    it('should return empty array for unknown provider', async () => {
      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('unknown');

      const pullRequests = await pullRequestIntegration.getOpenPullRequests();

      expect(pullRequests).to.be.an('array');
      expect(pullRequests.length).to.equal(0);
    });
  });

  describe('createPullRequest', () => {
    it('should create a GitHub pull request when provider is GitHub', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { number: 1, html_url: 'https://github.com/user/repo/pull/1' }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('github');

      const result = await pullRequestIntegration.createPullRequest(
        'Test PR',
        'PR Description',
        'feature-branch',
        'main'
      );

      expect(result).to.be.an('object');
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('url', 'https://github.com/user/repo/pull/1');
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should create a GitLab merge request when provider is GitLab', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { iid: 1, web_url: 'https://gitlab.com/user/repo/-/merge_requests/1' }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('gitlab');

      const result = await pullRequestIntegration.createPullRequest(
        'Test MR',
        'MR Description',
        'feature-branch',
        'main'
      );

      expect(result).to.be.an('object');
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('url', 'https://gitlab.com/user/repo/-/merge_requests/1');
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should create a Bitbucket pull request when provider is Bitbucket', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { id: 1, links: { html: { href: 'https://bitbucket.org/user/repo/pull-requests/1' } } }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('bitbucket');

      const result = await pullRequestIntegration.createPullRequest(
        'Test PR',
        'PR Description',
        'feature-branch',
        'main'
      );

      expect(result).to.be.an('object');
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('url', 'https://bitbucket.org/user/repo/pull-requests/1');
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should return null for unknown provider', async () => {
      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('unknown');

      const result = await pullRequestIntegration.createPullRequest(
        'Test PR',
        'PR Description',
        'feature-branch',
        'main'
      );

      expect(result).to.be.null;
    });
  });

  describe('addReviewComment', () => {
    it('should add a review comment to a GitHub pull request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { id: 123, body: 'Test comment' }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('github');

      const result = await pullRequestIntegration.addReviewComment(1, 'file.js', 10, 'Test comment');

      expect(result).to.be.true;
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should add a review comment to a GitLab merge request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { id: 123, body: 'Test comment' }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('gitlab');

      const result = await pullRequestIntegration.addReviewComment(1, 'file.js', 10, 'Test comment');

      expect(result).to.be.true;
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should add a review comment to a Bitbucket pull request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { id: 123, content: { raw: 'Test comment' } }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('bitbucket');

      const result = await pullRequestIntegration.addReviewComment(1, 'file.js', 10, 'Test comment');

      expect(result).to.be.true;
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should return false for unknown provider', async () => {
      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('unknown');

      const result = await pullRequestIntegration.addReviewComment(1, 'file.js', 10, 'Test comment');

      expect(result).to.be.false;
    });
  });

  describe('submitReview', () => {
    it('should submit a review to a GitHub pull request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { id: 123, state: 'APPROVED' }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('github');

      const result = await pullRequestIntegration.submitReview(1, 'APPROVE', 'Looks good!');

      expect(result).to.be.true;
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should submit a review to a GitLab merge request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { id: 123 }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('gitlab');

      const result = await pullRequestIntegration.submitReview(1, 'APPROVE', 'Looks good!');

      expect(result).to.be.true;
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should submit a review to a Bitbucket pull request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        post: sandbox.stub().resolves({
          data: { approved: true }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('bitbucket');

      const result = await pullRequestIntegration.submitReview(1, 'APPROVE', 'Looks good!');

      expect(result).to.be.true;
      expect(mockAxios.post.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should return false for unknown provider', async () => {
      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('unknown');

      const result = await pullRequestIntegration.submitReview(1, 'APPROVE', 'Looks good!');

      expect(result).to.be.false;
    });
  });

  describe('checkPullRequestQuality', () => {
    it('should check quality of a pull request', async () => {
      // Mock the getChangedFiles and checkFileQuality methods
      sandbox.stub(pullRequestIntegration, 'getChangedFiles').resolves([
        'file1.js',
        'file2.js'
      ]);

      const checkFileQualityStub = sandbox.stub(pullRequestIntegration, 'checkFileQuality');
      checkFileQualityStub.onFirstCall().resolves({ issues: 2, suggestions: ['Fix issue 1', 'Fix issue 2'] });
      checkFileQualityStub.onSecondCall().resolves({ issues: 1, suggestions: ['Fix issue 3'] });

      const result = await pullRequestIntegration.checkPullRequestQuality(1);

      expect(result).to.be.an('object');
      expect(result).to.have.property('totalIssues', 3);
      expect(result).to.have.property('fileCount', 2);
      expect(result).to.have.property('suggestions').that.is.an('array');
      expect(result.suggestions).to.have.lengthOf(3);
      expect(result.suggestions).to.include('Fix issue 1');
      expect(result.suggestions).to.include('Fix issue 2');
      expect(result.suggestions).to.include('Fix issue 3');
    });

    it('should handle errors and return default quality result', async () => {
      // Mock the getChangedFiles method to throw an error
      sandbox.stub(pullRequestIntegration, 'getChangedFiles').rejects(new Error('Failed to get files'));

      const result = await pullRequestIntegration.checkPullRequestQuality(1);

      expect(result).to.be.an('object');
      expect(result).to.have.property('totalIssues', 0);
      expect(result).to.have.property('fileCount', 0);
      expect(result).to.have.property('suggestions').that.is.an('array');
      expect(result.suggestions).to.have.lengthOf(0);
    });
  });

  describe('getChangedFiles', () => {
    it('should get changed files from a GitHub pull request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        get: sandbox.stub().resolves({
          data: [
            { filename: 'file1.js' },
            { filename: 'file2.js' }
          ]
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('github');

      const result = await pullRequestIntegration.getChangedFiles(1);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result).to.include('file1.js');
      expect(result).to.include('file2.js');
      expect(mockAxios.get.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should get changed files from a GitLab merge request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        get: sandbox.stub().resolves({
          data: [
            { new_path: 'file1.js' },
            { new_path: 'file2.js' }
          ]
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('gitlab');

      const result = await pullRequestIntegration.getChangedFiles(1);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result).to.include('file1.js');
      expect(result).to.include('file2.js');
      expect(mockAxios.get.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should get changed files from a Bitbucket pull request', async () => {
      // Mock axios for API calls
      const mockAxios = {
        get: sandbox.stub().resolves({
          data: {
            values: [
              { path: 'file1.js' },
              { path: 'file2.js' }
            ]
          }
        })
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('axios').returns(mockAxios);
      requireStub.callThrough();

      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('bitbucket');

      const result = await pullRequestIntegration.getChangedFiles(1);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result).to.include('file1.js');
      expect(result).to.include('file2.js');
      expect(mockAxios.get.calledOnce).to.be.true;

      // Restore stub
      requireStub.restore();
    });

    it('should return empty array for unknown provider', async () => {
      // Mock detectProvider
      sandbox.stub(pullRequestIntegration, 'detectProvider').resolves('unknown');

      const result = await pullRequestIntegration.getChangedFiles(1);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('checkFileQuality', () => {
    it('should check JavaScript file quality', async () => {
      // Mock file system operations
      const mockFs = {
        readFileSync: sandbox.stub().returns('// JavaScript code with potential issues')
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.checkFileQuality('file.js');

      expect(result).to.be.an('object');
      expect(result).to.have.property('issues').that.is.a('number');
      expect(result).to.have.property('suggestions').that.is.an('array');

      // Restore stub
      requireStub.restore();
    });

    it('should check TypeScript file quality', async () => {
      // Mock file system operations
      const mockFs = {
        readFileSync: sandbox.stub().returns('// TypeScript code with potential issues')
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.checkFileQuality('file.ts');

      expect(result).to.be.an('object');
      expect(result).to.have.property('issues').that.is.a('number');
      expect(result).to.have.property('suggestions').that.is.an('array');

      // Restore stub
      requireStub.restore();
    });

    it('should handle errors and return default quality result', async () => {
      // Mock file system operations to throw an error
      const mockFs = {
        readFileSync: sandbox.stub().throws(new Error('File not found'))
      };

      // Replace modules using stubbing
      const requireStub = sandbox.stub(global, 'require');
      requireStub.withArgs('fs').returns(mockFs);
      requireStub.callThrough();

      const result = await pullRequestIntegration.checkFileQuality('file.js');

      expect(result).to.be.an('object');
      expect(result).to.have.property('issues', 0);
      expect(result).to.have.property('suggestions').that.is.an('array');
      expect(result.suggestions).to.have.lengthOf(0);

      // Restore stub
      requireStub.restore();
    });
  });
});
