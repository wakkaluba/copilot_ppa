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
exports.GitHubActionsProvider = void 0;
var vscode = require("vscode");
var rest_1 = require("@octokit/rest");
var yaml = require("yaml");
var GitHubActionsProvider = /** @class */ (function () {
    function GitHubActionsProvider() {
        this.name = 'GitHub Actions';
        this.initialize();
    }
    GitHubActionsProvider.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAuthToken()];
                    case 1:
                        token = _a.sent();
                        if (token) {
                            this.octokit = new rest_1.Octokit({ auth: token });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    GitHubActionsProvider.prototype.getAuthToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, vscode.workspace.getConfiguration('copilot-ppa')
                        .get('github.personalAccessToken')];
            });
        });
    };
    GitHubActionsProvider.prototype.isConfigured = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, !!this.octokit];
            });
        });
    };
    GitHubActionsProvider.prototype.createWorkflow = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var workflowPath, template, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workflowPath = options.path || ".github/workflows/".concat(options.name, ".yml");
                        return [4 /*yield*/, this.loadWorkflowTemplate(options.template)];
                    case 1:
                        template = _a.sent();
                        content = this.replaceVariables(template, options.variables);
                        return [4 /*yield*/, vscode.workspace.fs.writeFile(vscode.Uri.file(workflowPath), Buffer.from(content))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitHubActionsProvider.prototype.loadWorkflowTemplate = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var templatePath, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        templatePath = vscode.Uri.file("templates/github/".concat(templateName, ".yml"));
                        return [4 /*yield*/, vscode.workspace.fs.readFile(templatePath)];
                    case 1:
                        content = _a.sent();
                        return [2 /*return*/, content.toString()];
                }
            });
        });
    };
    GitHubActionsProvider.prototype.replaceVariables = function (template, variables) {
        var result = template;
        for (var _i = 0, _a = Object.entries(variables); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            result = result.replace(new RegExp("\\$\\{".concat(key, "\\}"), 'g'), value);
        }
        return result;
    };
    GitHubActionsProvider.prototype.listWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workflowFiles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.findFiles('.github/workflows/*.{yml,yaml}', '**/node_modules/**')];
                    case 1:
                        workflowFiles = _a.sent();
                        return [2 /*return*/, Promise.all(workflowFiles.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var content, workflow;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, vscode.workspace.fs.readFile(file)];
                                        case 1:
                                            content = _b.sent();
                                            workflow = yaml.parse(content.toString());
                                            return [2 /*return*/, {
                                                    name: workflow.name || ((_a = file.fsPath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.yml', '')),
                                                    path: file.fsPath,
                                                    status: workflow.on ? 'active' : 'disabled',
                                                    lastRun: undefined // Would need GitHub API call to get this
                                                }];
                                    }
                                });
                            }); }))];
                }
            });
        });
    };
    GitHubActionsProvider.prototype.deleteWorkflow = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var workflows, workflow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listWorkflows()];
                    case 1:
                        workflows = _a.sent();
                        workflow = workflows.find(function (w) { return w.name === name; });
                        if (!workflow) return [3 /*break*/, 3];
                        return [4 /*yield*/, vscode.workspace.fs.delete(vscode.Uri.file(workflow.path))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return GitHubActionsProvider;
}());
exports.GitHubActionsProvider = GitHubActionsProvider;
