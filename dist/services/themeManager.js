"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontSettings = exports.ThemeColors = exports.Theme = exports.ThemeManager = void 0;
const themeManager_1 = require("./ui/themeManager");
/**
 * @deprecated Use ThemeManager from './ui/themeManager' instead.
 * This file will be removed in a future release.
 */
class ThemeManager {
    static instance;
    constructor(_context) {
        console.warn('ThemeManager is deprecated. Use ThemeManager from ./ui/themeManager instead.');
    }
    static getInstance(context) {
        if (!ThemeManager.instance) {
            if (!context) {
                throw new Error('Context is required when first initializing ThemeManager');
            }
            ThemeManager.instance = new ThemeManager(context);
        }
        return ThemeManager.instance;
    }
    getCurrentTheme() {
        return themeManager_1.ThemeManager.getInstance().getActiveTheme();
    }
    dispose() {
        // Nothing to dispose
    }
}
exports.ThemeManager = ThemeManager;
// Re-export types and interfaces from the new location
var interfaces_1 = require("./ui/themes/interfaces");
Object.defineProperty(exports, "Theme", { enumerable: true, get: function () { return interfaces_1.Theme; } });
Object.defineProperty(exports, "ThemeColors", { enumerable: true, get: function () { return interfaces_1.ThemeColors; } });
Object.defineProperty(exports, "FontSettings", { enumerable: true, get: function () { return interfaces_1.FontSettings; } });
//# sourceMappingURL=themeManager.js.map