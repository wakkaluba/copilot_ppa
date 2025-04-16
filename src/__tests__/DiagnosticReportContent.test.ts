// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\DiagnosticReportContent.test.ts
import { DiagnosticReportContent } from '../diagnostics/diagnosticReport';

describe('DiagnosticReportContent Interface', () => {
  // Test for basic report structure
  describe('Basic Report Structure', () => {
    it('should create a valid diagnostic report with required fields', () => {
      const report: DiagnosticReportContent = {
        timestamp: '2025-04-16T10:30:00.000Z',
        extension: {
          name: 'copilot-ppa',
          version: '1.0.0',
          environment: 'development'
        },
        system: {
          os: 'Windows 10',
          arch: 'x64',
          cpuInfo: {
            model: 'Intel Core i7',
            cores: 8,
            threads: 16,
            clockSpeed: '3.6 GHz',
            architecture: 'x64'
          },
          memoryInfo: {
            totalMemoryGB: '32 GB',
            freeMemoryGB: '16 GB'
          },
          diskInfo: {
            totalSpaceGB: '512 GB',
            freeSpaceGB: '256 GB'
          },
          gpuInfo: {
            available: true,
            name: 'NVIDIA RTX 3080',
            memory: '10GB',
            cudaAvailable: true,
            cudaVersion: '11.7'
          }
        },
        configuration: {
          provider: 'ollama',
          model: 'llama2',
          endpoint: 'http://localhost:11434',
          cacheEnabled: true,
          otherSettings: {}
        },
        performance: {
          lastLatencyMs: 250,
          averageLatencyMs: 275,
          peakMemoryUsageMB: 1024,
          responseTimeHistory: [200, 300, 250]
        },
        runtime: {
          uptime: 3600,
          requestCount: 100,
          errorCount: 2,
          lastError: 'Connection timeout',
          lastErrorTime: '2025-04-16T10:29:00.000Z'
        },
        logs: {
          recentLogs: ['Log entry 1', 'Log entry 2'],
          errorCount: 2,
          warningCount: 5
        }
      };

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
      const report: DiagnosticReportContent = {
        timestamp: '2025-04-16T10:30:00.000Z',
        extension: {
          name: 'copilot-ppa',
          version: '1.0.0',
          environment: 'production'
        },
        system: { os: '', arch: '', cpuInfo: {}, memoryInfo: {}, diskInfo: {}, gpuInfo: {} },
        configuration: { provider: '', model: '', endpoint: '', cacheEnabled: false, otherSettings: {} },
        performance: { lastLatencyMs: null, averageLatencyMs: null, peakMemoryUsageMB: null, responseTimeHistory: [] },
        runtime: { uptime: 0, requestCount: 0, errorCount: 0, lastError: null, lastErrorTime: null },
        logs: { recentLogs: [], errorCount: 0, warningCount: 0 }
      };

      expect(report.extension.name).toBe('copilot-ppa');
      expect(report.extension.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(['development', 'production']).toContain(report.extension.environment);
    });
  });

  // Test for system information
  describe('System Information', () => {
    it('should validate system details', () => {
      const report: DiagnosticReportContent = {
        timestamp: '2025-04-16T10:30:00.000Z',
        extension: { name: '', version: '', environment: '' },
        system: {
          os: 'Windows 10',
          arch: 'x64',
          cpuInfo: {
            model: 'Intel Core i7',
            cores: 8,
            threads: 16,
            clockSpeed: '3.6 GHz',
            architecture: 'x64'
          },
          memoryInfo: {
            totalMemoryGB: '32 GB',
            freeMemoryGB: '16 GB'
          },
          diskInfo: {
            totalSpaceGB: '512 GB',
            freeSpaceGB: '256 GB'
          },
          gpuInfo: {
            available: true,
            name: 'NVIDIA RTX 3080'
          }
        },
        configuration: { provider: '', model: '', endpoint: '', cacheEnabled: false, otherSettings: {} },
        performance: { lastLatencyMs: null, averageLatencyMs: null, peakMemoryUsageMB: null, responseTimeHistory: [] },
        runtime: { uptime: 0, requestCount: 0, errorCount: 0, lastError: null, lastErrorTime: null },
        logs: { recentLogs: [], errorCount: 0, warningCount: 0 }
      };

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
      const report: DiagnosticReportContent = {
        timestamp: '2025-04-16T10:30:00.000Z',
        extension: { name: '', version: '', environment: '' },
        system: { os: '', arch: '', cpuInfo: {}, memoryInfo: {}, diskInfo: {}, gpuInfo: {} },
        configuration: { provider: '', model: '', endpoint: '', cacheEnabled: false, otherSettings: {} },
        performance: {
          lastLatencyMs: 250,
          averageLatencyMs: 275.5,
          peakMemoryUsageMB: 1024.5,
          responseTimeHistory: [200, 300, 250, 275, 350]
        },
        runtime: { uptime: 0, requestCount: 0, errorCount: 0, lastError: null, lastErrorTime: null },
        logs: { recentLogs: [], errorCount: 0, warningCount: 0 }
      };

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
      const report: DiagnosticReportContent = {
        timestamp: '2025-04-16T10:30:00.000Z',
        extension: { name: '', version: '', environment: '' },
        system: { os: '', arch: '', cpuInfo: {}, memoryInfo: {}, diskInfo: {}, gpuInfo: {} },
        configuration: { provider: '', model: '', endpoint: '', cacheEnabled: false, otherSettings: {} },
        performance: { lastLatencyMs: null, averageLatencyMs: null, peakMemoryUsageMB: null, responseTimeHistory: [] },
        runtime: {
          uptime: 3600,
          requestCount: 100,
          errorCount: 2,
          lastError: 'Connection timeout',
          lastErrorTime: '2025-04-16T10:29:00.000Z'
        },
        logs: { recentLogs: [], errorCount: 0, warningCount: 0 }
      };

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
      const report: DiagnosticReportContent = {
        timestamp: '2025-04-16T10:30:00.000Z',
        extension: { name: '', version: '', environment: '' },
        system: { os: '', arch: '', cpuInfo: {}, memoryInfo: {}, diskInfo: {}, gpuInfo: {} },
        configuration: { provider: '', model: '', endpoint: '', cacheEnabled: false, otherSettings: {} },
        performance: { lastLatencyMs: null, averageLatencyMs: null, peakMemoryUsageMB: null, responseTimeHistory: [] },
        runtime: { uptime: 0, requestCount: 0, errorCount: 0, lastError: null, lastErrorTime: null },
        logs: {
          recentLogs: [
            '[2025-04-16T10:29:00.000Z] [ERROR] Connection timeout',
            '[2025-04-16T10:29:30.000Z] [WARNING] High latency detected'
          ],
          errorCount: 1,
          warningCount: 1
        }
      };

      expect(Array.isArray(report.logs.recentLogs)).toBe(true);
      expect(report.logs.recentLogs.every(log => typeof log === 'string')).toBe(true);
      expect(report.logs.errorCount).toBeGreaterThanOrEqual(0);
      expect(report.logs.warningCount).toBeGreaterThanOrEqual(0);
    });
  });
});