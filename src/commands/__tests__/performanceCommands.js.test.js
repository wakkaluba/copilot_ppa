// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\performanceCommands.js.test.js
const vscode = require('vscode');
const sinon = require('sinon');
const { afterEach, beforeEach, describe, expect, it } = require('@jest/globals');
const { registerPerformanceCommands } = require('../performanceCommands');
const { PerformanceManager } = require('../../performance/performanceManager');
const { Logger } = require('../../utils/logger');

describe('Performance Commands', () => {
    let sandbox;
    let mockContext;
    let mockCommands;
    let mockWindow;
    let mockWorkspace;
    let mockQuickPick;
    let mockInfoMessage;
    let mockWarningMessage;

    // Mock PerformanceManager
    let mockPerfManager;
    let mockCachingService;
    let mockBottleneckDetector;
    let mockProfiler;

    // Mock Logger
    let mockLogger;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock VS Code extension context
        mockContext = {
            subscriptions: []
        };

        // Mock VS Code window APIs
        mockQuickPick = sandbox.stub();
        mockInfoMessage = sandbox.stub();
        mockWarningMessage = sandbox.stub();

        mockWindow = {
            showQuickPick: mockQuickPick,
            showInformationMessage: mockInfoMessage,
            showWarningMessage: mockWarningMessage
        };

        // Mock VS Code workspace APIs
        const mockConfig = {
            get: sandbox.stub().returns(false), // Default to profiling disabled
            update: sandbox.stub().resolves()
        };

        mockWorkspace = {
            getConfiguration: sandbox.stub().returns(mockConfig)
        };

        // Mock VS Code commands
        mockCommands = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };

        // Replace VS Code namespaces with mocks
        sandbox.stub(vscode, 'window').value(mockWindow);
        sandbox.stub(vscode, 'workspace').value(mockWorkspace);
        sandbox.stub(vscode, 'commands').value(mockCommands);
        sandbox.stub(vscode, 'ConfigurationTarget').value({ Global: 1 });

        // Mock caching service
        mockCachingService = {
            clearAll: sandbox.stub()
        };

        // Mock bottleneck detector
        mockBottleneckDetector = {
            analyzeAll: sandbox.stub().returns({
                critical: [],
                warnings: []
            }),
            getOptimizationSuggestions: sandbox.stub().returns([
                'Suggestion 1',
                'Suggestion 2'
            ])
        };

        // Mock profiler
        mockProfiler = {
            getAllStats: sandbox.stub().returns(new Map([
                ['operation1', { duration: 100 }],
                ['operation2', { duration: 200 }]
            ]))
        };

        // Mock PerformanceManager
        mockPerfManager = {
            initialize: sandbox.stub(),
            generatePerformanceReport: sandbox.stub(),
            getCachingService: sandbox.stub().returns(mockCachingService),
            getBottleneckDetector: sandbox.stub().returns(mockBottleneckDetector),
            getProfiler: sandbox.stub().returns(mockProfiler)
        };

        // Mock PerformanceManager.getInstance
        sandbox.stub(PerformanceManager, 'getInstance').returns(mockPerfManager);

        // Mock Logger
        mockLogger = {
            log: sandbox.stub()
        };

        // Mock Logger.getInstance
        sandbox.stub(Logger, 'getInstance').returns(mockLogger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerPerformanceCommands', () => {
        it('should register all performance commands', () => {
            registerPerformanceCommands(mockContext);

            // Verify commands are registered
            expect(mockCommands.registerCommand.callCount).toBe(5);
            expect(mockCommands.registerCommand.args[0][0]).toBe('localLLMAgent.performance.toggleProfiling');
            expect(mockCommands.registerCommand.args[1][0]).toBe('localLLMAgent.performance.generateReport');
            expect(mockCommands.registerCommand.args[2][0]).toBe('localLLMAgent.performance.clearCache');
            expect(mockCommands.registerCommand.args[3][0]).toBe('localLLMAgent.performance.analyzeBottlenecks');
            expect(mockCommands.registerCommand.args[4][0]).toBe('localLLMAgent.performance.optimizationSuggestions');

            // Verify context subscriptions are updated
            expect(mockContext.subscriptions.length).toBe(5);

            // Verify logger output
            expect(mockLogger.log).toHaveBeenCalledWith('Performance commands registered');
        });
    });

    describe('toggleProfiling command', () => {
        beforeEach(() => {
            registerPerformanceCommands(mockContext);
        });

        it('should enable profiling when currently disabled', async () => {
            // Mock current config value (profiling disabled)
            const mockConfig = {
                get: sandbox.stub().returns(false),
                update: sandbox.stub().resolves()
            };
            mockWorkspace.getConfiguration.returns(mockConfig);

            // Get the command callback
            const toggleProfilingCallback = mockCommands.registerCommand.args[0][1];

            // Call the command
            await toggleProfilingCallback();

            // Verify config was updated to enable profiling
            expect(mockConfig.update).toHaveBeenCalledWith('profilingEnabled', true, 1);

            // Verify performance manager was reinitialized
            expect(mockPerfManager.initialize).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('Performance profiling enabled');
        });

        it('should disable profiling when currently enabled', async () => {
            // Mock current config value (profiling enabled)
            const mockConfig = {
                get: sandbox.stub().returns(true),
                update: sandbox.stub().resolves()
            };
            mockWorkspace.getConfiguration.returns(mockConfig);

            // Get the command callback
            const toggleProfilingCallback = mockCommands.registerCommand.args[0][1];

            // Call the command
            await toggleProfilingCallback();

            // Verify config was updated to disable profiling
            expect(mockConfig.update).toHaveBeenCalledWith('profilingEnabled', false, 1);

            // Verify performance manager was reinitialized
            expect(mockPerfManager.initialize).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('Performance profiling disabled');
        });
    });

    describe('generateReport command', () => {
        beforeEach(() => {
            registerPerformanceCommands(mockContext);
        });

        it('should generate a performance report', () => {
            // Get the command callback
            const generateReportCallback = mockCommands.registerCommand.args[1][1];

            // Call the command
            generateReportCallback();

            // Verify performance manager was called
            expect(mockPerfManager.generatePerformanceReport).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('Performance report generated. Check the output log.');
        });
    });

    describe('clearCache command', () => {
        beforeEach(() => {
            registerPerformanceCommands(mockContext);
        });

        it('should clear the cache', () => {
            // Get the command callback
            const clearCacheCallback = mockCommands.registerCommand.args[2][1];

            // Call the command
            clearCacheCallback();

            // Verify caching service was called
            expect(mockCachingService.clearAll).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('Cache cleared successfully.');
        });
    });

    describe('analyzeBottlenecks command', () => {
        beforeEach(() => {
            registerPerformanceCommands(mockContext);
        });

        it('should show message when no bottlenecks are found', () => {
            // Mock empty bottleneck results
            mockBottleneckDetector.analyzeAll.returns({
                critical: [],
                warnings: []
            });

            // Get the command callback
            const analyzeBottlenecksCallback = mockCommands.registerCommand.args[3][1];

            // Call the command
            analyzeBottlenecksCallback();

            // Verify bottleneck detector was called
            expect(mockBottleneckDetector.analyzeAll).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('No performance bottlenecks detected.');

            // Verify logger was not called (since no bottlenecks were found)
            expect(mockLogger.log).not.toHaveBeenCalledWith('=== BOTTLENECK ANALYSIS ===');
        });

        it('should log critical bottlenecks when found', () => {
            // Mock bottleneck results with critical issues
            mockBottleneckDetector.analyzeAll.returns({
                critical: ['operation1', 'operation2'],
                warnings: []
            });

            // Get the command callback
            const analyzeBottlenecksCallback = mockCommands.registerCommand.args[3][1];

            // Call the command
            analyzeBottlenecksCallback();

            // Verify bottleneck detector was called
            expect(mockBottleneckDetector.analyzeAll).toHaveBeenCalled();

            // Verify logger outputs
            expect(mockLogger.log).toHaveBeenCalledWith('=== BOTTLENECK ANALYSIS ===');
            expect(mockLogger.log).toHaveBeenCalledWith('Critical bottlenecks (2):');
            expect(mockLogger.log).toHaveBeenCalledWith('- operation1');
            expect(mockLogger.log).toHaveBeenCalledWith('- operation2');
            expect(mockLogger.log).toHaveBeenCalledWith('==========================');

            // Verify user notification
            expect(mockWarningMessage).toHaveBeenCalledWith('Found 2 critical and 0 warning bottlenecks. See output log for details.');
        });

        it('should log warning bottlenecks when found', () => {
            // Mock bottleneck results with warnings
            mockBottleneckDetector.analyzeAll.returns({
                critical: [],
                warnings: ['operation3', 'operation4']
            });

            // Get the command callback
            const analyzeBottlenecksCallback = mockCommands.registerCommand.args[3][1];

            // Call the command
            analyzeBottlenecksCallback();

            // Verify bottleneck detector was called
            expect(mockBottleneckDetector.analyzeAll).toHaveBeenCalled();

            // Verify logger outputs
            expect(mockLogger.log).toHaveBeenCalledWith('=== BOTTLENECK ANALYSIS ===');
            expect(mockLogger.log).toHaveBeenCalledWith('Performance warnings (2):');
            expect(mockLogger.log).toHaveBeenCalledWith('- operation3');
            expect(mockLogger.log).toHaveBeenCalledWith('- operation4');
            expect(mockLogger.log).toHaveBeenCalledWith('==========================');

            // Verify user notification
            expect(mockWarningMessage).toHaveBeenCalledWith('Found 0 critical and 2 warning bottlenecks. See output log for details.');
        });

        it('should log both critical and warning bottlenecks when found', () => {
            // Mock bottleneck results with both critical and warnings
            mockBottleneckDetector.analyzeAll.returns({
                critical: ['operation1'],
                warnings: ['operation3']
            });

            // Get the command callback
            const analyzeBottlenecksCallback = mockCommands.registerCommand.args[3][1];

            // Call the command
            analyzeBottlenecksCallback();

            // Verify bottleneck detector was called
            expect(mockBottleneckDetector.analyzeAll).toHaveBeenCalled();

            // Verify logger outputs
            expect(mockLogger.log).toHaveBeenCalledWith('=== BOTTLENECK ANALYSIS ===');
            expect(mockLogger.log).toHaveBeenCalledWith('Critical bottlenecks (1):');
            expect(mockLogger.log).toHaveBeenCalledWith('- operation1');
            expect(mockLogger.log).toHaveBeenCalledWith('Performance warnings (1):');
            expect(mockLogger.log).toHaveBeenCalledWith('- operation3');
            expect(mockLogger.log).toHaveBeenCalledWith('==========================');

            // Verify user notification
            expect(mockWarningMessage).toHaveBeenCalledWith('Found 1 critical and 1 warning bottlenecks. See output log for details.');
        });
    });

    describe('optimizationSuggestions command', () => {
        beforeEach(() => {
            registerPerformanceCommands(mockContext);
        });

        it('should show message when no operations data available', async () => {
            // Mock empty operations data
            mockProfiler.getAllStats.returns(new Map());

            // Get the command callback
            const optimizationSuggestionsCallback = mockCommands.registerCommand.args[4][1];

            // Call the command
            await optimizationSuggestionsCallback();

            // Verify profiler was called
            expect(mockProfiler.getAllStats).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('No operations data available for optimization suggestions.');

            // Verify QuickPick was not shown
            expect(mockQuickPick).not.toHaveBeenCalled();
        });

        it('should show optimization suggestions for selected operation', async () => {
            // Mock QuickPick selection
            mockQuickPick.resolves('operation1');

            // Get the command callback
            const optimizationSuggestionsCallback = mockCommands.registerCommand.args[4][1];

            // Call the command
            await optimizationSuggestionsCallback();

            // Verify profiler was called
            expect(mockProfiler.getAllStats).toHaveBeenCalled();

            // Verify QuickPick was shown with correct operations
            expect(mockQuickPick).toHaveBeenCalledWith(['operation1', 'operation2'], {
                placeHolder: 'Select an operation to get optimization suggestions'
            });

            // Verify bottleneck detector was called for optimization suggestions
            expect(mockBottleneckDetector.getOptimizationSuggestions).toHaveBeenCalledWith('operation1');

            // Verify logger outputs
            expect(mockLogger.log).toHaveBeenCalledWith('=== OPTIMIZATION SUGGESTIONS FOR operation1 ===');
            expect(mockLogger.log).toHaveBeenCalledWith('1. Suggestion 1');
            expect(mockLogger.log).toHaveBeenCalledWith('2. Suggestion 2');
            expect(mockLogger.log).toHaveBeenCalledWith('==========================================');

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('Optimization suggestions available in output log.');
        });

        it('should do nothing if no operation is selected', async () => {
            // Mock QuickPick cancellation
            mockQuickPick.resolves(undefined);

            // Get the command callback
            const optimizationSuggestionsCallback = mockCommands.registerCommand.args[4][1];

            // Call the command
            await optimizationSuggestionsCallback();

            // Verify profiler was called
            expect(mockProfiler.getAllStats).toHaveBeenCalled();

            // Verify QuickPick was shown
            expect(mockQuickPick).toHaveBeenCalled();

            // Verify bottleneck detector was NOT called for optimization suggestions
            expect(mockBottleneckDetector.getOptimizationSuggestions).not.toHaveBeenCalled();

            // Verify no user notification was shown for suggestions
            expect(mockInfoMessage).not.toHaveBeenCalledWith('Optimization suggestions available in output log.');
        });
    });
});
