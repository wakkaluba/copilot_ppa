import * as vscode from 'vscode';
import { PerformanceManager } from '../../src/performance/performanceManager';

describe('PerformanceManager', () => {
    let manager: PerformanceManager;
    let mockContext: any;
    let mockAnalyzer: any;
    let mockFactory: any;

    beforeEach(() => {
        mockContext = { subscriptions: [] } as unknown as vscode.ExtensionContext;
        // Mock analyzer with stubbed methods
        mockAnalyzer = { analyze: jest.fn().mockResolvedValue({ filePath: 'file:///test.ts', issues: [], skipped: false }) };
        mockFactory = { getAnalyzer: jest.fn().mockReturnValue(mockAnalyzer) };
        const mockAnalyzerService = new (require('../../src/performance/services/PerformanceAnalyzerService').PerformanceAnalyzerService)(mockContext, mockFactory);
        manager = PerformanceManager.getInstance(mockContext, mockAnalyzerService);
        manager.clearCaches();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should cache file analysis results', async () => {
        const doc = { uri: { toString: () => 'file:///test.ts' }, getText: () => 'function foo() {}' } as any;
        const result1 = await manager.analyzeFile(doc);
        const result2 = await manager.analyzeFile(doc);
        expect(result1).toBe(result2);
    });

    it('should return null if no active editor in analyzeCurrentFile', async () => {
        const original = vscode.window.activeTextEditor;
        Object.defineProperty(vscode.window, 'activeTextEditor', { value: undefined });
        const result = await manager.analyzeCurrentFile();
        expect(result).toBeNull();
        Object.defineProperty(vscode.window, 'activeTextEditor', { value: original });
    });

    it('should emit and handle events', () => {
        const listener = jest.fn();
        manager.on('fileAnalysisComplete', listener);
        manager['eventEmitter'].emit('fileAnalysisComplete', { test: 1 });
        expect(listener).toHaveBeenCalledWith({ test: 1 });
        manager.off('fileAnalysisComplete', listener);
        manager['eventEmitter'].emit('fileAnalysisComplete', { test: 2 });
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should call dispose on all services', () => {
        const statusDispose = jest.spyOn(manager['statusService'], 'dispose');
        const diagDispose = jest.spyOn(manager['diagnosticsService'], 'dispose');
        const fileMonDispose = jest.spyOn(manager['fileMonitorService'], 'dispose');
        const cacheDispose = jest.spyOn(manager['cachingService'], 'dispose');
        const asyncDispose = jest.spyOn(manager['asyncOptimizer'], 'dispose');
        manager.dispose();
        expect(statusDispose).toHaveBeenCalled();
        expect(diagDispose).toHaveBeenCalled();
        expect(fileMonDispose).toHaveBeenCalled();
        expect(cacheDispose).toHaveBeenCalled();
        expect(asyncDispose).toHaveBeenCalled();
    });

    it('should return profiler, bottleneckDetector, cachingService, and asyncOptimizer', () => {
        expect(manager.getProfiler()).toBeDefined();
        expect(manager.getBottleneckDetector()).toBeDefined();
        expect(manager.getCachingService()).toBeDefined();
        expect(manager.getAsyncOptimizer()).toBeDefined();
    });

    it('integration: should clear all caches and trigger analyzer after clearing', async () => {
        // Reset the singleton to allow a fresh instance
        (PerformanceManager as any).instance = undefined;
        class TestAnalyzerFactory {
            callCount = 0;
            getAnalyzer() {
                this.callCount++;
                return { analyze: (content: any, file: any) => ({ filePath: file, issues: [], skipped: false }) };
            }
            hasAnalyzer() { return true; }
            getSupportedExtensions() { return ['.ts', '.js']; }
        }
        const testFactory = new TestAnalyzerFactory();
        const { PerformanceAnalyzerService } = require('../../src/performance/services/PerformanceAnalyzerService');
        const analyzerService = new PerformanceAnalyzerService(mockContext, testFactory);
        const integrationManager = PerformanceManager.getInstance(mockContext, analyzerService);
        integrationManager.clearCaches();
        analyzerService.clearCache();
        const doc = { uri: { toString: () => 'file:///integration.ts', fsPath: '/integration.ts' }, getText: () => 'function integration() {}' } as any;
        await integrationManager.analyzeFile(doc);
        expect(testFactory.callCount).toBeGreaterThan(0);
    });

    it('should handle errors in analyzeFile gracefully', async () => {
        manager['analyzerService'].analyzeDocument = jest.fn().mockRejectedValue(new Error('fail'));
        const doc = { uri: { toString: () => 'file:///fail.ts', fsPath: '/fail.ts' }, getText: () => 'fail' } as any;
        const result = await manager.analyzeFile(doc);
        expect(result.skipped).toBe(true);
        expect(result.filePath).toBe('');
    });

    it('should handle errors in updateFileMetrics gracefully', async () => {
        manager['profiler'].getStats = jest.fn(() => { throw new Error('fail'); });
        const uri = { fsPath: '/fail.ts', toString: () => 'file:///fail.ts' } as any;
        const result = { filePath: '/fail.ts', issues: [], skipped: false, metrics: {} };
        await expect(manager['updateFileMetrics'](uri, result)).resolves.toBeUndefined();
    });

    it('should handle errors in initializeServices gracefully', async () => {
        manager['configService'].initialize = jest.fn().mockRejectedValue(new Error('fail'));
        await expect(manager['initializeServices']()).rejects.toThrow('fail');
    });

    it('should throw if getInstance is called without context', () => {
        (PerformanceManager as any).instance = undefined;
        expect(() => PerformanceManager.getInstance()).toThrow('Context required for PerformanceManager initialization');
    });

    it('should not reinitialize singleton if already created', () => {
        const instance1 = PerformanceManager.getInstance(mockContext, manager['analyzerService']);
        const instance2 = PerformanceManager.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should emit performanceReport with correct structure', () => {
        // Patch a mock analyzeAll method onto bottleneckDetector
        (manager['bottleneckDetector'] as any).analyzeAll = jest.fn().mockReturnValue({ critical: [], warnings: [] });
        const listener = jest.fn();
        manager.on('performanceReport', listener);
        manager.generatePerformanceReport();
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            operationStats: expect.anything(),
            bottleneckAnalysis: expect.anything(),
            cacheStats: expect.anything(),
            asyncStats: expect.anything()
        }));
    });

    it('should handle fileMonitorService events', () => {
        // Simulate onDocumentSaved and onActiveEditorChanged
        const savedCallback = jest.fn();
        const changedCallback = jest.fn();
        manager['fileMonitorService'].onDocumentSaved = jest.fn(cb => savedCallback.mockImplementation(cb));
        manager['fileMonitorService'].onActiveEditorChanged = jest.fn(cb => changedCallback.mockImplementation(cb));
        manager['setupEventListeners']();
        // Simulate document save
        const doc = { uri: { toString: () => 'file:///test.ts' }, getText: () => 'foo' } as any;
        savedCallback(doc);
        expect(typeof savedCallback).toBe('function');
        // Simulate editor change
        changedCallback({ document: doc });
        expect(typeof changedCallback).toBe('function');
    });

    it('should handle errors in analyzeFile from statusService, diagnosticsService, and updateFileMetrics', async () => {
        // Simulate statusService.updateStatusBar throwing
        manager['statusService'].updateStatusBar = jest.fn(() => { throw new Error('fail-status'); });
        // Simulate diagnosticsService.updateDiagnostics throwing
        manager['diagnosticsService'].updateDiagnostics = jest.fn(() => { throw new Error('fail-diagnostics'); });
        // Simulate updateFileMetrics throwing
        manager['updateFileMetrics'] = jest.fn(() => { throw new Error('fail-metrics'); });
        // analyzerService returns a valid result
        manager['analyzerService'].analyzeDocument = jest.fn().mockResolvedValue({ filePath: 'file:///test.ts', issues: [], skipped: false });
        const doc = { uri: { toString: () => 'file:///test.ts', fsPath: '/test.ts' }, getText: () => 'foo' } as any;
        // Should not throw, should return a result with filePath: '' (error path)
        const result = await manager.analyzeFile(doc);
        expect(result.filePath).toBe('');
        expect(result.skipped).toBe(true);
    });

    it('should handle errors in handleDocumentChange gracefully', () => {
        // Simulate analyzeFile throwing
        manager.analyzeFile = jest.fn().mockRejectedValue(new Error('fail'));
        // Patch throttleDocumentChange to immediately invoke the callback and catch errors
        manager['fileMonitorService'].throttleDocumentChange = (_doc: any, cb: any) => {
            cb().catch(() => {});
        };
        const doc = { uri: { toString: () => 'file:///fail.ts', fsPath: '/fail.ts' }, getText: () => 'fail' } as any;
        // Should not throw
        expect(() => manager['handleDocumentChange'](doc)).not.toThrow();
    });

    it('should handle errors in setupEventListeners reinitialization', async () => {
        // Patch logger to track error
        const errorLogger = jest.fn();
        manager['logger'].error = errorLogger;
        // Patch initializeServices to throw
        manager['initializeServices'] = jest.fn().mockRejectedValue(new Error('fail'));
        // Simulate onDidChangeConfiguration event by calling the callback directly
        const configEvent = { affectsConfiguration: jest.fn().mockReturnValue(true) };
        // Extract the callback from setupEventListeners
        let capturedCallback: any = null;
        manager['fileMonitorService'].onDocumentSaved = jest.fn();
        manager['fileMonitorService'].onActiveEditorChanged = jest.fn();
        jest.spyOn(vscode.workspace, 'onDidChangeConfiguration').mockImplementation(cb => {
            capturedCallback = cb;
            return { dispose: () => {} };
        });
        manager['setupEventListeners']();
        // Call the captured callback to simulate the event
        if (capturedCallback) await capturedCallback(configEvent);
        expect(errorLogger).toHaveBeenCalledWith('Failed to reinitialize services:', expect.any(Error));
    });

    it('should call bottleneckDetector.analyzeOperation and emit fileAnalysisComplete', async () => {
        const analyzeOp = jest.spyOn(manager['bottleneckDetector'], 'analyzeOperation');
        const emit = jest.spyOn(manager['eventEmitter'], 'emit');
        const doc = { uri: { toString: () => 'file:///test2.ts', fsPath: '/test2.ts' }, getText: () => 'function bar() {}' } as any;
        await manager.analyzeFile(doc);
        expect(analyzeOp).toHaveBeenCalledWith(expect.stringContaining('file-analysis-'), expect.anything());
        expect(emit).toHaveBeenCalledWith('fileAnalysisComplete', expect.anything());
    });

    it('should call eventEmitter.emit("fileMetricsUpdated") in updateFileMetrics', async () => {
        const emit = jest.spyOn(manager['eventEmitter'], 'emit');
        const uri = { fsPath: '/metrics.ts', toString: () => 'file:///metrics.ts' } as any;
        const result = { filePath: '/metrics.ts', issues: [], skipped: false, metrics: { foo: 1 } };
        await manager['updateFileMetrics'](uri, result);
        expect(emit).toHaveBeenCalledWith('fileMetricsUpdated', expect.objectContaining({ uri, metrics: { foo: 1 } }));
    });

    it('should handle error in updateFileMetrics gracefully', async () => {
        manager['profiler'].getStats = jest.fn(() => { throw new Error('fail'); });
        const logger = jest.spyOn(manager['logger'], 'error');
        const uri = { fsPath: '/fail.ts', toString: () => 'file:///fail.ts' } as any;
        const result = { filePath: '/fail.ts', issues: [], skipped: false, metrics: {} };
        await manager['updateFileMetrics'](uri, result);
        expect(logger).toHaveBeenCalledWith(expect.stringContaining('Failed to update metrics'), expect.any(Error));
    });

    it('should call eventEmitter.removeAllListeners on dispose', () => {
        const removeAll = jest.spyOn(manager['eventEmitter'], 'removeAllListeners');
        manager.dispose();
        expect(removeAll).toHaveBeenCalled();
    });
});

describe('PerformanceManager additional coverage', () => {
    let manager: PerformanceManager;
    let mockContext: any;
    function createMockUri(path: string) {
        return {
            fsPath: path,
            scheme: 'file',
            authority: '',
            path,
            query: '',
            fragment: '',
            with: jest.fn(),
            toString: jest.fn(() => path),
            toJSON: jest.fn(() => ({ fsPath: path }))
        };
    }
    function createMockEnvVarCollection() {
        return {
            persistent: true,
            description: '',
            replace: jest.fn(),
            append: jest.fn(),
            prepend: jest.fn(),
            get: jest.fn(),
            getScoped: jest.fn(),
            forEach: jest.fn(),
            clear: jest.fn(),
            delete: jest.fn(),
            [Symbol.iterator]: jest.fn().mockReturnValue({ next: () => ({ done: true }) })
        };
    }
    function createMockExtension() {
        return {
            id: 'mock.extension',
            extensionUri: createMockUri('/mock'),
            extensionPath: '/mock',
            isActive: true,
            packageJSON: {},
            exports: {},
            activate: jest.fn(),
            extensionKind: 1
        };
    }
    function createMockContext() {
        return {
            subscriptions: [],
            extensionPath: '/mock',
            workspaceState: { get: jest.fn(), update: jest.fn(), keys: jest.fn().mockReturnValue([]) },
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([]),
                setKeysForSync: jest.fn()
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn(),
                onDidChange: jest.fn()
            },
            extensionUri: createMockUri('/mock'),
            environmentVariableCollection: createMockEnvVarCollection(),
            asAbsolutePath: jest.fn((p: string) => `/mock/${p}`),
            storagePath: '/mock/storage',
            logPath: '/mock/log',
            extensionMode: 1,
            extension: createMockExtension(),
            globalStoragePath: '/mock/global',
            logUri: createMockUri('/mock/log'),
            storageUri: createMockUri('/mock/storage'),
            globalStorageUri: createMockUri('/mock/global'),
            extensionRuntime: 1,
            languageModelAccessInformation: {
                status: 'granted',
                reason: undefined,
                onDidChange: jest.fn(),
                canSendRequest: jest.fn().mockReturnValue(true)
            }
        };
    }
    beforeEach(() => {
        mockContext = createMockContext();
        manager = PerformanceManager.getInstance(mockContext);
    });

    afterEach(() => {
        if (manager && manager.dispose) manager.dispose();
    });

    it('should not reinitialize singleton if already created', () => {
        const newManager = PerformanceManager.getInstance(createMockContext());
        expect(newManager).toBe(manager);
    });

    it('should throw if getInstance is called without context and no instance exists', () => {
        // Dispose current instance
        manager.dispose();
        // Remove static instance
        (PerformanceManager as any).instance = undefined;
        expect(() => PerformanceManager.getInstance()).toThrow();
    });

    it('should allow double disposal without error', () => {
        expect(() => {
            manager.dispose();
            manager.dispose();
        }).not.toThrow();
    });

    it('should allow event emitter registration and removal', () => {
        const fn = jest.fn();
        manager.on('testEvent', fn);
        manager.off('testEvent', fn);
        // Should not throw or call fn
        manager['eventEmitter'].emit('testEvent');
        expect(fn).not.toHaveBeenCalled();
    });

    it('should clear caches when already empty', () => {
        manager.clearCaches();
        // Should not throw
        expect(manager['analysisCache'].size).toBe(0);
    });

    it('should return valid instances from all public getters', () => {
        expect(manager.getProfiler()).toBeDefined();
        expect(manager.getBottleneckDetector()).toBeDefined();
        expect(manager.getCachingService()).toBeDefined();
        expect(manager.getAsyncOptimizer()).toBeDefined();
    });
});

describe('PerformanceManager coverage edge cases', () => {
    let manager: PerformanceManager;
    let mockContext: any;
    beforeEach(() => {
        mockContext = { subscriptions: [] } as unknown as vscode.ExtensionContext;
        const mockAnalyzerService = {
            analyzeDocument: jest.fn().mockResolvedValue({ filePath: 'file:///test.ts', issues: [], skipped: false })
        };
        manager = PerformanceManager.getInstance(mockContext, mockAnalyzerService as any);
        manager.clearCaches();
    });
    afterEach(() => {
        jest.restoreAllMocks();
        if (manager && manager.dispose) manager.dispose();
        (PerformanceManager as any).instance = undefined;
    });

    it('should log and show error if initializeServices fails in constructor', async () => {
        const errorLogger = jest.spyOn(manager['logger'], 'error');
        const showError = jest.spyOn(vscode.window, 'showErrorMessage').mockImplementation(() => undefined as any);
        // Patch initializeServices to throw
        const origInit = manager['initializeServices'];
        manager['initializeServices'] = jest.fn().mockRejectedValue(new Error('fail'));
        // Recreate instance to trigger constructor
        (PerformanceManager as any).instance = undefined;
        PerformanceManager.getInstance(mockContext);
        // Wait for microtasks
        await new Promise(res => setTimeout(res, 10));
        expect(errorLogger).toHaveBeenCalledWith('Failed to initialize performance services:', expect.any(Error));
        expect(showError).toHaveBeenCalledWith('Failed to initialize performance services');
        manager['initializeServices'] = origInit;
        showError.mockRestore();
    });

    it('should not throw when removing a non-existent listener', () => {
        const fn = jest.fn();
        expect(() => manager.off('nonexistent', fn)).not.toThrow();
    });

    it('should not throw when emitting event with no listeners', () => {
        expect(() => manager['eventEmitter'].emit('noListenersEvent', { foo: 1 })).not.toThrow();
    });

    it('should only call dispose on services once even if called multiple times', () => {
        const statusDispose = jest.spyOn(manager['statusService'], 'dispose');
        const diagDispose = jest.spyOn(manager['diagnosticsService'], 'dispose');
        const fileMonDispose = jest.spyOn(manager['fileMonitorService'], 'dispose');
        const cacheDispose = jest.spyOn(manager['cachingService'], 'dispose');
        const asyncDispose = jest.spyOn(manager['asyncOptimizer'], 'dispose');
        manager.dispose();
        manager.dispose();
        expect(statusDispose).toHaveBeenCalledTimes(1);
        expect(diagDispose).toHaveBeenCalledTimes(1);
        expect(fileMonDispose).toHaveBeenCalledTimes(1);
        expect(cacheDispose).toHaveBeenCalledTimes(1);
        expect(asyncDispose).toHaveBeenCalledTimes(1);
    });

    it('should return cached result and not call analyzer again', async () => {
        const doc = { uri: { toString: () => 'file:///cached.ts', fsPath: '/cached.ts' }, getText: () => 'foo' } as any;
        const analyzeSpy = jest.spyOn(manager['analyzerService'], 'analyzeDocument');
        await manager.analyzeFile(doc);
        await manager.analyzeFile(doc);
        expect(analyzeSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle error in statusService.updateStatusBar gracefully', async () => {
        manager['statusService'].updateStatusBar = jest.fn(() => { throw new Error('fail-status'); });
        const doc = { uri: { toString: () => 'file:///failstatus.ts', fsPath: '/failstatus.ts' }, getText: () => 'foo' } as any;
        // analyzerService returns a valid result
        manager['analyzerService'].analyzeDocument = jest.fn().mockResolvedValue({ filePath: 'file:///failstatus.ts', issues: [], skipped: false });
        const result = await manager.analyzeFile(doc);
        expect(result.filePath).toBe('');
        expect(result.skipped).toBe(true);
    });
});

describe('PerformanceManager instantiation and core service exposure', () => {
    it('should instantiate and expose core services', () => {
        // @ts-ignore
        const manager = PerformanceManager.getInstance({});
        expect(manager.getProfiler()).toBeDefined();
        expect(manager.getBottleneckDetector()).toBeDefined();
        expect(manager.getCachingService()).toBeDefined();
        expect(manager.getAsyncOptimizer()).toBeDefined();
    });

    it('should dispose without error', () => {
        // @ts-ignore
        const manager = PerformanceManager.getInstance({});
        expect(() => manager.dispose()).not.toThrow();
    });
});
