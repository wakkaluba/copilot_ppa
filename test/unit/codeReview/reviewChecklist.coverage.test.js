const assert = require('assert');
const sinon = require('sinon');
// Use our mock instead of the real vscode module
const vscode = require('./mocks/vscode');

// Mock the dependencies
jest.mock('../../../src/codeReview/services/ReviewChecklistService', () => {
  return {
    ReviewChecklistService: function() {
      return {
        getAvailableChecklists: jest.fn().mockReturnValue(['template1', 'template2']),
        getChecklist: jest.fn().mockReturnValue({ name: 'test', items: [{ id: 'item1', description: 'Test item' }] }),
        createChecklist: jest.fn(),
        generateReport: jest.fn(),
        updateReport: jest.fn(),
        getReportHistory: jest.fn().mockReturnValue([]),
        exportReportToHtml: jest.fn().mockReturnValue('<html></html>')
      };
    }
  };
});

jest.mock('../../../src/services/LoggerService', () => {
  return {
    LoggerService: {
      getInstance: jest.fn().mockReturnValue({
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      })
    }
  };
});

// Import after mocks are set up
const { ReviewChecklist } = require('../../../src/codeReview/reviewChecklist');
const { ReviewChecklistError } = require('../../../src/codeReview/errors/ReviewChecklistError');

describe('ReviewChecklist Coverage Tests', () => {
  let reviewChecklist;
  let mockContext;

  beforeEach(() => {
    // Mock VS Code context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path'
    };

    // Reset mocks
    jest.clearAllMocks();

    // Create ReviewChecklist instance
    reviewChecklist = new ReviewChecklist(mockContext);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAvailableChecklists returns available checklists', () => {
    const checklists = reviewChecklist.getAvailableChecklists();
    expect(checklists).toEqual(['template1', 'template2']);
  });

  test('getChecklist retrieves a specific checklist by name', () => {
    const checklist = reviewChecklist.getChecklist('test');
    expect(checklist).toEqual({ name: 'test', items: [{ id: 'item1', description: 'Test item' }] });
  });

  test('getReportHistory retrieves report history with default limit', () => {
    reviewChecklist.getReportHistory();
    // Default limit should be 10
    expect(reviewChecklist.service.getReportHistory).toHaveBeenCalledWith(10);
  });

  test('getReportHistory retrieves report history with specified limit', () => {
    reviewChecklist.getReportHistory(5);
    expect(reviewChecklist.service.getReportHistory).toHaveBeenCalledWith(5);
  });

  test('exportReportToHtml exports a report to HTML format', () => {
    const html = reviewChecklist.exportReportToHtml('report1');
    expect(html).toBe('<html></html>');
    expect(reviewChecklist.service.exportReportToHtml).toHaveBeenCalledWith('report1');
  });

  test('dispose cleans up resources', () => {
    const disposeSpy = jest.spyOn(reviewChecklist.disposables, 'forEach');
    reviewChecklist.dispose();
    expect(disposeSpy).toHaveBeenCalled();
    expect(reviewChecklist.disposables.length).toBe(0);
  });

  // Error handling tests
  test('handleError properly formats and throws errors', () => {
    expect(() => {
      reviewChecklist.handleError('Test message', new Error('Test error'));
    }).toThrow(ReviewChecklistError);
  });
});
