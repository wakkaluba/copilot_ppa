import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { HostState, HostStateChangeEvent, LLMHostConfig } from '../../types/llm';
import { HostProcessInfo } from './interfaces';
import { LLMHostProcessService } from './services/LLMHostProcessService';
import { LLMHostHealthMonitorService } from './services/LLMHostHealthMonitorService';
import { LLMHostStateService } from './services/LLMHostStateService';
import { LLMHostErrorHandlerService } from './services/LLMHostErrorHandlerService';

export class LLMHostManager extends EventEmitter {
    private static instance: LLMHostManager;
    private readonly outputChannel: vscode.OutputChannel;
    private readonly processService: LLMHostProcessService;
    private readonly healthMonitorService: LLMHostHealthMonitorService;
    private readonly stateService: LLMHostStateService;
    private readonly errorHandlerService: LLMHostErrorHandlerService;
    
    private constructor() {
        super();
        this.outputChannel = vscode.window.createOutputChannel('LLM Host');
        this.processService = new LLMHostProcessService(this.outputChannel);
        this.healthMonitorService = new LLMHostHealthMonitorService(this.outputChannel);
        this.stateService = new LLMHostStateService();
        this.errorHandlerService = new LLMHostErrorHandlerService(this.outputChannel);
        
        this.setupEventListeners();
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
    
    public async startHost(config: LLMHostConfig): Promise<void> {
        try {
            if (this.state === HostState.RUNNING) {
                return;
            }
            
            this.stateService.updateState(HostState.STARTING);
            
            const process = await this.processService.startProcess(config);
            this.healthMonitorService.startMonitoring(process);
            
            this.stateService.updateState(HostState.RUNNING);
        } catch (error) {
            this.errorHandlerService.handleError(error);
            throw error;
        }
    }
    
    public async stopHost(): Promise<void> {
        if (this.state === HostState.STOPPED) {
            return;
        }
        
        try {
            this.healthMonitorService.stopMonitoring();
            await this.processService.stopProcess();
            this.stateService.updateState(HostState.STOPPED);
            this.emit('stopped');
        } catch (error) {
            this.errorHandlerService.handleError(error);
            throw error;
        }
    }
    
    public getProcessInfo(): HostProcessInfo | null {
        if (this.state !== HostState.RUNNING) {
            return null;
        }
        return this.processService.getProcessInfo();
    }
    
    public isRunning(): boolean {
        return this.state === HostState.RUNNING && this.processService.hasProcess();
    }
    
    private setupEventListeners(): void {
        this.stateService.on('stateChanged', (event: HostStateChangeEvent) => {
            this.emit('stateChanged', event);
        });
        
        this.errorHandlerService.on('error', (error: Error) => {
            this.emit('error', error);
        });
        
        this.processService.on('processError', (error: Error) => {
            this.errorHandlerService.handleError(error);
        });
        
        this.processService.on('processExit', (code: number) => {
            if (code !== 0) {
                this.errorHandlerService.handleError(new Error(`Process exited with code ${code}`));
            }
            this.stateService.updateState(HostState.STOPPED);
        });
        
        this.healthMonitorService.on('healthError', (error: Error) => {
            this.errorHandlerService.handleError(error);
        });
    }
    
    public dispose(): void {
        this.stopHost().catch(console.error);
        this.outputChannel.dispose();
        this.healthMonitorService.dispose();
        this.processService.dispose();
        this.removeAllListeners();
    }
}