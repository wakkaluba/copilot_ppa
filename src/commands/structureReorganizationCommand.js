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
exports.StructureReorganizationCommand = void 0;
var vscode = require("vscode");
var path = require("path");
var structureReorganizer_1 = require("../services/refactoring/structureReorganizer");
/**
 * Command handler for code structure reorganization
 */
var StructureReorganizationCommand = /** @class */ (function () {
    function StructureReorganizationCommand() {
        this.structureReorganizer = new structureReorganizer_1.StructureReorganizer();
    }
    /**
     * Register the command with VS Code
     */
    StructureReorganizationCommand.prototype.register = function () {
        return vscode.commands.registerCommand('vscodeLocalLLMAgent.reorganizeCodeStructure', this.executeCommand.bind(this));
    };
    /**
     * Execute the structure reorganization command
     */
    StructureReorganizationCommand.prototype.executeCommand = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, filePath, fileName, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        filePath = editor.document.uri.fsPath;
                        fileName = path.basename(filePath);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Show progress indication
                        return [4 /*yield*/, vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Analyzing code structure in ".concat(fileName, "..."),
                                cancellable: false
                            }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                                var analysisResult, proposal, originalUri, proposalUri, proposalProvider, registration, applyChanges;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            // Analyze the structure
                                            progress.report({ message: 'Analyzing code structure...' });
                                            return [4 /*yield*/, this.structureReorganizer.analyzeFileStructure(filePath)];
                                        case 1:
                                            analysisResult = _a.sent();
                                            // Generate reorganization proposal
                                            progress.report({ message: 'Generating reorganization proposal...' });
                                            return [4 /*yield*/, this.structureReorganizer.proposeReorganization(filePath)];
                                        case 2:
                                            proposal = _a.sent();
                                            // If there are no suggestions, inform the user and exit
                                            if (proposal.changes.length === 0) {
                                                vscode.window.showInformationMessage('No structure improvements suggested for this file.');
                                                return [2 /*return*/];
                                            }
                                            // Show the reorganization proposal to the user
                                            progress.report({ message: 'Preparing proposal preview...' });
                                            originalUri = editor.document.uri;
                                            proposalUri = originalUri.with({ scheme: 'proposed-reorganization' });
                                            proposalProvider = new /** @class */ (function () {
                                                function class_1() {
                                                    this.onDidChangeEmitter = new vscode.EventEmitter();
                                                    this.onDidChange = this.onDidChangeEmitter.event;
                                                }
                                                class_1.prototype.provideTextDocumentContent = function (uri) {
                                                    return proposal.reorganizedCode;
                                                };
                                                return class_1;
                                            }());
                                            registration = vscode.workspace.registerTextDocumentContentProvider('proposed-reorganization', proposalProvider);
                                            // Show the diff
                                            return [4 /*yield*/, vscode.commands.executeCommand('vscode.diff', originalUri, proposalUri, "Structure Reorganization: ".concat(fileName), { preview: true })];
                                        case 3:
                                            // Show the diff
                                            _a.sent();
                                            return [4 /*yield*/, vscode.window.showInformationMessage("".concat(proposal.changes.length, " structure improvements suggested. Apply changes?"), { modal: true }, 'Apply', 'Cancel')];
                                        case 4:
                                            applyChanges = _a.sent();
                                            if (!(applyChanges === 'Apply')) return [3 /*break*/, 6];
                                            return [4 /*yield*/, this.structureReorganizer.applyReorganization(filePath, proposal)];
                                        case 5:
                                            _a.sent();
                                            vscode.window.showInformationMessage('Code structure reorganized successfully.');
                                            _a.label = 6;
                                        case 6:
                                            // Dispose of the content provider registration
                                            registration.dispose();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        // Show progress indication
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Error analyzing code structure: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return StructureReorganizationCommand;
}());
exports.StructureReorganizationCommand = StructureReorganizationCommand;
