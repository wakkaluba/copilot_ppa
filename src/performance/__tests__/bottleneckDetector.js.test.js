const vscode = require('vscode');
const { EventEmitter } = require('events');
const { BottleneckDetector } = require('../bottleneckDetector');
const { BottleneckDetectionService } = require('../services/BottleneckDetectionService');

// Mock the BottleneckDetectionService that is used by BottleneckDetector
jest.mock('../services/BottleneckDetectionService', () => {
    return {
        BottleneckDetectionService: jest.fn().mockImplementation(() => {
            return {
                setEnabled: jest.fn(),
                resetStats: jest.fn(),
                setThreshold: jest.fn(),
                analyzeOperation: jest.fn(),
                analyzeAll: jest.fn().mockReturnValue({ critical: [], warnings: [] }),
                getOptimizationSuggestions: jest.fn().mockReturnValue([]),
                reportPerformanceIssue: jest.fn(),
                getIssues: jest.fn().mockReturnValue([]),
                getOperationsCount: jest.fn().mockReturnValue(0),
                incrementOperationsCount: jest.fn(),
                resetOperationsCount: jest.fn(),
                getPatternAnalysis: jest.fn().mockReturnValue([]),
                getSummary: jest.fn().mockReturnValue({}),
                clear: jest.fn()
            };
        })
    };
});

describe('BottleneckDetector (JavaScript)', () => {
    let detector;
    let mockService;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Reset the singleton instance for each test
        BottleneckDetector.instance = undefined;

        // Get a new instance
        detector = BottleneckDetector.getInstance();

        // Get the mock service instance
        mockService = detector.service;
    });

    describe('Singleton Pattern', () => {
        test('getInstance returns the same instance', () => {
            const instance1 = BottleneckDetector.getInstance();
            const instance2 = BottleneckDetector.getInstance();

            expect(instance1).toBe(instance2);
        });

        test('constructor creates a new BottleneckDetectionService', () => {
            expect(BottleneckDetectionService).toHaveBeenCalledTimes(1);
        });
    });

    describe('Service Method Delegation', () => {
        test('setEnabled should call service.setEnabled', () => {
            detector.setEnabled(true);
            expect(mockService.setEnabled).toHaveBeenCalledWith(true);

            detector.setEnabled(false);
            expect(mockService.setEnabled).toHaveBeenCalledWith(false);
        });

        test('resetStats should call service.resetStats', () => {
            detector.resetStats();
            expect(mockService.resetStats).toHaveBeenCalled();
        });

        test('setThreshold should call service.setThreshold', () => {
            const thresholds = {
                warning: 100,
                critical: 500,
                samplesRequired: 5
            };

            detector.setThreshold('operation1', thresholds);
            expect(mockService.setThreshold).toHaveBeenCalledWith('operation1', thresholds);
        });

        test('analyzeOperation should call service.analyzeOperation', () => {
            detector.analyzeOperation('operation1');
            expect(mockService.analyzeOperation).toHaveBeenCalledWith('operation1');
        });

        test('analyzeAll should call service.analyzeAll and return its result', () => {
            const mockResult = { critical: ['op1'], warnings: ['op2'] };
            mockService.analyzeAll.mockReturnValue(mockResult);

            const result = detector.analyzeAll();

            expect(mockService.analyzeAll).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });

        test('getOptimizationSuggestions should call service.getOptimizationSuggestions', () => {
            const mockSuggestions = ['Optimize loop', 'Reduce memory usage'];
            mockService.getOptimizationSuggestions.mockReturnValue(mockSuggestions);

            const result = detector.getOptimizationSuggestions('operation1');

            expect(mockService.getOptimizationSuggestions).toHaveBeenCalledWith('operation1');
            expect(result).toEqual(mockSuggestions);
        });

        test('reportPerformanceIssue should call service.reportPerformanceIssue', () => {
            const issue = {
                type: 'execution-time',
                metric: 1500,
                threshold: 1000,
                sessionId: 'session1',
                timestamp: Date.now(),
                context: { operation: 'test' }
            };

            detector.reportPerformanceIssue(issue);
            expect(mockService.reportPerformanceIssue).toHaveBeenCalledWith(issue);
        });

        test('getIssues should call service.getIssues and return its result', () => {
            const mockIssues = [
                {
                    type: 'memory-usage',
                    metric: 100,
                    threshold: 50,
                    sessionId: 'session1'
                }
            ];
            mockService.getIssues.mockReturnValue(mockIssues);

            const result = detector.getIssues('session1');

            expect(mockService.getIssues).toHaveBeenCalledWith('session1');
            expect(result).toEqual(mockIssues);
        });

        test('getOperationsCount should call service.getOperationsCount', () => {
            mockService.getOperationsCount.mockReturnValue(42);

            const result = detector.getOperationsCount();

            expect(mockService.getOperationsCount).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        test('incrementOperationsCount should call service.incrementOperationsCount', () => {
            detector.incrementOperationsCount();
            expect(mockService.incrementOperationsCount).toHaveBeenCalled();
        });

        test('resetOperationsCount should call service.resetOperationsCount', () => {
            detector.resetOperationsCount();
            expect(mockService.resetOperationsCount).toHaveBeenCalled();
        });

        test('getPatternAnalysis should call service.getPatternAnalysis', () => {
            const mockPatterns = [
                {
                    operationId: 'op1',
                    avgDuration: 100,
                    frequency: 5,
                    memoryImpact: 10,
                    dependencies: ['op2']
                }
            ];
            mockService.getPatternAnalysis.mockReturnValue(mockPatterns);

            const result = detector.getPatternAnalysis('session1');

            expect(mockService.getPatternAnalysis).toHaveBeenCalledWith('session1');
            expect(result).toEqual(mockPatterns);
        });

        test('getSummary should call service.getSummary', () => {
            const mockSummary = {
                totalOperations: 100,
                slowOperations: 5,
                criticalOperations: 2
            };
            mockService.getSummary.mockReturnValue(mockSummary);

            const result = detector.getSummary();

            expect(mockService.getSummary).toHaveBeenCalled();
            expect(result).toEqual(mockSummary);
        });

        test('clear should call service.clear', () => {
            detector.clear();
            expect(mockService.clear).toHaveBeenCalled();
        });
    });

    describe('Event Emitter Functionality', () => {
        test('BottleneckDetector should extend EventEmitter', () => {
            expect(detector).toBeInstanceOf(EventEmitter);
        });

        test('should be able to register event listeners', () => {
            const listener = jest.fn();
            detector.on('bottleneck', listener);

            detector.emit('bottleneck', { operationId: 'op1' });

            expect(listener).toHaveBeenCalledWith({ operationId: 'op1' });
        });

        test('should be able to remove event listeners', () => {
            const listener = jest.fn();
            detector.on('bottleneck', listener);
            detector.removeListener('bottleneck', listener);

            detector.emit('bottleneck', { operationId: 'op1' });

            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should handle errors from service methods', () => {
            // Mock service method to throw an error
            mockService.analyzeOperation.mockImplementation(() => {
                throw new Error('Service error');
            });

            // The detector should catch and handle the error
            expect(() => {
                detector.analyzeOperation('operation1');
            }).not.toThrow();

            // But the method should still forward the call to the service
            expect(mockService.analyzeOperation).toHaveBeenCalledWith('operation1');
        });
    });
});
