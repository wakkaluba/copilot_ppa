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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleStatusBarItem = void 0;
const vscode = __importStar(require("vscode"));
const commandToggleManager_1 = require("./commandToggleManager");
const quickAccessMenu_1 = require("./quickAccessMenu");
const keybindingManager_1 = require("../services/ui/keybindingManager");
/**
 * Status bar item to display and control command toggles
 */
class ToggleStatusBarItem {
    constructor(context) {
        this.disposables = [];
        this.toggleManager = commandToggleManager_1.CommandToggleManager.getInstance(context);
        this.quickAccessMenu = new quickAccessMenu_1.QuickAccessMenu(context);
        // Create status bar item with high priority to appear near command toggles
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000 // High priority to appear near command toggles
        );
        this.statusBarItem.command = 'copilot-ppa.showCommandToggles';
        // Listen for toggle changes to update status bar
        this.disposables.push(this.toggleManager.onToggleChange(() => {
            this.updateStatusBar();
        }));
        // Listen for theme changes to update colors
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(() => {
            this.updateStatusBar();
        }));
        // Initialize status bar
        this.updateStatusBar();
        this.statusBarItem.show();
        // Register status bar item for cleanup
        this.disposables.push(this.statusBarItem);
        // Register all disposables with the extension context
        context.subscriptions.push(...this.disposables);
    }
    /**
     * Update the status bar item based on current toggle states
     */
    updateStatusBar() {
        const toggles = this.toggleManager.getAllToggles().map(t => ({
            ...t,
            category: this.getToggleCategory(t.id)
        }));
        const activeToggles = toggles.filter(t => t.state);
        if (activeToggles.length === 0) {
            this.statusBarItem.text = '$(circle-large-outline) Commands';
            this.statusBarItem.tooltip = 'No command toggles active\nClick to configure command toggles';
            this.statusBarItem.backgroundColor = undefined;
        }
        else if (activeToggles.length === 1) {
            // We know there's exactly one toggle, so this assertion is safe
            const toggle = activeToggles[0];
            this.statusBarItem.text = `$(circle-large-filled) ${toggle.label}`;
            this.statusBarItem.tooltip = `Active toggle: ${toggle.label}\n${toggle.description}\nCategory: ${toggle.category}\n\nClick to configure command toggles`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
        else {
            const byCategory = this.groupByCategory(activeToggles);
            this.statusBarItem.text = `$(circle-large-filled) ${activeToggles.length} Toggles`;
            this.statusBarItem.tooltip = this.formatTooltip(byCategory);
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
    }
    /**
     * Get category for a toggle based on its ID
     */
    getToggleCategory(id) {
        // Map toggle IDs to categories
        switch (id) {
            case 'workspace':
            case 'codebase':
                return keybindingManager_1.KeybindingCategory.Navigation;
            case 'verbose':
            case 'debug':
                return keybindingManager_1.KeybindingCategory.Other;
            case 'explain':
            case 'refactor':
            case 'document':
                return keybindingManager_1.KeybindingCategory.Code;
            default:
                return keybindingManager_1.KeybindingCategory.Other;
        }
    }
    /**
     * Group toggles by their category
     */
    groupByCategory(toggles) {
        const grouped = new Map();
        for (const toggle of toggles) {
            const list = grouped.get(toggle.category) || [];
            list.push(toggle);
            grouped.set(toggle.category, list);
        }
        return grouped;
    }
    /**
     * Format tooltip with category grouping
     */
    formatTooltip(byCategory) {
        const lines = [`${[...byCategory.values()].flat().length} command toggles active:`];
        for (const [category, toggles] of byCategory.entries()) {
            lines.push(`\n${category}:`);
            for (const toggle of toggles) {
                lines.push(`  • ${toggle.label}`);
            }
        }
        lines.push('\nClick to configure command toggles');
        return lines.join('\n');
    }
    /**
     * Show the command toggles menu
     */
    showMenu() {
        this.quickAccessMenu.show();
    }
    /**
     * Dispose of status bar item and other resources
     */
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.ToggleStatusBarItem = ToggleStatusBarItem;
//# sourceMappingURL=toggleStatusBarItem.js.map