"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var vscode = require("vscode");
var BitbucketProvider_1 = require("../../../../services/repositoryProviders/BitbucketProvider");
var bitbucket_1 = require("bitbucket");
suite('BitbucketProvider Tests', function () {
    var provider;
    var sandbox;
    var configurationStub;
    var createRepoStub;
    var listReposStub;
    setup(function () {
        sandbox = sinon.createSandbox();
        // Stub VS Code configuration
        configurationStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        configurationStub.returns({
            get: sandbox.stub().callsFake(function (key) {
                switch (key) {
                    case 'bitbucket.username':
                        return 'test-user';
                    case 'bitbucket.appPassword':
                        return 'test-password';
                    case 'bitbucket.workspace':
                        return 'test-workspace';
                    default:
                        return undefined;
                }
            })
        });
        // Create stubs for Bitbucket methods
        createRepoStub = sandbox.stub().resolves();
        listReposStub = sandbox.stub().resolves({
            data: {
                values: [
                    {
                        name: 'test-repo',
                        links: {
                            html: {
                                href: 'https://bitbucket.org/workspace/test-repo'
                            }
                        },
                        is_private: true,
                        description: 'Test repository'
                    }
                ]
            }
        });
        // Stub Bitbucket constructor
        sandbox.stub(bitbucket_1.Bitbucket.prototype, 'repositories').value({
            create: createRepoStub,
            list: listReposStub
        });
        provider = new BitbucketProvider_1.BitbucketProvider();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('isConfigured should return true when credentials are configured', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = assert).strictEqual;
                        return [4 /*yield*/, provider.isConfigured()];
                    case 1:
                        _b.apply(_a, [_c.sent(), true]);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('isConfigured should return false when credentials are not configured', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        configurationStub.returns({
                            get: sandbox.stub().returns(undefined)
                        });
                        // Create new instance with undefined credentials
                        provider = new BitbucketProvider_1.BitbucketProvider();
                        _b = (_a = assert).strictEqual;
                        return [4 /*yield*/, provider.isConfigured()];
                    case 1:
                        _b.apply(_a, [_c.sent(), false]);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('createRepository should create repository with correct options', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, provider.createRepository({
                            name: 'test-repo',
                            description: 'Test repository',
                            private: true
                        })];
                    case 1:
                        _a.sent();
                        assert.strictEqual(createRepoStub.calledOnce, true);
                        options = createRepoStub.firstCall.args[0];
                        assert.strictEqual(options.workspace, 'test-workspace');
                        assert.deepStrictEqual(options._body, {
                            name: 'test-repo',
                            description: 'Test repository',
                            is_private: true,
                            scm: 'git'
                        });
                        return [2 /*return*/];
                }
            });
        });
    });
    test('createRepository should throw error when not configured', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configurationStub.returns({
                            get: sandbox.stub().returns(undefined)
                        });
                        // Create new instance with undefined credentials
                        provider = new BitbucketProvider_1.BitbucketProvider();
                        return [4 /*yield*/, assert.rejects(function () { return provider.createRepository({ name: 'test-repo' }); }, /Bitbucket provider not configured/)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    test('getRepositories should return list of repositories', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var repos, options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, provider.getRepositories()];
                    case 1:
                        repos = _a.sent();
                        assert.strictEqual(listReposStub.calledOnce, true);
                        assert.strictEqual(repos.length, 1);
                        assert.deepStrictEqual(repos[0], {
                            name: 'test-repo',
                            url: 'https://bitbucket.org/workspace/test-repo',
                            private: true,
                            description: 'Test repository'
                        });
                        options = listReposStub.firstCall.args[0];
                        assert.strictEqual(options.workspace, 'test-workspace');
                        return [2 /*return*/];
                }
            });
        });
    });
    test('getRepositories should handle missing repository data', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var repos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listReposStub.resolves({
                            data: {
                                values: [
                                    {
                                        // Missing optional fields
                                        name: 'test-repo',
                                        links: {
                                            html: {
                                                href: 'https://bitbucket.org/workspace/test-repo'
                                            }
                                        }
                                    }
                                ]
                            }
                        });
                        return [4 /*yield*/, provider.getRepositories()];
                    case 1:
                        repos = _a.sent();
                        assert.deepStrictEqual(repos[0], {
                            name: 'test-repo',
                            url: 'https://bitbucket.org/workspace/test-repo',
                            private: false,
                            description: undefined
                        });
                        return [2 /*return*/];
                }
            });
        });
    });
    test('getRepositories should throw error when not configured', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configurationStub.returns({
                            get: sandbox.stub().returns(undefined)
                        });
                        // Create new instance with undefined credentials
                        provider = new BitbucketProvider_1.BitbucketProvider();
                        return [4 /*yield*/, assert.rejects(function () { return provider.getRepositories(); }, /Bitbucket provider not configured/)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=BitbucketProvider.test.js.map