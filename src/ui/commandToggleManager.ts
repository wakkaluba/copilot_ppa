import * as vscode from 'vscode';
import { ToggleStateService } from './services/ToggleStateService';
import { ToggleStorageService } from './services/ToggleStorageService';
import { ToggleConfigurationService } from './services/ToggleConfigurationService';
import { ToggleOperationsService } from './services/ToggleOperationsService';

export class CommandToggleManager {
    private static instance: CommandToggleManager;
    private readonly stateService: ToggleStateService;
    private readonly storageService: ToggleStorageService;
    private readonly configService: ToggleConfigurationService;
    private readonly operationsService: ToggleOperationsService;
    
    private readonly _onToggleChange = new vscode.EventEmitter<{id: string, state: boolean}>();
    public readonly onToggleChange = this._onToggleChange.event;
    
    private constructor(context: vscode.ExtensionContext) {
        this.configService = new ToggleConfigurationService();
        this.storageService = new ToggleStorageService(context);
        this.stateService = new ToggleStateService(this.configService.getAvailableToggles());
        this.operationsService = new ToggleOperationsService(
            this.stateService,
            this.storageService,
            this._onToggleChange
        );
        
        this.initialize();
    }
    
    public static getInstance(context: vscode.ExtensionContext): CommandToggleManager {
        if (!CommandToggleManager.instance) {
            CommandToggleManager.instance = new CommandToggleManager(context);
        }
        return CommandToggleManager.instance;
    }
    
    private async initialize(): Promise<void> {
        const storedStates = await this.storageService.loadToggleStates();
        this.stateService.initializeStates(storedStates);
    }
    
    public getToggleState(id: string): boolean {
        return this.stateService.getState(id);
    }
    
    public async setToggleState(id: string, state: boolean): Promise<void> {
        if (!this.configService.isToggleAvailable(id)) {
            throw new Error(`Toggle with ID "${id}" is not available`);
        }
        
        await this.operationsService.setState(id, state);
    }
    
    public async toggleState(id: string): Promise<boolean> {
        return this.operationsService.toggleState(id);
    }
    
    public getAllToggles(): Array<{id: string, label: string, description: string, state: boolean}> {
        const availableToggles = this.configService.getAvailableToggles();
        return Object.entries(availableToggles).map(([id, config]) => ({
            id,
            label: config.label,
            description: config.description,
            state: this.getToggleState(id)
        }));
    }
    
    public async resetToggles(): Promise<void> {
        await this.operationsService.resetToggles();
    }
    
    public getActiveTogglesPrefix(): string {
        return this.operationsService.getActivePrefix();
    }
}
