const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { ReviewChecklist } = require('../../../src/codeReview/reviewChecklist');
const { ReviewChecklistError } = require('../../../src/codeReview/errors/ReviewChecklistError');

describe('ReviewChecklist - JavaScript', () => {
  let reviewChecklist;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    reviewChecklist = new ReviewChecklist();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getChecklistTemplates', () => {
    it('should return available checklist templates', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(true),
        readdirSync: sandbox.stub().returns(['template1.json', 'template2.json', 'notatemplate.txt']),
        readFileSync: sandbox.stub().returns(JSON.stringify({
          name: 'Template 1',
          description: 'Test template 1',
          items: [
            { id: 'item1', description: 'Item 1 description' },
            { id: 'item2', description: 'Item 2 description' }
          ]
        }))
      };

      // Replace file system module
      const originalRequire = require;
      global.require = (module) => {
        if (module === 'fs') return mockFs;
        return originalRequire(module);
      };

      const templates = await reviewChecklist.getChecklistTemplates();

      expect(templates).to.be.an('array');
      expect(templates.length).to.equal(2);
      expect(templates[0]).to.have.property('name', 'Template 1');
      expect(templates[0]).to.have.property('description', 'Test template 1');
      expect(templates[0]).to.have.property('items').that.is.an('array');
      expect(templates[0].items.length).to.equal(2);

      // Restore original require
      global.require = originalRequire;
    });

    it('should throw ReviewChecklistError if templates directory does not exist', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(false)
      };

      // Replace file system module
      const originalRequire = require;
      global.require = (module) => {
        if (module === 'fs') return mockFs;
        return originalRequire(module);
      };

      try {
        await reviewChecklist.getChecklistTemplates();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Could not find checklist templates');
      }

      // Restore original require
      global.require = originalRequire;
    });

    it('should throw ReviewChecklistError if there is an error reading templates', async () => {
      // Mock file system operations
      const mockFs = {
        existsSync: sandbox.stub().returns(true),
        readdirSync: sandbox.stub().throws(new Error('Read directory error'))
      };

      // Replace file system module
      const originalRequire = require;
      global.require = (module) => {
        if (module === 'fs') return mockFs;
        return originalRequire(module);
      };

      try {
        await reviewChecklist.getChecklistTemplates();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Error retrieving checklist templates');
      }

      // Restore original require
      global.require = originalRequire;
    });
  });

  describe('getChecklist', () => {
    it('should retrieve a checklist by id', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves({
          id: 'checklist1',
          name: 'Checklist 1',
          items: [
            { id: 'item1', description: 'Item 1 description' },
            { id: 'item2', description: 'Item 2 description' }
          ]
        })
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const checklist = await reviewChecklist.getChecklist('checklist1');

      expect(checklist).to.be.an('object');
      expect(checklist).to.have.property('id', 'checklist1');
      expect(checklist).to.have.property('name', 'Checklist 1');
      expect(checklist).to.have.property('items').that.is.an('array');
      expect(checklist.items.length).to.equal(2);
      expect(mockStorage.get.calledOnce).to.be.true;
      expect(mockStorage.get.calledWith('checklists', 'checklist1')).to.be.true;
    });

    it('should throw ReviewChecklistError if checklist not found', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves(null)
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      try {
        await reviewChecklist.getChecklist('nonexistent');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Could not find checklist');
      }
    });

    it('should throw ReviewChecklistError if there is an error retrieving checklist', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().rejects(new Error('Storage error'))
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      try {
        await reviewChecklist.getChecklist('checklist1');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Error retrieving checklist');
      }
    });
  });

  describe('createChecklist', () => {
    it('should create a new checklist', async () => {
      // Mock storage service
      const mockStorage = {
        set: sandbox.stub().resolves()
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const checklist = {
        name: 'New Checklist',
        items: [
          { id: 'item1', description: 'Item 1 description' },
          { id: 'item2', description: 'Item 2 description' }
        ]
      };

      const result = await reviewChecklist.createChecklist(checklist);

      expect(result).to.be.an('object');
      expect(result).to.have.property('id').that.is.a('string');
      expect(result).to.have.property('name', 'New Checklist');
      expect(result).to.have.property('items').that.is.an('array');
      expect(result.items.length).to.equal(2);
      expect(mockStorage.set.calledOnce).to.be.true;
    });

    it('should throw ReviewChecklistError if checklist validation fails', async () => {
      // Invalid checklist with missing items array
      const checklist = {
        name: 'New Checklist'
      };

      try {
        await reviewChecklist.createChecklist(checklist);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Checklist items must be a non-empty array');
      }
    });

    it('should throw ReviewChecklistError if there is an error saving checklist', async () => {
      // Mock storage service
      const mockStorage = {
        set: sandbox.stub().rejects(new Error('Storage error'))
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const checklist = {
        name: 'New Checklist',
        items: [
          { id: 'item1', description: 'Item 1 description' }
        ]
      };

      try {
        await reviewChecklist.createChecklist(checklist);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Error creating checklist');
      }
    });

    it('should throw ReviewChecklistError if checklist items are invalid', async () => {
      // Invalid item missing id
      const checklist = {
        name: 'New Checklist',
        items: [
          { description: 'Item without id' }
        ]
      };

      try {
        await reviewChecklist.createChecklist(checklist);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Each checklist item must have an id and description');
      }
    });
  });

  describe('generateReport', () => {
    it('should generate a report from checklist results', async () => {
      // Mock storage services
      const mockStorage = {
        get: sandbox.stub().resolves({
          id: 'checklist1',
          name: 'Checklist 1',
          items: [
            { id: 'item1', description: 'Item 1 description' },
            { id: 'item2', description: 'Item 2 description' }
          ]
        }),
        set: sandbox.stub().resolves()
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const results = [
        { itemId: 'item1', passed: true, comments: 'Good job' },
        { itemId: 'item2', passed: false, comments: 'Needs improvement' }
      ];

      const report = await reviewChecklist.generateReport('checklist1', results);

      expect(report).to.be.an('object');
      expect(report).to.have.property('id').that.is.a('string');
      expect(report).to.have.property('checklistId', 'checklist1');
      expect(report).to.have.property('timestamp').that.is.a('number');
      expect(report).to.have.property('results').that.is.an('array');
      expect(report.results.length).to.equal(2);
      expect(report).to.have.property('passRate', 0.5);
      expect(mockStorage.set.calledOnce).to.be.true;
    });

    it('should calculate pass rate correctly', async () => {
      // Mock storage services
      const mockStorage = {
        get: sandbox.stub().resolves({
          id: 'checklist1',
          name: 'Checklist 1',
          items: [
            { id: 'item1', description: 'Item 1' },
            { id: 'item2', description: 'Item 2' },
            { id: 'item3', description: 'Item 3' }
          ]
        }),
        set: sandbox.stub().resolves()
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const results = [
        { itemId: 'item1', passed: true },
        { itemId: 'item2', passed: true },
        { itemId: 'item3', passed: false }
      ];

      const report = await reviewChecklist.generateReport('checklist1', results);

      expect(report).to.have.property('passRate', 2/3);
    });

    it('should throw ReviewChecklistError if checklist not found', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves(null)
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const results = [
        { itemId: 'item1', passed: true }
      ];

      try {
        await reviewChecklist.generateReport('nonexistent', results);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Could not find checklist');
      }
    });

    it('should throw ReviewChecklistError if results validation fails', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves({
          id: 'checklist1',
          name: 'Checklist 1',
          items: [
            { id: 'item1', description: 'Item 1' }
          ]
        })
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      // Invalid results with missing itemId
      const results = [
        { passed: true }
      ];

      try {
        await reviewChecklist.generateReport('checklist1', results);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Each result must have an itemId and passed status');
      }
    });
  });

  describe('updateReport', () => {
    it('should update an existing report', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves({
          id: 'report1',
          checklistId: 'checklist1',
          timestamp: Date.now(),
          results: [
            { itemId: 'item1', passed: true, comments: 'Good job' },
            { itemId: 'item2', passed: false, comments: 'Needs improvement' }
          ],
          passRate: 0.5
        }),
        set: sandbox.stub().resolves()
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const updatedReport = {
        results: [
          { itemId: 'item1', passed: true, comments: 'Excellent job' },
          { itemId: 'item2', passed: true, comments: 'Fixed issues' }
        ]
      };

      const result = await reviewChecklist.updateReport('report1', updatedReport);

      expect(result).to.be.an('object');
      expect(result).to.have.property('id', 'report1');
      expect(result).to.have.property('results').that.is.an('array');
      expect(result.results[0].comments).to.equal('Excellent job');
      expect(result.results[1].comments).to.equal('Fixed issues');
      expect(result).to.have.property('passRate', 1.0);
      expect(mockStorage.set.calledOnce).to.be.true;
    });

    it('should throw ReviewChecklistError if report not found', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves(null)
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const updatedReport = {
        results: [
          { itemId: 'item1', passed: true }
        ]
      };

      try {
        await reviewChecklist.updateReport('nonexistent', updatedReport);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Could not find report');
      }
    });

    it('should throw ReviewChecklistError if there is an error updating report', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves({
          id: 'report1',
          checklistId: 'checklist1',
          timestamp: Date.now(),
          results: [{ itemId: 'item1', passed: true }],
          passRate: 1.0
        }),
        set: sandbox.stub().rejects(new Error('Storage error'))
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const updatedReport = {
        results: [
          { itemId: 'item1', passed: false }
        ]
      };

      try {
        await reviewChecklist.updateReport('report1', updatedReport);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Error updating report');
      }
    });
  });

  describe('getReport', () => {
    it('should retrieve a report by id', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves({
          id: 'report1',
          checklistId: 'checklist1',
          timestamp: Date.now(),
          results: [
            { itemId: 'item1', passed: true },
            { itemId: 'item2', passed: false }
          ],
          passRate: 0.5
        })
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      const report = await reviewChecklist.getReport('report1');

      expect(report).to.be.an('object');
      expect(report).to.have.property('id', 'report1');
      expect(report).to.have.property('checklistId', 'checklist1');
      expect(report).to.have.property('timestamp').that.is.a('number');
      expect(report).to.have.property('results').that.is.an('array');
      expect(report.results.length).to.equal(2);
      expect(report).to.have.property('passRate', 0.5);
      expect(mockStorage.get.calledOnce).to.be.true;
      expect(mockStorage.get.calledWith('reports', 'report1')).to.be.true;
    });

    it('should throw ReviewChecklistError if report not found', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves(null)
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      try {
        await reviewChecklist.getReport('nonexistent');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Could not find report');
      }
    });

    it('should throw ReviewChecklistError if there is an error retrieving report', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().rejects(new Error('Storage error'))
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      try {
        await reviewChecklist.getReport('report1');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Error retrieving report');
      }
    });
  });

  describe('exportReport', () => {
    it('should export a report to a file', async () => {
      // Mock file system and report
      const mockFs = {
        writeFileSync: sandbox.stub().returns(undefined)
      };

      const mockReport = {
        id: 'report1',
        checklistId: 'checklist1',
        timestamp: Date.now(),
        results: [
          { itemId: 'item1', passed: true, comments: 'Good' },
          { itemId: 'item2', passed: false, comments: 'Bad' }
        ],
        passRate: 0.5
      };

      const mockChecklist = {
        id: 'checklist1',
        name: 'Security Checklist',
        items: [
          { id: 'item1', description: 'Security Item 1' },
          { id: 'item2', description: 'Security Item 2' }
        ]
      };

      // Mock storage service
      const mockStorage = {
        get: sandbox.stub()
      };

      mockStorage.get.withArgs('reports', 'report1').resolves(mockReport);
      mockStorage.get.withArgs('checklists', 'checklist1').resolves(mockChecklist);

      // Replace modules
      const originalRequire = require;
      global.require = (module) => {
        if (module === 'fs') return mockFs;
        return originalRequire(module);
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      // Mock dialog
      const mockVscode = {
        window: {
          showSaveDialog: sandbox.stub().resolves({ fsPath: '/path/to/report.md' })
        }
      };
      sandbox.stub(vscode, 'window').value(mockVscode.window);

      await reviewChecklist.exportReport('report1', 'markdown');

      expect(mockStorage.get.calledTwice).to.be.true;
      expect(mockFs.writeFileSync.calledOnce).to.be.true;
      expect(mockFs.writeFileSync.firstCall.args[0]).to.equal('/path/to/report.md');

      // Restore original require
      global.require = originalRequire;
    });

    it('should throw ReviewChecklistError if report not found', async () => {
      // Mock storage service
      const mockStorage = {
        get: sandbox.stub().resolves(null)
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      try {
        await reviewChecklist.exportReport('nonexistent', 'markdown');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Could not find report');
      }
    });

    it('should throw ReviewChecklistError if checklist not found', async () => {
      // Mock report
      const mockReport = {
        id: 'report1',
        checklistId: 'checklist1',
        timestamp: Date.now(),
        results: [],
        passRate: 0
      };

      // Mock storage service
      const mockStorage = {
        get: sandbox.stub()
      };

      mockStorage.get.withArgs('reports', 'report1').resolves(mockReport);
      mockStorage.get.withArgs('checklists', 'checklist1').resolves(null);

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      try {
        await reviewChecklist.exportReport('report1', 'markdown');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Could not find checklist for report');
      }
    });

    it('should throw ReviewChecklistError if user cancels the save dialog', async () => {
      // Mock report
      const mockReport = {
        id: 'report1',
        checklistId: 'checklist1',
        timestamp: Date.now(),
        results: [],
        passRate: 0
      };

      const mockChecklist = {
        id: 'checklist1',
        name: 'Test Checklist',
        items: []
      };

      // Mock storage service
      const mockStorage = {
        get: sandbox.stub()
      };

      mockStorage.get.withArgs('reports', 'report1').resolves(mockReport);
      mockStorage.get.withArgs('checklists', 'checklist1').resolves(mockChecklist);

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      // Mock dialog that returns undefined (canceled by user)
      const mockVscode = {
        window: {
          showSaveDialog: sandbox.stub().resolves(undefined)
        }
      };
      sandbox.stub(vscode, 'window').value(mockVscode.window);

      try {
        await reviewChecklist.exportReport('report1', 'markdown');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Export cancelled');
      }
    });

    it('should throw ReviewChecklistError if there is an error writing the file', async () => {
      // Mock file system and report
      const mockFs = {
        writeFileSync: sandbox.stub().throws(new Error('Write error'))
      };

      const mockReport = {
        id: 'report1',
        checklistId: 'checklist1',
        timestamp: Date.now(),
        results: [],
        passRate: 0
      };

      const mockChecklist = {
        id: 'checklist1',
        name: 'Test Checklist',
        items: []
      };

      // Mock storage service
      const mockStorage = {
        get: sandbox.stub()
      };

      mockStorage.get.withArgs('reports', 'report1').resolves(mockReport);
      mockStorage.get.withArgs('checklists', 'checklist1').resolves(mockChecklist);

      // Replace modules
      const originalRequire = require;
      global.require = (module) => {
        if (module === 'fs') return mockFs;
        return originalRequire(module);
      };

      // Set storage service
      reviewChecklist.storageService = mockStorage;

      // Mock dialog
      const mockVscode = {
        window: {
          showSaveDialog: sandbox.stub().resolves({ fsPath: '/path/to/report.md' })
        }
      };
      sandbox.stub(vscode, 'window').value(mockVscode.window);

      try {
        await reviewChecklist.exportReport('report1', 'markdown');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.include('Error exporting report');
      }

      // Restore original require
      global.require = originalRequire;
    });
  });

  describe('validateChecklistItems', () => {
    it('should validate checklist items correctly', () => {
      const validItems = [
        { id: 'item1', description: 'Item 1 description' },
        { id: 'item2', description: 'Item 2 description' }
      ];

      expect(() => reviewChecklist.validateChecklistItems(validItems)).not.to.throw();
    });

    it('should throw if items is not an array', () => {
      expect(() => reviewChecklist.validateChecklistItems('not an array')).to.throw(ReviewChecklistError);
    });

    it('should throw if items is an empty array', () => {
      expect(() => reviewChecklist.validateChecklistItems([])).to.throw(ReviewChecklistError);
    });

    it('should throw if any item is missing an id', () => {
      const invalidItems = [
        { id: 'item1', description: 'Item 1' },
        { description: 'Missing id' }
      ];

      expect(() => reviewChecklist.validateChecklistItems(invalidItems)).to.throw(ReviewChecklistError);
    });

    it('should throw if any item is missing a description', () => {
      const invalidItems = [
        { id: 'item1', description: 'Item 1' },
        { id: 'item2' }
      ];

      expect(() => reviewChecklist.validateChecklistItems(invalidItems)).to.throw(ReviewChecklistError);
    });
  });

  describe('validateResults', () => {
    it('should validate results correctly', () => {
      const validResults = [
        { itemId: 'item1', passed: true, comments: 'Good job' },
        { itemId: 'item2', passed: false, comments: 'Needs improvement' }
      ];

      expect(() => reviewChecklist.validateResults(validResults)).not.to.throw();
    });

    it('should throw if results is not an array', () => {
      expect(() => reviewChecklist.validateResults('not an array')).to.throw(ReviewChecklistError);
    });

    it('should throw if any result is missing an itemId', () => {
      const invalidResults = [
        { itemId: 'item1', passed: true },
        { passed: false }
      ];

      expect(() => reviewChecklist.validateResults(invalidResults)).to.throw(ReviewChecklistError);
    });

    it('should throw if any result is missing a passed status', () => {
      const invalidResults = [
        { itemId: 'item1', passed: true },
        { itemId: 'item2' }
      ];

      expect(() => reviewChecklist.validateResults(invalidResults)).to.throw(ReviewChecklistError);
    });

    it('should validate an empty results array', () => {
      expect(() => reviewChecklist.validateResults([])).not.to.throw();
    });
  });

  describe('handleError', () => {
    it('should create a ReviewChecklistError with the appropriate message', () => {
      const errorMessage = 'Original error';
      const contextMessage = 'Context message';

      try {
        reviewChecklist.handleError(new Error(errorMessage), contextMessage);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.equal(`${contextMessage}: ${errorMessage}`);
      }
    });

    it('should handle non-Error objects', () => {
      const contextMessage = 'Context message';

      try {
        reviewChecklist.handleError('string error', contextMessage);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(ReviewChecklistError);
        expect(error.message).to.equal(`${contextMessage}: string error`);
      }
    });
  });
});
