import * as vscode from 'vscode';

export interface DisplaySettings {
    fontSize: number;
    messageSpacing: number;
    codeBlockTheme: string;
    userMessageColor: string;
    agentMessageColor: string;
    timestampDisplay: boolean;
    compactMode: boolean;
}

export class DisplaySettingsService {
    private static instance: DisplaySettingsService;
    private _onSettingsChanged = new vscode.EventEmitter<DisplaySettings>();
    readonly onSettingsChanged = this._onSettingsChanged.event;

    private constructor() {
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.display')) {
                this._onSettingsChanged.fire(this.getSettings());
            }
        });
    }

    public static getInstance(): DisplaySettingsService {
        if (!DisplaySettingsService.instance) {
            DisplaySettingsService.instance = new DisplaySettingsService();
        }
        return DisplaySettingsService.instance;
    }

    public getSettings(): DisplaySettings {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const displayConfig = config.get<any>('display') || {};
        
        return {
            fontSize: displayConfig.fontSize || 14,
            messageSpacing: displayConfig.messageSpacing || 12,
            codeBlockTheme: displayConfig.codeBlockTheme || 'default',
            userMessageColor: displayConfig.userMessageColor || '#569cd6',
            agentMessageColor: displayConfig.agentMessageColor || '#4ec9b0',
            timestampDisplay: displayConfig.timestampDisplay !== false,
            compactMode: !!displayConfig.compactMode
        };
    }

    public async updateSetting<K extends keyof DisplaySettings>(
        setting: K, 
        value: DisplaySettings[K]
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const displayConfig = config.get<any>('display') || {};
        
        displayConfig[setting] = value;
        
        await config.update('display', displayConfig, vscode.ConfigurationTarget.Global);
        this._onSettingsChanged.fire(this.getSettings());
    }

    public applySettingsToElement(element: HTMLElement): void {
        const settings = this.getSettings();
        
        // Apply font size to the element
        element.style.fontSize = `${settings.fontSize}px`;
        
        // Apply compact mode if enabled
        if (settings.compactMode) {
            element.classList.add('compact-mode');
        } else {
            element.classList.remove('compact-mode');
        }
    }

    public getCssVariables(): string {
        const settings = this.getSettings();
        
        return `
            :root {
                --agent-font-size: ${settings.fontSize}px;
                --agent-message-spacing: ${settings.messageSpacing}px;
                --agent-user-message-color: ${settings.userMessageColor};
                --agent-assistant-message-color: ${settings.agentMessageColor};
                --agent-code-theme: ${settings.codeBlockTheme};
            }
        `;
    }
}
