import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { SystemMetrics, ProcessInfo, ResourceUsage } from '../types';
import os from 'os';
import { cpus, freemem, totalmem, loadavg } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@injectable()
export class ModelSystemManager extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private monitoringInterval: NodeJS.Timer | null = null;
    private readonly metricsHistory = new Array<SystemMetrics>();
    private readonly maxHistoryLength = 100;
    private readonly processMap = new Map<number, ProcessInfo>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        private readonly monitoringIntervalMs = 5000
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('System Monitor');
        this.startMonitoring();
    }

    public async getSystemMetrics(): Promise<SystemMetrics> {
        try {
            const [resourceUsage, processMetrics] = await Promise.all([
                this.getResourceUsage(),
                this.getProcessMetrics()
            ]);

            const metrics: SystemMetrics = {
                timestamp: Date.now(),
                resources: resourceUsage,
                processes: processMetrics
            };

            this.updateMetricsHistory(metrics);
            this.emit('metricsUpdated', metrics);
            return metrics;
        } catch (error) {
            this.handleError('Failed to get system metrics', error as Error);
            throw error;
        }
    }

    public async registerProcess(pid: number, info: Partial<ProcessInfo> = {}): Promise<void> {
        try {
            const processInfo = await this.getProcessInfo(pid);
            if (processInfo) {
                this.processMap.set(pid, {
                    ...processInfo,
                    ...info
                });
                this.emit('processRegistered', { pid, info: this.processMap.get(pid) });
            }
        } catch (error) {
            this.handleError(`Failed to register process ${pid}`, error as Error);
            throw error;
        }
    }

    public async unregisterProcess(pid: number): Promise<void> {
        if (this.processMap.has(pid)) {
            this.processMap.delete(pid);
            this.emit('processUnregistered', { pid });
        }
    }

    private async getResourceUsage(): Promise<ResourceUsage> {
        const totalMem = totalmem();
        const freeMem = freemem();
        const cpuInfo = cpus();
        const loads = loadavg();

        // Calculate CPU usage percentage
        const cpuUsage = cpuInfo.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total) * 100;
        }, 0) / cpuInfo.length;

        return {
            cpuUsagePercent: cpuUsage,
            memoryUsagePercent: ((totalMem - freeMem) / totalMem) * 100,
            totalMemoryBytes: totalMem,
            freeMemoryBytes: freeMem,
            loadAverages: loads
        };
    }

    private async getProcessMetrics(): Promise<Map<number, ProcessInfo>> {
        const metrics = new Map<number, ProcessInfo>();
        
        for (const [pid] of this.processMap) {
            try {
                const info = await this.getProcessInfo(pid);
                if (info) {
                    metrics.set(pid, info);
                } else {
                    this.unregisterProcess(pid);
                }
            } catch (error) {
                this.logger.warn('[ModelSystemManager]', `Failed to get metrics for process ${pid}`, error);
                // Process might have terminated
                this.unregisterProcess(pid);
            }
        }

        return metrics;
    }

    private async getProcessInfo(pid: number): Promise<ProcessInfo | null> {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync(`powershell "Get-Process -Id ${pid} | Select-Object CPU,WorkingSet,Path"`);
                const [_, cpu, memory] = stdout.trim().split(/\s+/);
                
                return {
                    pid,
                    cpuUsagePercent: parseFloat(cpu),
                    memoryBytes: parseInt(memory, 10),
                    timestamp: Date.now()
                };
            } else {
                const { stdout } = await execAsync(`ps -p ${pid} -o %cpu,%mem,rss`);
                const [_, cpu, memPercent, rss] = stdout.trim().split(/\s+/);
                
                return {
                    pid,
                    cpuUsagePercent: parseFloat(cpu),
                    memoryBytes: parseInt(rss, 10) * 1024, // Convert KB to bytes
                    timestamp: Date.now()
                };
            }
        } catch {
            return null; // Process not found or access denied
        }
    }

    private startMonitoring(): void {
        if (this.monitoringInterval) {
            return;
        }

        this.monitoringInterval = setInterval(async () => {
            try {
                await this.getSystemMetrics();
            } catch (error) {
                this.handleError('Error during system monitoring', error as Error);
            }
        }, this.monitoringIntervalMs);
    }

    private stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    private updateMetricsHistory(metrics: SystemMetrics): void {
        this.metricsHistory.push(metrics);
        
        // Maintain fixed size history
        while (this.metricsHistory.length > this.maxHistoryLength) {
            this.metricsHistory.shift();
        }
    }

    public getMetricsHistory(): SystemMetrics[] {
        return [...this.metricsHistory];
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelSystemManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.stopMonitoring();
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.length = 0;
        this.processMap.clear();
    }
}
