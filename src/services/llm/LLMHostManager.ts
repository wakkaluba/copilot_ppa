import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { EventEmitter } from 'events';
import { HostState } from './types';

export interface HostMetrics {
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
    restartCount: number;
    lastError?: string;
    lastRestart?: Date;
}

export interface HostOptions {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
    maxMemoryMB?: number;
    maxRestarts?: number;
    healthCheckEndpoint?: string;
    healthCheckInterval?: number;
}

/**
 * Manager for the LLM host process
 */
export class LLMHostManager extends EventEmitter {
    private static instance: LLMHostManager;
    private process: child_process.ChildProcess | null = null;
    private statusBarItem: vscode.StatusBarItem;
    private metricsInterval: NodeJS.Timeout | null = null;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private startTime: number = 0;
    private restartCount: number = 0;
    private _hostState: HostState = HostState.STOPPED;
    private metrics: HostMetrics = {
        cpuUsage: 0,
        memoryUsage: 0,
        uptime: 0,
        restartCount: 0
    };
    private options: HostOptions | null = null;

    /**
     * Creates a new LLMHostManager
     */
    private constructor() {
        super();
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.updateStatusBar();
    }

    /**
     * Gets the singleton instance of LLMHostManager
     */
    public static getInstance(): LLMHostManager {
        if (!this.instance) {
            this.instance = new LLMHostManager();
        }
        return this.instance;
    }

    /**
     * Gets the current host state
     */
    public get hostState(): HostState {
        return this._hostState;
    }

    /**
     * Sets the host state and emits events
     */
    private set hostState(newState: HostState) {
        if (this._hostState !== newState) {
            this._hostState = newState;
            this.emit('stateChanged', newState);
            this.updateStatusBar();
        }
    }

    /**
     * Check if the host is running
     */
    public isRunning(): boolean {
        return this._hostState === HostState.RUNNING && !!this.process;
    }

    /**
     * Starts the LLM host process
     */
    public async startHost(options: HostOptions): Promise<void> {
        if (this.isRunning()) {
            throw new Error('Host process is already running');
        }

        this.options = options;
        this.hostState = HostState.STARTING;

        try {
            await this.launchProcess();
            await this.waitForReady();
            
            this.startTime = Date.now();
            this.startMetricsCollection();
            this.startHealthChecks();
            
            this.hostState = HostState.RUNNING;
        } catch (error) {
            this.handleStartError(error);
        }
    }

    /**
     * Stops the LLM host process
     */
    public async stopHost(): Promise<void> {
        if (!this.process) return;

        this.stopMetricsCollection();
        this.stopHealthChecks();

        return new Promise<void>((resolve) => {
            if (!this.process) {
                resolve();
                return;
            }

            // Handle process exit
            this.process.once('exit', () => {
                this.process = null;
                this.hostState = HostState.STOPPED;
                resolve();
            });

            // Send SIGTERM first
            this.process.kill('SIGTERM');

            // Force kill after timeout
            setTimeout(() => {
                if (this.process) {
                    this.process.kill('SIGKILL');
                }
            }, 5000);
        });
    }

    /**
     * Restarts the LLM host process
     */
    public async restartHost(): Promise<void> {
        await this.stopHost();
        if (this.options) {
            await this.startHost(this.options);
        }
    }

    /**
     * Launch the host process
     */
    private async launchProcess(): Promise<void> {
        if (!this.options) {
            throw new Error('No host options provided');
        }

        this.process = child_process.spawn(
            this.options.command,
            this.options.args || [],
            {
                env: { ...process.env, ...this.options.env },
                cwd: this.options.cwd,
                stdio: ['pipe', 'pipe', 'pipe']
            }
        );

        // Handle process events
        this.process.on('error', this.handleProcessError.bind(this));
        this.process.on('exit', this.handleProcessExit.bind(this));

        // Handle output
        this.process.stdout?.on('data', this.handleProcessOutput.bind(this));
        this.process.stderr?.on('data', this.handleProcessError.bind(this));
    }

    /**
     * Wait for the process to be ready
     */
    private async waitForReady(): Promise<void> {
        if (!this.options?.healthCheckEndpoint) {
            // Wait for startup message if no health check endpoint
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Host process failed to start'));
                }, 30000);

                this.process?.stdout?.on('data', (data) => {
                    if (data.toString().includes('Model loaded')) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            });
        }

        // Wait for health check endpoint
        let attempts = 0;
        while (attempts < 30) {
            try {
                const response = await fetch(this.options.healthCheckEndpoint);
                if (response.ok) {
                    return;
                }
            } catch {
                // Ignore connection errors during startup
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        throw new Error('Host process health check failed');
    }

    /**
     * Start collecting process metrics
     */
    private startMetricsCollection(): void {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }

        this.metricsInterval = setInterval(() => {
            this.collectMetrics().catch(() => {
                // Ignore metric collection errors
            });
        }, 5000);
    }

    /**
     * Stop collecting process metrics
     */
    private stopMetricsCollection(): void {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
    }

    /**
     * Start health checks
     */
    private startHealthChecks(): void {
        if (!this.options?.healthCheckEndpoint) return;

        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = setInterval(() => {
            this.checkHealth().catch(() => {
                // Health check failures are handled in checkHealth
            });
        }, this.options.healthCheckInterval || 30000);
    }

    /**
     * Stop health checks
     */
    private stopHealthChecks(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    /**
     * Collect process metrics
     */
    private async collectMetrics(): Promise<void> {
        if (!this.process?.pid) return;

        try {
            const usage = process.cpuUsage();
            const memUsage = process.memoryUsage();

            this.metrics = {
                cpuUsage: (usage.user + usage.system) / 1000000, // Convert to seconds
                memoryUsage: memUsage.heapUsed / (1024 * 1024), // Convert to MB
                uptime: (Date.now() - this.startTime) / 1000, // Convert to seconds
                restartCount: this.restartCount
            };

            this.emit('metricsUpdated', this.metrics);

            // Check memory limits
            if (
                this.options?.maxMemoryMB &&
                this.metrics.memoryUsage > this.options.maxMemoryMB
            ) {
                this.handleResourceLimit('Memory limit exceeded');
            }
        } catch (error) {
            // Ignore metric collection errors
        }
    }

    /**
     * Check process health
     */
    private async checkHealth(): Promise<void> {
        if (!this.options?.healthCheckEndpoint) return;

        try {
            const response = await fetch(this.options.healthCheckEndpoint);
            if (!response.ok) {
                throw new Error('Health check failed');
            }
        } catch (error) {
            this.handleHealthCheckFailure(error);
        }
    }

    /**
     * Handle process output
     */
    private handleProcessOutput(data: Buffer): void {
        this.emit('output', data.toString());
    }

    /**
     * Handle process errors
     */
    private handleProcessError(error: Error | Buffer): void {
        const errorMessage = error instanceof Buffer ? error.toString() : error.message;
        this.metrics.lastError = errorMessage;
        this.emit('error', errorMessage);

        if (this._hostState === HostState.STARTING) {
            this.handleStartError(error);
        } else {
            this.handleRunError(error);
        }
    }

    /**
     * Handle process exit
     */
    private handleProcessExit(code: number | null): void {
        if (code !== 0 && this._hostState !== HostState.STOPPED) {
            this.handleCrash(code);
        }
    }

    /**
     * Handle startup errors
     */
    private handleStartError(error: unknown): void {
        this.hostState = HostState.ERROR;
        this.process = null;
        throw error instanceof Error ? error : new Error(String(error));
    }

    /**
     * Handle runtime errors
     */
    private handleRunError(error: unknown): void {
        this.emit('error', error instanceof Error ? error.message : String(error));
    }

    /**
     * Handle process crash
     */
    private async handleCrash(code: number | null): Promise<void> {
        this.metrics.lastError = `Process crashed with code ${code}`;
        this.metrics.lastRestart = new Date();
        this.restartCount++;

        if (
            this.options?.maxRestarts &&
            this.restartCount > this.options.maxRestarts
        ) {
            this.hostState = HostState.ERROR;
            this.emit('error', 'Maximum restart attempts exceeded');
            return;
        }

        // Attempt restart
        try {
            await this.restartHost();
        } catch (error) {
            this.hostState = HostState.ERROR;
            this.emit('error', 'Failed to restart host process');
        }
    }

    /**
     * Handle resource limit exceeded
     */
    private async handleResourceLimit(reason: string): Promise<void> {
        this.emit('warning', `Resource limit exceeded: ${reason}`);
        await this.restartHost();
    }

    /**
     * Handle health check failure
     */
    private async handleHealthCheckFailure(error: unknown): Promise<void> {
        this.emit('warning', 'Health check failed');
        await this.restartHost();
    }

    /**
     * Get current process metrics
     */
    public getMetrics(): HostMetrics {
        return { ...this.metrics };
    }

    /**
     * Updates the status bar item based on the current state
     */
    private updateStatusBar(): void {
        const icons = {
            [HostState.STOPPED]: '$(debug-stop)',
            [HostState.STARTING]: '$(sync~spin)',
            [HostState.RUNNING]: '$(check)',
            [HostState.ERROR]: '$(error)'
        };

        this.statusBarItem.text = `${icons[this._hostState]} LLM Host: ${this._hostState}`;
        this.statusBarItem.show();
    }

    /**
     * Disposes resources used by the manager
     */
    public dispose(): void {
        this.stopHost().catch(() => {});
        this.stopMetricsCollection();
        this.stopHealthChecks();
        this.statusBarItem.dispose();
        this.removeAllListeners();
    }
}