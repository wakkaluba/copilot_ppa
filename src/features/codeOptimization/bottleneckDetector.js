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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottleneckDetector = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs");
var BottleneckDetector = /** @class */ (function () {
    function BottleneckDetector(context) {
        this.context = context;
        this.outputChannel = vscode.window.createOutputChannel('Bottleneck Detector');
        context.subscriptions.push(vscode.commands.registerCommand('vscode-local-llm-agent.detectBottlenecks', this.detectBottlenecksInCurrentFile.bind(this)), vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceBottlenecks', this.analyzeWorkspaceBottlenecks.bind(this)), this.outputChannel);
    }
    /**
     * Analyzes the current file for potential bottlenecks
     */
    BottleneckDetector.prototype.detectBottlenecksInCurrentFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, document;
            return __generator(this, function (_a) {
                editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showWarningMessage('No active file to analyze');
                    return [2 /*return*/, []];
                }
                document = editor.document;
                return [2 /*return*/, this.detectBottlenecks(document.uri)];
            });
        });
    };
    /**
     * Detects bottlenecks in a specific file
     */
    BottleneckDetector.prototype.detectBottlenecks = function (fileUri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, fileContent, fileName, fileExtension, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(fileUri)];
                    case 1:
                        document = _a.sent();
                        fileContent = document.getText();
                        fileName = path.basename(fileUri.fsPath);
                        fileExtension = path.extname(fileUri.fsPath).substring(1);
                        // Only support certain file types for now
                        if (!['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp'].includes(fileExtension)) {
                            vscode.window.showInformationMessage("Bottleneck detection not supported for .".concat(fileExtension, " files"));
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Analyzing ".concat(fileName, " for bottlenecks"),
                                cancellable: true
                            }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var structuralBottlenecks, algorithmicBottlenecks, resourceBottlenecks, allBottlenecks;
                                return __generator(this, function (_a) {
                                    progress.report({ increment: 0 });
                                    structuralBottlenecks = this.detectStructuralBottlenecks(fileContent, fileExtension);
                                    progress.report({ increment: 30 });
                                    if (token.isCancellationRequested) {
                                        return [2 /*return*/, []];
                                    }
                                    algorithmicBottlenecks = this.detectAlgorithmicBottlenecks(fileContent, fileExtension);
                                    progress.report({ increment: 30 });
                                    if (token.isCancellationRequested) {
                                        return [2 /*return*/, []];
                                    }
                                    resourceBottlenecks = this.detectResourceBottlenecks(fileContent, fileExtension);
                                    progress.report({ increment: 40 });
                                    allBottlenecks = __spreadArray(__spreadArray(__spreadArray([], structuralBottlenecks, true), algorithmicBottlenecks, true), resourceBottlenecks, true).map(function (b) { return (__assign(__assign({}, b), { file: fileUri.fsPath })); });
                                    // Display results
                                    this.displayBottleneckResults(allBottlenecks);
                                    return [2 /*return*/, allBottlenecks];
                                });
                            }); })];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results || []];
                }
            });
        });
    };
    /**
     * Detects bottlenecks across all workspace files
     */
    BottleneckDetector.prototype.analyzeWorkspaceBottlenecks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!vscode.workspace.workspaceFolders) {
                            vscode.window.showWarningMessage('No workspace folder open');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: 'Analyzing workspace for bottlenecks',
                                cancellable: true
                            }, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var files, totalFiles, processedFiles, allBottlenecks, _i, files_1, file, bottlenecks;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,c,cpp}', '**/node_modules/**')];
                                        case 1:
                                            files = _a.sent();
                                            totalFiles = files.length;
                                            processedFiles = 0;
                                            allBottlenecks = [];
                                            _i = 0, files_1 = files;
                                            _a.label = 2;
                                        case 2:
                                            if (!(_i < files_1.length)) return [3 /*break*/, 5];
                                            file = files_1[_i];
                                            if (token.isCancellationRequested) {
                                                return [3 /*break*/, 5];
                                            }
                                            return [4 /*yield*/, this.detectBottlenecks(file)];
                                        case 3:
                                            bottlenecks = _a.sent();
                                            allBottlenecks = __spreadArray(__spreadArray([], allBottlenecks, true), bottlenecks, true);
                                            processedFiles++;
                                            progress.report({
                                                increment: (100 / totalFiles),
                                                message: "Processed ".concat(processedFiles, " of ").concat(totalFiles, " files")
                                            });
                                            _a.label = 4;
                                        case 4:
                                            _i++;
                                            return [3 /*break*/, 2];
                                        case 5:
                                            // Generate comprehensive report
                                            this.generateBottleneckReport(allBottlenecks);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detects structural bottlenecks like deeply nested loops, complex conditions
     */
    BottleneckDetector.prototype.detectStructuralBottlenecks = function (content, fileType) {
        var bottlenecks = [];
        var lines = content.split('\n');
        // Track nesting level
        var nestingLevels = [];
        var currentNestingLevel = 0;
        var nestingStartLine = -1;
        // Detect loop nesting
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            // Check for loop starts
            if (this.isLoopStart(line, fileType)) {
                if (currentNestingLevel === 0) {
                    nestingStartLine = i;
                }
                currentNestingLevel++;
                nestingLevels[i] = currentNestingLevel;
            }
            // Check for loop ends
            if (this.isBlockEnd(line, fileType) && currentNestingLevel > 0) {
                currentNestingLevel--;
                // If we're back to zero nesting and we had deep nesting
                if (currentNestingLevel === 0 && Math.max.apply(Math, nestingLevels.slice(nestingStartLine, i + 1)) >= 3) {
                    bottlenecks.push({
                        file: '',
                        startLine: nestingStartLine,
                        endLine: i,
                        description: 'Deeply nested loops detected',
                        impact: 'high',
                        suggestions: [
                            'Consider refactoring deeply nested loops to reduce time complexity',
                            'Extract inner loops into separate functions',
                            'Consider using more efficient data structures to avoid nested iterations'
                        ]
                    });
                }
                nestingLevels[i] = currentNestingLevel;
            }
            // Check for complex conditions
            if (line.includes('if') || line.includes('while') || line.includes('for')) {
                var conditionComplexity = (line.match(/&&|\|\|/g) || []).length;
                if (conditionComplexity >= 3) {
                    bottlenecks.push({
                        file: '',
                        startLine: i,
                        endLine: i,
                        description: 'Complex condition with multiple logical operators',
                        impact: 'medium',
                        suggestions: [
                            'Break complex conditions into separate if statements or variables',
                            'Extract condition logic into a separate function with a meaningful name'
                        ]
                    });
                }
            }
        }
        return bottlenecks;
    };
    /**
     * Detects algorithmic inefficiencies
     */
    BottleneckDetector.prototype.detectAlgorithmicBottlenecks = function (content, fileType) {
        var bottlenecks = [];
        var lines = content.split('\n');
        // Look for potential inefficient sorting or search algorithms
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            // Check for bubble sort-like patterns (two nested loops with swapping)
            if (this.isLoopStart(line, fileType)) {
                var nextLines = lines.slice(i, i + 15).join('\n');
                if (this.containsNestedLoop(nextLines, fileType) &&
                    (nextLines.includes('swap') ||
                        (nextLines.includes('temp') && nextLines.includes('=')))) {
                    bottlenecks.push({
                        file: '',
                        startLine: i,
                        endLine: this.findBlockEnd(lines, i),
                        description: 'Potentially inefficient sorting algorithm detected',
                        impact: 'high',
                        suggestions: [
                            'Consider using built-in sort functions which implement efficient algorithms',
                            'If custom sorting is required, consider using quicksort or mergesort instead of bubble/selection sort'
                        ]
                    });
                }
            }
            // Check for linear search in large arrays
            if (line.includes('find(') ||
                line.includes('includes(') ||
                line.includes('indexOf(') ||
                (line.includes('for') && line.includes('==='))) {
                bottlenecks.push({
                    file: '',
                    startLine: i,
                    endLine: i,
                    description: 'Potential linear search operation',
                    impact: 'medium',
                    suggestions: [
                        'For frequent lookups, consider using a Map or object for O(1) access instead of array linear search',
                        'If the array is sorted, binary search could be more efficient'
                    ]
                });
            }
            // Check for excessive string concatenation
            if ((line.match(/\+=/g) || []).length > 2 && line.includes('string') || line.includes('"') || line.includes("'")) {
                bottlenecks.push({
                    file: '',
                    startLine: i,
                    endLine: i,
                    description: 'Excessive string concatenation',
                    impact: 'medium',
                    suggestions: [
                        'Use string interpolation or template literals instead of multiple concatenations',
                        'For building large strings in loops, use array.join() or a string builder pattern'
                    ]
                });
            }
        }
        return bottlenecks;
    };
    /**
     * Detects I/O and resource usage bottlenecks
     */
    BottleneckDetector.prototype.detectResourceBottlenecks = function (content, fileType) {
        var bottlenecks = [];
        var lines = content.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            // Check for synchronous file operations
            if ((line.includes('readFileSync') || line.includes('writeFileSync')) &&
                !content.includes('performance critical')) {
                bottlenecks.push({
                    file: '',
                    startLine: i,
                    endLine: i,
                    description: 'Synchronous file I/O operation',
                    impact: 'high',
                    suggestions: [
                        'Use asynchronous file operations to prevent blocking the event loop',
                        'Consider using streams for large files to reduce memory usage'
                    ]
                });
            }
            // Check for resource leaks
            if ((line.includes('new ') || line.includes('create')) &&
                (line.includes('Stream') || line.includes('Connection') || line.includes('Socket'))) {
                // Look for corresponding close/dispose in the next 30 lines
                var nextLines = lines.slice(i, i + 30).join('\n');
                if (!nextLines.includes('close(') && !nextLines.includes('dispose(') && !nextLines.includes('finally')) {
                    bottlenecks.push({
                        file: '',
                        startLine: i,
                        endLine: i,
                        description: 'Potential resource leak detected',
                        impact: 'high',
                        suggestions: [
                            'Ensure resources are properly closed/disposed with finally blocks',
                            'Consider using a try-with-resources pattern or resource management pattern'
                        ]
                    });
                }
            }
            // Check for inefficient DOM operations in loops
            if (fileType === 'js' || fileType === 'ts' || fileType === 'jsx' || fileType === 'tsx') {
                if (this.isLoopStart(line, fileType)) {
                    var loopBody = this.getLoopBody(lines, i);
                    if (loopBody.includes('document.') || loopBody.includes('getElementById') ||
                        loopBody.includes('querySelector')) {
                        bottlenecks.push({
                            file: '',
                            startLine: i,
                            endLine: this.findBlockEnd(lines, i),
                            description: 'DOM operations inside loops',
                            impact: 'high',
                            suggestions: [
                                'Cache DOM elements outside of loops',
                                'Minimize reflows by batching DOM updates',
                                'Consider using DocumentFragment for multiple DOM insertions'
                            ]
                        });
                    }
                }
            }
        }
        return bottlenecks;
    };
    /**
     * Helper to check if a line starts a loop
     */
    BottleneckDetector.prototype.isLoopStart = function (line, fileType) {
        if (['js', 'ts', 'jsx', 'tsx', 'java', 'c', 'cpp'].includes(fileType)) {
            return /^\s*(for|while|do)\s*\(/.test(line) || /^\s*for\s*\(/.test(line) ||
                /^\s*while\s*\(/.test(line) || /^\s*forEach/.test(line);
        }
        else if (fileType === 'py') {
            return /^\s*for\s+\w+\s+in/.test(line) || /^\s*while\s+/.test(line);
        }
        return false;
    };
    /**
     * Helper to check if a line ends a block
     */
    BottleneckDetector.prototype.isBlockEnd = function (line, fileType) {
        if (['js', 'ts', 'jsx', 'tsx', 'java', 'c', 'cpp'].includes(fileType)) {
            return /^\s*}/.test(line);
        }
        else if (fileType === 'py') {
            return /^\s*\w/.test(line) && line.trim() !== '';
        }
        return false;
    };
    /**
     * Helper to check if content contains nested loops
     */
    BottleneckDetector.prototype.containsNestedLoop = function (content, fileType) {
        var lines = content.split('\n');
        var nestingLevel = 0;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (this.isLoopStart(line, fileType)) {
                nestingLevel++;
                if (nestingLevel >= 2) {
                    return true;
                }
            }
            if (this.isBlockEnd(line, fileType) && nestingLevel > 0) {
                nestingLevel--;
            }
        }
        return false;
    };
    /**
     * Find the ending line for a block starting at the given line
     */
    BottleneckDetector.prototype.findBlockEnd = function (lines, startLine) {
        var fileType = 'js'; // Default to JS-like syntax
        var nestingLevel = 0;
        var inBlock = false;
        for (var i = startLine; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.includes('{')) {
                nestingLevel++;
                inBlock = true;
            }
            if (line.includes('}') && inBlock) {
                nestingLevel--;
                if (nestingLevel === 0) {
                    return i;
                }
            }
        }
        return startLine + 5; // Fallback if we can't find the end
    };
    /**
     * Extract the body of a loop
     */
    BottleneckDetector.prototype.getLoopBody = function (lines, loopStartLine) {
        var endLine = this.findBlockEnd(lines, loopStartLine);
        return lines.slice(loopStartLine + 1, endLine).join('\n');
    };
    /**
     * Display bottleneck results in output channel
     */
    BottleneckDetector.prototype.displayBottleneckResults = function (bottlenecks) {
        var _this = this;
        this.outputChannel.clear();
        if (bottlenecks.length === 0) {
            this.outputChannel.appendLine('No bottlenecks detected.');
            return;
        }
        this.outputChannel.appendLine("Found ".concat(bottlenecks.length, " potential bottlenecks:"));
        this.outputChannel.appendLine('');
        bottlenecks.forEach(function (bottleneck) {
            _this.outputChannel.appendLine("File: ".concat(bottleneck.file));
            _this.outputChannel.appendLine("Location: Lines ".concat(bottleneck.startLine + 1, "-").concat(bottleneck.endLine + 1));
            _this.outputChannel.appendLine("Impact: ".concat(bottleneck.impact.toUpperCase()));
            _this.outputChannel.appendLine("Issue: ".concat(bottleneck.description));
            _this.outputChannel.appendLine('Suggestions:');
            bottleneck.suggestions.forEach(function (suggestion) {
                _this.outputChannel.appendLine("  - ".concat(suggestion));
            });
            _this.outputChannel.appendLine('-------------------------------------------');
        });
        this.outputChannel.show();
    };
    /**
     * Generate a comprehensive report of all bottlenecks
     */
    BottleneckDetector.prototype.generateBottleneckReport = function (bottlenecks) {
        var reportFile = path.join(this.context.extensionPath, 'bottleneck-report.md');
        var report = '# Code Bottleneck Analysis Report\n\n';
        report += "Generated on: ".concat(new Date().toLocaleString(), "\n\n");
        // Group by file
        var bottlenecksByFile = {};
        bottlenecks.forEach(function (bottleneck) {
            if (!bottlenecksByFile[bottleneck.file]) {
                bottlenecksByFile[bottleneck.file] = [];
            }
            bottlenecksByFile[bottleneck.file].push(bottleneck);
        });
        // Group by impact
        var highImpact = bottlenecks.filter(function (b) { return b.impact === 'high'; });
        var mediumImpact = bottlenecks.filter(function (b) { return b.impact === 'medium'; });
        var lowImpact = bottlenecks.filter(function (b) { return b.impact === 'low'; });
        report += '## Summary\n\n';
        report += "- Total bottlenecks detected: ".concat(bottlenecks.length, "\n");
        report += "- High impact issues: ".concat(highImpact.length, "\n");
        report += "- Medium impact issues: ".concat(mediumImpact.length, "\n");
        report += "- Low impact issues: ".concat(lowImpact.length, "\n");
        report += "- Files affected: ".concat(Object.keys(bottlenecksByFile).length, "\n\n");
        report += '## High Impact Issues\n\n';
        if (highImpact.length === 0) {
            report += 'No high impact issues detected.\n\n';
        }
        else {
            highImpact.forEach(function (bottleneck) {
                report += "### ".concat(bottleneck.description, "\n");
                report += "- File: `".concat(path.basename(bottleneck.file), "`\n");
                report += "- Lines: ".concat(bottleneck.startLine + 1, "-").concat(bottleneck.endLine + 1, "\n");
                report += "- Suggestions:\n";
                bottleneck.suggestions.forEach(function (suggestion) {
                    report += "  - ".concat(suggestion, "\n");
                });
                report += '\n';
            });
        }
        report += '## Findings by File\n\n';
        Object.keys(bottlenecksByFile).forEach(function (file) {
            report += "### ".concat(path.basename(file), "\n\n");
            bottlenecksByFile[file].forEach(function (bottleneck) {
                report += "- **".concat(bottleneck.description, "** (").concat(bottleneck.impact, ")\n");
                report += "  Lines: ".concat(bottleneck.startLine + 1, "-").concat(bottleneck.endLine + 1, "\n");
                report += "  Suggestions:\n";
                bottleneck.suggestions.forEach(function (suggestion) {
                    report += "  - ".concat(suggestion, "\n");
                });
                report += '\n';
            });
        });
        fs.writeFileSync(reportFile, report);
        vscode.window.showInformationMessage('Bottleneck analysis report generated', 'Open Report').then(function (selection) {
            if (selection === 'Open Report') {
                vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(reportFile));
            }
        });
        this.outputChannel.appendLine("Report saved to: ".concat(reportFile));
        this.outputChannel.show();
    };
    return BottleneckDetector;
}());
exports.BottleneckDetector = BottleneckDetector;
