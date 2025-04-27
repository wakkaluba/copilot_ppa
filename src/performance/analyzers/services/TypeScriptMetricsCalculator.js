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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptMetricsCalculator = void 0;
var inversify_1 = require("inversify");
var ILogger_1 = require("../../../logging/ILogger");
var TypeScriptMetricsCalculator = /** @class */ (function () {
    function TypeScriptMetricsCalculator(logger) {
        this.logger = logger;
    }
    TypeScriptMetricsCalculator.prototype.calculateMetrics = function (content) {
        try {
            var lines = content.split('\n');
            return {
                classCount: this.countPattern(content, /\bclass\s+\w+/g),
                methodCount: this.countPattern(content, /\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g),
                importCount: this.countPattern(content, /^import\s+/gm),
                commentRatio: this.calculateCommentRatio(content, lines),
                averageMethodLength: this.calculateAverageMethodLength(content),
                asyncMethodCount: this.countPattern(content, /\basync\s+/g),
                promiseUsage: this.countPattern(content, /Promise\./g),
                arrowFunctionCount: this.countPattern(content, /=>/g),
                typeAnnotationCount: this.countPattern(content, /:\s*[A-Z]\w+/g),
                eventListenerCount: this.countPattern(content, /addEventListener\(/g),
                domManipulationCount: this.countPattern(content, /document\.|getElementById|querySelector/g)
            };
        }
        catch (error) {
            this.logger.error('Error calculating TypeScript metrics:', error);
            return {};
        }
    };
    TypeScriptMetricsCalculator.prototype.countPattern = function (content, regex) {
        return (content.match(regex) || []).length;
    };
    TypeScriptMetricsCalculator.prototype.calculateCommentRatio = function (content, lines) {
        var commentCount = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
        return Math.round((commentCount / lines.length) * 100);
    };
    TypeScriptMetricsCalculator.prototype.calculateAverageMethodLength = function (content) {
        // ... existing implementation ...
    };
    var _a;
    TypeScriptMetricsCalculator = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, inject(ILogger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object])
    ], TypeScriptMetricsCalculator);
    return TypeScriptMetricsCalculator;
}());
exports.TypeScriptMetricsCalculator = TypeScriptMetricsCalculator;
