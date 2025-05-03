const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { ReviewChecklist } = require('../../../src/codeReview/reviewChecklist');
const { ReviewChecklistError } = require('../../../src/codeReview/errors/ReviewChecklistError');
const { Logger } = require('../../../src/utils/logging');

describe('ReviewChecklist - JavaScript', () => {
  let reviewChecklist;
  let sandbox;
  let mockContext;
  let mockService;
  let mockLogger;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code context
    mockContext = {
      subscriptions: [],
      extensionPath: '/path/to/extension',
      storageUri: { fsPath: '/path/to/storage' },
      globalStorageUri: { fsPath: '/path/to/global/storage' },
      logUri: { fsPath: '/path/to/logs' },
      extensionUri: { fsPath: '/path/to/extension' },
      environmentVariableCollection: {},
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(),
        setKeysForSync: sandbox.stub()
      },
      workspaceState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(),
        setKeysForSync: sandbox.stub()
      },
      secrets: {
        get: sandbox.stub().resolves(''),
        store: sandbox.stub().resolves(),
        delete: sandbox.stub().resolves()
      },
      asAbsolutePath: (relativePath) => `/path/to/extension/${relativePath}`
    };

    // Mock ReviewChecklistService
    mockService = {
      getAvailableChecklists: sandbox.stub(),
      getChecklist: sandbox.stub(),
      createChecklist: sandbox.stub(),
      generateReport: sandbox.stub(),
      updateReport: sandbox.stub(),
      getReportHistory: sandbox.stub(),
      exportReportToHtml: sandbox.stub()
    };

    // Mock logger
    mockLogger = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      warn: sandbox.stub(),
      debug: sandbox.stub(),
      log: sandbox.stub()
    };

    // Set up LoggerService.getInstance to return our mock
    sandbox.stub(Logger, 'getInstance').returns(mockLogger);

    // Create ReviewChecklist instance
    reviewChecklist = new ReviewChecklist(mockContext);

    // Replace the service with our mock
    reviewChecklist.service = mockService;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should initialize with extension context', () => {
      const checklist = new ReviewChecklist(mockContext);
      expect(checklist).to.be.an.instanceOf(ReviewChecklist);
    });

    it('should set up logger', () => {
      const loggerStub = sandbox.stub(Logger, 'getInstance');
      new ReviewChecklist(mockContext);
      expect(loggerStub.called).to.be.true;
    });
  });

  describe('getAvailableChecklists', () => {
    it('should return checklists from service', () => {
      const mockChecklists = ['checklist1', 'checklist2'];
      mockService.getAvailableChecklists.returns(mockChecklists);

      const result = reviewChecklist.getAvailableChecklists();

      expect(mockService.getAvailableChecklists.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockChecklists);
    });

    it('should handle errors and return empty array', () => {
      mockService.getAvailableChecklists.throws(new Error('Service error'));

      const result = reviewChecklist.getAvailableChecklists();

      expect(mockLogger.error.calledOnce).to.be.true;
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getChecklist', () => {
    it('should return checklist from service', () => {
      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' },
          { id: 'item2', description: 'Test item 2' }
        ]
      };
      mockService.getChecklist.withArgs('testChecklist').returns(mockChecklist);

      const result = reviewChecklist.getChecklist('testChecklist');

      expect(mockService.getChecklist.calledWith('testChecklist')).to.be.true;
      expect(result).to.deep.equal(mockChecklist);
    });

    it('should handle errors and return undefined', () => {
      mockService.getChecklist.throws(new Error('Service error'));

      try {
        reviewChecklist.getChecklist('testChecklist');
        // This line should not be reached
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('createChecklist', () => {
    it('should validate and create checklist via service', () => {
      const name = 'newChecklist';
      const items = [
        { id: 'item1', description: 'Test item 1' },
        { id: 'item2', description: 'Test item 2' }
      ];

      reviewChecklist.createChecklist(name, items);

      expect(mockService.createChecklist.calledWith(name, items)).to.be.true;
    });

    it('should validate checklist items', () => {
      const name = 'newChecklist';
      const invalidItems = []; // Empty array is invalid

      try {
        reviewChecklist.createChecklist(name, invalidItems);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Checklist items must be a non-empty array');
        expect(mockService.createChecklist.called).to.be.false;
      }
    });

    it('should validate each checklist item has id and description', () => {
      const name = 'newChecklist';
      const invalidItems = [
        { id: 'item1' } // Missing description
      ];

      try {
        reviewChecklist.createChecklist(name, invalidItems);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Each checklist item must have an id and description');
        expect(mockService.createChecklist.called).to.be.false;
      }
    });

    it('should handle service errors', () => {
      const name = 'newChecklist';
      const items = [
        { id: 'item1', description: 'Test item 1' }
      ];

      mockService.createChecklist.throws(new Error('Service error'));

      try {
        reviewChecklist.createChecklist(name, items);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('generateReport', () => {
    it('should generate report via service', () => {
      const checklistName = 'testChecklist';
      const filePaths = ['/path/to/file1.ts', '/path/to/file2.ts'];
      const reviewerId = 'user123';
      const mockReport = {
        id: 'report-123',
        checklistName,
        filePaths,
        reviewerId,
        results: [],
        summary: '',
        approved: false,
        timestamp: new Date().toISOString()
      };

      mockService.generateReport.returns(mockReport);

      const result = reviewChecklist.generateReport(checklistName, filePaths, reviewerId);

      expect(mockService.generateReport.calledWith(checklistName, filePaths, reviewerId)).to.be.true;
      expect(result).to.deep.equal(mockReport);
    });

    it('should handle service errors and return an empty report', () => {
      const checklistName = 'testChecklist';
      const filePaths = ['/path/to/file.ts'];
      const reviewerId = 'user123';

      mockService.generateReport.throws(new Error('Service error'));

      const result = reviewChecklist.generateReport(checklistName, filePaths, reviewerId);

      expect(mockLogger.error.calledOnce).to.be.true;
      expect(result).to.be.an('object');
      expect(result.id).to.include('error-');
      expect(result.checklistName).to.equal(checklistName);
      expect(result.filePaths).to.deep.equal(filePaths);
      expect(result.reviewerId).to.equal(reviewerId);
      expect(result.results).to.be.an('array').that.is.empty;
      expect(result.summary).to.equal('Error generating report');
      expect(result.approved).to.be.false;
    });
  });

  describe('updateReport', () => {
    it('should validate and update report via service', () => {
      const reportId = 'report-123';
      const results = [
        { itemId: 'item1', passed: true, comment: 'Looks good' }
      ];
      const summary = 'Report summary';
      const approved = true;

      reviewChecklist.updateReport(reportId, results, summary, approved);

      expect(mockService.updateReport.calledWith(reportId, results, summary, approved)).to.be.true;
    });

    it('should validate results', () => {
      const reportId = 'report-123';
      const invalidResults = 'not an array'; // Not an array
      const summary = 'Report summary';
      const approved = true;

      try {
        reviewChecklist.updateReport(reportId, invalidResults, summary, approved);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Results must be an array');
        expect(mockService.updateReport.called).to.be.false;
      }
    });

    it('should validate each result has itemId and passed property', () => {
      const reportId = 'report-123';
      const invalidResults = [
        { itemId: 'item1' } // Missing passed property
      ];
      const summary = 'Report summary';
      const approved = true;

      try {
        reviewChecklist.updateReport(reportId, invalidResults, summary, approved);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Each result must have an itemId and passed status');
        expect(mockService.updateReport.called).to.be.false;
      }
    });

    it('should handle service errors', () => {
      const reportId = 'report-123';
      const results = [
        { itemId: 'item1', passed: true, comment: 'Looks good' }
      ];
      const summary = 'Report summary';
      const approved = true;

      mockService.updateReport.throws(new Error('Service error'));

      try {
        reviewChecklist.updateReport(reportId, results, summary, approved);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('getReportHistory', () => {
    it('should get report history via service with default limit', () => {
      const mockReports = [
        { id: 'report-1', timestamp: new Date().toISOString() },
        { id: 'report-2', timestamp: new Date().toISOString() }
      ];
      mockService.getReportHistory.returns(mockReports);

      const result = reviewChecklist.getReportHistory();

      expect(mockService.getReportHistory.calledWith(10)).to.be.true;
      expect(result).to.deep.equal(mockReports);
    });

    it('should get report history via service with custom limit', () => {
      const mockReports = [
        { id: 'report-1', timestamp: new Date().toISOString() }
      ];
      mockService.getReportHistory.returns(mockReports);

      const result = reviewChecklist.getReportHistory(1);

      expect(mockService.getReportHistory.calledWith(1)).to.be.true;
      expect(result).to.deep.equal(mockReports);
    });

    it('should handle service errors and return empty array', () => {
      mockService.getReportHistory.throws(new Error('Service error'));

      const result = reviewChecklist.getReportHistory();

      expect(mockLogger.error.calledOnce).to.be.true;
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('exportReportToHtml', () => {
    it('should export report to HTML via service', () => {
      const reportId = 'report-123';
      const mockHtml = '<html><body>Report content</body></html>';
      mockService.exportReportToHtml.returns(mockHtml);

      const result = reviewChecklist.exportReportToHtml(reportId);

      expect(mockService.exportReportToHtml.calledWith(reportId)).to.be.true;
      expect(result).to.equal(mockHtml);
    });

    it('should handle service errors and return error HTML', () => {
      const reportId = 'report-123';
      mockService.exportReportToHtml.throws(new Error('Service error'));

      const result = reviewChecklist.exportReportToHtml(reportId);

      expect(mockLogger.error.calledOnce).to.be.true;
      expect(result).to.include('<h1>Error Exporting Report</h1>');
      expect(result).to.include(reportId);
    });
  });

  describe('dispose', () => {
    it('should dispose all disposables', () => {
      const disposeStub1 = sandbox.stub();
      const disposeStub2 = sandbox.stub();
      reviewChecklist.disposables = [
        { dispose: disposeStub1 },
        { dispose: disposeStub2 }
      ];

      reviewChecklist.dispose();

      expect(disposeStub1.calledOnce).to.be.true;
      expect(disposeStub2.calledOnce).to.be.true;
      expect(reviewChecklist.disposables.length).to.equal(0);
    });
  });
});
