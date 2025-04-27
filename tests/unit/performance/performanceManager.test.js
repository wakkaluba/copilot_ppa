"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var performanceManager_1 = require("../../../src/performance/performanceManager");
var performanceProfiler_1 = require("../../../src/performance/performanceProfiler");
var bottleneckDetector_1 = require("../../../src/performance/bottleneckDetector");
var cachingService_1 = require("../../../src/performance/cachingService");
var asyncOptimizer_1 = require("../../../src/performance/asyncOptimizer");
var logger_1 = require("../../../src/utils/logger");
jest.mock('vscode');
jest.mock('../../../src/performance/performanceProfiler');
jest.mock('../../../src/performance/bottleneckDetector');
jest.mock('../../../src/performance/cachingService');
jest.mock('../../../src/performance/asyncOptimizer');
jest.mock('../../../src/utils/logger');
describe('PerformanceManager', function () {
    var performanceManager;
    beforeEach(function () {
        // Reset all mocks
        jest.clearAllMocks();
        // Get singleton instance
        performanceManager = performanceManager_1.PerformanceManager.getInstance();
    });
    describe('Initialization', function () {
        test('should initialize with default configuration', function () {
            performanceManager.initialize();
            expect(performanceProfiler_1.PerformanceProfiler.getInstance).toHaveBeenCalled();
            expect(bottleneckDetector_1.BottleneckDetector.getInstance).toHaveBeenCalled();
            expect(cachingService_1.CachingService.getInstance).toHaveBeenCalled();
            expect(asyncOptimizer_1.AsyncOptimizer.getInstance).toHaveBeenCalled();
            expect(logger_1.Logger.getInstance).toHaveBeenCalled();
        });
        test('should load configuration from VS Code settings', function () {
            var mockConfig = {
                get: jest.fn().mockImplementation(function (setting, defaultValue) { return defaultValue; })
            };
            vscode.workspace.getConfiguration.mockReturnValue(mockConfig);
            performanceManager.initialize();
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('localLLMAgent.performance');
            expect(mockConfig.get).toHaveBeenCalledWith('profilingEnabled', false);
            expect(mockConfig.get).toHaveBeenCalledWith('bottleneckDetectionEnabled', false);
            expect(mockConfig.get).toHaveBeenCalledWith('cachingEnabled', true);
            expect(mockConfig.get).toHaveBeenCalledWith('maxCacheItems', 100);
            expect(mockConfig.get).toHaveBeenCalledWith('reportIntervalMinutes', 30);
        });
    });
    describe('Performance Reporting', function () {
        test('should generate performance report', function () {
            var mockProfiler = {
                getOperationStats: jest.fn().mockReturnValue([
                    { id: 'op1', count: 10, avg: 100 },
                    { id: 'op2', count: 5, avg: 200 }
                ])
            };
            var mockBottleneckDetector = {
                analyzeAll: jest.fn().mockReturnValue({
                    critical: ['Critical bottleneck 1'],
                    warnings: ['Warning 1', 'Warning 2']
                })
            };
            performanceProfiler_1.PerformanceProfiler.getInstance.mockReturnValue(mockProfiler);
            bottleneckDetector_1.BottleneckDetector.getInstance.mockReturnValue(mockBottleneckDetector);
            performanceManager.generatePerformanceReport();
            expect(mockProfiler.getOperationStats).toHaveBeenCalled();
            expect(mockBottleneckDetector.analyzeAll).toHaveBeenCalled();
            expect(logger_1.Logger.getInstance().log).toHaveBeenCalledWith(expect.stringContaining('Critical bottlenecks detected: 1'));
            expect(logger_1.Logger.getInstance().log).toHaveBeenCalledWith(expect.stringContaining('Performance warnings detected: 2'));
        });
    });
    describe('Service Access', function () {
        test('should provide access to performance services', function () {
            var profiler = performanceManager.getProfiler();
            var bottleneckDetector = performanceManager.getBottleneckDetector();
            var cachingService = performanceManager.getCachingService();
            var asyncOptimizer = performanceManager.getAsyncOptimizer();
            expect(profiler).toBeDefined();
            expect(bottleneckDetector).toBeDefined();
            expect(cachingService).toBeDefined();
            expect(asyncOptimizer).toBeDefined();
        });
    });
    describe('Cleanup', function () {
        test('should dispose resources properly', function () {
            var mockCachingService = {
                dispose: jest.fn()
            };
            var mockAsyncOptimizer = {
                dispose: jest.fn()
            };
            cachingService_1.CachingService.getInstance.mockReturnValue(mockCachingService);
            asyncOptimizer_1.AsyncOptimizer.getInstance.mockReturnValue(mockAsyncOptimizer);
            performanceManager.dispose();
            expect(mockCachingService.dispose).toHaveBeenCalled();
            expect(mockAsyncOptimizer.dispose).toHaveBeenCalled();
            expect(logger_1.Logger.getInstance().log).toHaveBeenCalledWith('Performance manager disposed');
        });
    });
});
