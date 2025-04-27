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
exports.TypeScriptPatternAnalyzer = void 0;
var inversify_1 = require("inversify");
var ILogger_1 = require("../../../logging/ILogger");
var TypeScriptPatternAnalyzer = /** @class */ (function () {
    function TypeScriptPatternAnalyzer(logger) {
        this.logger = logger;
    }
    TypeScriptPatternAnalyzer.prototype.analyzeTypeScriptPatterns = function (fileContent, lines) {
        var issues = [];
        try {
            this.checkAnyTypeUsage(fileContent, lines, issues);
            this.checkTypeAssertions(fileContent, lines, issues);
            this.checkNonNullAssertions(fileContent, lines, issues);
        }
        catch (error) {
            this.logger.error('Error analyzing TypeScript patterns:', error);
        }
        return issues;
    };
    TypeScriptPatternAnalyzer.prototype.checkAnyTypeUsage = function (fileContent, lines, issues) {
        var anyTypeRegex = /: any(?!\[\])/g;
        var match;
        while ((match = anyTypeRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Unspecified Type Usage',
                description: 'Using "any" type bypasses TypeScript type checking',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 2),
                solution: 'Define proper interface or type',
                solutionCode: '// Instead of:\nfunction process(data: any) {}\n\n// Use:\ninterface Data {\n    id: string;\n    value: number;\n}\nfunction process(data: Data) {}'
            });
        }
    };
    // ... rest of pattern checking methods ...
    TypeScriptPatternAnalyzer.prototype.findLineNumber = function (content, index) {
        return content.substring(0, index).split('\n').length - 1;
    };
    TypeScriptPatternAnalyzer.prototype.extractCodeSnippet = function (lines, lineIndex, context) {
        if (context === void 0) { context = 2; }
        var start = Math.max(0, lineIndex - context);
        var end = Math.min(lines.length, lineIndex + context + 1);
        return lines.slice(start, end).join('\n');
    };
    var _a;
    TypeScriptPatternAnalyzer = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, inject(ILogger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object])
    ], TypeScriptPatternAnalyzer);
    return TypeScriptPatternAnalyzer;
}());
exports.TypeScriptPatternAnalyzer = TypeScriptPatternAnalyzer;
