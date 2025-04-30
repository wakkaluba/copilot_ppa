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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExampleService = void 0;
const vscode_1 = require("vscode");
const inversify_1 = require("inversify");
let CodeExampleService = class CodeExampleService {
    githubApi;
    searchIndex;
    _onDidUpdateExamples = new vscode_1.EventEmitter();
    disposables = [];
    constructor(githubApi, searchIndex) {
        this.githubApi = githubApi;
        this.searchIndex = searchIndex;
        this.disposables.push(this._onDidUpdateExamples);
    }
    async searchExamples(query, language) {
        try {
            const results = await this.searchIndex.search(query, language);
            return this.processResults(results);
        }
        catch (error) {
            this.handleError('Failed to search code examples', error);
            return [];
        }
    }
    async refreshExamples() {
        try {
            await this.searchIndex.rebuild();
            this._onDidUpdateExamples.fire();
        }
        catch (error) {
            this.handleError('Failed to refresh code examples', error);
        }
    }
    processResults(results) {
        return results.map(result => ({
            id: result.id,
            title: result.title,
            code: result.content,
            language: result.language,
            source: result.source
        }));
    }
    handleError(message, error) {
        console.error(message, error);
        // Add telemetry/logging here
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
};
exports.CodeExampleService = CodeExampleService;
exports.CodeExampleService = CodeExampleService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('GithubApiService')),
    __param(1, (0, inversify_1.inject)('SearchIndexService')),
    __metadata("design:paramtypes", [typeof (_a = typeof IGithubApiService !== "undefined" && IGithubApiService) === "function" ? _a : Object, typeof (_b = typeof ISearchIndexService !== "undefined" && ISearchIndexService) === "function" ? _b : Object])
], CodeExampleService);
//# sourceMappingURL=codeExampleService.js.map