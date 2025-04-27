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
exports.PullRequestIntegration = void 0;
var githubProvider_1 = require("../repository/githubProvider");
var gitlabProvider_1 = require("../repository/gitlabProvider");
var bitbucketProvider_1 = require("../repository/bitbucketProvider");
/**
 * Provides integration with Pull Request systems from various Git providers
 */
var PullRequestIntegration = /** @class */ (function () {
    function PullRequestIntegration() {
        this.activeProvider = null;
        this.gitHubProvider = new githubProvider_1.GitHubProvider();
        this.gitLabProvider = new gitlabProvider_1.GitLabProvider();
        this.bitbucketProvider = new bitbucketProvider_1.BitbucketProvider();
    }
    /**
     * Detects the Git provider being used in the current workspace
     */
    PullRequestIntegration.prototype.detectProvider = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gitHubProvider.isConnected()];
                    case 1:
                        // Check for GitHub first
                        if (_a.sent()) {
                            this.activeProvider = 'github';
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.gitLabProvider.isConnected()];
                    case 2:
                        // Check for GitLab next
                        if (_a.sent()) {
                            this.activeProvider = 'gitlab';
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.bitbucketProvider.isConnected()];
                    case 3:
                        // Check for Bitbucket last
                        if (_a.sent()) {
                            this.activeProvider = 'bitbucket';
                            return [2 /*return*/, true];
                        }
                        this.activeProvider = null;
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Gets the list of open pull requests for the current repository
     */
    PullRequestIntegration.prototype.getOpenPullRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.activeProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.detectProvider()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _a = this.activeProvider;
                        switch (_a) {
                            case 'github': return [3 /*break*/, 3];
                            case 'gitlab': return [3 /*break*/, 5];
                            case 'bitbucket': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.gitHubProvider.getOpenPullRequests()];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.gitLabProvider.getOpenPullRequests()];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.bitbucketProvider.getOpenPullRequests()];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: throw new Error('No active Git provider detected');
                }
            });
        });
    };
    /**
     * Creates a new pull request with the specified details
     */
    PullRequestIntegration.prototype.createPullRequest = function (title, description, sourceBranch, targetBranch) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.activeProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.detectProvider()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _a = this.activeProvider;
                        switch (_a) {
                            case 'github': return [3 /*break*/, 3];
                            case 'gitlab': return [3 /*break*/, 5];
                            case 'bitbucket': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.gitHubProvider.createPullRequest(title, description, sourceBranch, targetBranch)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.gitLabProvider.createPullRequest(title, description, sourceBranch, targetBranch)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.bitbucketProvider.createPullRequest(title, description, sourceBranch, targetBranch)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: throw new Error('No active Git provider detected');
                }
            });
        });
    };
    /**
     * Adds a code review comment to a specific pull request
     */
    PullRequestIntegration.prototype.addReviewComment = function (pullRequestId, filePath, lineNumber, comment) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.activeProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.detectProvider()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _a = this.activeProvider;
                        switch (_a) {
                            case 'github': return [3 /*break*/, 3];
                            case 'gitlab': return [3 /*break*/, 5];
                            case 'bitbucket': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.gitHubProvider.addReviewComment(pullRequestId, filePath, lineNumber, comment)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, this.gitLabProvider.addReviewComment(pullRequestId, filePath, lineNumber, comment)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.bitbucketProvider.addReviewComment(pullRequestId, filePath, lineNumber, comment)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9: throw new Error('No active Git provider detected');
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Submits a complete review for a pull request
     */
    PullRequestIntegration.prototype.submitReview = function (pullRequestId, reviewState, summary) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.activeProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.detectProvider()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _a = this.activeProvider;
                        switch (_a) {
                            case 'github': return [3 /*break*/, 3];
                            case 'gitlab': return [3 /*break*/, 5];
                            case 'bitbucket': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.gitHubProvider.submitReview(pullRequestId, reviewState, summary)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, this.gitLabProvider.submitReview(pullRequestId, reviewState, summary)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.bitbucketProvider.submitReview(pullRequestId, reviewState, summary)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9: throw new Error('No active Git provider detected');
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if a pull request meets the specified quality criteria
     */
    PullRequestIntegration.prototype.checkPullRequestQuality = function (pullRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var changedFiles, issues, _i, changedFiles_1, file, fileIssues, passed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getChangedFiles(pullRequestId)];
                    case 1:
                        changedFiles = _a.sent();
                        issues = [];
                        _i = 0, changedFiles_1 = changedFiles;
                        _a.label = 2;
                    case 2:
                        if (!(_i < changedFiles_1.length)) return [3 /*break*/, 5];
                        file = changedFiles_1[_i];
                        return [4 /*yield*/, this.checkFileQuality(file)];
                    case 3:
                        fileIssues = _a.sent();
                        issues.push.apply(issues, fileIssues);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        passed = issues.length === 0;
                        return [2 /*return*/, { passed: passed, issues: issues }];
                }
            });
        });
    };
    PullRequestIntegration.prototype.getChangedFiles = function (pullRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.activeProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.detectProvider()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _a = this.activeProvider;
                        switch (_a) {
                            case 'github': return [3 /*break*/, 3];
                            case 'gitlab': return [3 /*break*/, 5];
                            case 'bitbucket': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.gitHubProvider.getChangedFiles(pullRequestId)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.gitLabProvider.getChangedFiles(pullRequestId)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.bitbucketProvider.getChangedFiles(pullRequestId)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: throw new Error('No active Git provider detected');
                }
            });
        });
    };
    PullRequestIntegration.prototype.checkFileQuality = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implement file quality checks
                // This would integrate with the code quality tools
                return [2 /*return*/, []];
            });
        });
    };
    return PullRequestIntegration;
}());
exports.PullRequestIntegration = PullRequestIntegration;
