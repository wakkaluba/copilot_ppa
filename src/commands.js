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
exports.CommandManager = void 0;
var vscode = require("vscode");
var modelService_1 = require("./llm/modelService");
var AgentCommandService_1 = require("./services/commands/AgentCommandService");
var ConfigurationCommandService_1 = require("./services/commands/ConfigurationCommandService");
var VisualizationCommandService_1 = require("./services/commands/VisualizationCommandService");
var MenuCommandService_1 = require("./services/commands/MenuCommandService");
var ErrorHandler_1 = require("./services/error/ErrorHandler");
var CommandManager = /** @class */ (function () {
    function CommandManager(context, configManager) {
        this.context = context;
        this.configManager = configManager;
        this._modelService = new modelService_1.ModelService(context);
        this._registeredCommands = new Map();
        // Initialize services
        this.errorHandler = new ErrorHandler_1.ErrorHandler();
        this.agentService = new AgentCommandService_1.AgentCommandService(this._modelService, this.errorHandler);
        this.configService = new ConfigurationCommandService_1.ConfigurationCommandService(this._modelService, this.configManager, this.errorHandler);
        this.visualizationService = new VisualizationCommandService_1.VisualizationCommandService(context, this.errorHandler);
        this.menuService = new MenuCommandService_1.MenuCommandService(this.agentService, this.configService, this.visualizationService, this.errorHandler);
        // Add services to disposables
        context.subscriptions.push(this.errorHandler);
    }
    CommandManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.registerCommands()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.registerCommand = function (command, handler) {
        this._registeredCommands.set(command, handler);
        var disposable = vscode.commands.registerCommand(command, handler.execute);
        this.context.subscriptions.push(disposable);
    };
    CommandManager.prototype.registerCommands = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Agent commands
                this.registerCommand('copilot-ppa.startAgent', { execute: this.agentService.startAgent.bind(this.agentService) });
                this.registerCommand('copilot-ppa.stopAgent', { execute: this.agentService.stopAgent.bind(this.agentService) });
                this.registerCommand('copilot-ppa.restartAgent', { execute: this.agentService.restartAgent.bind(this.agentService) });
                // Configuration commands
                this.registerCommand('copilot-ppa.configureModel', { execute: this.configService.configureModel.bind(this.configService) });
                this.registerCommand('copilot-ppa.clearConversation', { execute: this.configService.clearConversation.bind(this.configService) });
                // Menu commands
                this.registerCommand('copilot-ppa.openMenu', { execute: this.menuService.openMenu.bind(this.menuService) });
                this.registerCommand('copilot-ppa.showMetrics', { execute: this.visualizationService.showMetrics.bind(this.visualizationService) });
                // Visualization commands
                this.registerCommand('copilot-ppa.showMemoryVisualization', { execute: this.visualizationService.showMemoryVisualization.bind(this.visualizationService) });
                this.registerCommand('copilot-ppa.showPerformanceMetrics', { execute: this.visualizationService.showPerformanceMetrics.bind(this.visualizationService) });
                this.registerCommand('copilot-ppa.exportMetrics', { execute: this.visualizationService.exportMetrics.bind(this.visualizationService) });
                return [2 /*return*/];
            });
        });
    };
    // ICommandService implementation - delegate to specialized services
    CommandManager.prototype.startAgent = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.agentService.startAgent()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.stopAgent = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.agentService.stopAgent()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.restartAgent = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.agentService.restartAgent()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.configureModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.configService.configureModel()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.clearConversation = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.configService.clearConversation()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.openMenu = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.menuService.openMenu()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.showMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.visualizationService.showMetrics()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.showMemoryVisualization = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.visualizationService.showMemoryVisualization()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.showPerformanceMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.visualizationService.showPerformanceMetrics()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.exportMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.visualizationService.exportMetrics()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.dispose = function () {
        this._modelService.dispose();
        this._registeredCommands.clear();
    };
    return CommandManager;
}());
exports.CommandManager = CommandManager;
