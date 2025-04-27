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
exports.ReadmeWikiGenerator = exports.DocumentationType = void 0;
var vscode = require("vscode");
var ProjectInfoService_1 = require("./services/ProjectInfoService");
var ReadmeService_1 = require("./services/ReadmeService");
var ContributingService_1 = require("./services/ContributingService");
var WikiService_1 = require("./services/WikiService");
var DocumentationDiffService_1 = require("./services/DocumentationDiffService");
/**
 * Types of documentation that can be generated
 */
var DocumentationType;
(function (DocumentationType) {
    DocumentationType["README"] = "README";
    DocumentationType["CONTRIBUTING"] = "CONTRIBUTING";
    DocumentationType["WIKI_HOME"] = "Wiki Home";
    DocumentationType["WIKI_GETTING_STARTED"] = "Wiki Getting Started";
    DocumentationType["WIKI_API"] = "Wiki API";
    DocumentationType["WIKI_EXAMPLES"] = "Wiki Examples";
    DocumentationType["WIKI_FAQ"] = "Wiki FAQ";
    DocumentationType["WIKI_TROUBLESHOOTING"] = "Wiki Troubleshooting";
    DocumentationType["CUSTOM"] = "Custom";
})(DocumentationType || (exports.DocumentationType = DocumentationType = {}));
/**
 * README/Wiki Generator class for creating project documentation
 */
var ReadmeWikiGenerator = /** @class */ (function () {
    /**
     * Constructor for the README/Wiki generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    function ReadmeWikiGenerator(context, llmProvider) {
        this.context = context;
        this.llmProvider = llmProvider;
        this.projectInfoSvc = new ProjectInfoService_1.ProjectInfoService();
        this.readmeSvc = new ReadmeService_1.ReadmeService(context, llmProvider, this.projectInfoSvc);
        this.contributingSvc = new ContributingService_1.ContributingService(context, llmProvider, this.projectInfoSvc);
        this.wikiSvc = new WikiService_1.WikiService(context, llmProvider, this.projectInfoSvc);
        this.diffSvc = new DocumentationDiffService_1.DocumentationDiffService(context);
        this.registerCommands();
    }
    /**
     * Register commands for README/Wiki generation
     */
    ReadmeWikiGenerator.prototype.registerCommands = function () {
        var _this = this;
        // Command to generate README
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.readme', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.generateReadme()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); }));
        // Command to generate CONTRIBUTING guide
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.contributing', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.generateContributing()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); }));
        // Command to generate Wiki page
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.wiki', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.generateWikiPage()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); }));
        // Command to generate multiple documentation files
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.projectDocs', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.generateProjectDocumentation()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); }));
    };
    /**
     * Generate a README.md file for the current project
     */
    ReadmeWikiGenerator.prototype.generateReadme = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readmeSvc.generate()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate a CONTRIBUTING.md file for the current project
     */
    ReadmeWikiGenerator.prototype.generateContributing = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contributingSvc.generate()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate a Wiki page file
     */
    ReadmeWikiGenerator.prototype.generateWikiPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.wikiSvc.generatePage()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate multiple documentation files for the project
     */
    ReadmeWikiGenerator.prototype.generateProjectDocumentation = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.wikiSvc.generateAll()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ReadmeWikiGenerator;
}());
exports.ReadmeWikiGenerator = ReadmeWikiGenerator;
