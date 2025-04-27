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
exports.RepositoryManager = void 0;
var vscode = require("vscode");
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var RepositoryManager = /** @class */ (function () {
    function RepositoryManager() {
        this._onDidChangeAccess = new vscode.EventEmitter();
        this._isEnabled = vscode.workspace.getConfiguration('copilot-ppa').get('repository.enabled', false);
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.updateStatusBar();
    }
    RepositoryManager.getInstance = function () {
        if (!RepositoryManager.instance) {
            RepositoryManager.instance = new RepositoryManager();
        }
        return RepositoryManager.instance;
    };
    Object.defineProperty(RepositoryManager.prototype, "onDidChangeAccess", {
        get: function () {
            return this._onDidChangeAccess.event;
        },
        enumerable: false,
        configurable: true
    });
    RepositoryManager.prototype.toggleAccess = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._isEnabled = !this._isEnabled;
                        return [4 /*yield*/, vscode.workspace.getConfiguration('copilot-ppa').update('repository.enabled', this._isEnabled, vscode.ConfigurationTarget.Global)];
                    case 1:
                        _a.sent();
                        this.updateStatusBar();
                        this._onDidChangeAccess.fire(this._isEnabled);
                        return [4 /*yield*/, vscode.window.showInformationMessage("Repository access ".concat(this._isEnabled ? 'enabled' : 'disabled'))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RepositoryManager.prototype.isEnabled = function () {
        return this._isEnabled;
    };
    RepositoryManager.prototype.updateStatusBar = function () {
        this._statusBarItem.text = "$(git-branch) Repository: ".concat(this._isEnabled ? 'Enabled' : 'Disabled');
        this._statusBarItem.tooltip = 'Click to toggle repository access';
        this._statusBarItem.command = 'copilot-ppa.toggleRepositoryAccess';
        this._statusBarItem.show();
    };
    RepositoryManager.prototype.dispose = function () {
        this._statusBarItem.dispose();
        this._onDidChangeAccess.dispose();
    };
    RepositoryManager.prototype.createNewRepository = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, options, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._isEnabled) {
                            throw new Error('Repository access is disabled');
                        }
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            throw new Error('No workspace folder open');
                        }
                        return [4 /*yield*/, this.getRepositoryOptions()];
                    case 1:
                        options = _a.sent();
                        if (!options) {
                            return [2 /*return*/]; // User cancelled
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.initializeGitRepository(workspaceFolders[0].uri.fsPath, options)];
                    case 3:
                        _a.sent();
                        vscode.window.showInformationMessage('Repository created successfully!');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to create repository: ".concat(error_1));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RepositoryManager.prototype.getRepositoryOptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var name, description;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: 'Enter repository name',
                            placeHolder: 'my-project'
                        })];
                    case 1:
                        name = _a.sent();
                        if (!name) {
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Enter repository description (optional)',
                                placeHolder: 'A brief description of the project'
                            })];
                    case 2:
                        description = _a.sent();
                        return [2 /*return*/, { name: name, description: description || '' }];
                }
            });
        });
    };
    RepositoryManager.prototype.initializeGitRepository = function (path, options) {
        return __awaiter(this, void 0, void 0, function () {
            var readmePath, readmeContent, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, execAsync('git init', { cwd: path })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, execAsync('git add .', { cwd: path })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, execAsync('git commit -m "Initial commit"', { cwd: path })];
                    case 3:
                        _b.sent();
                        readmePath = vscode.Uri.file(path + '/README.md');
                        readmeContent = "# ".concat(options.name, "\n\n").concat(options.description);
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 8]);
                        return [4 /*yield*/, vscode.workspace.fs.stat(readmePath)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        _a = _b.sent();
                        return [4 /*yield*/, vscode.workspace.fs.writeFile(readmePath, Buffer.from(readmeContent))];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return RepositoryManager;
}());
exports.RepositoryManager = RepositoryManager;
