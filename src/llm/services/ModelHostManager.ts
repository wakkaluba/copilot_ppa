import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelSystemManager } from './ModelSystemManager';
import { ModelStateManager } from './ModelStateManager';

interface HostedProcess {
    pid: number;
    modelId: string;
    startTime: Date;
    memoryUsage: number;
    cpuUsage: number;
    status: 'starting' | 'running' | 'crashed' | 'stopped';
    lastHealthCheck: Date;
    restartCount: number;
}

@injectable()
export class ModelHostManager extends EventEmitter implements vscode.Disposable {
    private readonly hostedProcesses = new Map<string, HostedProcess>();
    private readonly outputChannel: vscode.OutputChannel;
    private readonly monitorInterval: NodeJS.Timer;
    private readonly maxRestartAttempts = 3;
    private readonly restartDelayMs = 5000;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelSystemManager) private readonly systemManager: ModelSystemManager,
        @inject(ModelStateManager) private readonly stateManager: ModelStateManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Host');
        this.monitorInterval = setInterval(() => this.monitorProcesses(), 10000);
    }

    public async startProcess(modelId: string, config: any): Promise<number> {
        try {
            // In a real implementation, this would start an actual process
            const pid = Math.floor(Math.random() * 10000) + 1000; // Simulated PID

            const process: HostedProcess = {
                pid,
                modelId,
                startTime: new Date(),
                memoryUsage: 0,
                cpuUsage: 0,
                status: 'starting',
                lastHealthCheck: new Date(),
                restartCount: 0
            };

            this.hostedProcesses.set(modelId, process);
            await this.systemManager.registerProcess(pid);
            await this.stateManager.updateState(modelId, 'loading');

            // Simulate startup delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            process.status = 'running';
            await this.stateManager.updateState(modelId, 'ready');

            this.emit('processStarted', { modelId, pid });
            this.logProcessUpdate(modelId, 'Process started successfully');

            return pid;
        } catch (error) {
            this.handleError(`Failed to start process for model ${modelId}`, error as Error);
            throw error;
        }
    }

    public async stopProcess(modelId: string): Promise<void> {
        try {
            const process = this.hostedProcesses.get(modelId);
            if (!process) {
                throw new Error(`No process found for model ${modelId}`);
            }

            process.status = 'stopped';
            await this.systemManager.unregisterProcess(process.pid);
            await this.stateManager.updateState(modelId, 'unloading');

            this.hostedProcesses.delete(modelId);
            await this.stateManager.updateState(modelId, 'unloaded');

            this.emit('processStopped', { modelId });
            this.logProcessUpdate(modelId, 'Process stopped successfully');
        } catch (error) {
            this.handleError(`Failed to stop process for model ${modelId}`, error as Error);
            throw error;
        }
    }

    private async monitorProcesses(): Promise<void> {
        for (const [modelId, process] of this.hostedProcesses.entries()) {
            try {
                if (process.status !== 'running') continue;

                const metrics = await this.systemManager.getSystemMetrics();
                const processInfo = metrics.processes.get(process.pid);

                if (!processInfo) {
                    await this.handleCrashedProcess(modelId, process);
                    continue;
                }

                // Update process metrics
                process.memoryUsage = processInfo.memoryBytes;
                process.cpuUsage = processInfo.cpuUsagePercent;
                process.lastHealthCheck = new Date();

                this.emit('processMetrics', {
                    modelId,
                    pid: process.pid,
                    metrics: {
                        memoryUsage: process.memoryUsage,
                        cpuUsage: process.cpuUsage,
                        uptime: (Date.now() - process.startTime.getTime()) / 1000
                    }
                });
            } catch (error) {
                this.handleError(`Failed to monitor process for model ${modelId}`, error as Error);
            }
        }
    }

    private async handleCrashedProcess(modelId: string, process: HostedProcess): Promise<void> {
        try {
            process.status = 'crashed';
            await this.stateManager.updateState(modelId, 'error');

            this.emit('processCrashed', { modelId, pid: process.pid });
            this.logProcessUpdate(modelId, 'Process crashed, attempting restart');

            if (process.restartCount < this.maxRestartAttempts) {
                process.restartCount++;
                await new Promise(resolve => setTimeout(resolve, this.restartDelayMs));
                await this.startProcess(modelId, {}); // Use stored config in real implementation
            } else {
                this.logProcessUpdate(modelId, `Process failed to restart after ${this.maxRestartAttempts} attempts`);
                this.hostedProcesses.delete(modelId);
            }
        } catch (error) {
            this.handleError(`Failed to handle crashed process for model ${modelId}`, error as Error);
        }
    }

    private logProcessUpdate(modelId: string, message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${modelId}: ${message}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelHostManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        clearInterval(this.monitorInterval);
        this.outputChannel.dispose();
        this.removeAllListeners();
        
        // Stop all running processes
        Promise.all(
            Array.from(this.hostedProcesses.keys())
                .map(modelId => this.stopProcess(modelId))
        ).catch(err => {
            this.logger.error('Failed to stop all processes during disposal', err);
        });

        this.hostedProcesses.clear();
    }
}
