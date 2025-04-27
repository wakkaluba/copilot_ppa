"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleStatusBarItem = void 0;
var vscode = require("vscode");
var commandToggleManager_1 = require("./commandToggleManager");
var quickAccessMenu_1 = require("./quickAccessMenu");
var keybindingManager_1 = require("../services/ui/keybindingManager");
/**
 * Status bar item to display and control command toggles
 */
var ToggleStatusBarItem = /** @class */ (function () {
    function ToggleStatusBarItem(context) {
        var _a;
        var _this = this;
        this.disposables = [];
        this.toggleManager = commandToggleManager_1.CommandToggleManager.getInstance(context);
        this.quickAccessMenu = new quickAccessMenu_1.QuickAccessMenu(context);
        // Create status bar item with high priority to appear near command toggles
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000 // High priority to appear near command toggles
        );
        this.statusBarItem.command = 'copilot-ppa.showCommandToggles';
        // Listen for toggle changes to update status bar
        this.disposables.push(this.toggleManager.onToggleChange(function () {
            _this.updateStatusBar();
        }));
        // Listen for theme changes to update colors
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(function () {
            _this.updateStatusBar();
        }));
        // Initialize status bar
        this.updateStatusBar();
        this.statusBarItem.show();
        // Register status bar item for cleanup
        this.disposables.push(this.statusBarItem);
        // Register all disposables with the extension context
        (_a = context.subscriptions).push.apply(_a, this.disposables);
    }
    /**
     * Update the status bar item based on current toggle states
     */
    ToggleStatusBarItem.prototype.updateStatusBar = function () {
        var _this = this;
        var toggles = this.toggleManager.getAllToggles().map(function (t) { return (__assign(__assign({}, t), { category: _this.getToggleCategory(t.id) })); });
        var activeToggles = toggles.filter(function (t) { return t.state; });
        if (activeToggles.length === 0) {
            this.statusBarItem.text = '$(circle-large-outline) Commands';
            this.statusBarItem.tooltip = 'No command toggles active\nClick to configure command toggles';
            this.statusBarItem.backgroundColor = undefined;
        }
        else if (activeToggles.length === 1) {
            // We know there's exactly one toggle, so this assertion is safe
            var toggle = activeToggles[0];
            this.statusBarItem.text = "$(circle-large-filled) ".concat(toggle.label);
            this.statusBarItem.tooltip = "Active toggle: ".concat(toggle.label, "\n").concat(toggle.description, "\nCategory: ").concat(toggle.category, "\n\nClick to configure command toggles");
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
        else {
            var byCategory = this.groupByCategory(activeToggles);
            this.statusBarItem.text = "$(circle-large-filled) ".concat(activeToggles.length, " Toggles");
            this.statusBarItem.tooltip = this.formatTooltip(byCategory);
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
    };
    /**
     * Get category for a toggle based on its ID
     */
    ToggleStatusBarItem.prototype.getToggleCategory = function (id) {
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
    };
    /**
     * Group toggles by their category
     */
    ToggleStatusBarItem.prototype.groupByCategory = function (toggles) {
        var grouped = new Map();
        for (var _i = 0, toggles_1 = toggles; _i < toggles_1.length; _i++) {
            var toggle = toggles_1[_i];
            var list = grouped.get(toggle.category) || [];
            list.push(toggle);
            grouped.set(toggle.category, list);
        }
        return grouped;
    };
    /**
     * Format tooltip with category grouping
     */
    ToggleStatusBarItem.prototype.formatTooltip = function (byCategory) {
        var lines = ["".concat(__spreadArray([], byCategory.values(), true).flat().length, " command toggles active:")];
        for (var _i = 0, _a = byCategory.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], category = _b[0], toggles = _b[1];
            lines.push("\n".concat(category, ":"));
            for (var _c = 0, toggles_2 = toggles; _c < toggles_2.length; _c++) {
                var toggle = toggles_2[_c];
                lines.push("  \u2022 ".concat(toggle.label));
            }
        }
        lines.push('\nClick to configure command toggles');
        return lines.join('\n');
    };
    /**
     * Show the command toggles menu
     */
    ToggleStatusBarItem.prototype.showMenu = function () {
        this.quickAccessMenu.show();
    };
    /**
     * Dispose of status bar item and other resources
     */
    ToggleStatusBarItem.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return ToggleStatusBarItem;
}());
exports.ToggleStatusBarItem = ToggleStatusBarItem;
