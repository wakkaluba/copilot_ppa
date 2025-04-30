import * as vscode from 'vscode';
export declare class CommandToggleManager {
    private static instance;
    private readonly stateService;
    private readonly storageService;
    private readonly configService;
    private readonly operationsService;
    private readonly _onToggleChange;
    readonly onToggleChange: vscode.Event<{
        id: string;
        state: boolean;
    }>;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): CommandToggleManager;
    private initialize;
    getToggleState(id: string): boolean;
    setToggleState(id: string, state: boolean): Promise<void>;
    toggleState(id: string): Promise<boolean>;
    getAllToggles(): Array<{
        id: string;
        label: string;
        description: string;
        state: boolean;
    }>;
    resetToggles(): Promise<void>;
    getActiveTogglesPrefix(): string;
}
