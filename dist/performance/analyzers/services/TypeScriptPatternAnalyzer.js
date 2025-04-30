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
const inversify_1 = require("inversify");
let TypeScriptPatternAnalyzer = class TypeScriptPatternAnalyzer {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    analyzeTypeScriptPatterns(fileContent, lines) {
        const issues = [];
        try {
            this.checkAnyTypeUsage(fileContent, lines, issues);
            this.checkTypeAssertions(fileContent, lines, issues);
            this.checkNonNullAssertions(fileContent, lines, issues);
        }
        catch (error) {
            this.logger.error('Error analyzing TypeScript patterns:', error);
        }
        return issues;
    }
    checkAnyTypeUsage(fileContent, lines, issues) {
        const anyTypeRegex = /: any(?!\[\])/g;
        let match;
        while ((match = anyTypeRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
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
    }
    // ... rest of pattern checking methods ...
    findLineNumber(content, index) {
        return content.substring(0, index).split('\n').length - 1;
    }
    extractCodeSnippet(lines, lineIndex, context = 2) {
        const start = Math.max(0, lineIndex - context);
        const end = Math.min(lines.length, lineIndex + context + 1);
        return lines.slice(start, end).join('\n');
    }
};
exports.TypeScriptPatternAnalyzer = TypeScriptPatternAnalyzer;
exports.TypeScriptPatternAnalyzer = TypeScriptPatternAnalyzer = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, inject(ILogger_1.ILogger)),
    __metadata("design:paramtypes", [Object])
], TypeScriptPatternAnalyzer);
//# sourceMappingURL=TypeScriptPatternAnalyzer.js.map