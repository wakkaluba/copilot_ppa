import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { HardwareSpecs, HardwareMetrics, HardwareEvent } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

@injectable()
export class ModelHardwareManager extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private monitoringInterval: NodeJS.Timer | null = null;
    private readonly metricsHistory = new Map<string, HardwareMetrics[]>();
    private readonly maxHistoryLength = 100;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        private readonly monitoringIntervalMs = 5000
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Hardware Monitor');
        this.startMonitoring();
    }

    public async getHardwareSpecs(): Promise<HardwareSpecs> {
        try {
            const [gpuInfo, cudaInfo] = await Promise.all([
                this.detectGPU(),
                this.detectCUDA()
            ]);

            const specs: HardwareSpecs = {
                gpu: {
                    available: gpuInfo.available,
                    name: gpuInfo.name,
                    vram: gpuInfo.vram,
                    cudaSupport: cudaInfo.available,
                    cudaVersion: cudaInfo.version
                },
                ram: {
                    total: os.totalmem() / (1024 * 1024), // Convert to MB
                    free: os.freemem() / (1024 * 1024)
                },
                cpu: {
                    cores: os.cpus().length,
                    model: os.cpus()[0]?.model?.trim() || 'Unknown'
                }
            };

            this.emit(HardwareEvent.SpecsUpdated, specs);
            this.logHardwareSpecs(specs);
            return specs;
        } catch (error) {
            this.handleError('Failed to get hardware specifications', error as Error);
            throw error;
        }
    }

    public async getHardwareMetrics(): Promise<HardwareMetrics> {
        try {
            const [gpuMetrics, systemMetrics] = await Promise.all([
                this.getGPUMetrics(),
                this.getSystemMetrics()
            ]);

            const metrics: HardwareMetrics = {
                timestamp: new Date(),
                gpu: gpuMetrics,
                system: systemMetrics
            };

            this.updateMetricsHistory('default', metrics);
            this.emit(HardwareEvent.MetricsUpdated, metrics);
            return metrics;
        } catch (error) {
            this.handleError('Failed to get hardware metrics', error as Error);
            throw error;
        }
    }

    private async detectGPU(): Promise<{ available: boolean; name?: string; vram?: number }> {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader');
                if (stdout) {
                    const [name, vramStr] = stdout.split(',').map(s => s.trim());
                    const vram = parseInt(vramStr) * 1024 * 1024; // Convert to bytes
                    return { available: true, name, vram };
                }
            } else if (process.platform === 'linux') {
                const { stdout } = await execAsync('lspci | grep -i nvidia');
                if (stdout) {
                    return { available: true, name: stdout.split(':')[2]?.trim() };
                }
            }
            return { available: false };
        } catch {
            return { available: false };
        }
    }

    private async detectCUDA(): Promise<{ available: boolean; version?: string }> {
        try {
            if (process.platform === 'win32' || process.platform === 'linux') {
                const { stdout } = await execAsync('nvcc --version');
                const match = stdout.match(/release (\d+\.\d+)/i);
                if (match) {
                    return { available: true, version: match[1] };
                }
            }
            return { available: false };
        } catch {
            return { available: false };
        }
    }

    private async getGPUMetrics(): Promise<{
        utilizationPercent?: number;
        memoryUsedBytes?: number;
        temperature?: number;
        powerWatts?: number;
    }> {
        try {
            if (!process.platform.match(/^(win32|linux)$/)) {
                return {};
            }

            const { stdout } = await execAsync(
                'nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu,power.draw --format=csv,noheader'
            );

            const [utilization, memory, temp, power] = stdout.split(',').map(s => parseFloat(s));

            return {
                utilizationPercent: utilization,
                memoryUsedBytes: memory * 1024 * 1024,
                temperature: temp,
                powerWatts: power
            };
        } catch {
            return {};
        }
    }

    private async getSystemMetrics(): Promise<{
        cpuUsagePercent: number;
        memoryUsedPercent: number;
        loadAverage: number[];
    }> {
        const cpus = os.cpus();
        const totalCpuTime = cpus.reduce((acc, cpu) => {
            Object.values(cpu.times).forEach(time => acc += time);
            return acc;
        }, 0);

        const cpuUsagePercent = 100 - (os.cpus()[0].times.idle / totalCpuTime * 100);
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsedPercent = ((totalMem - freeMem) / totalMem) * 100;

        return {
            cpuUsagePercent,
            memoryUsedPercent,
            loadAverage: os.loadavg()
        };
    }

    private startMonitoring(): void {
        if (this.monitoringInterval) {
            return;
        }

        this.monitoringInterval = setInterval(async () => {
            try {
                await this.getHardwareMetrics();
            } catch (error) {
                this.handleError('Error during hardware monitoring', error as Error);
            }
        }, this.monitoringIntervalMs);
    }

    private stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    public getMetricsHistory(id: string = 'default'): HardwareMetrics[] {
        return this.metricsHistory.get(id) || [];
    }

    private updateMetricsHistory(id: string, metrics: HardwareMetrics): void {
        const history = this.metricsHistory.get(id) || [];
        history.push(metrics);

        // Maintain fixed size history
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }

        this.metricsHistory.set(id, history);
    }

    private logHardwareSpecs(specs: HardwareSpecs): void {
        this.outputChannel.appendLine('\nHardware Specifications:');
        this.outputChannel.appendLine('CPU:');
        this.outputChannel.appendLine(`  Model: ${specs.cpu.model}`);
        this.outputChannel.appendLine(`  Cores: ${specs.cpu.cores}`);
        
        this.outputChannel.appendLine('\nMemory:');
        this.outputChannel.appendLine(`  Total: ${Math.round(specs.ram.total / 1024)}GB`);
        this.outputChannel.appendLine(`  Free: ${Math.round(specs.ram.free / 1024)}GB`);
        
        this.outputChannel.appendLine('\nGPU:');
        if (specs.gpu.available) {
            this.outputChannel.appendLine(`  Name: ${specs.gpu.name}`);
            if (specs.gpu.vram) {
                this.outputChannel.appendLine(`  VRAM: ${Math.round(specs.gpu.vram / (1024 * 1024))}GB`);
            }
            this.outputChannel.appendLine(`  CUDA Support: ${specs.gpu.cudaSupport ? `Yes (${specs.gpu.cudaVersion})` : 'No'}`);
        } else {
            this.outputChannel.appendLine('  No GPU detected');
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelHardwareManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.stopMonitoring();
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.clear();
    }
}
