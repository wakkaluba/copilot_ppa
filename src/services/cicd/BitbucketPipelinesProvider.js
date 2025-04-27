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
exports.BitbucketPipelinesProvider = void 0;
var vscode = require("vscode");
var ICICDProvider_1 = require("./ICICDProvider");
var logger_1 = require("../../services/logger");
var retry_1 = require("../utils/retry");
var BitbucketPipelinesProvider = /** @class */ (function () {
    function BitbucketPipelinesProvider() {
        var _this = this;
        this.connectionState = 'disconnected';
        this.logger = new logger_1.Logger('BitbucketPipelinesProvider');
        this.disposables = [];
        this.name = 'Bitbucket Pipelines';
        this.initialize().catch(function (err) {
            return _this.logger.error('Failed to initialize Bitbucket provider:', err);
        });
        // Watch for configuration changes
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(function (e) {
            if (e.affectsConfiguration('copilot-ppa.bitbucket')) {
                _this.initialize().catch(function (err) {
                    return _this.logger.error('Failed to reinitialize after config change:', err);
                });
            }
        }));
    }
    BitbucketPipelinesProvider.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables = [];
        this.connectionState = 'disconnected';
        this.bitbucket = undefined;
    };
    BitbucketPipelinesProvider.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credentials, BitbucketClient, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.connectionState = 'connecting';
                        return [4 /*yield*/, this.getCredentials()];
                    case 1:
                        credentials = _a.sent();
                        if (!credentials) {
                            this.connectionState = 'disconnected';
                            throw new ICICDProvider_1.CICDError('missing_credentials', 'Bitbucket credentials not configured');
                        }
                        BitbucketClient = require('bitbucket');
                        this.bitbucket = new BitbucketClient({
                            auth: {
                                username: credentials.username,
                                password: credentials.appPassword
                            }
                        });
                        this.workspace = credentials.workspace;
                        // Verify connection
                        return [4 /*yield*/, this.testConnection()];
                    case 2:
                        // Verify connection
                        _a.sent();
                        this.connectionState = 'connected';
                        this.logger.info('Successfully connected to Bitbucket');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.connectionState = 'error';
                        this.logger.error('Failed to initialize Bitbucket connection:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BitbucketPipelinesProvider.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.bitbucket || !this.workspace) {
                            throw new ICICDProvider_1.CICDError('not_initialized', 'Provider not initialized');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.bitbucket.workspaces.getWorkspace({ workspace: this.workspace })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        throw new ICICDProvider_1.CICDError('connection_failed', 'Failed to connect to Bitbucket');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BitbucketPipelinesProvider.prototype.getCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, username, appPassword, workspace;
            return __generator(this, function (_a) {
                config = vscode.workspace.getConfiguration('copilot-ppa');
                username = config.get('bitbucket.username');
                appPassword = config.get('bitbucket.appPassword');
                workspace = config.get('bitbucket.workspace');
                if (!username || !appPassword || !workspace) {
                    return [2 /*return*/, undefined];
                }
                return [2 /*return*/, { username: username, appPassword: appPassword, workspace: workspace }];
            });
        });
    };
    BitbucketPipelinesProvider.prototype.isConfigured = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.connectionState === 'connected'];
            });
        });
    };
    BitbucketPipelinesProvider.prototype.createWorkflow = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var workflowPath, template, content, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured()) {
                            throw new ICICDProvider_1.CICDError('not_configured', 'Bitbucket provider not configured');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        workflowPath = options.path || 'bitbucket-pipelines.yml';
                        return [4 /*yield*/, (0, retry_1.retry)(function () { return _this.loadWorkflowTemplate(options.template); }, { retries: 3, backoff: true })];
                    case 2:
                        template = _a.sent();
                        content = this.replaceVariables(template, options.variables || {});
                        return [4 /*yield*/, vscode.workspace.fs.writeFile(vscode.Uri.file(workflowPath), Buffer.from(content))];
                    case 3:
                        _a.sent();
                        this.logger.info("Created workflow at ".concat(workflowPath));
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        this.logger.error('Failed to create workflow:', error_3);
                        throw new ICICDProvider_1.CICDError('workflow_creation_failed', 'Failed to create workflow');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BitbucketPipelinesProvider.prototype.loadWorkflowTemplate = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var templatePath, content, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        templatePath = vscode.Uri.file("templates/bitbucket/".concat(templateName, ".yml"));
                        return [4 /*yield*/, vscode.workspace.fs.readFile(templatePath)];
                    case 1:
                        content = _a.sent();
                        return [2 /*return*/, content.toString()];
                    case 2:
                        error_4 = _a.sent();
                        throw new ICICDProvider_1.CICDError('template_not_found', "Template ".concat(templateName, " not found"));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BitbucketPipelinesProvider.prototype.replaceVariables = function (template, variables) {
        var result = template;
        for (var _i = 0, _a = Object.entries(variables); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            result = result.replace(new RegExp("\\$\\{".concat(key, "\\}"), 'g'), value);
        }
        return result;
    };
    BitbucketPipelinesProvider.prototype.listWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineFiles, workflows, _i, pipelineFiles_1, file, content, contentStr, hasPipelines, lastRun, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured()) {
                            throw new ICICDProvider_1.CICDError('not_configured', 'Bitbucket provider not configured');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, vscode.workspace.findFiles('bitbucket-pipelines.yml', '**/node_modules/**')];
                    case 2:
                        pipelineFiles = _a.sent();
                        if (pipelineFiles.length === 0) {
                            return [2 /*return*/, []];
                        }
                        workflows = [];
                        _i = 0, pipelineFiles_1 = pipelineFiles;
                        _a.label = 3;
                    case 3:
                        if (!(_i < pipelineFiles_1.length)) return [3 /*break*/, 7];
                        file = pipelineFiles_1[_i];
                        return [4 /*yield*/, vscode.workspace.fs.readFile(file)];
                    case 4:
                        content = _a.sent();
                        contentStr = content.toString();
                        hasPipelines = contentStr.includes('pipelines:');
                        return [4 /*yield*/, this.getLastRunStatus(file.fsPath)];
                    case 5:
                        lastRun = _a.sent();
                        workflows.push({
                            name: 'bitbucket-pipelines.yml',
                            path: file.fsPath,
                            status: hasPipelines ? 'active' : 'disabled',
                            lastRun: lastRun ? new Date(lastRun) : undefined
                        });
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, workflows];
                    case 8:
                        error_5 = _a.sent();
                        this.logger.error('Failed to list workflows:', error_5);
                        throw new ICICDProvider_1.CICDError('workflow_list_failed', 'Failed to list workflows');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    BitbucketPipelinesProvider.prototype.getLastRunStatus = function (pipelinePath) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, response, pipeline, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.bitbucket || !this.workspace) {
                            return [2 /*return*/, undefined];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        repository = pipelinePath.split('/').slice(-2)[0];
                        return [4 /*yield*/, this.bitbucket.pipelines.list({
                                workspace: this.workspace,
                                repo_slug: repository,
                                sort: '-created_on',
                                page: 1,
                                pagelen: 1
                            })];
                    case 2:
                        response = _c.sent();
                        pipeline = (_b = response.data.values) === null || _b === void 0 ? void 0 : _b[0];
                        return [2 /*return*/, pipeline === null || pipeline === void 0 ? void 0 : pipeline.created_on];
                    case 3:
                        _a = _c.sent();
                        return [2 /*return*/, undefined];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BitbucketPipelinesProvider.prototype.deleteWorkflow = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var workflows, workflow, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured()) {
                            throw new ICICDProvider_1.CICDError('not_configured', 'Bitbucket provider not configured');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.listWorkflows()];
                    case 2:
                        workflows = _a.sent();
                        workflow = workflows.find(function (w) { return w.name === name; });
                        if (!workflow) {
                            throw new ICICDProvider_1.CICDError('workflow_not_found', "Workflow ".concat(name, " not found"));
                        }
                        return [4 /*yield*/, vscode.workspace.fs.delete(vscode.Uri.file(workflow.path))];
                    case 3:
                        _a.sent();
                        this.logger.info("Deleted workflow ".concat(name));
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        this.logger.error('Failed to delete workflow:', error_6);
                        throw new ICICDProvider_1.CICDError('workflow_deletion_failed', 'Failed to delete workflow');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return BitbucketPipelinesProvider;
}());
exports.BitbucketPipelinesProvider = BitbucketPipelinesProvider;
