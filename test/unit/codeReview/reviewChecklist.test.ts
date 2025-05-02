import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ReviewChecklistError } from '../../../src/codeReview/errors/ReviewChecklistError';
import { ReviewChecklist } from '../../../src/codeReview/reviewChecklist';
import { Logger } from '../../../src/utils/logging';

describe('ReviewChecklist - TypeScript', () => {
  let reviewChecklist: ReviewChecklist;
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let mockStorageService: any;
  let mockFileSystem: any;
  let mockLogger: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code context
    mockContext = {
      subscriptions: [],
      extensionPath: '/path/to/extension',
      storageUri: { fsPath: '/path/to/storage' } as any,
      globalStorageUri: { fsPath: '/path/to/global/storage' } as any,
      logUri: { fsPath: '/path/to/logs' } as any,
      extensionUri: { fsPath: '/path/to/extension' } as any,
      environmentVariableCollection: {} as any,
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(),
        setKeysForSync: sandbox.stub()
      } as any,
      workspaceState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(),
        setKeysForSync: sandbox.stub()
      } as any,
      secrets: {
        get: sandbox.stub().resolves(''),
        store: sandbox.stub().resolves(),
        delete: sandbox.stub().resolves()
      } as any,
      asAbsolutePath: (relativePath: string) => `/path/to/extension/${relativePath}`
    };

    // Mock storage service
    mockStorageService = {
      getItem: sandbox.stub(),
      setItem: sandbox.stub().resolves(),
      removeItem: sandbox.stub().resolves(),
      keys: sandbox.stub().resolves([]),
      clear: sandbox.stub().resolves()
    };

    // Mock file system
    mockFileSystem = {
      readdir: sandbox.stub(),
      readFile: sandbox.stub(),
      writeFile: sandbox.stub().resolves(),
      exists: sandbox.stub().resolves(true),
      mkdir: sandbox.stub().resolves(),
      stat: sandbox.stub().resolves({ isDirectory: () => true })
    };

    // Mock logger
    mockLogger = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      warn: sandbox.stub(),
      debug: sandbox.stub(),
      log: sandbox.stub()
    };

    // Create ReviewChecklist instance
    reviewChecklist = new ReviewChecklist(mockContext);

    // Replace private properties with mocks
    (reviewChecklist as any).storageService = mockStorageService;
    (reviewChecklist as any).fs = mockFileSystem;
    (reviewChecklist as any).logger = mockLogger;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should initialize with extension context', () => {
      const checklist = new ReviewChecklist(mockContext);
      expect(checklist).to.be.an.instanceOf(ReviewChecklist);
    });

    it('should set up storage service and logger', () => {
      // This is testing the initialization flow in the constructor
      const loggerSpy = sandbox.spy(Logger, 'getInstance');
      const checklist = new ReviewChecklist(mockContext);
      expect(loggerSpy.called).to.be.true;
    });
  });

  describe('getAvailableChecklists', () => {
    it('should retrieve available checklist templates', async () => {
      // Setup mock response
      mockStorageService.keys.resolves(['checklist:template1', 'checklist:template2', 'otherKey']);

      const templates = await reviewChecklist.getAvailableChecklists();

      expect(mockStorageService.keys.calledOnce).to.be.true;
      expect(templates).to.be.an('array').with.lengthOf(2);
      expect(templates).to.include('template1');
      expect(templates).to.include('template2');
    });

    it('should filter only checklist keys', async () => {
      mockStorageService.keys.resolves(['checklist:template1', 'report:report1', 'otherKey']);

      const templates = await reviewChecklist.getAvailableChecklists();

      expect(templates).to.be.an('array').with.lengthOf(1);
      expect(templates).to.include('template1');
      expect(templates).not.to.include('report1');
    });

    it('should throw ReviewChecklistError if templates cannot be retrieved', async () => {
      mockStorageService.keys.rejects(new Error('Storage error'));

      try {
        await reviewChecklist.getAvailableChecklists();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Failed to retrieve available checklists');
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });

    it('should return empty array if no checklists found', async () => {
      mockStorageService.keys.resolves(['report:report1', 'otherKey']);

      const templates = await reviewChecklist.getAvailableChecklists();

      expect(templates).to.be.an('array').with.lengthOf(0);
    });
  });

  describe('getChecklist', () => {
    it('should retrieve a specific checklist by name', async () => {
      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' },
          { id: 'item2', description: 'Test item 2' }
        ]
      };

      mockStorageService.getItem.withArgs('checklist:testChecklist').resolves(JSON.stringify(mockChecklist));

      const checklist = await reviewChecklist.getChecklist('testChecklist');

      expect(mockStorageService.getItem.calledOnce).to.be.true;
      expect(checklist).to.deep.equal(mockChecklist);
    });

    it('should throw ReviewChecklistError if checklist not found', async () => {
      mockStorageService.getItem.withArgs('checklist:nonexistent').resolves(null);

      try {
        await reviewChecklist.getChecklist('nonexistent');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Checklist not found');
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });

    it('should throw ReviewChecklistError if there is an error retrieving checklist', async () => {
      mockStorageService.getItem.rejects(new Error('Storage error'));

      try {
        await reviewChecklist.getChecklist('testChecklist');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Failed to retrieve checklist');
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('createChecklist', () => {
    it('should create a new checklist', async () => {
      const newChecklist = {
        name: 'newChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' },
          { id: 'item2', description: 'Test item 2' }
        ]
      };

      mockStorageService.setItem.resolves();

      const result = await reviewChecklist.createChecklist(newChecklist);

      expect(mockStorageService.setItem.calledOnce).to.be.true;
      expect(mockStorageService.setItem.firstCall.args[0]).to.equal('checklist:newChecklist');
      expect(JSON.parse(mockStorageService.setItem.firstCall.args[1])).to.deep.equal(newChecklist);
      expect(result).to.be.true;
    });

    it('should throw ReviewChecklistError if checklist validation fails', async () => {
      const invalidChecklist = {
        name: 'invalidChecklist',
        items: [] // Empty array is invalid
      };

      try {
        await reviewChecklist.createChecklist(invalidChecklist);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Checklist items must be a non-empty array');
        expect(mockStorageService.setItem.called).to.be.false;
      }
    });

    it('should throw ReviewChecklistError if there is an error saving checklist', async () => {
      const newChecklist = {
        name: 'newChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' }
        ]
      };

      mockStorageService.setItem.rejects(new Error('Storage error'));

      try {
        await reviewChecklist.createChecklist(newChecklist);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Failed to create checklist');
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });

    it('should throw ReviewChecklistError if checklist items are invalid', async () => {
      const invalidChecklist = {
        name: 'invalidChecklist',
        items: [
          { id: 'item1' } // Missing description
        ]
      };

      try {
        await reviewChecklist.createChecklist(invalidChecklist);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Each checklist item must have an id and description');
        expect(mockStorageService.setItem.called).to.be.false;
      }
    });
  });

  describe('generateReport', () => {
    it('should generate a review report for a checklist', async () => {
      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' },
          { id: 'item2', description: 'Test item 2' }
        ]
      };

      const filePaths = ['/path/to/file1.ts', '/path/to/file2.ts'];
      const reviewerId = 'tester';

      // Mock checklist retrieval
      mockStorageService.getItem.withArgs('checklist:testChecklist').resolves(JSON.stringify(mockChecklist));

      // Mock report saving
      mockStorageService.setItem.resolves();

      // Generate UUID deterministically for testing
      const uuidStub = sandbox.stub(global, 'crypto').returns({
        randomUUID: () => 'mocked-uuid',
        getRandomValues: () => {}
      } as any);

      const report = await reviewChecklist.generateReport('testChecklist', filePaths, reviewerId);

      expect(mockStorageService.getItem.calledOnce).to.be.true;
      expect(mockStorageService.setItem.calledOnce).to.be.true;
      expect(report).to.be.an('object');
      expect(report.id).to.equal('mocked-uuid');
      expect(report.checklistName).to.equal('testChecklist');
      expect(report.filePaths).to.deep.equal(filePaths);
      expect(report.reviewerId).to.equal('reviewerId' in report ? 'tester' : undefined);
      expect(report.timestamp).to.be.a('number');
      expect(report.results).to.be.an('array').that.is.empty;
      expect(report.summary).to.equal('');
      expect(report.approved).to.be.false;
    });

    it('should generate a report with reviewerId if provided', async () => {
      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' }
        ]
      };

      mockStorageService.getItem.withArgs('checklist:testChecklist').resolves(JSON.stringify(mockChecklist));
      mockStorageService.setItem.resolves();

      const report = await reviewChecklist.generateReport('testChecklist', ['/path/to/file.ts'], 'tester');

      expect(report.reviewerId).to.equal('tester');
    });

    it('should throw ReviewChecklistError if checklist not found', async () => {
      mockStorageService.getItem.withArgs('checklist:nonexistent').resolves(null);

      try {
        await reviewChecklist.generateReport('nonexistent', ['/path/to/file.ts']);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Checklist not found');
        expect(mockStorageService.setItem.called).to.be.false;
      }
    });

    it('should throw ReviewChecklistError if there is an error generating report', async () => {
      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' }
        ]
      };

      mockStorageService.getItem.withArgs('checklist:testChecklist').resolves(JSON.stringify(mockChecklist));
      mockStorageService.setItem.rejects(new Error('Storage error'));

      try {
        await reviewChecklist.generateReport('testChecklist', ['/path/to/file.ts']);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Failed to generate report');
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('updateReport', () => {
    it('should update an existing report', async () => {
      const existingReport = {
        id: 'report1',
        checklistName: 'testChecklist',
        filePaths: ['/path/to/file.ts'],
        timestamp: Date.now(),
        results: [],
        summary: '',
        approved: false
      };

      const updatedResults = [
        { itemId: 'item1', passed: true, comment: 'Looks good' }
      ];

      const updatedSummary = 'Updated summary';
      const updatedApproved = true;

      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(existingReport));
      mockStorageService.setItem.resolves();

      const result = await reviewChecklist.updateReport('report1', updatedResults, updatedSummary, updatedApproved);

      expect(mockStorageService.getItem.calledOnce).to.be.true;
      expect(mockStorageService.setItem.calledOnce).to.be.true;
      expect(result).to.be.true;

      const savedReport = JSON.parse(mockStorageService.setItem.firstCall.args[1]);
      expect(savedReport.id).to.equal('report1');
      expect(savedReport.results).to.deep.equal(updatedResults);
      expect(savedReport.summary).to.equal(updatedSummary);
      expect(savedReport.approved).to.equal(updatedApproved);
    });

    it('should throw ReviewChecklistError if report not found', async () => {
      mockStorageService.getItem.withArgs('report:nonexistent').resolves(null);

      try {
        await reviewChecklist.updateReport('nonexistent', [], '');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Report not found');
        expect(mockStorageService.setItem.called).to.be.false;
      }
    });

    it('should throw ReviewChecklistError if there is an error updating report', async () => {
      const existingReport = {
        id: 'report1',
        checklistName: 'testChecklist',
        filePaths: ['/path/to/file.ts'],
        timestamp: Date.now(),
        results: [],
        summary: '',
        approved: false
      };

      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(existingReport));
      mockStorageService.setItem.rejects(new Error('Storage error'));

      try {
        await reviewChecklist.updateReport('report1', [], 'Updated summary');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Failed to update report');
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('getReportHistory', () => {
    it('should retrieve report history with specified limit', async () => {
      // Mock reports in storage
      const reportKeys = ['report:report1', 'report:report2', 'report:report3', 'other:key'];
      const report1 = { id: 'report1', timestamp: 1000 };
      const report2 = { id: 'report2', timestamp: 2000 };
      const report3 = { id: 'report3', timestamp: 3000 };

      mockStorageService.keys.resolves(reportKeys);
      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(report1));
      mockStorageService.getItem.withArgs('report:report2').resolves(JSON.stringify(report2));
      mockStorageService.getItem.withArgs('report:report3').resolves(JSON.stringify(report3));

      const reports = await reviewChecklist.getReportHistory(2);

      expect(mockStorageService.keys.calledOnce).to.be.true;
      expect(reports).to.be.an('array').with.lengthOf(2);
      expect(reports[0].id).to.equal('report3'); // Most recent first
      expect(reports[1].id).to.equal('report2');
    });

    it('should return all reports if limit is not specified', async () => {
      const reportKeys = ['report:report1', 'report:report2', 'other:key'];
      const report1 = { id: 'report1', timestamp: 1000 };
      const report2 = { id: 'report2', timestamp: 2000 };

      mockStorageService.keys.resolves(reportKeys);
      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(report1));
      mockStorageService.getItem.withArgs('report:report2').resolves(JSON.stringify(report2));

      const reports = await reviewChecklist.getReportHistory();

      expect(reports).to.be.an('array').with.lengthOf(2);
    });

    it('should throw ReviewChecklistError if there is an error retrieving history', async () => {
      mockStorageService.keys.rejects(new Error('Storage error'));

      try {
        await reviewChecklist.getReportHistory();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Failed to retrieve report history');
        expect(mockLogger.error.calledOnce).to.be.true;
      }
    });

    it('should sort reports by timestamp in descending order', async () => {
      const reportKeys = ['report:report1', 'report:report2', 'report:report3'];
      const report1 = { id: 'report1', timestamp: 3000 };
      const report2 = { id: 'report2', timestamp: 1000 };
      const report3 = { id: 'report3', timestamp: 2000 };

      mockStorageService.keys.resolves(reportKeys);
      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(report1));
      mockStorageService.getItem.withArgs('report:report2').resolves(JSON.stringify(report2));
      mockStorageService.getItem.withArgs('report:report3').resolves(JSON.stringify(report3));

      const reports = await reviewChecklist.getReportHistory();

      expect(reports[0].id).to.equal('report1');
      expect(reports[1].id).to.equal('report3');
      expect(reports[2].id).to.equal('report2');
    });
  });

  describe('exportReport', () => {
    it('should export a report to markdown format', async () => {
      const mockReport = {
        id: 'report1',
        checklistName: 'testChecklist',
        filePaths: ['/path/to/file.ts'],
        timestamp: Date.now(),
        results: [
          { itemId: 'item1', passed: true, comment: 'Looks good' },
          { itemId: 'item2', passed: false, comment: 'Needs work' }
        ],
        summary: 'Report summary',
        approved: true
      };

      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' },
          { id: 'item2', description: 'Test item 2' }
        ]
      };

      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(mockReport));
      mockStorageService.getItem.withArgs('checklist:testChecklist').resolves(JSON.stringify(mockChecklist));

      // Mock VS Code APIs
      const mockUri = { fsPath: '/path/to/export.md' };
      sandbox.stub(vscode.window, 'showSaveDialog').resolves(mockUri as any);
      sandbox.stub(vscode.workspace, 'fs').value({
        writeFile: sandbox.stub().resolves()
      });

      await reviewChecklist.exportReport('report1', 'markdown');

      expect(mockStorageService.getItem.calledTwice).to.be.true;
      expect(vscode.window.showSaveDialog.calledOnce).to.be.true;
      expect(vscode.workspace.fs.writeFile.calledOnce).to.be.true;
    });

    it('should export a report to HTML format', async () => {
      const mockReport = {
        id: 'report1',
        checklistName: 'testChecklist',
        filePaths: ['/path/to/file.ts'],
        timestamp: Date.now(),
        results: [
          { itemId: 'item1', passed: true, comment: 'Looks good' }
        ],
        summary: 'Report summary',
        approved: true
      };

      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' }
        ]
      };

      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(mockReport));
      mockStorageService.getItem.withArgs('checklist:testChecklist').resolves(JSON.stringify(mockChecklist));

      const mockUri = { fsPath: '/path/to/export.html' };
      sandbox.stub(vscode.window, 'showSaveDialog').resolves(mockUri as any);
      sandbox.stub(vscode.workspace, 'fs').value({
        writeFile: sandbox.stub().resolves()
      });

      await reviewChecklist.exportReport('report1', 'html');

      expect(mockStorageService.getItem.calledTwice).to.be.true;
      expect(vscode.window.showSaveDialog.calledOnce).to.be.true;
      expect(vscode.workspace.fs.writeFile.calledOnce).to.be.true;
    });

    it('should throw ReviewChecklistError if report not found', async () => {
      mockStorageService.getItem.withArgs('report:nonexistent').resolves(null);

      try {
        await reviewChecklist.exportReport('nonexistent', 'markdown');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Report not found');
      }
    });

    it('should throw ReviewChecklistError if checklist not found', async () => {
      const mockReport = {
        id: 'report1',
        checklistName: 'nonexistentChecklist',
        filePaths: ['/path/to/file.ts'],
        timestamp: Date.now(),
        results: [],
        summary: '',
        approved: false
      };

      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(mockReport));
      mockStorageService.getItem.withArgs('checklist:nonexistentChecklist').resolves(null);

      try {
        await reviewChecklist.exportReport('report1', 'markdown');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Checklist not found');
      }
    });

    it('should throw ReviewChecklistError if user cancels the save dialog', async () => {
      const mockReport = {
        id: 'report1',
        checklistName: 'testChecklist',
        filePaths: ['/path/to/file.ts'],
        timestamp: Date.now(),
        results: [],
        summary: '',
        approved: false
      };

      const mockChecklist = {
        name: 'testChecklist',
        items: [
          { id: 'item1', description: 'Test item 1' }
        ]
      };

      mockStorageService.getItem.withArgs('report:report1').resolves(JSON.stringify(mockReport));
      mockStorageService.getItem.withArgs('checklist:testChecklist').resolves(JSON.stringify(mockChecklist));

      sandbox.stub(vscode.window, 'showSaveDialog').resolves(undefined);

      try {
        await reviewChecklist.exportReport('report1', 'markdown');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Export cancelled');
      }
    });
  });

  describe('dispose', () => {
    it('should clean up resources properly', () => {
      const disposeStub = sandbox.stub();
      (reviewChecklist as any).disposables = [{ dispose: disposeStub }];

      reviewChecklist.dispose();

      expect(disposeStub.calledOnce).to.be.true;
    });
  });

  describe('validateChecklistItems', () => {
    it('should validate valid checklist items', () => {
      const validItems = [
        { id: 'item1', description: 'Test item 1' },
        { id: 'item2', description: 'Test item 2' }
      ];

      // Should not throw an error
      (reviewChecklist as any).validateChecklistItems(validItems);
    });

    it('should throw error for empty items array', () => {
      try {
        (reviewChecklist as any).validateChecklistItems([]);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.equal('Checklist items must be a non-empty array');
      }
    });

    it('should throw error for items without required properties', () => {
      const invalidItems = [
        { id: 'item1' }, // Missing description
        { description: 'Test item 2' } // Missing id
      ];

      try {
        (reviewChecklist as any).validateChecklistItems(invalidItems);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.equal('Each checklist item must have an id and description');
      }
    });
  });

  describe('validateResults', () => {
    it('should validate valid results', () => {
      const validResults = [
        { itemId: 'item1', passed: true, comment: 'Looks good' },
        { itemId: 'item2', passed: false, comment: 'Needs work' }
      ];

      // Should not throw an error
      (reviewChecklist as any).validateResults(validResults);
    });

    it('should throw error for non-array results', () => {
      try {
        (reviewChecklist as any).validateResults({});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.equal('Results must be an array');
      }
    });

    it('should throw error for results without required properties', () => {
      const invalidResults = [
        { itemId: 'item1' }, // Missing passed
        { passed: true } // Missing itemId
      ];

      try {
        (reviewChecklist as any).validateResults(invalidResults);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.equal('Each result must have an itemId and passed status');
      }
    });
  });
});
