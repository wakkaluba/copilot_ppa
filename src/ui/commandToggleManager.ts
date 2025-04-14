import * as vscode from 'vscode';

/**
 * Manages toggle states for command switches
 */
export class CommandToggleManager {
    private static instance: CommandToggleManager;
    private context: vscode.ExtensionContext;
    
    // Toggle states
    private toggleStates: Map<string, boolean> = new Map();
    
    // Event emitters for toggle state changes
    private _onToggleChange = new vscode.EventEmitter<{id: string, state: boolean}>();
    public readonly onToggleChange = this._onToggleChange.event;
    
    // Available toggles with default states
    private readonly availableToggles = {
        'workspace': {
            id: 'workspace',
            label: '@workspace',
            description: 'Enable workspace file access',
            defaultState: false
        },
        'codebase': {
            id: 'codebase',
            label: '/codebase',
            description: 'Search through the entire codebase',
            defaultState: false
        },
        'verbose': {
            id: 'verbose',
            label: '!verbose',
            description: 'Include detailed explanations',
            defaultState: false
        },
        'repo': {
            id: 'repo',
            label: '#repo',
            description: 'Enable repository operations',
            defaultState: false
        },
        'debug': {
            id: 'debug',
            label: '&debug',
            description: 'Include debug information',
            defaultState: false
        }
    };
    
    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadToggleStates();
    }
    
    /**
     * Get the singleton instance
     */
    public static getInstance(context: vscode.ExtensionContext): CommandToggleManager {
        if (!CommandToggleManager.instance) {
            CommandToggleManager.instance = new CommandToggleManager(context);
        }
        return CommandToggleManager.instance;
    }
    
    /**
     * Load toggle states from storage
     */
    private loadToggleStates(): void {
        const storedStates = this.context.globalState.get<{[key: string]: boolean}>('commandToggleStates') || {};
        
        // Initialize with defaults first
        for (const [id, config] of Object.entries(this.availableToggles)) {
            this.toggleStates.set(id, config.defaultState);
        }
        
        // Apply stored states
        for (const [id, state] of Object.entries(storedStates)) {
            if (this.availableToggles[id]) {
                this.toggleStates.set(id, state);
            }
        }
    }
    
    /**
     * Save toggle states to storage
     */
    private async saveToggleStates(): Promise<void> {
        const states: {[key: string]: boolean} = {};
        this.toggleStates.forEach((state, id) => {
            states[id] = state;
        });
        
        await this.context.globalState.update('commandToggleStates', states);
    }
    
    /**
     * Get the current state of a toggle
     */
    public getToggleState(id: string): boolean {
        return this.toggleStates.get(id) || false;
    }
    
    /**
     * Set the state of a toggle
     */
    public async setToggleState(id: string, state: boolean): Promise<void> {
        if (this.availableToggles[id]) {
            this.toggleStates.set(id, state);
            await this.saveToggleStates();
            this._onToggleChange.fire({id, state});
        } else {
            throw new Error(`Toggle with ID "${id}" is not available`);
        }
    }
    
    /**
     * Toggle the state of a toggle (flip it)
     */
    public async toggleState(id: string): Promise<boolean> {
        const currentState = this.getToggleState(id);
        const newState = !currentState;
        await this.setToggleState(id, newState);
        return newState;
    }
    
    /**
     * Get all available toggles with their current states
     */
    public getAllToggles(): Array<{id: string, label: string, description: string, state: boolean}> {
        return Object.entries(this.availableToggles).map(([id, config]) => ({
            id,
            label: config.label,
            description: config.description,
            state: this.getToggleState(id)
        }));
    }
    
    /**
     * Reset all toggles to their default states
     */
    public async resetToggles(): Promise<void> {
        for (const [id, config] of Object.entries(this.availableToggles)) {
            await this.setToggleState(id, config.defaultState);
        }
    }
    
    /**
     * Get a formatted prompt prefix based on active toggles
     */
    public getActiveTogglesPrefix(): string {
        const activeToggles = [];
        
        for (const [id, config] of Object.entries(this.availableToggles)) {
            if (this.getToggleState(id)) {
                activeToggles.push(config.label);
            }
        }
        
        return activeToggles.join(' ') + (activeToggles.length > 0 ? ' ' : '');
    }
}
