import { LoggerService } from '../../services/LoggerService';
import { ReviewChecklistError } from '../errors/ReviewChecklistError';
import { ReviewChecklist } from '../reviewChecklist';
import { ReviewChecklistService } from '../services/ReviewChecklistService';

// Mock dependencies
jest.mock('../services/ReviewChecklistService');
jest.mock('../../services/LoggerService');
jest.mock('vscode');

describe('ReviewChecklist', () => {
    let reviewChecklist;
    let mockContext;
    let mockService;
    let mockLogger;

    // Sample data for tests
    const sampleChecklistItems = [
        { id: 'item1', description: 'Check code formatting', category: 'Style' },
        { id: 'item2', description: 'Verify error handling', category: 'Quality' }
    ];

    const sampleResults = [
        { itemId: 'item1', passed: true, comments: 'Looks good' },
        { itemId: 'item2', passed: false, comments: 'Missing try/catch blocks' }
    ];

    const sampleReport = {
        id: 'report1',
        checklistName: 'General',
        filePaths: ['/path/to/file1.js', '/path/to/file2.js'],
        reviewerId: 'reviewer1',
        results: sampleResults,
        summary: 'Overall good but needs error handling improvements',
        approved: false,
        timestamp: '2025-05-04T10:00:00Z'
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock context
        mockContext = {
            extensionPath: '/test/extension/path',
            subscriptions: [],
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
            },
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
            }
        };

        // Set up service mock implementation
        mockService = ReviewChecklistService;
        mockService.prototype.getAvailableChecklists = jest.fn().mockReturnValue(['General', 'Security', 'Performance']);
        mockService.prototype.getChecklist = jest.fn().mockReturnValue(sampleChecklistItems);
        mockService.prototype.createChecklist = jest.fn();
        mockService.prototype.generateReport = jest.fn().mockReturnValue(sampleReport);
        mockService.prototype.updateReport = jest.fn();
        mockService.prototype.getReportHistory = jest.fn().mockReturnValue([sampleReport]);
        mockService.prototype.exportReportToHtml = jest.fn().mockReturnValue('<html><body>Report content</body></html>');

        // Set up logger mock
        mockLogger = {
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        };
        LoggerService.getInstance = jest.fn().mockReturnValue(mockLogger);

        // Create instance
        reviewChecklist = new ReviewChecklist(mockContext);
    });

    describe('getAvailableChecklists', () => {
        it('should return list of available checklist templates', () => {
            const result = reviewChecklist.getAvailableChecklists();

            expect(mockService.prototype.getAvailableChecklists).toHaveBeenCalled();
            expect(result).toEqual(['General', 'Security', 'Performance']);
        });

        it('should handle errors and return empty array', () => {
            mockService.prototype.getAvailableChecklists.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            const result = reviewChecklist.getAvailableChecklists();

            expect(mockLogger.error).toHaveBeenCalledWith(
                'ReviewChecklist: Failed to get available checklists',
                'Service error'
            );
            expect(result).toEqual([]);
        });

        it('should handle non-Error throwables', () => {
            mockService.prototype.getAvailableChecklists.mockImplementationOnce(() => {
                throw 'String error';
            });

            const result = reviewChecklist.getAvailableChecklists();

            expect(mockLogger.error).toHaveBeenCalledWith(
                'ReviewChecklist: Failed to get available checklists',
                'String error'
            );
            expect(result).toEqual([]);
        });
    });

    describe('getChecklist', () => {
        it('should return checklist items for a specific checklist', () => {
            const result = reviewChecklist.getChecklist('General');

            expect(mockService.prototype.getChecklist).toHaveBeenCalledWith('General');
            expect(result).toEqual(sampleChecklistItems);
        });

        it('should handle errors and return undefined', () => {
            mockService.prototype.getChecklist.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            const result = reviewChecklist.getChecklist('NonExistent');

            expect(mockLogger.error).toHaveBeenCalledWith(
                'ReviewChecklist: Failed to get checklist: NonExistent',
                'Service error'
            );
            expect(result).toBeUndefined();
        });
    });

    describe('createChecklist', () => {
        it('should create a new checklist', () => {
            reviewChecklist.createChecklist('New Checklist', sampleChecklistItems);

            expect(mockService.prototype.createChecklist).toHaveBeenCalledWith('New Checklist', sampleChecklistItems);
        });

        it('should validate checklist items', () => {
            expect(() => {
                reviewChecklist.createChecklist('Invalid', []);
            }).toThrow(ReviewChecklistError);

            expect(() => {
                reviewChecklist.createChecklist('Invalid', [{ description: 'Missing ID' }]);
            }).toThrow(ReviewChecklistError);

            expect(() => {
                reviewChecklist.createChecklist('Invalid', [{ id: 'missing-desc' }]);
            }).toThrow(ReviewChecklistError);

            expect(() => {
                reviewChecklist.createChecklist('Invalid', 'not-an-array');
            }).toThrow(ReviewChecklistError);

            expect(() => {
                reviewChecklist.createChecklist('Invalid', null);
            }).toThrow(ReviewChecklistError);
        });

        it('should handle service errors', () => {
            mockService.prototype.createChecklist.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            expect(() => {
                reviewChecklist.createChecklist('Error Test', sampleChecklistItems);
            }).toThrow(ReviewChecklistError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                'ReviewChecklist: Failed to create checklist: Error Test',
                'Service error'
            );
        });
    });

    describe('generateReport', () => {
        it('should generate a report using the service', () => {
            const filePaths = ['/path/to/file.js'];
            const result = reviewChecklist.generateReport('General', filePaths, 'reviewer1');

            expect(mockService.prototype.generateReport).toHaveBeenCalledWith('General', filePaths, 'reviewer1');
            expect(result).toEqual(sampleReport);
        });

        it('should handle errors and return empty report', () => {
            mockService.prototype.generateReport.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            const filePaths = ['/path/to/file.js'];
            const result = reviewChecklist.generateReport('General', filePaths, 'reviewer1');

            expect(mockLogger.error).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.filePaths).toEqual(filePaths);
            expect(result.checklistName).toBe('General');
            expect(result.reviewerId).toBe('reviewer1');
            expect(result.results).toEqual([]);
            expect(result.approved).toBe(false);
            expect(result.summary).toBe('Error generating report');
            expect(result.id).toContain('error-');
            expect(result.timestamp).toBeTruthy();
        });
    });

    describe('updateReport', () => {
        it('should update an existing report', () => {
            reviewChecklist.updateReport('report1', sampleResults, 'Updated summary', true);

            expect(mockService.prototype.updateReport).toHaveBeenCalledWith(
                'report1', sampleResults, 'Updated summary', true
            );
        });

        it('should validate review results', () => {
            expect(() => {
                reviewChecklist.updateReport('report1', 'invalid', 'Summary', true);
            }).toThrow(ReviewChecklistError);

            expect(() => {
                reviewChecklist.updateReport('report1', [{ passed: true }], 'Summary', true);
            }).toThrow(ReviewChecklistError);

            expect(() => {
                reviewChecklist.updateReport('report1', [{ itemId: 'item1' }], 'Summary', true);
            }).toThrow(ReviewChecklistError);
        });

        it('should handle service errors', () => {
            mockService.prototype.updateReport.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            expect(() => {
                reviewChecklist.updateReport('report1', sampleResults, 'Updated summary', true);
            }).toThrow(ReviewChecklistError);

            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('getReportHistory', () => {
        it('should return report history', () => {
            const result = reviewChecklist.getReportHistory(5);

            expect(mockService.prototype.getReportHistory).toHaveBeenCalledWith(5);
            expect(result).toEqual([sampleReport]);
        });

        it('should use default limit if not specified', () => {
            reviewChecklist.getReportHistory();

            expect(mockService.prototype.getReportHistory).toHaveBeenCalledWith(10);
        });

        it('should handle errors and return empty array', () => {
            mockService.prototype.getReportHistory.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            const result = reviewChecklist.getReportHistory();

            expect(mockLogger.error).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('exportReportToHtml', () => {
        it('should export a report to HTML format', () => {
            const result = reviewChecklist.exportReportToHtml('report1');

            expect(mockService.prototype.exportReportToHtml).toHaveBeenCalledWith('report1');
            expect(result).toBe('<html><body>Report content</body></html>');
        });

        it('should handle errors and return error HTML', () => {
            mockService.prototype.exportReportToHtml.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            const result = reviewChecklist.exportReportToHtml('report1');

            expect(mockLogger.error).toHaveBeenCalled();
            expect(result).toContain('Error Exporting Report');
            expect(result).toContain('report1');
        });

        it('should format error HTML with proper indentation', () => {
            mockService.prototype.exportReportToHtml.mockImplementationOnce(() => {
                throw new Error('Service error');
            });

            const result = reviewChecklist.exportReportToHtml('report1');

            // Check that the HTML has proper structure and isn't all on one line
            expect(result.trim()).toMatch(/^\s*<html>/);
            expect(result).toContain('<body>');
            expect(result).toContain('</body>');
            expect(result.trim()).toMatch(/<\/html>\s*$/);
        });
    });

    describe('dispose', () => {
        it('should dispose all disposables', () => {
            // Add a mock disposable
            const mockDisposable = { dispose: jest.fn() };
            reviewChecklist.disposables.push(mockDisposable);

            reviewChecklist.dispose();

            expect(mockDisposable.dispose).toHaveBeenCalled();
            expect(reviewChecklist.disposables.length).toBe(0);
        });

        it('should handle empty disposables array', () => {
            // Ensure disposables array is empty
            reviewChecklist.disposables = [];

            // Should not throw an error
            expect(() => {
                reviewChecklist.dispose();
            }).not.toThrow();
        });
    });

    describe('error handling', () => {
        it('should wrap original errors in ReviewChecklistError', () => {
            mockService.prototype.getChecklist.mockImplementationOnce(() => {
                throw new Error('Original error');
            });

            try {
                reviewChecklist.getChecklist('Test');
            } catch (error) {
                expect(error).toBeInstanceOf(ReviewChecklistError);
                expect(error.message).toContain('Original error');
            }
        });

        it('should handle non-Error objects in error handler', () => {
            mockService.prototype.getChecklist.mockImplementationOnce(() => {
                throw { custom: 'error object' };
            });

            try {
                reviewChecklist.getChecklist('Test');
            } catch (error) {
                expect(error).toBeInstanceOf(ReviewChecklistError);
                expect(error.message).toContain('[object Object]');
            }
        });
    });
});
