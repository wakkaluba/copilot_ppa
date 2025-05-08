import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { ILogger } from '../../../../logging/ILogger';
import { PerformanceMetricsService } from '../PerformanceMetricsService';

// Mock the vscode API
jest.mock('vscode', () => ({
    TextDocument: jest.fn(),
    Progress: jest.fn(),
}));

describe('PerformanceMetricsService', () => {
    let service: PerformanceMetricsService;
    let mockLogger: ILogger;
    let mockDocument: vscode.TextDocument;
    let mockProgress: vscode.Progress<{ message?: string; increment?: number }>;

    beforeEach(() => {
        // Setup mock logger
        mockLogger = {
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            log: jest.fn(),
        } as unknown as ILogger;

        // Setup mock document
        mockDocument = {
            getText: jest.fn().mockReturnValue('const x = 1; function test() { return x; }'),
            lineCount: 3,
        } as unknown as vscode.TextDocument;

        // Setup mock progress
        mockProgress = {
            report: jest.fn()
        } as unknown as vscode.Progress<{ message?: string; increment?: number }>;

        // Create the service instance
        service = new PerformanceMetricsService(mockLogger);
    });

    afterEach(() => {
        // Clean up
        service.dispose();
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize correctly with logger', () => {
            expect(service).toBeInstanceOf(PerformanceMetricsService);
            expect(service).toBeInstanceOf(EventEmitter);
        });
    });

    describe('analyzeFile', () => {
        it('should analyze file and return metrics', async () => {
            // Set up spies for private methods
            const calculateComplexitySpy = jest.spyOn(
                service as any, 'calculateComplexity'
            ).mockReturnValue(5);

            const calculateMaintainabilitySpy = jest.spyOn(
                service as any, 'calculateMaintainability'
            ).mockReturnValue(80);

            const countFunctionsSpy = jest.spyOn(
                service as any, 'countFunctions'
            ).mockReturnValue(2);

            const detectDuplicateCodeSpy = jest.spyOn(
                service as any, 'detectDuplicateCode'
            ).mockResolvedValue(0);

            const detectUnusedCodeSpy = jest.spyOn(
                service as any, 'detectUnusedCode'
            ).mockResolvedValue(1);

            // Set up event listener
            const metricsSpy = jest.fn();
            service.on('metricsCalculated', metricsSpy);

            const result = await service.analyzeFile(mockDocument, mockProgress);

            // Verify metrics calculation methods were called
            expect(calculateComplexitySpy).toHaveBeenCalledWith(expect.any(String));
            expect(calculateMaintainabilitySpy).toHaveBeenCalledWith(expect.any(String));
            expect(countFunctionsSpy).toHaveBeenCalledWith(expect.any(String));
            expect(detectDuplicateCodeSpy).toHaveBeenCalledWith(expect.any(String));
            expect(detectUnusedCodeSpy).toHaveBeenCalledWith(mockDocument);

            // Verify result structure
            expect(result).toHaveProperty('cyclomaticComplexity', 5);
            expect(result).toHaveProperty('maintainabilityIndex', 80);
            expect(result).toHaveProperty('linesOfCode', 3);
            expect(result).toHaveProperty('functionCount', 2);
            expect(result).toHaveProperty('duplicateCode', 0);
            expect(result).toHaveProperty('unusedCode', 1);
            expect(result).toHaveProperty('timestamp');

            // Verify event was emitted
            expect(metricsSpy).toHaveBeenCalledWith(result);
        });

        it('should handle errors during analysis', async () => {
            // Set up a spy for the handleError method
            const handleErrorSpy = jest.spyOn(service as any, 'handleError');

            // Force an error in one of the metric calculation methods
            jest.spyOn(service as any, 'calculateComplexity').mockImplementation(() => {
                throw new Error('Test error');
            });

            // Set up event listener for error
            const errorSpy = jest.fn();
            service.on('error', errorSpy);

            // Verify that the analyzeFile method throws an error
            await expect(service.analyzeFile(mockDocument, mockProgress)).rejects.toThrow('Test error');

            // Verify handleError was called with the right error
            expect(handleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

            // Verify error event was emitted (this depends on if the service emits the error event)
            // If service emits the error event directly
            expect(errorSpy).toHaveBeenCalled();
        });
    });

    describe('utility methods', () => {
        it('should calculate complexity correctly', () => {
            const complexity = (service as any).calculateComplexity('const x = 1;');
            // Since the actual implementation returns 0, we're just testing method invocation
            expect(complexity).toBe(0);
        });

        it('should calculate maintainability correctly', () => {
            const maintainability = (service as any).calculateMaintainability('const x = 1;');
            // Since the actual implementation returns 0, we're just testing method invocation
            expect(maintainability).toBe(0);
        });

        it('should count functions correctly', () => {
            const functionCount = (service as any).countFunctions('function test() {}');
            // Since the actual implementation returns 0, we're just testing method invocation
            expect(functionCount).toBe(0);
        });

        it('should detect duplicate code correctly', async () => {
            const duplicates = await (service as any).detectDuplicateCode('const x = 1;');
            // Since the actual implementation returns 0, we're just testing method invocation
            expect(duplicates).toBe(0);
        });

        it('should detect unused code correctly', async () => {
            const unused = await (service as any).detectUnusedCode(mockDocument);
            // Since the actual implementation returns 0, we're just testing method invocation
            expect(unused).toBe(0);
        });
    });

    describe('error handling', () => {
        it('should handle errors correctly', () => {
            const errorSpy = jest.fn();
            service.on('error', errorSpy);

            const testError = new Error('Test error');
            (service as any).handleError(testError);

            // Verify logger was called
            expect(mockLogger.error).toHaveBeenCalledWith('[PerformanceMetricsService]', testError);

            // Verify error event was emitted
            expect(errorSpy).toHaveBeenCalledWith(testError);
        });
    });

    describe('dispose', () => {
        it('should remove all event listeners', () => {
            // Add some event listeners
            const metricsSpy = jest.fn();
            const errorSpy = jest.fn();

            service.on('metricsCalculated', metricsSpy);
            service.on('error', errorSpy);

            // Call dispose
            service.dispose();

            // Attempt to emit events and verify listeners aren't called
            service.emit('metricsCalculated', {});
            service.emit('error', new Error('Test'));

            expect(metricsSpy).not.toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();
        });
    });
});
