"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeQualityService = exports.DesignImprovementSuggester = exports.CodeReviewReport = exports.CodeReviewComment = exports.CodeReviewer = exports.BestPracticesChecker = exports.CodeOptimizer = exports.SecurityScanner = void 0;
const securityScanner_1 = require("./securityScanner");
Object.defineProperty(exports, "SecurityScanner", { enumerable: true, get: function () { return securityScanner_1.SecurityScanner; } });
const codeOptimizer_1 = require("./codeOptimizer");
Object.defineProperty(exports, "CodeOptimizer", { enumerable: true, get: function () { return codeOptimizer_1.CodeOptimizer; } });
const bestPracticesChecker_1 = require("./bestPracticesChecker");
Object.defineProperty(exports, "BestPracticesChecker", { enumerable: true, get: function () { return bestPracticesChecker_1.BestPracticesChecker; } });
const codeReviewer_1 = require("./codeReviewer");
Object.defineProperty(exports, "CodeReviewer", { enumerable: true, get: function () { return codeReviewer_1.CodeReviewer; } });
Object.defineProperty(exports, "CodeReviewComment", { enumerable: true, get: function () { return codeReviewer_1.CodeReviewComment; } });
Object.defineProperty(exports, "CodeReviewReport", { enumerable: true, get: function () { return codeReviewer_1.CodeReviewReport; } });
const designImprovementSuggester_1 = require("./designImprovementSuggester");
Object.defineProperty(exports, "DesignImprovementSuggester", { enumerable: true, get: function () { return designImprovementSuggester_1.DesignImprovementSuggester; } });
class CodeQualityService {
    constructor(context) {
        this._securityScanner = new securityScanner_1.SecurityScanner(context);
        this._codeOptimizer = new codeOptimizer_1.CodeOptimizer(context);
        this._bestPracticesChecker = new bestPracticesChecker_1.BestPracticesChecker(context);
        this._codeReviewer = new codeReviewer_1.CodeReviewer(context);
        this._designImprovementSuggester = new designImprovementSuggester_1.DesignImprovementSuggester(context);
    }
    getSecurityScanner() {
        return this._securityScanner;
    }
    getCodeOptimizer() {
        return this._codeOptimizer;
    }
    getBestPracticesChecker() {
        return this._bestPracticesChecker;
    }
    getCodeReviewer() {
        return this._codeReviewer;
    }
    getDesignImprovementSuggester() {
        return this._designImprovementSuggester;
    }
}
exports.CodeQualityService = CodeQualityService;
//# sourceMappingURL=index.js.map