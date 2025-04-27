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
exports.DependencyAnalyzer = void 0;
var fs = require("fs");
var path = require("path");
var util = require("util");
// Promisify fs functions
var readFile = util.promisify(fs.readFile);
var readdir = util.promisify(fs.readdir);
var stat = util.promisify(fs.stat);
var DependencyAnalyzer = /** @class */ (function () {
    function DependencyAnalyzer() {
    }
    /**
     * Analyzes dependencies in a JavaScript/TypeScript project
     * @param projectPath Path to the project root
     * @returns Promise with the dependency analysis result
     */
    DependencyAnalyzer.prototype.analyzeDependencies = function (projectPath) {
        return __awaiter(this, void 0, void 0, function () {
            var packageJsonPath, packageJsonContent, packageJson, graph, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packageJsonPath = path.join(projectPath, 'package.json');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, readFile(packageJsonPath, 'utf8')];
                    case 2:
                        packageJsonContent = _a.sent();
                        packageJson = JSON.parse(packageJsonContent);
                        return [4 /*yield*/, this.buildDependencyGraph(projectPath, packageJson)];
                    case 3:
                        graph = _a.sent();
                        return [2 /*return*/, {
                                filePath: packageJsonPath,
                                graph: graph
                            }];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error analyzing dependencies:', error_1);
                        throw new Error("Failed to analyze dependencies: ".concat(error_1.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes imports in a JavaScript/TypeScript file
     * @param filePath Path to the file
     * @returns Promise with the dependency analysis result
     */
    DependencyAnalyzer.prototype.analyzeFileImports = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent, fileDir, graph, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, readFile(filePath, 'utf8')];
                    case 1:
                        fileContent = _a.sent();
                        fileDir = path.dirname(filePath);
                        return [4 /*yield*/, this.buildFileImportGraph(filePath, fileContent, fileDir)];
                    case 2:
                        graph = _a.sent();
                        return [2 /*return*/, {
                                filePath: filePath,
                                graph: graph
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error analyzing file imports:', error_2);
                        throw new Error("Failed to analyze file imports: ".concat(error_2.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalyzer.prototype.buildDependencyGraph = function (projectPath, packageJson) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, links, rootNodeId, dependencies, devDependencies, _i, _a, _b, name_1, version, nodeId, _c, _d, _e, name_2, version, nodeId;
            return __generator(this, function (_f) {
                nodes = [];
                links = [];
                rootNodeId = 'root';
                nodes.push({
                    id: rootNodeId,
                    name: packageJson.name || 'project',
                    path: projectPath,
                    type: 'package'
                });
                dependencies = packageJson.dependencies || {};
                devDependencies = packageJson.devDependencies || {};
                for (_i = 0, _a = Object.entries(dependencies); _i < _a.length; _i++) {
                    _b = _a[_i], name_1 = _b[0], version = _b[1];
                    nodeId = "dep_".concat(name_1);
                    nodes.push({
                        id: nodeId,
                        name: name_1,
                        path: name_1,
                        type: 'external'
                    });
                    links.push({
                        source: rootNodeId,
                        target: nodeId,
                        type: 'dependency'
                    });
                }
                for (_c = 0, _d = Object.entries(devDependencies); _c < _d.length; _c++) {
                    _e = _d[_c], name_2 = _e[0], version = _e[1];
                    nodeId = "devDep_".concat(name_2);
                    nodes.push({
                        id: nodeId,
                        name: name_2,
                        path: name_2,
                        type: 'external'
                    });
                    links.push({
                        source: rootNodeId,
                        target: nodeId,
                        type: 'dependency',
                        strength: 0.5 // Weaker connection for dev dependencies
                    });
                }
                return [2 /*return*/, { nodes: nodes, links: links }];
            });
        });
    };
    DependencyAnalyzer.prototype.buildFileImportGraph = function (filePath, fileContent, fileDir) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, links, currentFileId, importRegex, requireRegex, match, importPath, importPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodes = [];
                        links = [];
                        currentFileId = path.basename(filePath);
                        nodes.push({
                            id: currentFileId,
                            name: path.basename(filePath),
                            path: filePath,
                            type: 'file',
                            size: fileContent.length
                        });
                        importRegex = /import\s+(?:[\w*{}\n\r\t, ]+from\s+)?['"]([^'"]+)['"]/g;
                        requireRegex = /(?:const|let|var)\s+(?:[\w{}\n\r\t, ]+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
                        _a.label = 1;
                    case 1:
                        if (!((match = importRegex.exec(fileContent)) !== null)) return [3 /*break*/, 3];
                        importPath = match[1];
                        return [4 /*yield*/, this.addImportToGraph(currentFileId, importPath, fileDir, nodes, links, 'import')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        if (!((match = requireRegex.exec(fileContent)) !== null)) return [3 /*break*/, 5];
                        importPath = match[1];
                        return [4 /*yield*/, this.addImportToGraph(currentFileId, importPath, fileDir, nodes, links, 'require')];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 5: return [2 /*return*/, { nodes: nodes, links: links }];
                }
            });
        });
    };
    DependencyAnalyzer.prototype.addImportToGraph = function (sourceId, importPath, sourceDir, nodes, links, importType) {
        return __awaiter(this, void 0, void 0, function () {
            var importId, isNodeModule;
            return __generator(this, function (_a) {
                importId = "import_".concat(importPath.replace(/[^\w]/g, '_'));
                isNodeModule = !importPath.startsWith('.') && !importPath.startsWith('/');
                // Add node if it doesn't exist
                if (!nodes.some(function (n) { return n.id === importId; })) {
                    nodes.push({
                        id: importId,
                        name: path.basename(importPath),
                        path: importPath,
                        type: isNodeModule ? 'external' : 'file'
                    });
                }
                // Add link
                links.push({
                    source: sourceId,
                    target: importId,
                    type: importType
                });
                return [2 /*return*/];
            });
        });
    };
    return DependencyAnalyzer;
}());
exports.DependencyAnalyzer = DependencyAnalyzer;
