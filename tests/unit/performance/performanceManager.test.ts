import * as vscode from 'vscode';
import { AsyncOptimizer } from '../../../src/performance/asyncOptimizer';
import { BottleneckDetector } from '../../../src/performance/bottleneckDetector';
import { CachingService } from '../../../src/performance/cachingService';
import { PerformanceManager } from '../../../src/performance/performanceManager';
import { PerformanceProfiler } from '../../../src/performance/performanceProfiler';
import { Logger } from '../../../src/utils/logger';

jest.mock('vscode');
jest.mock('../../../src/performance/performanceProfiler');
jest.mock('../../../src/performance/bottleneckDetector');
jest.mock('../../../src/performance/cachingService');
jest.mock('../../../src/performance/asyncOptimizer');
jest.mock('../../../src/utils/logger');

describe('PerformanceManager', () => {
    let performanceManager: PerformanceManager;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Get singleton instance
        performanceManager = PerformanceManager.getInstance();
    });

    describe('Initialization', () => {
        test('should initialize with default configuration', () => {
            performanceManager.initialize();

            expect(PerformanceProfiler.getInstance).toHaveBeenCalled();
            expect(BottleneckDetector.getInstance).toHaveBeenCalled();
            expect(CachingService.getInstance).toHaveBeenCalled();
            expect(AsyncOptimizer.getInstance).toHaveBeenCalled();
            expect(Logger.getInstance).toHaveBeenCalled();
        });

        test('should load configuration from VS Code settings', () => {
            const mockConfig = {
                get: jest.fn().mockImplementation((setting: string, defaultValue: any) => defaultValue)
            };

            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

            performanceManager.initialize();

            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('copilot-ppa.performance');
            expect(mockConfig.get).toHaveBeenCalledWith('profilingEnabled', false);
            expect(mockConfig.get).toHaveBeenCalledWith('bottleneckDetectionEnabled', false);
            expect(mockConfig.get).toHaveBeenCalledWith('cachingEnabled', true);
            expect(mockConfig.get).toHaveBeenCalledWith('maxCacheItems', 100);
            expect(mockConfig.get).toHaveBeenCalledWith('reportIntervalMinutes', 30);
        });
    });

    describe('Performance Reporting', () => {
        test('should generate performance report', () => {
            const mockProfiler = {
                getOperationStats: jest.fn().mockReturnValue([
                    { id: 'op1', count: 10, avg: 100 },
                    { id: 'op2', count: 5, avg: 200 }
                ])
            };

            const mockBottleneckDetector = {
                analyzeAll: jest.fn().mockReturnValue({
                    critical: ['Critical bottleneck 1'],
                    warnings: ['Warning 1', 'Warning 2']
                })
            };

            (PerformanceProfiler.getInstance as jest.Mock).mockReturnValue(mockProfiler);
            (BottleneckDetector.getInstance as jest.Mock).mockReturnValue(mockBottleneckDetector);

            performanceManager.generatePerformanceReport();

            expect(mockProfiler.getOperationStats).toHaveBeenCalled();
            expect(mockBottleneckDetector.analyzeAll).toHaveBeenCalled();
            expect(Logger.getInstance().log).toHaveBeenCalledWith(expect.stringContaining('Critical bottlenecks detected: 1'));
            expect(Logger.getInstance().log).toHaveBeenCalledWith(expect.stringContaining('Performance warnings detected: 2'));
        });
    });

    describe('Service Access', () => {
        test('should provide access to performance services', () => {
            const profiler = performanceManager.getProfiler();
            const bottleneckDetector = performanceManager.getBottleneckDetector();
            const cachingService = performanceManager.getCachingService();
            const asyncOptimizer = performanceManager.getAsyncOptimizer();

            expect(profiler).toBeDefined();
            expect(bottleneckDetector).toBeDefined();
            expect(cachingService).toBeDefined();
            expect(asyncOptimizer).toBeDefined();
        });
    });

    describe('Cleanup', () => {
        test('should dispose resources properly', () => {
            const mockCachingService = {
                dispose: jest.fn()
            };

            const mockAsyncOptimizer = {
                dispose: jest.fn()
            };

            (CachingService.getInstance as jest.Mock).mockReturnValue(mockCachingService);
            (AsyncOptimizer.getInstance as jest.Mock).mockReturnValue(mockAsyncOptimizer);

            performanceManager.dispose();

            expect(mockCachingService.dispose).toHaveBeenCalled();
            expect(mockAsyncOptimizer.dispose).toHaveBeenCalled();
            expect(Logger.getInstance().log).toHaveBeenCalledWith('Performance manager disposed');
        });
    });
});
