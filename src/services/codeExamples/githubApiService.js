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
exports.GitHubApiService = void 0;
var axios_1 = require("axios");
var GitHubApiService = /** @class */ (function () {
    function GitHubApiService(context) {
        this.context = context;
        this.baseUrl = 'https://api.github.com';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.codeExamplesCache = new Map();
    }
    /**
     * Search for code examples on GitHub based on query
     * @param query Search query
     * @param language Programming language to filter by
     * @param maxResults Maximum number of results to return
     * @returns Array of code examples
     */
    GitHubApiService.prototype.searchCodeExamples = function (query_1, language_1) {
        return __awaiter(this, arguments, void 0, function (query, language, maxResults) {
            var cacheKey, cachedResult, searchQuery, response, error_1;
            if (maxResults === void 0) { maxResults = 10; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cacheKey = "".concat(query, "-").concat(language || 'all', "-").concat(maxResults);
                        cachedResult = this.codeExamplesCache.get(cacheKey);
                        if (cachedResult && (Date.now() - cachedResult.timestamp) < this.cacheExpiry) {
                            return [2 /*return*/, cachedResult.examples];
                        }
                        searchQuery = encodeURIComponent(query);
                        if (language) {
                            searchQuery += "+language:".concat(language);
                        }
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/search/code?q=").concat(searchQuery, "&per_page=").concat(maxResults), {
                                headers: {
                                    'Accept': 'application/vnd.github.v3+json',
                                    'User-Agent': 'VSCode-Local-LLM-Agent'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        // Cache results
                        this.codeExamplesCache.set(cacheKey, {
                            examples: response.data.items,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, response.data.items];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error searching GitHub code examples:', error_1);
                        throw new Error("Failed to search GitHub code examples: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get file content from GitHub
     * @param url GitHub URL for the file
     * @returns File content as string
     */
    GitHubApiService.prototype.getFileContent = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(url, {
                                headers: {
                                    'Accept': 'application/vnd.github.v3.raw',
                                    'User-Agent': 'VSCode-Local-LLM-Agent'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error fetching file content from GitHub:', error_2);
                        throw new Error("Failed to fetch file content: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear the code examples cache
     */
    GitHubApiService.prototype.clearCache = function () {
        this.codeExamplesCache.clear();
    };
    return GitHubApiService;
}());
exports.GitHubApiService = GitHubApiService;
