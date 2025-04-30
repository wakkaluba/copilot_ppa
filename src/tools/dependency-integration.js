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

var vscode = require('vscode');
var path = require('path');
var dependencyAnalyzer_1 = require('./dependencyAnalyzer');
var bottleneckDetector_1 = require('../features/codeOptimization/bottleneckDetector');
var memoryOptimizer_1 = require('../features/codeOptimization/memoryOptimizer');

/**
 * Integrates dependency analysis with optimization systems
 */
var DependencyIntegrationService = /** @class */ (function () {
    function DependencyIntegrationService() {
        this.analyzer = new dependencyAnalyzer_1.DependencyAnalyzer();
        this.bottleneckDetector = new bottleneckDetector_1.BottleneckDetector();
        this.memoryOptimizer = new memoryOptimizer_1.MemoryOptimizer();
    }

    /**
     * Analyzes a project's dependencies and identifies optimization opportunities
     */
    DependencyIntegrationService.prototype.analyzeProjectOptimizations = function (projectPath) {
        return __awaiter(this, void 0, void 0, function () {
            var dependencyGraph, circularDependencies, heavyDependencies, unusedDependencies, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.analyzer.analyzeDependencies(projectPath)];
                    case 1:
                        dependencyGraph = _a.sent();
                        circularDependencies = this.findCircularDependencies(dependencyGraph);
                        heavyDependencies = this.findHeavyDependencies(dependencyGraph);
                        unusedDependencies = this.findUnusedDependencies(dependencyGraph);

                        return [2 /*return*/, {
                            circularDependencies: circularDependencies,
                            heavyDependencies: heavyDependencies,
                            unusedDependencies: unusedDependencies,
                            graph: dependencyGraph
                        }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error analyzing project dependencies:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };

    /**
     * Finds circular dependencies in the dependency graph
     */
    DependencyIntegrationService.prototype.findCircularDependencies = function (graph) {
        var circularDeps = [];
        var visited = new Set();
        var recursionStack = new Set();

        var detectCycle = function(nodeId, path, adjacencyList) {
            if (!adjacencyList.has(nodeId)) {
                return false;
            }

            if (recursionStack.has(nodeId)) {
                circularDeps.push([...path, nodeId]);
                return true;
            }

            if (visited.has(nodeId)) {
                return false;
            }

            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);

            const neighbors = adjacencyList.get(nodeId) || [];
            for (const neighbor of neighbors) {
                if (detectCycle(neighbor, [...path], adjacencyList)) {
                    return true;
                }
            }

            recursionStack.delete(nodeId);
            return false;
        };

        // Build adjacency list from graph links
        const adjacencyList = new Map();
        for (const link of graph.links || []) {
            if (!adjacencyList.has(link.source)) {
                adjacencyList.set(link.source, []);
            }
            adjacencyList.get(link.source).push(link.target);
        }

        // Check each node for cycles
        for (const node of graph.nodes || []) {
            if (!visited.has(node.id)) {
                detectCycle(node.id, [], adjacencyList);
            }
        }

        return circularDeps;
    };

    /**
     * Finds heavy dependencies that might impact performance
     */
    DependencyIntegrationService.prototype.findHeavyDependencies = function (graph) {
        var heavyDeps = [];
        var nodeMap = new Map();

        // Create a map for quick lookup
        (graph.nodes || []).forEach(function(node) {
            nodeMap.set(node.id, node);
        });

        // Count incoming links for each node
        var incomingLinks = new Map();
        (graph.links || []).forEach(function(link) {
            if (!incomingLinks.has(link.target)) {
                incomingLinks.set(link.target, 0);
            }
            incomingLinks.set(link.target, incomingLinks.get(link.target) + 1);
        });

        // Find nodes with many incoming links and large size
        incomingLinks.forEach(function(count, nodeId) {
            const node = nodeMap.get(nodeId);
            if (node && count > 5 && node.size > 10000) {
                heavyDeps.push({
                    id: nodeId,
                    name: node.name,
                    incomingLinks: count,
                    size: node.size
                });
            }
        });

        return heavyDeps.sort((a, b) => b.incomingLinks - a.incomingLinks);
    };

    /**
     * Finds potentially unused dependencies
     */
    DependencyIntegrationService.prototype.findUnusedDependencies = function (graph) {
        var unusedDeps = [];
        var nodeMap = new Map();

        // Create a map for quick lookup
        (graph.nodes || []).forEach(function(node) {
            nodeMap.set(node.id, node);
        });

        // Find nodes with no incoming links that are not entry points
        var hasIncomingLink = new Set();
        (graph.links || []).forEach(function(link) {
            hasIncomingLink.add(link.target);
        });

        (graph.nodes || []).forEach(function(node) {
            // Skip entry points and package.json
            if (node.type === 'file' && !node.path.includes('index.') && !node.path.includes('package.json')) {
                if (!hasIncomingLink.has(node.id)) {
                    unusedDeps.push({
                        id: node.id,
                        name: node.name,
                        path: node.path
                    });
                }
            }
        });

        return unusedDeps;
    };

    /**
     * Integrates dependency analysis with bottleneck detection
     */
    DependencyIntegrationService.prototype.findDependencyBottlenecks = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fileImports, bottlenecks, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.analyzer.analyzeFileImports(filePath)];
                    case 1:
                        fileImports = _a.sent();
                        return [4 /*yield*/, this.bottleneckDetector.detectBottlenecks(filePath)];
                    case 2:
                        bottlenecks = _a.sent();

                        // Enhance bottlenecks with dependency information
                        bottlenecks = this.enhanceBottlenecksWithDependencyInfo(bottlenecks, fileImports);

                        return [2 /*return*/, bottlenecks];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error analyzing file dependencies and bottlenecks:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };

    /**
     * Enhances bottlenecks with dependency information
     */
    DependencyIntegrationService.prototype.enhanceBottlenecksWithDependencyInfo = function (bottlenecks, fileImports) {
        if (!bottlenecks || !fileImports) {
            return bottlenecks;
        }

        return bottlenecks.map(function(bottleneck) {
            // Check if bottleneck is near an import
            var isRelatedToImport = fileImports.some(function(importInfo) {
                return Math.abs(importInfo.line - bottleneck.startLine) < 5;
            });

            if (isRelatedToImport) {
                bottleneck.isRelatedToImport = true;
                bottleneck.suggestions.push('Consider lazy-loading or dynamic importing this dependency');
            }

            return bottleneck;
        });
    };

    /**
     * Registers commands for dependency integration
     */
    DependencyIntegrationService.prototype.registerCommands = function (context) {
        var _this = this;

        // Register command to analyze project dependencies and optimizations
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.analyzeDependencyOptimizations', function() {
                return __awaiter(_this, void 0, void 0, function() {
                    var folders, projectPath, optimizations, error_3;
                    return __generator(this, function(_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                folders = vscode.workspace.workspaceFolders;
                                if (!folders || folders.length === 0) {
                                    vscode.window.showErrorMessage('No workspace folder open');
                                    return [2 /*return*/];
                                }

                                projectPath = folders[0].uri.fsPath;
                                return [4 /*yield*/, vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Analyzing project dependencies and optimizations',
                                    cancellable: true
                                }, function(progress) {
                                    return __awaiter(_this, void 0, void 0, function() {
                                        return __generator(this, function(_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    progress.report({ increment: 0 });
                                                    return [4 /*yield*/, this.analyzeProjectOptimizations(projectPath)];
                                                case 1:
                                                    return [2 /*return*/, _b.sent()];
                                            }
                                        });
                                    });
                                })];
                            case 1:
                                optimizations = _a.sent();

                                // Show results
                                return [4 /*yield*/, this.showOptimizationResults(optimizations)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                error_3 = _a.sent();
                                vscode.window.showErrorMessage('Error analyzing dependencies: ' + error_3.message);
                                return [3 /*break*/, 4];
                            case 4:
                                return [2 /*return*/];
                        }
                    });
                });
            })
        );

        // Register command to analyze file dependencies and bottlenecks
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.analyzeFileDependencies', function() {
                return __awaiter(_this, void 0, void 0, function() {
                    var editor, filePath, bottlenecks, error_4;
                    return __generator(this, function(_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                editor = vscode.window.activeTextEditor;
                                if (!editor) {
                                    vscode.window.showErrorMessage('No active editor');
                                    return [2 /*return*/];
                                }

                                filePath = editor.document.uri.fsPath;
                                return [4 /*yield*/, vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Analyzing file dependencies and bottlenecks',
                                    cancellable: true
                                }, function(progress) {
                                    return __awaiter(_this, void 0, void 0, function() {
                                        return __generator(this, function(_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    progress.report({ increment: 0 });
                                                    return [4 /*yield*/, this.findDependencyBottlenecks(filePath)];
                                                case 1:
                                                    return [2 /*return*/, _b.sent()];
                                            }
                                        });
                                    });
                                })];
                            case 1:
                                bottlenecks = _a.sent();

                                // Show results
                                return [4 /*yield*/, this.showBottleneckResults(bottlenecks)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                error_4 = _a.sent();
                                vscode.window.showErrorMessage('Error analyzing file dependencies: ' + error_4.message);
                                return [3 /*break*/, 4];
                            case 4:
                                return [2 /*return*/];
                        }
                    });
                });
            })
        );
    };

    /**
     * Shows optimization results in the UI
     */
    DependencyIntegrationService.prototype.showOptimizationResults = function (optimizations) {
        return __awaiter(this, void 0, void 0, function () {
            var outputChannel, reportFile, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        outputChannel = vscode.window.createOutputChannel('Dependency Optimizations');
                        outputChannel.clear();

                        // Output to channel
                        outputChannel.appendLine('--- Dependency Optimization Results ---');

                        if (optimizations.circularDependencies.length > 0) {
                            outputChannel.appendLine('\n## Circular Dependencies');
                            optimizations.circularDependencies.forEach(function(cycle, i) {
                                outputChannel.appendLine(`\nCycle ${i + 1}: ${cycle.join(' → ')} → ${cycle[0]}`);
                            });
                        } else {
                            outputChannel.appendLine('\n✅ No circular dependencies detected');
                        }

                        if (optimizations.heavyDependencies.length > 0) {
                            outputChannel.appendLine('\n## Heavy Dependencies');
                            optimizations.heavyDependencies.forEach(function(dep) {
                                outputChannel.appendLine(`\n${dep.name}`);
                                outputChannel.appendLine(`  Used by: ${dep.incomingLinks} modules`);
                                outputChannel.appendLine(`  Size: ${this.formatSize(dep.size)}`);
                                outputChannel.appendLine(`  Consider: Lazy loading or splitting this dependency`);
                            }, this);
                        } else {
                            outputChannel.appendLine('\n✅ No heavy dependencies detected');
                        }

                        if (optimizations.unusedDependencies.length > 0) {
                            outputChannel.appendLine('\n## Potentially Unused Dependencies');
                            optimizations.unusedDependencies.forEach(function(dep) {
                                outputChannel.appendLine(`\n${dep.name} (${dep.path})`);
                                outputChannel.appendLine(`  Consider: Checking if this file is truly unused`);
                            });
                        } else {
                            outputChannel.appendLine('\n✅ No unused dependencies detected');
                        }

                        outputChannel.show();

                        // Generate markdown report
                        reportFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'dependency-optimization-report.md');
                        report = '# Dependency Optimization Report\n\n';

                        report += '## Circular Dependencies\n\n';
                        if (optimizations.circularDependencies.length > 0) {
                            optimizations.circularDependencies.forEach(function(cycle, i) {
                                report += `### Cycle ${i + 1}\n\n\`${cycle.join(' → ')} → ${cycle[0]}\`\n\n`;
                                report += 'Recommendation: Break this cycle by using dependency injection or restructuring the code.\n\n';
                            });
                        } else {
                            report += '✅ No circular dependencies detected\n\n';
                        }

                        report += '## Heavy Dependencies\n\n';
                        if (optimizations.heavyDependencies.length > 0) {
                            optimizations.heavyDependencies.forEach(function(dep) {
                                report += `### ${dep.name}\n\n`;
                                report += `- Used by: ${dep.incomingLinks} modules\n`;
                                report += `- Size: ${this.formatSize(dep.size)}\n\n`;
                                report += 'Recommendations:\n';
                                report += '- Consider lazy loading this dependency\n';
                                report += '- Consider splitting this module into smaller parts\n';
                                report += '- Review if all importing modules need the full dependency\n\n';
                            }, this);
                        } else {
                            report += '✅ No heavy dependencies detected\n\n';
                        }

                        report += '## Potentially Unused Dependencies\n\n';
                        if (optimizations.unusedDependencies.length > 0) {
                            optimizations.unusedDependencies.forEach(function(dep) {
                                report += `### ${dep.name}\n\n`;
                                report += `Path: \`${dep.path}\`\n\n`;
                                report += 'Recommendations:\n';
                                report += '- Verify this file is actually unused\n';
                                report += '- Remove if confirmed unused\n';
                                report += '- If needed, make sure it\'s properly imported\n\n';
                            });
                        } else {
                            report += '✅ No unused dependencies detected\n\n';
                        }

                        return [4 /*yield*/, vscode.workspace.fs.writeFile(
                            vscode.Uri.file(reportFile),
                            new TextEncoder().encode(report)
                        )];

                    case 1:
                        _a.sent();

                        vscode.window.showInformationMessage(
                            'Dependency optimization analysis complete',
                            'Open Report'
                        ).then(function(selection) {
                            if (selection === 'Open Report') {
                                vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(reportFile));
                            }
                        });

                        return [2 /*return*/];
                }
            });
        });
    };

    /**
     * Shows bottleneck results in the UI
     */
    DependencyIntegrationService.prototype.showBottleneckResults = function (bottlenecks) {
        if (!bottlenecks || bottlenecks.length === 0) {
            vscode.window.showInformationMessage('No dependency-related bottlenecks found');
            return;
        }

        const importRelatedBottlenecks = bottlenecks.filter(b => b.isRelatedToImport);
        if (importRelatedBottlenecks.length === 0) {
            vscode.window.showInformationMessage('No import-related bottlenecks found');
            return;
        }

        // Show findings
        const outputChannel = vscode.window.createOutputChannel('Dependency Bottlenecks');
        outputChannel.clear();
        outputChannel.appendLine('--- Import-Related Bottlenecks ---\n');

        importRelatedBottlenecks.forEach(function(bottleneck) {
            outputChannel.appendLine(`## ${bottleneck.description}`);
            outputChannel.appendLine(`Lines: ${bottleneck.startLine + 1}-${bottleneck.endLine + 1}`);
            outputChannel.appendLine('Suggestions:');
            bottleneck.suggestions.forEach(function(suggestion) {
                outputChannel.appendLine(`- ${suggestion}`);
            });
            outputChannel.appendLine('');
        });

        outputChannel.show();
    };

    /**
     * Formats file size in human-readable format
     */
    DependencyIntegrationService.prototype.formatSize = function (bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    };

    return DependencyIntegrationService;
}());

// Export the integration service
exports.DependencyIntegrationService = DependencyIntegrationService;
