"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMetricsService = void 0;
const inversify_1 = require("inversify");
const ILogger_1 = require("../../../logging/ILogger");
const events_1 = require("events");
let PerformanceMetricsService = class PerformanceMetricsService extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
    }
    async analyzeFile(document, progress) {
        try {
            const content = document.getText();
            const metrics = {
                cyclomaticComplexity: this.calculateComplexity(content),
                maintainabilityIndex: this.calculateMaintainability(content),
                linesOfCode: document.lineCount,
                functionCount: this.countFunctions(content),
                duplicateCode: await this.detectDuplicateCode(content),
                unusedCode: await this.detectUnusedCode(document),
                timestamp: new Date().toISOString()
            };
            this.emit('metricsCalculated', metrics);
            return metrics;
        }
        catch (error) {
            this.handleError(new Error(`Error calculating metrics: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }
    calculateComplexity(content) {
        // Implementation details...
        return 0;
    }
    calculateMaintainability(content) {
        // Implementation details...
        return 0;
    }
    countFunctions(content) {
        // Implementation details...
        return 0;
    }
    async detectDuplicateCode(content) {
        // Implementation details...
        return 0;
    }
    async detectUnusedCode(document) {
        // Implementation details...
        return 0;
    }
    handleError(error) {
        this.logger.error('[PerformanceMetricsService]', error);
        this.emit('error', error);
    }
    dispose() {
        this.removeAllListeners();
    }
};
PerformanceMetricsService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object])
], PerformanceMetricsService);
exports.PerformanceMetricsService = PerformanceMetricsService;
//# sourceMappingURL=PerformanceMetricsService.js.map