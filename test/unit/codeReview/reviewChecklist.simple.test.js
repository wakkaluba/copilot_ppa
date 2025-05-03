const assert = require('assert');
const sinon = require('sinon');
const vscode = require('vscode');
const { ReviewChecklist } = require('../../../src/codeReview/reviewChecklist');
const { ReviewChecklistError } = require('../../../src/codeReview/errors/ReviewChecklistError');

describe('ReviewChecklist Simple Tests', () => {
  let reviewChecklist;
  let mockContext;
  let mockService;
  let mockLogger;

  beforeEach(() => {
    // Mock VS Code context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path'
    };

    // Create mocks for service and logger
    mockService = {
      getAvailableChecklists: sinon.stub().returns(['template1', 'template2']),
      getChecklist: sinon.stub().returns({ name: 'test', items: [{ id: 'item1', description: 'Test item' }] }),
      createChecklist: sinon.stub(),
      generateReport: sinon.stub(),
      updateReport: sinon.stub(),
      getReportHistory: sinon.stub().returns([]),
      exportReportToHtml: sinon.stub().returns('<html></html>')
    };

    mockLogger = {
      error: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      debug: sinon.stub()
    };

    // Create ReviewChecklist instance
    reviewChecklist = new ReviewChecklist(mockContext);

    // Replace private properties with mocks
    reviewChecklist.service = mockService;
    reviewChecklist.logger = mockLogger;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return available checklists', () => {
    const checklists = reviewChecklist.getAvailableChecklists();
    assert.deepStrictEqual(checklists, ['template1', 'template2']);
    assert(mockService.getAvailableChecklists.calledOnce);
  });

  it('should get a specific checklist by name', () => {
    const checklist = reviewChecklist.getChecklist('test');
    assert.deepStrictEqual(checklist, { name: 'test', items: [{ id: 'item1', description: 'Test item' }] });
    assert(mockService.getChecklist.calledOnceWith('test'));
  });

  it('should handle errors when getting available checklists', () => {
    mockService.getAvailableChecklists.throws(new Error('Test error'));
    const checklists = reviewChecklist.getAvailableChecklists();
    assert.deepStrictEqual(checklists, []);
    assert(mockLogger.error.called);
  });

  it('should handle errors when getting a specific checklist', () => {
    mockService.getChecklist.throws(new Error('Test error'));
    assert.throws(() => {
      reviewChecklist.getChecklist('test');
    }, ReviewChecklistError);
    assert(mockLogger.error.called);
  });

  it('should export a report to HTML', () => {
    const html = reviewChecklist.exportReportToHtml('report1');
    assert.strictEqual(html, '<html></html>');
    assert(mockService.exportReportToHtml.calledOnceWith('report1'));
  });

  it('should handle errors when exporting a report', () => {
    mockService.exportReportToHtml.throws(new Error('Test error'));
    const html = reviewChecklist.exportReportToHtml('report1');
    assert(html.includes('Error Exporting Report'));
    assert(mockLogger.error.called);
  });
});
