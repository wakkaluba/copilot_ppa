"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManager = void 0;
var fs = require("fs");
var path = require("path");
var events_1 = require("events");
var PromptManager = /** @class */ (function (_super) {
    __extends(PromptManager, _super);
    function PromptManager(context) {
        var _this = _super.call(this) || this;
        _this.templates = new Map();
        _this.builtInTemplatesLoaded = false;
        _this.context = context;
        return _this;
    }
    PromptManager.getInstance = function (context) {
        if (!PromptManager.instance) {
            if (!context) {
                throw new Error('Context is required when creating PromptManager for the first time');
            }
            PromptManager.instance = new PromptManager(context);
        }
        return PromptManager.instance;
    };
    PromptManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadTemplates()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManager.prototype.loadTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userTemplates, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        userTemplates = this.context.globalState.get('promptTemplates', []);
                        userTemplates.forEach(function (template) {
                            _this.templates.set(template.id, template);
                        });
                        if (!!this.builtInTemplatesLoaded) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadBuiltInTemplates()];
                    case 1:
                        _a.sent();
                        this.builtInTemplatesLoaded = true;
                        _a.label = 2;
                    case 2:
                        this.emit('templatesLoaded', this.getAllTemplates());
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error loading prompt templates:', error_1);
                        throw new Error("Failed to load templates: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PromptManager.prototype.loadBuiltInTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var builtInTemplatesPath, templateData, builtInTemplates, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        builtInTemplatesPath = path.join(this.context.extensionPath, 'resources', 'templates', 'prompts.json');
                        if (!fs.existsSync(builtInTemplatesPath)) return [3 /*break*/, 2];
                        return [4 /*yield*/, fs.promises.readFile(builtInTemplatesPath, 'utf-8')];
                    case 1:
                        templateData = _a.sent();
                        builtInTemplates = JSON.parse(templateData);
                        builtInTemplates.forEach(function (template) {
                            // Mark as built-in
                            template.isUserDefined = false;
                            // Don't overwrite user templates with same ID
                            if (!_this.templates.has(template.id)) {
                                _this.templates.set(template.id, template);
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        // Default built-in templates if file doesn't exist
                        this.addDefaultTemplates();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Error loading built-in templates:', error_2);
                        this.addDefaultTemplates();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PromptManager.prototype.addDefaultTemplates = function () {
        var _this = this;
        var defaultTemplates = [
            {
                id: 'explain-code',
                name: 'Explain Code',
                description: 'Explain what the selected code does',
                template: 'Explain the following code:\n\n{{selectedCode}}',
                category: 'Code Understanding',
                tags: ['explanation', 'code', 'documentation'],
                usage: 0,
                isUserDefined: false
            },
            {
                id: 'optimize-code',
                name: 'Optimize Code',
                description: 'Suggest optimizations for the selected code',
                template: 'Optimize the following code for performance and readability:\n\n{{selectedCode}}',
                category: 'Code Improvement',
                tags: ['optimization', 'performance', 'refactoring'],
                usage: 0,
                isUserDefined: false
            },
            {
                id: 'generate-test',
                name: 'Generate Tests',
                description: 'Generate unit tests for the selected code',
                template: 'Generate unit tests for the following code:\n\n{{selectedCode}}',
                category: 'Testing',
                tags: ['testing', 'unit test', 'quality'],
                usage: 0,
                isUserDefined: false
            }
        ];
        defaultTemplates.forEach(function (template) {
            if (!_this.templates.has(template.id)) {
                _this.templates.set(template.id, template);
            }
        });
    };
    PromptManager.prototype.saveTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userTemplates, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userTemplates = Array.from(this.templates.values())
                            .filter(function (template) { return template.isUserDefined; });
                        return [4 /*yield*/, this.context.globalState.update('promptTemplates', userTemplates)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error saving prompt templates:', error_3);
                        throw new Error("Failed to save templates: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PromptManager.prototype.getTemplate = function (id) {
        return this.templates.get(id);
    };
    PromptManager.prototype.getAllTemplates = function () {
        return Array.from(this.templates.values());
    };
    PromptManager.prototype.getTemplatesByCategory = function (category) {
        return this.getAllTemplates().filter(function (template) { return template.category === category; });
    };
    PromptManager.prototype.getTemplatesByTags = function (tags) {
        return this.getAllTemplates().filter(function (template) {
            return tags.some(function (tag) { return template.tags.includes(tag); });
        });
    };
    PromptManager.prototype.createTemplate = function (template) {
        return __awaiter(this, void 0, void 0, function () {
            var id, newTemplate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = "template-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
                        newTemplate = __assign(__assign({}, template), { id: id, usage: 0, isUserDefined: true });
                        this.templates.set(id, newTemplate);
                        return [4 /*yield*/, this.saveTemplates()];
                    case 1:
                        _a.sent();
                        this.emit('templateCreated', newTemplate);
                        return [2 /*return*/, newTemplate];
                }
            });
        });
    };
    PromptManager.prototype.updateTemplate = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var template, _, isUserDefined, validUpdates, updatedTemplate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.templates.get(id);
                        if (!template) {
                            throw new Error("Template with ID ".concat(id, " not found"));
                        }
                        _ = updates.id, isUserDefined = updates.isUserDefined, validUpdates = __rest(updates, ["id", "isUserDefined"]);
                        updatedTemplate = __assign(__assign({}, template), validUpdates);
                        this.templates.set(id, updatedTemplate);
                        if (!template.isUserDefined) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.saveTemplates()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.emit('templateUpdated', updatedTemplate);
                        return [2 /*return*/, updatedTemplate];
                }
            });
        });
    };
    PromptManager.prototype.deleteTemplate = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.templates.get(id);
                        if (!template) {
                            return [2 /*return*/, false];
                        }
                        // Don't allow deleting built-in templates
                        if (!template.isUserDefined) {
                            throw new Error('Cannot delete built-in templates');
                        }
                        this.templates.delete(id);
                        return [4 /*yield*/, this.saveTemplates()];
                    case 1:
                        _a.sent();
                        this.emit('templateDeleted', id);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PromptManager.prototype.useTemplate = function (id_1) {
        return __awaiter(this, arguments, void 0, function (id, variables) {
            var template, processed;
            if (variables === void 0) { variables = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.templates.get(id);
                        if (!template) {
                            throw new Error("Template with ID ".concat(id, " not found"));
                        }
                        // Update usage stats
                        template.usage += 1;
                        template.lastUsed = Date.now();
                        if (!template.isUserDefined) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.saveTemplates()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        processed = template.template;
                        Object.entries(variables).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            var regex = new RegExp("{{".concat(key, "}}"), 'g');
                            processed = processed.replace(regex, value);
                        });
                        // Remove any remaining variables
                        processed = processed.replace(/{{\w+}}/g, '');
                        this.emit('templateUsed', id);
                        return [2 /*return*/, processed];
                }
            });
        });
    };
    PromptManager.prototype.resetUsageStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, template;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        for (_i = 0, _a = this.templates.values(); _i < _a.length; _i++) {
                            template = _a[_i];
                            template.usage = 0;
                            template.lastUsed = undefined;
                        }
                        return [4 /*yield*/, this.saveTemplates()];
                    case 1:
                        _b.sent();
                        this.emit('statsReset');
                        return [2 /*return*/];
                }
            });
        });
    };
    PromptManager.prototype.importTemplates = function (jsonData) {
        return __awaiter(this, void 0, void 0, function () {
            var templates, importedTemplates, _i, templates_1, template, newId, importedTemplate, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        templates = JSON.parse(jsonData);
                        importedTemplates = [];
                        for (_i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
                            template = templates_1[_i];
                            newId = "imported-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
                            importedTemplate = __assign(__assign({}, template), { id: newId, isUserDefined: true, usage: 0, lastUsed: undefined });
                            this.templates.set(newId, importedTemplate);
                            importedTemplates.push(importedTemplate);
                        }
                        return [4 /*yield*/, this.saveTemplates()];
                    case 1:
                        _a.sent();
                        this.emit('templatesImported', importedTemplates);
                        return [2 /*return*/, importedTemplates];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Failed to import templates: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PromptManager.prototype.exportTemplates = function () {
        return __awaiter(this, arguments, void 0, function (userOnly) {
            var templates;
            if (userOnly === void 0) { userOnly = false; }
            return __generator(this, function (_a) {
                templates = this.getAllTemplates();
                if (userOnly) {
                    templates = templates.filter(function (template) { return template.isUserDefined; });
                }
                return [2 /*return*/, JSON.stringify(templates, null, 2)];
            });
        });
    };
    PromptManager.prototype.dispose = function () {
        this.removeAllListeners();
    };
    return PromptManager;
}(events_1.EventEmitter));
exports.PromptManager = PromptManager;
