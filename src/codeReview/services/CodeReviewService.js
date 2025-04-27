"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.CodeReviewService = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var ILogger_1 = require("../../logging/ILogger");
var pullRequestIntegration_1 = require("../pullRequestIntegration");
var reviewChecklist_1 = require("../reviewChecklist");
var CodeReviewService = /** @class */ (function () {
    function CodeReviewService(logger, context) {
        this.logger = logger;
        this.pullRequestIntegration = new pullRequestIntegration_1.PullRequestIntegration();
        this.reviewChecklist = new reviewChecklist_1.ReviewChecklist(context);
    }
    CodeReviewService.prototype.getWebviewHtml = function (webview, extensionUri) {
        var scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'codeReview', 'codeReview.js'));
        var styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'codeReview', 'codeReview.css'));
        return this.generateHtml(webview, scriptUri, styleUri);
    };
    CodeReviewService.prototype.handleWebviewMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 19, , 20]);
                        _a = message.command;
                        switch (_a) {
                            case 'refreshPullRequests': return [3 /*break*/, 1];
                            case 'createPullRequest': return [3 /*break*/, 3];
                            case 'getChecklists': return [3 /*break*/, 5];
                            case 'startReview': return [3 /*break*/, 6];
                            case 'createChecklist': return [3 /*break*/, 8];
                            case 'submitReview': return [3 /*break*/, 10];
                            case 'getReportHistory': return [3 /*break*/, 12];
                            case 'viewReport': return [3 /*break*/, 13];
                            case 'exportReport': return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 17];
                    case 1: return [4 /*yield*/, this.handleRefreshPullRequests()];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.handleCreatePullRequest()];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [2 /*return*/, this.handleGetChecklists()];
                    case 6: return [4 /*yield*/, this.handleStartReview(message.checklistName)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.handleCreateChecklist()];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: return [4 /*yield*/, this.handleSubmitReview(message.reportId, message.results, message.summary, message.approved)];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [2 /*return*/, this.handleGetReportHistory()];
                    case 13: return [4 /*yield*/, this.handleViewReport(message.reportId)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: return [4 /*yield*/, this.handleExportReport(message.reportId)];
                    case 16: return [2 /*return*/, _b.sent()];
                    case 17:
                        this.logger.warn("Unknown command received: ".concat(message.command));
                        return [2 /*return*/, null];
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_1 = _b.sent();
                        this.logger.error('Error handling webview message:', error_1);
                        throw error_1;
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    CodeReviewService.prototype.handleRefreshPullRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pullRequests, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pullRequestIntegration.getOpenPullRequests()];
                    case 1:
                        pullRequests = _a.sent();
                        return [2 /*return*/, {
                                command: 'pullRequestsRefreshed',
                                pullRequests: pullRequests
                            }];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Failed to refresh pull requests:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ... rest of handler methods ...
    CodeReviewService.prototype.generateHtml = function (webview, scriptUri, styleUri) {
        var nonce = this.generateNonce();
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src ".concat(webview.cspSource, "; script-src 'nonce-").concat(nonce, "';\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <link href=\"").concat(styleUri, "\" rel=\"stylesheet\">\n                <title>Code Review</title>\n            </head>\n            <body>\n                <div class=\"container\">\n                    <h1>Code Review Tools</h1>\n                    \n                    <div class=\"section\">\n                        <h2>Pull Requests</h2>\n                        <button id=\"refreshPRs\">Refresh</button>\n                        <div id=\"prList\" class=\"list-container\">\n                            <p>No pull requests found.</p>\n                        </div>\n                        <button id=\"createPR\">Create Pull Request</button>\n                    </div>\n                    \n                    <div class=\"section\">\n                        <h2>Review Checklists</h2>\n                        <select id=\"checklistSelect\">\n                            <option value=\"\">Select a checklist...</option>\n                        </select>\n                        <button id=\"startReview\">Start Review</button>\n                        <button id=\"createChecklist\">Create Checklist</button>\n                    </div>\n                    \n                    <div class=\"section\">\n                        <h2>Recent Reviews</h2>\n                        <div id=\"reportList\" class=\"list-container\">\n                            <p>No recent reviews found.</p>\n                        </div>\n                    </div>\n                    \n                    <div id=\"reviewForm\" class=\"hidden\">\n                        <h2>Code Review Form</h2>\n                        <div id=\"reviewItems\"></div>\n                        <div class=\"form-group\">\n                            <label for=\"summary\">Summary</label>\n                            <textarea id=\"summary\" rows=\"4\"></textarea>\n                        </div>\n                        <div class=\"form-controls\">\n                            <button id=\"submitReview\">Submit Review</button>\n                            <button id=\"cancelReview\">Cancel</button>\n                        </div>\n                    </div>\n                </div>\n                \n                <script nonce=\"").concat(nonce, "\" src=\"").concat(scriptUri, "\"></script>\n            </body>\n        </html>");
    };
    CodeReviewService.prototype.generateNonce = function () {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
    };
    var _a;
    CodeReviewService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, inject(ILogger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, Object])
    ], CodeReviewService);
    return CodeReviewService;
}());
exports.CodeReviewService = CodeReviewService;
