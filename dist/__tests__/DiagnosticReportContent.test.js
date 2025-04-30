"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('DiagnosticReportContent', function () {
    var report;
    beforeEach(function () {
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
                cpuInfo: {
                    cores: 8,
                    model: 'Test CPU',
                    speed: 2.5
                },
                memoryInfo: {
                    totalMemoryGB: 16,
                    freeMemoryGB: 8
                },
                diskInfo: {
                    totalSpaceGB: 512,
                    freeSpaceGB: 256
                },
                gpuInfo: {
                    available: true,
                    model: 'Test GPU'
                }
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
    describe('Basic Report Structure', function () {
        it('should create a valid diagnostic report with required fields', function () {
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
    describe('Extension Information', function () {
        it('should validate extension details', function () {
            expect(report.extension.name).toBe('copilot-ppa');
            expect(report.extension.version).toMatch(/^\d+\.\d+\.\d+$/);
            expect(report.extension.environment).toBeDefined();
        });
    });
    // Test for system information
    describe('System Information', function () {
        it('should validate system details', function () {
            expect(report.system.os).toBeDefined();
            expect(report.system.arch).toBeDefined();
            expect(report.system.cpuInfo).toHaveProperty('cores');
            expect(report.system.memoryInfo).toHaveProperty('totalMemoryGB');
            expect(report.system.diskInfo).toHaveProperty('freeSpaceGB');
            expect(report.system.gpuInfo).toHaveProperty('available');
        });
    });
    // Test for performance metrics
    describe('Performance Metrics', function () {
        it('should validate performance measurements', function () {
            expect(report.performance.lastLatencyMs).toBeGreaterThanOrEqual(0);
            expect(report.performance.averageLatencyMs).toBeGreaterThanOrEqual(0);
            expect(report.performance.peakMemoryUsageMB).toBeGreaterThan(0);
            expect(Array.isArray(report.performance.responseTimeHistory)).toBe(true);
            expect(report.performance.responseTimeHistory.every(function (t) { return typeof t === 'number'; })).toBe(true);
        });
    });
    // Test for runtime statistics
    describe('Runtime Statistics', function () {
        it('should validate runtime statistics', function () {
            expect(report.runtime.uptime).toBeGreaterThanOrEqual(0);
            expect(report.runtime.requestCount).toBeGreaterThanOrEqual(0);
            expect(report.runtime.errorCount).toBeGreaterThanOrEqual(0);
            expect(typeof report.runtime.lastError === 'string' || report.runtime.lastError === null).toBe(true);
            expect(typeof report.runtime.lastErrorTime === 'string' || report.runtime.lastErrorTime === null).toBe(true);
        });
    });
    // Test for logs
    describe('Logs Section', function () {
        it('should validate log entries and counts', function () {
            expect(Array.isArray(report.logs.recentLogs)).toBe(true);
            expect(report.logs.recentLogs.every(function (log) { return typeof log === 'string'; })).toBe(true);
            expect(report.logs.errorCount).toBeGreaterThanOrEqual(0);
            expect(report.logs.warningCount).toBeGreaterThanOrEqual(0);
        });
    });
});
//# sourceMappingURL=DiagnosticReportContent.test.js.map