import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { HostProcessInfo } from '../interfaces/HostTypes';

export class LLMHostHealthMonitor extends EventEmitter {
    private monitoredProcesses = new Map<number, NodeJS.Timeout>();
    private healthChecks = new Map<number, HealthCheckMetrics>();
    private readonly checkInterval = 5000; // 5 seconds

    constructor(private outputChannel: vscode.OutputChannel) {
        super();
    }

    public startMonitoring(processInfo: HostProcessInfo): void {
        const { pid } = processInfo;
        
        if (this.monitoredProcesses.has(pid)) {
            return;
        }

        this.healthChecks.set(pid, {
            lastCheck: Date.now(),
            checkCount: 0,
            warningCount: 0,
            status: 'healthy'
        });

        const intervalId = setInterval(() => this.checkHealth(pid), this.checkInterval);
        this.monitoredProcesses.set(pid, intervalId);
    }

    public stopMonitoring(pid: number): void {
        const intervalId = this.monitoredProcesses.get(pid);
        if (intervalId) {
            clearInterval(intervalId);
            this.monitoredProcesses.delete(pid);
            this.healthChecks.delete(pid);
        }
    }

    private async checkHealth(pid: number): Promise<void> {
        try {
            const metrics = await this.collectMetrics(pid);
            const healthCheck = this.healthChecks.get(pid);
            
            if (!healthCheck) {return;}

            healthCheck.lastCheck = Date.now();
            healthCheck.checkCount++;

            if (metrics.cpuUsage > 90 || metrics.memoryUsage > 90) {
                healthCheck.warningCount++;
                healthCheck.status = 'warning';
                
                this.emit('health:warning', 
                    `High resource usage detected (CPU: ${metrics.cpuUsage}%, Memory: ${metrics.memoryUsage}%)`,
                    metrics
                );
            } else {
                healthCheck.status = 'healthy';
            }

            if (healthCheck.warningCount >= 3) {
                healthCheck.status = 'critical';
                this.emit('health:critical',
                    new Error(`Process ${pid} has shown high resource usage for an extended period`),
                    metrics
                );
            }
        } catch (error) {
            this.outputChannel.appendLine(`[ERROR] Health check failed for process ${pid}: ${error}`);
        }
    }

    private async collectMetrics(pid: number): Promise<ProcessMetrics> {
        // This would integrate with node's process module or OS-specific tools
        return {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            timestamp: new Date()
        };
    }

    public dispose(): void {
        for (const [pid] of this.monitoredProcesses) {
            this.stopMonitoring(pid);
        }
        this.removeAllListeners();
    }
}

interface HealthCheckMetrics {
    lastCheck: number;
    checkCount: number;
    warningCount: number;
    status: 'healthy' | 'warning' | 'critical';
}

interface ProcessMetrics {
    cpuUsage: number;
    memoryUsage: number;
    timestamp: number;
}
