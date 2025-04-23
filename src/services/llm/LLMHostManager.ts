import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { HostState, HostStateChangeEvent, LLMHostConfig } from '../../types/llm';
import { HostProcessInfo } from './interfaces/HostTypes';
import { LLMHostProcessService } from './services/LLMHostProcessService';
import { LLMHostHealthMonitorService } from './services/LLMHostHealthMonitorService';
import { LLMHostStateService } from './services/LLMHostStateService';
import { LLMHostErrorHandlerService } from './services/LLMHostErrorHandlerService';

/**
 * Manages LLM host processes and their lifecycle
 */
export class LLMHostManager extends EventEmitter {
    private static instance: LLMHostManager;
    private readonly processService: LLMHostProcessService;
    private readonly healthMonitor: LLMHostHealthMonitorService;
    private readonly stateService: LLMHostStateService;
    private readonly errorHandler: LLMHostErrorHandlerService;

    private constructor() {
        super();
        const outputChannel = vscode.window.createOutputChannel('LLM Host');
        this.processService = new LLMHostProcessService(outputChannel);
        this.healthMonitor = new LLMHostHealthMonitorService(outputChannel);
        this.stateService = new LLMHostStateService();
        this.errorHandler = new LLMHostErrorHandlerService(outputChannel);
        
        this.setupEventHandlers();
    }

    public static getInstance(): LLMHostManager {
        if (!this.instance) {
            this.instance = new LLMHostManager();
        }
        return this.instance;
    }

    public get state(): HostState {
        return this.stateService.getCurrentState();
    }

    private setupEventHandlers(): void {
        // Process events
        this.processService.on('process:started', info => {
            this.healthMonitor.startMonitoring(info);
            this.emit('hostStarted', info);
        });

        this.processService.on('process:stopped', info => {
            this.healthMonitor.stopMonitoring(info.pid);
            this.emit('hostStopped', info);
        });

        this.processService.on('process:error', (error, info) => {
            this.errorHandler.handleProcessError(error, info);
            this.emit('hostError', error);
        });

        // Health events
        this.healthMonitor.on('health:warning', (msg, metrics) => {
            this.errorHandler.handleHealthWarning(msg, metrics);
            this.emit('healthWarning', msg);
        });

        this.healthMonitor.on('health:critical', (error, metrics) => {
            this.errorHandler.handleHealthCritical(error, metrics);
            this.emit('healthCritical', error);
        });
    }

    public async startHost(config: LLMHostConfig): Promise<void> {
        try {
            if (this.state === HostState.RUNNING) {
                return;
            }
            
            this.stateService.updateState(HostState.STARTING);
            
            const process = await this.processService.startProcess(config);
            this.healthMonitor.startMonitoring(process);
            
            this.stateService.updateState(HostState.RUNNING);
        } catch (error) {
            this.errorHandler.handleStartError(error);
            throw error;
        }
    }

    public async stopHost(): Promise<void> {
        if (this.state === HostState.STOPPED) {
            return;
        }
        
        try {
            this.healthMonitor.stopMonitoring();
            await this.processService.stopProcess();
            this.stateService.updateState(HostState.STOPPED);
            this.emit('stopped');
        } catch (error) {
            this.errorHandler.handleStopError(error);
            throw error;
        }
    }

    public isRunning(): boolean {
        return this.state === HostState.RUNNING && this.processService.hasProcess();
    }

    public getProcessInfo(): HostProcessInfo | null {
        if (this.state !== HostState.RUNNING) {
            return null;
        }
        return this.processService.getProcessInfo();
    }

    public async restartHost(): Promise<void> {
        try {
            await this.stopHost();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.startHost();
        } catch (error) {
            this.errorHandler.handleRestartError(error);
            throw error;
        }
    }

    public dispose(): void {
        this.stopHost().catch(console.error);
        this.healthMonitor.dispose();
        this.processService.dispose();
        this.removeAllListeners();
    }
}