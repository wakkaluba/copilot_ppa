"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
var vscode = require("vscode");
var RecommendationService = /** @class */ (function () {
    function RecommendationService(analysisSvc, dependencySvc) {
        this.analysisSvc = analysisSvc;
        this.dependencySvc = dependencySvc;
        this.disposables = [];
        this.recommendationCache = new Map();
    }
    RecommendationService.prototype.generate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, codeResult, codeRecommendations, depResult, depRecommendations, frameworkRecommendations, bestPracticeRecommendations, analysisSummary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recommendations = [];
                        return [4 /*yield*/, this.analysisSvc.scanWorkspace()];
                    case 1:
                        codeResult = _a.sent();
                        return [4 /*yield*/, this.generateCodeRecommendations(codeResult)];
                    case 2:
                        codeRecommendations = _a.sent();
                        recommendations.push.apply(recommendations, codeRecommendations);
                        return [4 /*yield*/, this.dependencySvc.scanDependencies()];
                    case 3:
                        depResult = _a.sent();
                        return [4 /*yield*/, this.generateDependencyRecommendations(depResult)];
                    case 4:
                        depRecommendations = _a.sent();
                        recommendations.push.apply(recommendations, depRecommendations);
                        return [4 /*yield*/, this.generateFrameworkRecommendations()];
                    case 5:
                        frameworkRecommendations = _a.sent();
                        recommendations.push.apply(recommendations, frameworkRecommendations);
                        bestPracticeRecommendations = this.generateBestPracticeRecommendations();
                        recommendations.push.apply(recommendations, bestPracticeRecommendations);
                        analysisSummary = this.calculateSeverityCounts(recommendations);
                        // Cache recommendations for quick lookup
                        this.cacheRecommendations(recommendations);
                        return [2 /*return*/, {
                                recommendations: recommendations,
                                analysisSummary: analysisSummary
                            }];
                }
            });
        });
    };
    RecommendationService.prototype.getRecommendationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.recommendationCache.get(id)];
            });
        });
    };
    RecommendationService.prototype.getRecommendationsByCategory = function (category) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations;
            return __generator(this, function (_a) {
                recommendations = Array.from(this.recommendationCache.values());
                return [2 /*return*/, recommendations.filter(function (rec) { return rec.category === category; })];
            });
        });
    };
    RecommendationService.prototype.generateCodeRecommendations = function (codeResult) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, issues, _i, issues_1, issue;
            return __generator(this, function (_a) {
                recommendations = [];
                issues = codeResult.issues || [];
                for (_i = 0, issues_1 = issues; _i < issues_1.length; _i++) {
                    issue = issues_1[_i];
                    recommendations.push({
                        id: "REC_".concat(issue.id),
                        title: "Fix ".concat(issue.name),
                        description: issue.description,
                        severity: issue.severity,
                        category: 'code',
                        effort: this.estimateEffort(issue),
                        implementationSteps: this.generateImplementationSteps(issue),
                        codeExample: this.generateCodeExample(issue),
                        implemented: false
                    });
                }
                return [2 /*return*/, recommendations];
            });
        });
    };
    RecommendationService.prototype.generateDependencyRecommendations = function (depResult) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, vulnerabilities, _i, vulnerabilities_1, vuln;
            return __generator(this, function (_a) {
                recommendations = [];
                vulnerabilities = depResult.vulnerabilities || [];
                for (_i = 0, vulnerabilities_1 = vulnerabilities; _i < vulnerabilities_1.length; _i++) {
                    vuln = vulnerabilities_1[_i];
                    recommendations.push({
                        id: "REC_DEP_".concat(vuln.name),
                        title: "Update vulnerable package ".concat(vuln.name),
                        description: "Package ".concat(vuln.name, " has known vulnerabilities"),
                        severity: 'high',
                        category: 'dependency',
                        effort: 2,
                        implementationSteps: [
                            "Update ".concat(vuln.name, " to version ").concat(vuln.vulnerabilityInfo[0].fixedIn, " or later"),
                            'Test the application with the updated dependency',
                            'Review breaking changes in the changelog'
                        ],
                        implemented: false
                    });
                }
                return [2 /*return*/, recommendations];
            });
        });
    };
    RecommendationService.prototype.generateFrameworkRecommendations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, frameworkPatterns, _i, frameworkPatterns_1, pattern, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recommendations = [];
                        frameworkPatterns = [
                            {
                                files: '**/*.{jsx,tsx}',
                                framework: 'React',
                                recommendations: [
                                    {
                                        id: 'REC_REACT_XSS',
                                        title: 'Prevent XSS in React',
                                        description: 'Ensure proper sanitization of user input in React components',
                                        severity: 'medium',
                                        category: 'framework',
                                        effort: 3
                                    }
                                ]
                            },
                            {
                                files: '**/routes/*.{js,ts}',
                                framework: 'Express',
                                recommendations: [
                                    {
                                        id: 'REC_EXPRESS_HELMET',
                                        title: 'Use Helmet middleware',
                                        description: 'Add Helmet middleware to set security headers',
                                        severity: 'high',
                                        category: 'framework',
                                        effort: 1
                                    }
                                ]
                            }
                        ];
                        _i = 0, frameworkPatterns_1 = frameworkPatterns;
                        _a.label = 1;
                    case 1:
                        if (!(_i < frameworkPatterns_1.length)) return [3 /*break*/, 4];
                        pattern = frameworkPatterns_1[_i];
                        return [4 /*yield*/, vscode.workspace.findFiles(pattern.files)];
                    case 2:
                        files = _a.sent();
                        if (files.length > 0) {
                            recommendations.push.apply(recommendations, pattern.recommendations);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, recommendations];
                }
            });
        });
    };
    RecommendationService.prototype.generateBestPracticeRecommendations = function () {
        return [
            {
                id: 'REC_BP_AUTH',
                title: 'Implement proper authentication',
                description: 'Ensure robust authentication mechanisms are in place',
                severity: 'high',
                category: 'general',
                effort: 4,
                implementationSteps: [
                    'Review current authentication implementation',
                    'Implement password hashing',
                    'Add multi-factor authentication',
                    'Implement proper session management'
                ],
                implemented: false
            },
            {
                id: 'REC_BP_LOGGING',
                title: 'Implement security logging',
                description: 'Add comprehensive security logging and monitoring',
                severity: 'medium',
                category: 'general',
                effort: 3,
                implementationSteps: [
                    'Add logging for security events',
                    'Implement audit trails',
                    'Set up log rotation',
                    'Add monitoring alerts'
                ],
                implemented: false
            }
        ];
    };
    RecommendationService.prototype.calculateSeverityCounts = function (recommendations) {
        return recommendations.reduce(function (summary, rec) {
            summary[rec.severity]++;
            return summary;
        }, {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        });
    };
    RecommendationService.prototype.estimateEffort = function (issue) {
        // Estimate implementation effort (1-5)
        switch (issue.severity) {
            case 'critical': return 5;
            case 'high': return 4;
            case 'medium': return 3;
            case 'low': return 2;
            default: return 1;
        }
    };
    RecommendationService.prototype.generateImplementationSteps = function (issue) {
        // Generate implementation steps based on issue type
        var baseSteps = [
            "Locate the issue in ".concat(issue.location.file),
            "Review the problematic code around line ".concat(issue.location.line)
        ];
        if (issue.recommendation) {
            baseSteps.push.apply(baseSteps, issue.recommendation.split('\n'));
        }
        return baseSteps;
    };
    RecommendationService.prototype.generateCodeExample = function (issue) {
        // Generate example code based on issue type
        if (issue.codeExample) {
            return issue.codeExample;
        }
        return undefined;
    };
    RecommendationService.prototype.cacheRecommendations = function (recommendations) {
        this.recommendationCache.clear();
        for (var _i = 0, recommendations_1 = recommendations; _i < recommendations_1.length; _i++) {
            var rec = recommendations_1[_i];
            this.recommendationCache.set(rec.id, rec);
        }
    };
    RecommendationService.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.recommendationCache.clear();
    };
    return RecommendationService;
}());
exports.RecommendationService = RecommendationService;
