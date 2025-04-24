import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { HostProcessInfo, HostProcessEvent } from '../interfaces/HostTypes';
import { LLMHostConfig } from '../../../types/llm';

export class LLMHostProcessService extends EventEmitter {
    private process: child_process.ChildProcess | null = null;
    private processInfo: HostProcessInfo | null = null;
    private metricsInterval: NodeJS.Timeout | null = null;

    constructor(private outputChannel: vscode.OutputChannel) {
        super();
    }

    public async startProcess(config: LLMHostConfig): Promise<HostProcessInfo> {
        if (this.process) {
            throw new Error('Process already running');
        }

        this.process = child_process.spawn(config.hostPath, ['--model', config.modelPath]);
        
        this.processInfo = {
            pid: this.process.pid!,
            startTime: Date.now(),
            status: 'starting',
            errorCount: 0
        };

        this.setupProcessHandlers();
        this.startMetricsTracking();
        
        await this.waitForStartup();
        return this.processInfo;
    }

    private setupProcessHandlers(): void {
        if (!this.process) {return;}

        this.process.stdout?.on('data', this.handleOutput.bind(this));
        this.process.stderr?.on('data', this.handleError.bind(this));
        this.process.on('error', this.handleProcessError.bind(this));
        this.process.on('exit', this.handleProcessExit.bind(this));
    }

    private startMetricsTracking(): void {
        this.metricsInterval = setInterval(() => {
            this.updateProcessMetrics();
        }, 5000);
    }

    private async waitForStartup(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Process startup timeout'));
            }, 30000);

            this.once('process:running', () => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }

    public async stopProcess(): Promise<void> {
        if (!this.process) {return;}

        this.process.kill();
        this.process = null;
        
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }

        if (this.processInfo) {
            this.processInfo.status = 'stopped';
            this.emit('process:stopped', { ...this.processInfo });
        }
    }

    public getProcessInfo(): HostProcessInfo | null {
        return this.processInfo ? { ...this.processInfo } : null;
    }

    public hasProcess(): boolean {
        return this.process !== null && this.processInfo?.status === 'running';
    }

    public dispose(): void {
        this.stopProcess();
        this.removeAllListeners();
    }

    private handleOutput(data: Buffer): void {
        const output = data.toString();
        this.outputChannel.appendLine(output);

        if (this.processInfo?.status === 'starting' && output.includes('Model loaded')) {
            this.processInfo.status = 'running';
            this.emit('process:running', { ...this.processInfo });
        }
    }

    private handleError(data: Buffer): void {
        const error = data.toString();
        this.outputChannel.appendLine(`[ERROR] ${error}`);
        
        if (this.processInfo) {
            this.processInfo.errorCount++;
            this.processInfo.lastError = new Error(error);
        }
    }

    private handleProcessError(error: Error): void {
        if (this.processInfo) {
            this.processInfo.status = 'error';
            this.processInfo.errorCount++;
            this.processInfo.lastError = error;
            this.emit('process:error', error, { ...this.processInfo });
        }
    }

    private handleProcessExit(code: number | null): void {
        if (code !== 0 && this.processInfo) {
            this.processInfo.status = 'error';
            this.emit('process:crash', 
                new Error(`Process exited with code ${code}`),
                { ...this.processInfo }
            );
        }
        
        this.process = null;
    }

    private updateProcessMetrics(): void {
        if (!this.process || !this.processInfo) {return;}

        try {
            const usage = process.cpuUsage();
            const memory = process.memoryUsage();

            this.processInfo.cpuUsage = (usage.user + usage.system) / 1000000;
            this.processInfo.memoryUsage = memory.heapUsed / 1024 / 1024;

            this.emit('metrics:updated', {
                cpu: this.processInfo.cpuUsage,
                memory: this.processInfo.memoryUsage
            });
        } catch (error) {
            this.outputChannel.appendLine(`[ERROR] Failed to update metrics: ${error}`);
        }
    }
}
