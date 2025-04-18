import * as vscode from 'vscode';
import { PerformanceTestConfigService } from '../services/testRunner/performanceTestConfig';

jest.mock('vscode');

describe('PerformanceTestConfigService', () => {
    let service: PerformanceTestConfigService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new PerformanceTestConfigService();
    });

    describe('configurePerformanceTest', () => {
        it('should configure Lighthouse performance test', async () => {
            // Mock user selections
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({ 
                label: 'Lighthouse (Web Performance)', 
                value: 'lighthouse' 
            });
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('https://example.com');

            const config = await service.configurePerformanceTest('/workspace/path');
            
            expect(config).toBeDefined();
            expect(config?.framework).toBe('lighthouse');
            expect(config?.command).toContain('lighthouse');
            expect(config?.targetUrl).toBe('https://example.com');
        });

        it('should configure k6 load test', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({ 
                label: 'k6 (Load Testing)', 
                value: 'k6' 
            });
            (vscode.window.showInputBox as jest.Mock)
                .mockResolvedValueOnce('30') // duration
                .mockResolvedValueOnce('100'); // iterations

            const config = await service.configurePerformanceTest('/workspace/path');
            
            expect(config).toBeDefined();
            expect(config?.framework).toBe('k6');
            expect(config?.duration).toBe(30);
            expect(config?.iterations).toBe(100);
        });

        it('should handle user cancellation', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce(undefined);

            const config = await service.configurePerformanceTest('/workspace/path');
            
            expect(config).toBeUndefined();
        });

        it('should configure custom performance test', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValueOnce({ 
                label: 'Custom', 
                value: 'custom' 
            });
            (vscode.window.showInputBox as jest.Mock)
                .mockResolvedValueOnce('npm run perf')
                .mockResolvedValueOnce('responseTime,throughput');

            const config = await service.configurePerformanceTest('/workspace/path');
            
            expect(config).toBeDefined();
            expect(config?.framework).toBe('custom');
            expect(config?.command).toBe('npm run perf');
            expect(config?.customMetrics).toEqual(['responseTime', 'throughput']);
        });
    });
});