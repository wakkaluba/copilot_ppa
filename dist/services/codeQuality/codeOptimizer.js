"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeOptimizer = void 0;
const CodeOptimizerService_1 = require("./services/CodeOptimizerService");
class CodeOptimizer {
    service;
    constructor(context) {
        this.service = new CodeOptimizerService_1.CodeOptimizerService(context);
    }
    async analyzePerformance(document) {
        return this.service.analyzePerformance(document);
    }
    async analyzeMemoryUsage(document) {
        return this.service.analyzeMemoryUsage(document);
    }
    analyzeRuntimeComplexity(document) {
        return this.service.analyzeRuntimeComplexity(document);
    }
}
exports.CodeOptimizer = CodeOptimizer;
//# sourceMappingURL=codeOptimizer.js.map