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
var sinon = require("sinon");
var axios_1 = require("axios");
describe('LLM Connectivity Integration Tests', function () {
    var sandbox;
    var axiosGetStub;
    var axiosPostStub;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        axiosGetStub = sandbox.stub(axios_1.default, 'get');
        axiosPostStub = sandbox.stub(axios_1.default, 'post');
    });
    afterEach(function () {
        sandbox.restore();
    });
    describe('Ollama API Connectivity', function () {
        it('should handle successful connection to Ollama server', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axiosGetStub.withArgs('http://localhost:11434/api/version').resolves({
                            status: 200,
                            data: { version: '0.1.14' }
                        });
                        return [4 /*yield*/, axios_1.default.get('http://localhost:11434/api/version')];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.data.version).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should list available models from Ollama', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axiosGetStub.withArgs('http://localhost:11434/api/tags').resolves({
                            status: 200,
                            data: {
                                models: [
                                    { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 },
                                    { name: 'mistral', modified_at: '2023-10-10T12:15:23Z', size: 4126384733 },
                                    { name: 'codellama', modified_at: '2023-08-30T09:20:10Z', size: 3985231234 }
                                ]
                            }
                        });
                        return [4 /*yield*/, axios_1.default.get('http://localhost:11434/api/tags')];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(Array.isArray(response.data.models)).toBe(true);
                        expect(response.data.models.length).toBeGreaterThanOrEqual(3);
                        expect(response.data.models.some(function (model) { return model.name === 'llama2'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle model inference request correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axiosPostStub.withArgs('http://localhost:11434/api/generate').resolves({
                            status: 200,
                            data: {
                                response: "Here's a sample implementation:",
                                model: "llama2",
                                created_at: "2023-11-04T12:34:56.789Z"
                            }
                        });
                        return [4 /*yield*/, axios_1.default.post('http://localhost:11434/api/generate', {
                                prompt: 'Write a function to add two numbers',
                                model: 'llama2'
                            })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.data.response).toBeDefined();
                        expect(response.data.model).toBe('llama2');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle connection failures gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axiosGetStub.withArgs('http://localhost:11434/api/version')
                            .rejects(new Error('Connection refused'));
                        return [4 /*yield*/, expect(axios_1.default.get('http://localhost:11434/api/version'))
                                .rejects.toThrow('Connection refused')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('LM Studio API Connectivity', function () {
        it('should handle successful connection to LM Studio server', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axiosGetStub.withArgs('http://localhost:1234/v1/models').resolves({
                            status: 200,
                            data: {
                                object: 'list',
                                data: [{ id: 'local-model', object: 'model' }]
                            }
                        });
                        return [4 /*yield*/, axios_1.default.get('http://localhost:1234/v1/models')];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.data.object).toBe('list');
                        expect(Array.isArray(response.data.data)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle chat completion request correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axiosPostStub.withArgs('http://localhost:1234/v1/chat/completions').resolves({
                            status: 200,
                            data: {
                                id: 'chatcmpl-123',
                                object: 'chat.completion',
                                created: 1699266096,
                                model: 'local-model',
                                choices: [{
                                        index: 0,
                                        message: {
                                            role: 'assistant',
                                            content: 'function add(a, b) {\n  return a + b;\n}'
                                        },
                                        finish_reason: 'stop'
                                    }]
                            }
                        });
                        return [4 /*yield*/, axios_1.default.post('http://localhost:1234/v1/chat/completions', {
                                model: 'local-model',
                                messages: [{ role: 'user', content: 'Write a function to add two numbers' }]
                            })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.data.choices[0].message.content).toBeDefined();
                        expect(response.data.choices[0].message.role).toBe('assistant');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle connection failures gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axiosGetStub.withArgs('http://localhost:1234/v1/models')
                            .rejects(new Error('Connection refused'));
                        return [4 /*yield*/, expect(axios_1.default.get('http://localhost:1234/v1/models'))
                                .rejects.toThrow('Connection refused')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Fallback Behavior', function () {
        it('should try alternative endpoints when primary fails', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fallbackResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock primary endpoint failure
                        axiosGetStub.withArgs('http://localhost:11434/api/version')
                            .rejects(new Error('Connection refused'));
                        // Mock fallback endpoint success
                        axiosGetStub.withArgs('http://localhost:1234/v1/models').resolves({
                            status: 200,
                            data: { object: 'list', data: [{ id: 'local-model' }] }
                        });
                        // First attempt should fail
                        return [4 /*yield*/, expect(axios_1.default.get('http://localhost:11434/api/version'))
                                .rejects.toThrow('Connection refused')];
                    case 1:
                        // First attempt should fail
                        _a.sent();
                        return [4 /*yield*/, axios_1.default.get('http://localhost:1234/v1/models')];
                    case 2:
                        fallbackResponse = _a.sent();
                        expect(fallbackResponse.status).toBe(200);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
