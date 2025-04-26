"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('DiagnosticReportContent', () => {
    let report;
    beforeEach(() => {
        report = {
            timestamp: new Date().toISOString(),
            extension: {
                name: 'copilot-ppa',
                version: '1.0.0',
                environment: 'VS Code'
            },
            system: {
                os: 'test-os',
                arch: 'x64',
                cpuInfo: {},
                memoryInfo: {},
                diskInfo: {},
                gpuInfo: {}
            },
            configuration: {
                provider: 'test-provider',
                model: 'test-model',
                endpoint: 'test-endpoint',
                cacheEnabled: true,
                otherSettings: {}
            },
            performance: {
                lastLatencyMs: 100,
                averageLatencyMs: 150,
                peakMemoryUsageMB: 256,
                responseTimeHistory: [100, 150, 200]
            },
            runtime: {
                uptime: 3600,
                requestCount: 100,
                errorCount: 5,
                lastError: 'test error',
                lastErrorTime: new Date().toISOString()
            },
            logs: {
                recentLogs: ['log1', 'log2'],
                errorCount: 5,
                warningCount: 10
            }
        };
    });
    // Test for basic report structure
    describe('Basic Report Structure', () => {
        it('should create a valid diagnostic report with required fields', () => {
            expect(report.timestamp).toBeDefined();
            expect(report.extension).toBeDefined();
            expect(report.system).toBeDefined();
            expect(report.configuration).toBeDefined();
            expect(report.performance).toBeDefined();
            expect(report.runtime).toBeDefined();
            expect(report.logs).toBeDefined();
        });
    });
    // Test for extension information
    describe('Extension Information', () => {
        it('should validate extension details', () => {
            expect(report.extension.name).toBe('copilot-ppa');
            expect(report.extension.version).toMatch(/^\d+\.\d+\.\d+$/);
            expect(['development', 'production']).toContain(report.extension.environment);
        });
    });
    // Test for system information
    describe('System Information', () => {
        it('should validate system details', () => {
            expect(report.system.os).toBeDefined();
            expect(report.system.arch).toBeDefined();
            expect(report.system.cpuInfo).toHaveProperty('cores');
            expect(report.system.memoryInfo).toHaveProperty('totalMemoryGB');
            expect(report.system.diskInfo).toHaveProperty('freeSpaceGB');
            expect(report.system.gpuInfo).toHaveProperty('available');
        });
    });
    // Test for performance metrics
    describe('Performance Metrics', () => {
        it('should validate performance measurements', () => {
            expect(report.performance.lastLatencyMs).toBeGreaterThanOrEqual(0);
            expect(report.performance.averageLatencyMs).toBeGreaterThanOrEqual(0);
            expect(report.performance.peakMemoryUsageMB).toBeGreaterThan(0);
            expect(Array.isArray(report.performance.responseTimeHistory)).toBe(true);
            expect(report.performance.responseTimeHistory.every(t => typeof t === 'number')).toBe(true);
        });
    });
    // Test for runtime statistics
    describe('Runtime Statistics', () => {
        it('should validate runtime statistics', () => {
            expect(report.runtime.uptime).toBeGreaterThanOrEqual(0);
            expect(report.runtime.requestCount).toBeGreaterThanOrEqual(0);
            expect(report.runtime.errorCount).toBeGreaterThanOrEqual(0);
            expect(typeof report.runtime.lastError === 'string' || report.runtime.lastError === null).toBe(true);
            expect(typeof report.runtime.lastErrorTime === 'string' || report.runtime.lastErrorTime === null).toBe(true);
        });
    });
    // Test for logs
    describe('Logs Section', () => {
        it('should validate log entries and counts', () => {
            expect(Array.isArray(report.logs.recentLogs)).toBe(true);
            expect(report.logs.recentLogs.every(log => typeof log === 'string')).toBe(true);
            expect(report.logs.errorCount).toBeGreaterThanOrEqual(0);
            expect(report.logs.warningCount).toBeGreaterThanOrEqual(0);
        });
    });
});
//# sourceMappingURL=DiagnosticReportContent.test.js.map