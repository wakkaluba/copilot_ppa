"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandToggleManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages toggle states for command switches
 */
class CommandToggleManager {
    static instance;
    context;
    // Toggle states
    toggleStates = new Map();
    // Event emitters for toggle state changes
    _onToggleChange = new vscode.EventEmitter();
    onToggleChange = this._onToggleChange.event;
    // Available toggles with default states
    availableToggles = {
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
    constructor(context) {
        this.context = context;
        this.loadToggleStates();
    }
    /**
     * Get the singleton instance
     */
    static getInstance(context) {
        if (!CommandToggleManager.instance) {
            CommandToggleManager.instance = new CommandToggleManager(context);
        }
        return CommandToggleManager.instance;
    }
    /**
     * Load toggle states from storage
     */
    loadToggleStates() {
        const storedStates = this.context.globalState.get('commandToggleStates') || {};
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
    async saveToggleStates() {
        const states = {};
        this.toggleStates.forEach((state, id) => {
            states[id] = state;
        });
        await this.context.globalState.update('commandToggleStates', states);
    }
    /**
     * Get the current state of a toggle
     */
    getToggleState(id) {
        return this.toggleStates.get(id) || false;
    }
    /**
     * Set the state of a toggle
     */
    async setToggleState(id, state) {
        if (this.availableToggles[id]) {
            this.toggleStates.set(id, state);
            await this.saveToggleStates();
            this._onToggleChange.fire({ id, state });
        }
        else {
            throw new Error(`Toggle with ID "${id}" is not available`);
        }
    }
    /**
     * Toggle the state of a toggle (flip it)
     */
    async toggleState(id) {
        const currentState = this.getToggleState(id);
        const newState = !currentState;
        await this.setToggleState(id, newState);
        return newState;
    }
    /**
     * Get all available toggles with their current states
     */
    getAllToggles() {
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
    async resetToggles() {
        for (const [id, config] of Object.entries(this.availableToggles)) {
            await this.setToggleState(id, config.defaultState);
        }
    }
    /**
     * Get a formatted prompt prefix based on active toggles
     */
    getActiveTogglesPrefix() {
        const activeToggles = [];
        for (const [id, config] of Object.entries(this.availableToggles)) {
            if (this.getToggleState(id)) {
                activeToggles.push(config.label);
            }
        }
        return activeToggles.join(' ') + (activeToggles.length > 0 ? ' ' : '');
    }
}
exports.CommandToggleManager = CommandToggleManager;
//# sourceMappingURL=commandToggleManager.js.map