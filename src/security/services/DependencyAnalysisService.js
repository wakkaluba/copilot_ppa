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
exports.DependencyAnalysisService = void 0;
var vscode = require("vscode");
var DependencyAnalysisService = /** @class */ (function () {
    function DependencyAnalysisService() {
        this.disposables = [];
    }
    DependencyAnalysisService.prototype.scanDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vulnerabilities, workspaceFolders, _i, workspaceFolders_1, folder, packageJsonVulns, pythonVulns, javaVulns;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        vulnerabilities = [];
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            return [2 /*return*/, {
                                    vulnerabilities: [],
                                    hasVulnerabilities: false,
                                    timestamp: new Date(),
                                    totalDependencies: 0
                                }];
                        }
                        _i = 0, workspaceFolders_1 = workspaceFolders;
                        _b.label = 1;
                    case 1:
                        if (!(_i < workspaceFolders_1.length)) return [3 /*break*/, 6];
                        folder = workspaceFolders_1[_i];
                        return [4 /*yield*/, this.scanNpmDependencies(folder.uri)];
                    case 2:
                        packageJsonVulns = _b.sent();
                        vulnerabilities.push.apply(vulnerabilities, packageJsonVulns);
                        return [4 /*yield*/, this.scanPythonDependencies(folder.uri)];
                    case 3:
                        pythonVulns = _b.sent();
                        vulnerabilities.push.apply(vulnerabilities, pythonVulns);
                        return [4 /*yield*/, this.scanJavaDependencies(folder.uri)];
                    case 4:
                        javaVulns = _b.sent();
                        vulnerabilities.push.apply(vulnerabilities, javaVulns);
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        _a = {
                            vulnerabilities: vulnerabilities,
                            hasVulnerabilities: vulnerabilities.length > 0,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, this.countTotalDependencies()];
                    case 7: return [2 /*return*/, (_a.totalDependencies = _b.sent(),
                            _a)];
                }
            });
        });
    };
    DependencyAnalysisService.prototype.scanNpmDependencies = function (workspaceUri) {
        return __awaiter(this, void 0, void 0, function () {
            var packageJsonUri, packageLockUri, vulnerabilities, packageJsonContent, packageJson, allDeps, _i, _a, _b, name_1, version, vulns, err_1, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        packageJsonUri = vscode.Uri.joinPath(workspaceUri, 'package.json');
                        packageLockUri = vscode.Uri.joinPath(workspaceUri, 'package-lock.json');
                        vulnerabilities = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(packageJsonUri)];
                    case 2:
                        packageJsonContent = _c.sent();
                        packageJson = JSON.parse(packageJsonContent.toString());
                        allDeps = __assign(__assign({}, packageJson.dependencies), packageJson.devDependencies);
                        _i = 0, _a = Object.entries(allDeps);
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], name_1 = _b[0], version = _b[1];
                        return [4 /*yield*/, this.checkNpmVulnerabilities(name_1, version)];
                    case 4:
                        vulns = _c.sent();
                        if (vulns.length > 0) {
                            vulnerabilities.push({
                                name: name_1,
                                version: version,
                                vulnerabilityInfo: vulns
                            });
                        }
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_1 = _c.sent();
                        console.error('Error reading package.json:', err_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, vulnerabilities];
                    case 9:
                        err_2 = _c.sent();
                        console.error('Error scanning npm dependencies:', err_2);
                        return [2 /*return*/, []];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisService.prototype.scanPythonDependencies = function (workspaceUri) {
        return __awaiter(this, void 0, void 0, function () {
            var requirementsUri, vulnerabilities, requirementsContent, requirements, _i, requirements_1, requirement, _a, name_2, version, vulns, err_3, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        requirementsUri = vscode.Uri.joinPath(workspaceUri, 'requirements.txt');
                        vulnerabilities = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(requirementsUri)];
                    case 2:
                        requirementsContent = _b.sent();
                        requirements = requirementsContent.toString().split('\n');
                        _i = 0, requirements_1 = requirements;
                        _b.label = 3;
                    case 3:
                        if (!(_i < requirements_1.length)) return [3 /*break*/, 6];
                        requirement = requirements_1[_i];
                        _a = requirement.split('=='), name_2 = _a[0], version = _a[1];
                        if (!(name_2 && version)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.checkPythonVulnerabilities(name_2.trim(), version.trim())];
                    case 4:
                        vulns = _b.sent();
                        if (vulns.length > 0) {
                            vulnerabilities.push({
                                name: name_2,
                                version: version,
                                vulnerabilityInfo: vulns
                            });
                        }
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_3 = _b.sent();
                        console.error('Error reading requirements.txt:', err_3);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, vulnerabilities];
                    case 9:
                        err_4 = _b.sent();
                        console.error('Error scanning Python dependencies:', err_4);
                        return [2 /*return*/, []];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisService.prototype.scanJavaDependencies = function (workspaceUri) {
        return __awaiter(this, void 0, void 0, function () {
            var pomXmlUri, vulnerabilities, pomContent, pomXml, depRegex, match, groupId, artifactId, version, vulns, err_5, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        pomXmlUri = vscode.Uri.joinPath(workspaceUri, 'pom.xml');
                        vulnerabilities = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(pomXmlUri)];
                    case 2:
                        pomContent = _a.sent();
                        pomXml = pomContent.toString();
                        depRegex = /<dependency>[\s\S]*?<groupId>(.*?)<\/groupId>[\s\S]*?<artifactId>(.*?)<\/artifactId>[\s\S]*?<version>(.*?)<\/version>[\s\S]*?<\/dependency>/g;
                        match = void 0;
                        _a.label = 3;
                    case 3:
                        if (!((match = depRegex.exec(pomXml)) !== null)) return [3 /*break*/, 5];
                        groupId = match[1], artifactId = match[2], version = match[3];
                        return [4 /*yield*/, this.checkMavenVulnerabilities(groupId, artifactId, version)];
                    case 4:
                        vulns = _a.sent();
                        if (vulns.length > 0) {
                            vulnerabilities.push({
                                name: "".concat(groupId, ":").concat(artifactId),
                                version: version,
                                vulnerabilityInfo: vulns
                            });
                        }
                        return [3 /*break*/, 3];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_5 = _a.sent();
                        console.error('Error reading pom.xml:', err_5);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, vulnerabilities];
                    case 8:
                        err_6 = _a.sent();
                        console.error('Error scanning Java dependencies:', err_6);
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    DependencyAnalysisService.prototype.checkNpmVulnerabilities = function (name, version) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would check against npm audit or a vulnerability database
                // This is a simplified version
                return [2 /*return*/, []];
            });
        });
    };
    DependencyAnalysisService.prototype.checkPythonVulnerabilities = function (name, version) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would check against PyPI's security advisory database
                // This is a simplified version
                return [2 /*return*/, []];
            });
        });
    };
    DependencyAnalysisService.prototype.checkMavenVulnerabilities = function (groupId, artifactId, version) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would check against Maven Central's security advisory database
                // This is a simplified version
                return [2 /*return*/, []];
            });
        });
    };
    DependencyAnalysisService.prototype.countTotalDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var total, workspaceFolders, _i, workspaceFolders_2, folder, packageJsonUri, packageJsonContent, packageJson, err_7, requirementsUri, requirementsContent, requirements, err_8, pomXmlUri, pomContent, pomXml, depMatches, err_9, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        total = 0;
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            return [2 /*return*/, 0];
                        }
                        _i = 0, workspaceFolders_2 = workspaceFolders;
                        _a.label = 1;
                    case 1:
                        if (!(_i < workspaceFolders_2.length)) return [3 /*break*/, 17];
                        folder = workspaceFolders_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 15, , 16]);
                        packageJsonUri = vscode.Uri.joinPath(folder.uri, 'package.json');
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(packageJsonUri)];
                    case 4:
                        packageJsonContent = _a.sent();
                        packageJson = JSON.parse(packageJsonContent.toString());
                        total += Object.keys(packageJson.dependencies || {}).length;
                        total += Object.keys(packageJson.devDependencies || {}).length;
                        return [3 /*break*/, 6];
                    case 5:
                        err_7 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        requirementsUri = vscode.Uri.joinPath(folder.uri, 'requirements.txt');
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(requirementsUri)];
                    case 8:
                        requirementsContent = _a.sent();
                        requirements = requirementsContent.toString().split('\n');
                        total += requirements.filter(function (line) { return line.trim() && !line.startsWith('#'); }).length;
                        return [3 /*break*/, 10];
                    case 9:
                        err_8 = _a.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        pomXmlUri = vscode.Uri.joinPath(folder.uri, 'pom.xml');
                        _a.label = 11;
                    case 11:
                        _a.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(pomXmlUri)];
                    case 12:
                        pomContent = _a.sent();
                        pomXml = pomContent.toString();
                        depMatches = pomXml.match(/<dependency>/g);
                        if (depMatches) {
                            total += depMatches.length;
                        }
                        return [3 /*break*/, 14];
                    case 13:
                        err_9 = _a.sent();
                        return [3 /*break*/, 14];
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        err_10 = _a.sent();
                        console.error('Error counting dependencies:', err_10);
                        return [3 /*break*/, 16];
                    case 16:
                        _i++;
                        return [3 /*break*/, 1];
                    case 17: return [2 /*return*/, total];
                }
            });
        });
    };
    DependencyAnalysisService.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return DependencyAnalysisService;
}());
exports.DependencyAnalysisService = DependencyAnalysisService;
