"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageDecorationProvider = void 0;
var vscode = require("vscode");
var CoverageDecorationService_1 = require("./services/CoverageDecorationService");
var CoverageToggleService_1 = require("./services/CoverageToggleService");
/**
 * Provider for code coverage decorations in the editor
 */
var CoverageDecorationProvider = /** @class */ (function () {
    function CoverageDecorationProvider() {
        this.decorationService = new CoverageDecorationService_1.CoverageDecorationService();
        this.toggleService = new CoverageToggleService_1.CoverageToggleService();
    }
    /**
     * Set the current coverage data
     */
    CoverageDecorationProvider.prototype.setCoverage = function (coverage) {
        this.decorationService.updateCoverageData(coverage);
        this.refresh();
    };
    /**
     * Refresh decorations in the active editor
     */
    CoverageDecorationProvider.prototype.refresh = function () {
        if (!this.toggleService.isEnabled) {
            this.decorationService.clearDecorations();
            return;
        }
        this.decorationService.applyDecorations(vscode.window.activeTextEditor);
    };
    /**
     * Clean up resources
     */
    CoverageDecorationProvider.prototype.dispose = function () {
        this.decorationService.dispose();
        this.toggleService.dispose();
    };
    return CoverageDecorationProvider;
}());
exports.CoverageDecorationProvider = CoverageDecorationProvider;
