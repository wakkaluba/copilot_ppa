import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PullRequestIntegration } from '../../../../src/codeReview/pullRequestIntegration';
import { ReviewChecklist } from '../../../../src/codeReview/reviewChecklist';
import { CodeReviewService } from '../../../../src/codeReview/services/CodeReviewService';

describe('CodeReviewService - TypeScript', () => {
  let codeReviewService: CodeReviewService;
  let sandbox: sinon.SinonSandbox;
  let mockPullRequestIntegration: any;
  let mockReviewChecklist: any;
  let mockVSCode: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mocks
    mockPullRequestIntegration = {
      detectProvider: sandbox.stub().resolves('github'),
      getOpenPullRequests: sandbox.stub().resolves([
        { id: 1, title: 'PR 1', author: 'user1' },
        { id: 2, title: 'PR 2', author: 'user2' }
      ]),
      checkPullRequestQuality: sandbox.stub().resolves({
        totalIssues: 5,
        fileCount: 3,
        suggestions: ['Fix issue 1', 'Fix issue 2']
      }),
      getChangedFiles: sandbox.stub().resolves(['file1.js', 'file2.js']),
      createPullRequest: sandbox.stub().resolves({ id: 3, url: 'https://github.com/user/repo/pull/3' }),
      addReviewComment: sandbox.stub().resolves(true),
      submitReview: sandbox.stub().resolves(true)
    };

    mockReviewChecklist = {
      getChecklistTemplates: sandbox.stub().resolves([
        { id: 'template1', name: 'Template 1', description: 'Description 1', items: [] },
        { id: 'template2', name: 'Template 2', description: 'Description 2', items: [] }
      ]),
      getChecklist: sandbox.stub().resolves({
        id: 'checklist1',
        name: 'Checklist 1',
        items: [
          { id: 'item1', description: 'Item 1 description' },
          { id: 'item2', description: 'Item 2 description' }
        ]
      }),
      createChecklist: sandbox.stub().resolves({
        id: 'newChecklist',
        name: 'New Checklist',
        items: [{ id: 'item1', description: 'Item description' }]
      }),
      generateReport: sandbox.stub().resolves({
        id: 'report1',
        checklistId: 'checklist1',
        results: [{ itemId: 'item1', passed: true }],
        passRate: 1.0
      }),
      updateReport: sandbox.stub().resolves({
        id: 'report1',
        checklistId: 'checklist1',
        results: [{ itemId: 'item1', passed: false }],
        passRate: 0.0
      }),
      getReport: sandbox.stub().resolves({
        id: 'report1',
        checklistId: 'checklist1',
        results: [{ itemId: 'item1', passed: true }],
        passRate: 1.0
      }),
      exportReport: sandbox.stub().resolves()
    };

    // Mock VS Code API
    mockVSCode = {
      window: {
        showInformationMessage: sandbox.stub().resolves(),
        showErrorMessage: sandbox.stub().resolves(),
        showQuickPick: sandbox.stub().resolves({ id: 'template1' }),
        showInputBox: sandbox.stub().resolves('Report name'),
        createWebviewPanel: sandbox.stub().returns({
          webview: {
            html: '',
            onDidReceiveMessage: sandbox.stub()
          },
          onDidDispose: sandbox.stub(),
          reveal: sandbox.stub()
        })
      },
      workspace: {
        openTextDocument: sandbox.stub().resolves({
          getText: sandbox.stub().returns('File content')
        }),
        getConfiguration: sandbox.stub().returns({
          get: sandbox.stub().returns(true),
          update: sandbox.stub().resolves()
        })
      }
    };

    // Replace the VS Code API with mock
    sandbox.stub(vscode, 'window').value(mockVSCode.window as any);
    sandbox.stub(vscode, 'workspace').value(mockVSCode.workspace as any);

    // Create the service with mocks
    codeReviewService = new CodeReviewService();

    // Set mock dependencies
    (codeReviewService as any).pullRequestIntegration = mockPullRequestIntegration;
    (codeReviewService as any).reviewChecklist = mockReviewChecklist;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should initialize with default dependencies if not provided', () => {
      const service = new CodeReviewService();

      expect(service).to.be.an('object');
      expect((service as any).pullRequestIntegration).to.be.an('object');
      expect((service as any).reviewChecklist).to.be.an('object');
    });

    it('should use provided dependencies if provided', () => {
      const customPRIntegration = {} as PullRequestIntegration;
      const customReviewChecklist = {} as ReviewChecklist;

      const service = new CodeReviewService(customPRIntegration, customReviewChecklist);

      expect((service as any).pullRequestIntegration).to.equal(customPRIntegration);
      expect((service as any).reviewChecklist).to.equal(customReviewChecklist);
    });
  });

  describe('getPullRequests', () => {
    it('should fetch pull requests from the PR integration', async () => {
      const pullRequests = await codeReviewService.getPullRequests();

      expect(pullRequests).to.be.an('array');
      expect(pullRequests.length).to.equal(2);
      expect(pullRequests[0]).to.have.property('id', 1);
      expect(pullRequests[1]).to.have.property('id', 2);
      expect(mockPullRequestIntegration.getOpenPullRequests.calledOnce).to.be.true;
    });

    it('should handle errors and return an empty array', async () => {
      mockPullRequestIntegration.getOpenPullRequests.rejects(new Error('Failed to get PRs'));

      const pullRequests = await codeReviewService.getPullRequests();

      expect(pullRequests).to.be.an('array');
      expect(pullRequests.length).to.equal(0);
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('checkPullRequestQuality', () => {
    it('should check pull request quality and return results', async () => {
      const results = await codeReviewService.checkPullRequestQuality(1);

      expect(results).to.be.an('object');
      expect(results).to.have.property('totalIssues', 5);
      expect(results).to.have.property('fileCount', 3);
      expect(results.suggestions).to.be.an('array');
      expect(results.suggestions.length).to.equal(2);
      expect(mockPullRequestIntegration.checkPullRequestQuality.calledOnce).to.be.true;
      expect(mockPullRequestIntegration.checkPullRequestQuality.calledWith(1)).to.be.true;
    });

    it('should handle errors and return default result', async () => {
      mockPullRequestIntegration.checkPullRequestQuality.rejects(new Error('Failed to check PR quality'));

      const results = await codeReviewService.checkPullRequestQuality(1);

      expect(results).to.be.an('object');
      expect(results).to.have.property('totalIssues', 0);
      expect(results).to.have.property('fileCount', 0);
      expect(results.suggestions).to.be.an('array');
      expect(results.suggestions.length).to.equal(0);
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('getChangedFiles', () => {
    it('should get changed files for a pull request', async () => {
      const files = await codeReviewService.getChangedFiles(1);

      expect(files).to.be.an('array');
      expect(files.length).to.equal(2);
      expect(files[0]).to.equal('file1.js');
      expect(files[1]).to.equal('file2.js');
      expect(mockPullRequestIntegration.getChangedFiles.calledOnce).to.be.true;
      expect(mockPullRequestIntegration.getChangedFiles.calledWith(1)).to.be.true;
    });

    it('should handle errors and return an empty array', async () => {
      mockPullRequestIntegration.getChangedFiles.rejects(new Error('Failed to get changed files'));

      const files = await codeReviewService.getChangedFiles(1);

      expect(files).to.be.an('array');
      expect(files.length).to.equal(0);
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('createPullRequest', () => {
    it('should create a new pull request', async () => {
      const result = await codeReviewService.createPullRequest(
        'New PR',
        'PR Description',
        'feature-branch',
        'main'
      );

      expect(result).to.be.an('object');
      expect(result).to.have.property('id', 3);
      expect(result).to.have.property('url', 'https://github.com/user/repo/pull/3');
      expect(mockPullRequestIntegration.createPullRequest.calledOnce).to.be.true;
      expect(mockPullRequestIntegration.createPullRequest.calledWith(
        'New PR', 'PR Description', 'feature-branch', 'main'
      )).to.be.true;
      expect(mockVSCode.window.showInformationMessage.calledOnce).to.be.true;
    });

    it('should handle errors when creating pull request', async () => {
      mockPullRequestIntegration.createPullRequest.rejects(new Error('Failed to create PR'));

      const result = await codeReviewService.createPullRequest(
        'New PR',
        'PR Description',
        'feature-branch',
        'main'
      );

      expect(result).to.be.null;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('addReviewComment', () => {
    it('should add a review comment to a pull request', async () => {
      const success = await codeReviewService.addReviewComment(1, 'file.js', 10, 'This is a comment');

      expect(success).to.be.true;
      expect(mockPullRequestIntegration.addReviewComment.calledOnce).to.be.true;
      expect(mockPullRequestIntegration.addReviewComment.calledWith(
        1, 'file.js', 10, 'This is a comment'
      )).to.be.true;
      expect(mockVSCode.window.showInformationMessage.calledOnce).to.be.true;
    });

    it('should handle errors when adding a review comment', async () => {
      mockPullRequestIntegration.addReviewComment.rejects(new Error('Failed to add comment'));

      const success = await codeReviewService.addReviewComment(1, 'file.js', 10, 'This is a comment');

      expect(success).to.be.false;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });

    it('should handle failed comment addition gracefully', async () => {
      mockPullRequestIntegration.addReviewComment.resolves(false);

      const success = await codeReviewService.addReviewComment(1, 'file.js', 10, 'This is a comment');

      expect(success).to.be.false;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('submitReview', () => {
    it('should submit a review for a pull request', async () => {
      const success = await codeReviewService.submitReview(1, 'APPROVE', 'LGTM');

      expect(success).to.be.true;
      expect(mockPullRequestIntegration.submitReview.calledOnce).to.be.true;
      expect(mockPullRequestIntegration.submitReview.calledWith(1, 'APPROVE', 'LGTM')).to.be.true;
      expect(mockVSCode.window.showInformationMessage.calledOnce).to.be.true;
    });

    it('should handle errors when submitting a review', async () => {
      mockPullRequestIntegration.submitReview.rejects(new Error('Failed to submit review'));

      const success = await codeReviewService.submitReview(1, 'APPROVE', 'LGTM');

      expect(success).to.be.false;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });

    it('should handle failed review submission gracefully', async () => {
      mockPullRequestIntegration.submitReview.resolves(false);

      const success = await codeReviewService.submitReview(1, 'APPROVE', 'LGTM');

      expect(success).to.be.false;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('getChecklistTemplates', () => {
    it('should get available checklist templates', async () => {
      const templates = await codeReviewService.getChecklistTemplates();

      expect(templates).to.be.an('array');
      expect(templates.length).to.equal(2);
      expect(templates[0]).to.have.property('id', 'template1');
      expect(templates[1]).to.have.property('id', 'template2');
      expect(mockReviewChecklist.getChecklistTemplates.calledOnce).to.be.true;
    });

    it('should handle errors and return an empty array', async () => {
      mockReviewChecklist.getChecklistTemplates.rejects(new Error('Failed to get templates'));

      const templates = await codeReviewService.getChecklistTemplates();

      expect(templates).to.be.an('array');
      expect(templates.length).to.equal(0);
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('getChecklist', () => {
    it('should get a checklist by ID', async () => {
      const checklist = await codeReviewService.getChecklist('checklist1');

      expect(checklist).to.be.an('object');
      expect(checklist).to.have.property('id', 'checklist1');
      expect(checklist).to.have.property('name', 'Checklist 1');
      expect(checklist.items).to.be.an('array');
      expect(checklist.items.length).to.equal(2);
      expect(mockReviewChecklist.getChecklist.calledOnce).to.be.true;
      expect(mockReviewChecklist.getChecklist.calledWith('checklist1')).to.be.true;
    });

    it('should handle errors and return null', async () => {
      mockReviewChecklist.getChecklist.rejects(new Error('Failed to get checklist'));

      const checklist = await codeReviewService.getChecklist('checklist1');

      expect(checklist).to.be.null;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('createChecklist', () => {
    it('should create a new checklist', async () => {
      const checklistData = {
        name: 'New Checklist',
        items: [{ id: 'item1', description: 'Item description' }]
      };

      const checklist = await codeReviewService.createChecklist(checklistData);

      expect(checklist).to.be.an('object');
      expect(checklist).to.have.property('id', 'newChecklist');
      expect(checklist).to.have.property('name', 'New Checklist');
      expect(checklist.items).to.be.an('array');
      expect(checklist.items.length).to.equal(1);
      expect(mockReviewChecklist.createChecklist.calledOnce).to.be.true;
      expect(mockReviewChecklist.createChecklist.calledWith(checklistData)).to.be.true;
      expect(mockVSCode.window.showInformationMessage.calledOnce).to.be.true;
    });

    it('should handle errors when creating a checklist', async () => {
      mockReviewChecklist.createChecklist.rejects(new Error('Failed to create checklist'));

      const checklistData = {
        name: 'New Checklist',
        items: [{ id: 'item1', description: 'Item description' }]
      };

      const checklist = await codeReviewService.createChecklist(checklistData);

      expect(checklist).to.be.null;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('generateReport', () => {
    it('should generate a report for a checklist', async () => {
      const results = [{ itemId: 'item1', passed: true }];

      const report = await codeReviewService.generateReport('checklist1', results);

      expect(report).to.be.an('object');
      expect(report).to.have.property('id', 'report1');
      expect(report).to.have.property('checklistId', 'checklist1');
      expect(report.results).to.be.an('array');
      expect(report.results.length).to.equal(1);
      expect(report).to.have.property('passRate', 1.0);
      expect(mockReviewChecklist.generateReport.calledOnce).to.be.true;
      expect(mockReviewChecklist.generateReport.calledWith('checklist1', results)).to.be.true;
      expect(mockVSCode.window.showInformationMessage.calledOnce).to.be.true;
    });

    it('should handle errors when generating a report', async () => {
      mockReviewChecklist.generateReport.rejects(new Error('Failed to generate report'));

      const results = [{ itemId: 'item1', passed: true }];

      const report = await codeReviewService.generateReport('checklist1', results);

      expect(report).to.be.null;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('updateReport', () => {
    it('should update an existing report', async () => {
      const updatedData = {
        results: [{ itemId: 'item1', passed: false }]
      };

      const report = await codeReviewService.updateReport('report1', updatedData);

      expect(report).to.be.an('object');
      expect(report).to.have.property('id', 'report1');
      expect(report.results).to.be.an('array');
      expect(report.results[0].passed).to.be.false;
      expect(report).to.have.property('passRate', 0.0);
      expect(mockReviewChecklist.updateReport.calledOnce).to.be.true;
      expect(mockReviewChecklist.updateReport.calledWith('report1', updatedData)).to.be.true;
      expect(mockVSCode.window.showInformationMessage.calledOnce).to.be.true;
    });

    it('should handle errors when updating a report', async () => {
      mockReviewChecklist.updateReport.rejects(new Error('Failed to update report'));

      const updatedData = {
        results: [{ itemId: 'item1', passed: false }]
      };

      const report = await codeReviewService.updateReport('report1', updatedData);

      expect(report).to.be.null;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('getReport', () => {
    it('should get a report by ID', async () => {
      const report = await codeReviewService.getReport('report1');

      expect(report).to.be.an('object');
      expect(report).to.have.property('id', 'report1');
      expect(report).to.have.property('checklistId', 'checklist1');
      expect(report.results).to.be.an('array');
      expect(report.results[0].passed).to.be.true;
      expect(report).to.have.property('passRate', 1.0);
      expect(mockReviewChecklist.getReport.calledOnce).to.be.true;
      expect(mockReviewChecklist.getReport.calledWith('report1')).to.be.true;
    });

    it('should handle errors and return null', async () => {
      mockReviewChecklist.getReport.rejects(new Error('Failed to get report'));

      const report = await codeReviewService.getReport('report1');

      expect(report).to.be.null;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('exportReport', () => {
    it('should export a report', async () => {
      const success = await codeReviewService.exportReport('report1', 'markdown');

      expect(success).to.be.true;
      expect(mockReviewChecklist.exportReport.calledOnce).to.be.true;
      expect(mockReviewChecklist.exportReport.calledWith('report1', 'markdown')).to.be.true;
      expect(mockVSCode.window.showInformationMessage.calledOnce).to.be.true;
    });

    it('should handle errors when exporting a report', async () => {
      mockReviewChecklist.exportReport.rejects(new Error('Failed to export report'));

      const success = await codeReviewService.exportReport('report1', 'markdown');

      expect(success).to.be.false;
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('getGitProvider', () => {
    it('should detect the Git provider', async () => {
      const provider = await codeReviewService.getGitProvider();

      expect(provider).to.equal('github');
      expect(mockPullRequestIntegration.detectProvider.calledOnce).to.be.true;
    });

    it('should handle errors and return "unknown"', async () => {
      mockPullRequestIntegration.detectProvider.rejects(new Error('Failed to detect provider'));

      const provider = await codeReviewService.getGitProvider();

      expect(provider).to.equal('unknown');
      expect(mockVSCode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('showReviewPanel', () => {
    it('should create and show a webview panel', () => {
      codeReviewService.showReviewPanel();

      expect(mockVSCode.window.createWebviewPanel.calledOnce).to.be.true;
    });

    it('should reuse an existing panel if it exists', () => {
      // First call creates a panel
      codeReviewService.showReviewPanel();
      expect(mockVSCode.window.createWebviewPanel.calledOnce).to.be.true;

      // Set the panel
      (codeReviewService as any).panel = {
        reveal: sandbox.stub(),
        webview: { html: '' }
      };

      // Second call reuses the panel
      codeReviewService.showReviewPanel();
      expect(mockVSCode.window.createWebviewPanel.calledOnce).to.be.true;
      expect((codeReviewService as any).panel.reveal.calledOnce).to.be.true;
    });
  });
});
