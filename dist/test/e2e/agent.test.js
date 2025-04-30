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
var agent_1 = require("../../agents/agent");
var testWorkspace_1 = require("../helpers/testWorkspace");
var llmProviderFactory_1 = require("../../llmProviders/llmProviderFactory");
describe('Agent E2E Tests', function () {
    var agent;
    var testWorkspace;
    var mockProviderFactory;
    beforeEach(function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set up mock provider factory
                        mockProviderFactory = new llmProviderFactory_1.LLMProviderFactory();
                        jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(function () {
                            return ({
                                sendMessage: jest.fn().mockResolvedValue('Mock response'),
                                getContext: jest.fn().mockResolvedValue({}),
                                getCapabilities: jest.fn().mockReturnValue({
                                    streamingSupported: true,
                                    contextWindow: 4096,
                                    multimodalSupported: false
                                })
                            });
                        });
                        // Initialize test workspace
                        testWorkspace = new testWorkspace_1.TestWorkspace();
                        return [4 /*yield*/, testWorkspace.setup()];
                    case 1:
                        _a.sent();
                        // Create agent with mocked dependencies
                        agent = new agent_1.Agent(mockProviderFactory, testWorkspace);
                        return [2 /*return*/];
                }
            });
        });
    });
    afterEach(function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testWorkspace.cleanup()];
                    case 1:
                        _a.sent();
                        jest.clearAllMocks();
                        return [2 /*return*/];
                }
            });
        });
    });
    describe('Code Generation', function () {
        test('generates code from prompt', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var prompt, response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            prompt = 'Create a function that adds two numbers';
                            return [4 /*yield*/, agent.processRequest(prompt)];
                        case 1:
                            response = _b.sent();
                            expect(response).toBeDefined();
                            expect(mockProviderFactory.createProvider).toHaveBeenCalled();
                            _a = expect;
                            return [4 /*yield*/, testWorkspace.fileExists('add.ts')];
                        case 2:
                            _a.apply(void 0, [_b.sent()]).toBe(true);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('handles code generation errors gracefully', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var mockError;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            mockError = new Error('Generation failed');
                            jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(function () {
                                return ({
                                    sendMessage: jest.fn().mockRejectedValue(mockError),
                                    getContext: jest.fn(),
                                    getCapabilities: jest.fn()
                                });
                            });
                            return [4 /*yield*/, expect(agent.processRequest('Invalid prompt'))
                                    .rejects.toThrow('Generation failed')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe('Code Review', function () {
        test('reviews existing code', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Create test file
                            return [4 /*yield*/, testWorkspace.createFile('test.ts', 'function test() { return true; }')];
                        case 1:
                            // Create test file
                            _a.sent();
                            return [4 /*yield*/, agent.reviewCode('test.ts')];
                        case 2:
                            response = _a.sent();
                            expect(response).toBeDefined();
                            expect(response).toContain('review');
                            expect(response).toContain('suggestions');
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('provides meaningful review comments', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var testCode, review;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            testCode = "\n        function processData(data) {\n          return data.map(x => x + 1);\n        }\n      ";
                            return [4 /*yield*/, testWorkspace.createFile('process.ts', testCode)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, agent.reviewCode('process.ts')];
                        case 2:
                            review = _a.sent();
                            expect(review).toContain('type');
                            expect(review).toContain('parameter');
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe('Context Handling', function () {
        test('maintains conversation context', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var firstPrompt, secondPrompt, response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            firstPrompt = 'Create a User class';
                            secondPrompt = 'Add an age property to it';
                            return [4 /*yield*/, agent.processRequest(firstPrompt)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, agent.processRequest(secondPrompt)];
                        case 2:
                            response = _b.sent();
                            expect(response).toContain('age');
                            _a = expect;
                            return [4 /*yield*/, testWorkspace.fileContent('user.ts')];
                        case 3:
                            _a.apply(void 0, [_b.sent()]).toContain('age');
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('uses workspace context for responses', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, testWorkspace.createFile('config.ts', 'export const DEBUG = true;')];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, agent.processRequest('What is in config.ts?')];
                        case 2:
                            response = _a.sent();
                            expect(response).toContain('DEBUG');
                            expect(response).toContain('true');
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe('Error Handling', function () {
        test('validates generated code', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(function () {
                                return ({
                                    sendMessage: jest.fn().mockResolvedValue('invalid typescript code'),
                                    getContext: jest.fn(),
                                    getCapabilities: jest.fn()
                                });
                            });
                            return [4 /*yield*/, agent.processRequest('Generate invalid code')];
                        case 1:
                            response = _a.sent();
                            expect(response).toContain('error');
                            expect(response).toContain('invalid');
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('handles workspace errors', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            jest.spyOn(testWorkspace, 'createFile').mockRejectedValue(new Error('Write failed'));
                            return [4 /*yield*/, expect(agent.processRequest('Create a new file'))
                                    .rejects.toThrow('Write failed')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=agent.test.js.map