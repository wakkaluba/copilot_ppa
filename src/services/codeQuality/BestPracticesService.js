"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.BestPracticesService = void 0;
var BestPracticesService = /** @class */ (function () {
    function BestPracticesService(context) {
        this._context = context;
    }
    /**
     * Detects anti-patterns in code
     */
    BestPracticesService.prototype.detectAntiPatterns = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, fileExtension, text;
            return __generator(this, function (_a) {
                issues = [];
                fileExtension = document.uri.fsPath.toLowerCase();
                text = document.getText();
                // Check for language-specific anti-patterns
                if (fileExtension.endsWith('.ts') || fileExtension.endsWith('.js')) {
                    this.detectJavaScriptAntiPatterns(document, text, issues);
                }
                else if (fileExtension.endsWith('.py')) {
                    this.detectPythonAntiPatterns(document, text, issues);
                }
                else if (fileExtension.endsWith('.java')) {
                    this.detectJavaAntiPatterns(document, text, issues);
                }
                return [2 /*return*/, issues];
            });
        });
    };
    /**
     * Suggests design improvements
     */
    BestPracticesService.prototype.suggestDesignImprovements = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, text;
            return __generator(this, function (_a) {
                issues = [];
                text = document.getText();
                this.checkMethodLength(document, text, issues);
                this.checkParameterCount(document, text, issues);
                this.checkComplexity(document, text, issues);
                return [2 /*return*/, issues];
            });
        });
    };
    /**
     * Checks code consistency
     */
    BestPracticesService.prototype.checkCodeConsistency = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, text;
            return __generator(this, function (_a) {
                issues = [];
                text = document.getText();
                this.checkNamingConventions(document, text, issues);
                this.checkStyleConsistency(document, text, issues);
                this.checkCommentConsistency(document, text, issues);
                return [2 /*return*/, issues];
            });
        });
    };
    BestPracticesService.prototype.detectJavaScriptAntiPatterns = function (document, text, issues) {
        // Check for var usage
        this.findPatterns(document, text, /\bvar\s+/g, {
            severity: 'warning',
            description: 'Use of var keyword',
            recommendation: 'Use let or const instead of var',
            category: 'antiPattern'
        }, issues);
        // Check for console.log
        this.findPatterns(document, text, /console\.(log|debug|info)\(/g, {
            severity: 'warning',
            description: 'Console logging in production code',
            recommendation: 'Remove console logging or use a proper logging system',
            category: 'antiPattern'
        }, issues);
    };
    BestPracticesService.prototype.detectPythonAntiPatterns = function (document, text, issues) {
        // Check for wildcard imports
        this.findPatterns(document, text, /from\s+\w+\s+import\s+\*/g, {
            severity: 'warning',
            description: 'Wildcard import usage',
            recommendation: 'Import specific names instead of using wildcard imports',
            category: 'antiPattern'
        }, issues);
    };
    BestPracticesService.prototype.detectJavaAntiPatterns = function (document, text, issues) {
        // Check for raw exception catching
        this.findPatterns(document, text, /catch\s*\(\s*Exception\s+/g, {
            severity: 'warning',
            description: 'Catching raw Exception',
            recommendation: 'Catch specific exceptions instead of generic Exception',
            category: 'antiPattern'
        }, issues);
    };
    BestPracticesService.prototype.checkMethodLength = function (document, text, issues) {
        var methodMatches = text.match(/(\b(function|class|def)\s+\w+|=>)\s*{[\s\S]*?}/g) || [];
        for (var _i = 0, methodMatches_1 = methodMatches; _i < methodMatches_1.length; _i++) {
            var method = methodMatches_1[_i];
            var lines = method.split('\n').length;
            if (lines > 30) {
                issues.push({
                    file: document.uri.fsPath,
                    line: text.indexOf(method),
                    column: 0,
                    severity: 'warning',
                    description: "Method is too long (".concat(lines, " lines)"),
                    recommendation: 'Break down into smaller methods',
                    category: 'design'
                });
            }
        }
    };
    BestPracticesService.prototype.checkParameterCount = function (document, text, issues) {
        var paramMatches = text.match(/\([^)]*\)/g) || [];
        for (var _i = 0, paramMatches_1 = paramMatches; _i < paramMatches_1.length; _i++) {
            var params = paramMatches_1[_i];
            var count = params.split(',').length;
            if (count > 4) {
                issues.push({
                    file: document.uri.fsPath,
                    line: text.indexOf(params),
                    column: 0,
                    severity: 'suggestion',
                    description: "Too many parameters (".concat(count, ")"),
                    recommendation: 'Use parameter object pattern',
                    category: 'design'
                });
            }
        }
    };
    BestPracticesService.prototype.checkComplexity = function (document, text, issues) {
        // Check nesting depth
        var maxDepth = this.findMaxNestingDepth(text);
        if (maxDepth > 3) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'warning',
                description: "High nesting depth (".concat(maxDepth, " levels)"),
                recommendation: 'Reduce nesting by extracting methods',
                category: 'design'
            });
        }
    };
    BestPracticesService.prototype.checkNamingConventions = function (document, text, issues) {
        // Mix of camelCase and snake_case
        var camelCase = text.match(/[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/g) || [];
        var snakeCase = text.match(/[a-z][a-z0-9]*_[a-z0-9_]*/g) || [];
        if (camelCase.length > 0 && snakeCase.length > 0) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: 'Mixed naming conventions',
                recommendation: 'Standardize on either camelCase or snake_case',
                category: 'consistency'
            });
        }
    };
    BestPracticesService.prototype.checkStyleConsistency = function (document, text, issues) {
        // Check quote style consistency
        var singleQuotes = (text.match(/'/g) || []).length;
        var doubleQuotes = (text.match(/"/g) || []).length;
        if (singleQuotes > 0 && doubleQuotes > 0) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: 'Inconsistent quote style',
                recommendation: 'Standardize on single or double quotes',
                category: 'consistency'
            });
        }
    };
    BestPracticesService.prototype.checkCommentConsistency = function (document, text, issues) {
        // Check JSDoc style consistency
        var jsdocStyle = text.match(/\/\*\*[\s\S]*?\*\//g) || [];
        var lineComments = text.match(/\/\/.*$/mg) || [];
        if (jsdocStyle.length > 0 && lineComments.length > jsdocStyle.length * 2) {
            issues.push({
                file: document.uri.fsPath,
                line: 1,
                column: 1,
                severity: 'suggestion',
                description: 'Inconsistent comment style',
                recommendation: 'Use JSDoc for documentation comments',
                category: 'documentation'
            });
        }
    };
    BestPracticesService.prototype.findPatterns = function (document, text, pattern, issueTemplate, issues) {
        var match;
        while ((match = pattern.exec(text)) !== null) {
            var pos = document.positionAt(match.index);
            issues.push(__assign({ file: document.uri.fsPath, line: pos.line + 1, column: pos.character + 1 }, issueTemplate));
        }
    };
    BestPracticesService.prototype.findMaxNestingDepth = function (text) {
        var maxDepth = 0;
        var currentDepth = 0;
        var inString = false;
        var stringChar = '';
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            // Handle strings
            if ((char === '"' || char === "'") && text[i - 1] !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                }
                else if (char === stringChar) {
                    inString = false;
                }
                continue;
            }
            if (!inString) {
                if (char === '{') {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                }
                else if (char === '}') {
                    currentDepth--;
                }
            }
        }
        return maxDepth;
    };
    BestPracticesService.prototype.dispose = function () {
        // Clean up any resources
    };
    return BestPracticesService;
}());
exports.BestPracticesService = BestPracticesService;
