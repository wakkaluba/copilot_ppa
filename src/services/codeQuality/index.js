"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeQualityService = exports.DesignImprovementSuggester = exports.CodeReviewReport = exports.CodeReviewComment = exports.CodeReviewer = exports.BestPracticesChecker = exports.OptimizationIssue = exports.CodeOptimizer = exports.SecurityScanner = void 0;
var securityScanner_1 = require("./securityScanner");
Object.defineProperty(exports, "SecurityScanner", { enumerable: true, get: function () { return securityScanner_1.SecurityScanner; } });
var codeOptimizer_1 = require("./codeOptimizer");
Object.defineProperty(exports, "CodeOptimizer", { enumerable: true, get: function () { return codeOptimizer_1.CodeOptimizer; } });
Object.defineProperty(exports, "OptimizationIssue", { enumerable: true, get: function () { return codeOptimizer_1.OptimizationIssue; } });
var bestPracticesChecker_1 = require("./bestPracticesChecker");
Object.defineProperty(exports, "BestPracticesChecker", { enumerable: true, get: function () { return bestPracticesChecker_1.BestPracticesChecker; } });
var codeReviewer_1 = require("./codeReviewer");
Object.defineProperty(exports, "CodeReviewer", { enumerable: true, get: function () { return codeReviewer_1.CodeReviewer; } });
Object.defineProperty(exports, "CodeReviewComment", { enumerable: true, get: function () { return codeReviewer_1.CodeReviewComment; } });
Object.defineProperty(exports, "CodeReviewReport", { enumerable: true, get: function () { return codeReviewer_1.CodeReviewReport; } });
var designImprovementSuggester_1 = require("./designImprovementSuggester");
Object.defineProperty(exports, "DesignImprovementSuggester", { enumerable: true, get: function () { return designImprovementSuggester_1.DesignImprovementSuggester; } });
var CodeQualityService = /** @class */ (function () {
    function CodeQualityService(context) {
        this._securityScanner = new securityScanner_1.SecurityScanner(context);
        this._codeOptimizer = new codeOptimizer_1.CodeOptimizer(context);
        this._bestPracticesChecker = new bestPracticesChecker_1.BestPracticesChecker(context);
        this._codeReviewer = new codeReviewer_1.CodeReviewer(context);
        this._designImprovementSuggester = new designImprovementSuggester_1.DesignImprovementSuggester(context);
    }
    CodeQualityService.prototype.getSecurityScanner = function () {
        return this._securityScanner;
    };
    CodeQualityService.prototype.getCodeOptimizer = function () {
        return this._codeOptimizer;
    };
    CodeQualityService.prototype.getBestPracticesChecker = function () {
        return this._bestPracticesChecker;
    };
    CodeQualityService.prototype.getCodeReviewer = function () {
        return this._codeReviewer;
    };
    CodeQualityService.prototype.getDesignImprovementSuggester = function () {
        return this._designImprovementSuggester;
    };
    return CodeQualityService;
}());
exports.CodeQualityService = CodeQualityService;
