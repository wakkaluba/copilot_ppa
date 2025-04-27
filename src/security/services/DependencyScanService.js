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
exports.DependencyScanService = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs/promises");
var logger_1 = require("../../utils/logger");
var DependencyScanService = /** @class */ (function () {
    function DependencyScanService(vulnerabilityService) {
        this.vulnerabilityService = vulnerabilityService;
        this.logger = logger_1.Logger.getInstance();
    }
    DependencyScanService.prototype.scanWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, vulnerabilities, _i, workspaceFolders_1, folder, npmVulns, pythonVulns, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            return [2 /*return*/, { vulnerabilities: [], hasVulnerabilities: false }];
                        }
                        vulnerabilities = [];
                        _i = 0, workspaceFolders_1 = workspaceFolders;
                        _a.label = 1;
                    case 1:
                        if (!(_i < workspaceFolders_1.length)) return [3 /*break*/, 5];
                        folder = workspaceFolders_1[_i];
                        return [4 /*yield*/, this.scanNpmDependencies(folder.uri)];
                    case 2:
                        npmVulns = _a.sent();
                        vulnerabilities.push.apply(vulnerabilities, npmVulns);
                        return [4 /*yield*/, this.scanPythonDependencies(folder.uri)];
                    case 3:
                        pythonVulns = _a.sent();
                        vulnerabilities.push.apply(vulnerabilities, pythonVulns);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, {
                            vulnerabilities: vulnerabilities,
                            hasVulnerabilities: vulnerabilities.length > 0
                        }];
                    case 6:
                        error_1 = _a.sent();
                        this.logger.error('Error scanning workspace dependencies', error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DependencyScanService.prototype.scanNpmDependencies = function (workspaceUri) {
        return __awaiter(this, void 0, void 0, function () {
            var packageJsonPath, packageJson, _a, _b, vulnerabilities, allDeps, _i, _c, _d, name_1, version, cleanVersion, vulns, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        packageJsonPath = path.join(workspaceUri.fsPath, 'package.json');
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, fs.readFile(packageJsonPath, 'utf8')];
                    case 1:
                        packageJson = _b.apply(_a, [_e.sent()]);
                        vulnerabilities = [];
                        allDeps = __assign(__assign({}, packageJson.dependencies), packageJson.devDependencies);
                        _i = 0, _c = Object.entries(allDeps);
                        _e.label = 2;
                    case 2:
                        if (!(_i < _c.length)) return [3 /*break*/, 5];
                        _d = _c[_i], name_1 = _d[0], version = _d[1];
                        cleanVersion = version.replace(/[^0-9.]/g, '');
                        return [4 /*yield*/, this.vulnerabilityService.checkNpmVulnerabilities(name_1, cleanVersion)];
                    case 3:
                        vulns = _e.sent();
                        if (vulns.length > 0) {
                            vulnerabilities.push({
                                package: name_1,
                                version: cleanVersion,
                                vulnerabilityInfo: vulns
                            });
                        }
                        _e.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, vulnerabilities];
                    case 6:
                        error_2 = _e.sent();
                        this.logger.error('Error scanning npm dependencies', error_2);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DependencyScanService.prototype.scanPythonDependencies = function (workspaceUri) {
        return __awaiter(this, void 0, void 0, function () {
            var requirementsPath, requirements, vulnerabilities, _i, _a, line, _b, name_2, version, vulns, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        requirementsPath = path.join(workspaceUri.fsPath, 'requirements.txt');
                        return [4 /*yield*/, fs.readFile(requirementsPath, 'utf8')];
                    case 1:
                        requirements = _c.sent();
                        vulnerabilities = [];
                        _i = 0, _a = requirements.split('\n');
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        line = _a[_i];
                        _b = line.split('=='), name_2 = _b[0], version = _b[1];
                        if (!(name_2 && version)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.vulnerabilityService.checkPythonVulnerabilities(name_2.trim(), version.trim())];
                    case 3:
                        vulns = _c.sent();
                        if (vulns.length > 0) {
                            vulnerabilities.push({
                                package: name_2.trim(),
                                version: version.trim(),
                                vulnerabilityInfo: vulns
                            });
                        }
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, vulnerabilities];
                    case 6:
                        error_3 = _c.sent();
                        this.logger.error('Error scanning Python dependencies', error_3);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return DependencyScanService;
}());
exports.DependencyScanService = DependencyScanService;
