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
exports.LLMRequestExecutionService = void 0;
var events_1 = require("events");
var types_1 = require("../types");
/**
 * Service for executing LLM requests with proper queuing and rate limiting
 */
var LLMRequestExecutionService = /** @class */ (function (_super) {
    __extends(LLMRequestExecutionService, _super);
    function LLMRequestExecutionService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.activeRequests = new Map();
        _this.requestQueue = [];
        _this.maxConcurrentRequests = 3;
        _this.requestTimeout = 30000;
        _this.processingQueue = false;
        return _this;
    }
    /**
     * Execute an LLM request
     */
    LLMRequestExecutionService.prototype.execute = function (request, options) {
        return __awaiter(this, void 0, void 0, function () {
            var requestInfo;
            var _this = this;
            return __generator(this, function (_a) {
                requestInfo = {
                    id: crypto.randomUUID(),
                    request: {
                        content: request,
                        options: options
                    },
                    startTime: Date.now(),
                    status: 'queued'
                };
                // Add to queue and process
                this.requestQueue.push(requestInfo);
                this.emit(types_1.LLMRequestEvent.Queued, {
                    requestId: requestInfo.id,
                    queuePosition: this.requestQueue.length - 1
                });
                // Start queue processing if not already running
                if (!this.processingQueue) {
                    this.processQueue();
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var cleanup = function () {
                            _this.activeRequests.delete(requestInfo.id);
                            _this.removeListener(types_1.LLMRequestEvent.Success + requestInfo.id, handleSuccess);
                            _this.removeListener(types_1.LLMRequestEvent.Error + requestInfo.id, handleError);
                        };
                        var handleSuccess = function (response) {
                            cleanup();
                            resolve(response);
                        };
                        var handleError = function (error) {
                            cleanup();
                            reject(error);
                        };
                        _this.once(types_1.LLMRequestEvent.Success + requestInfo.id, handleSuccess);
                        _this.once(types_1.LLMRequestEvent.Error + requestInfo.id, handleError);
                    })];
            });
        });
    };
    /**
     * Process the request queue
     */
    LLMRequestExecutionService.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.processingQueue) {
                            return [2 /*return*/];
                        }
                        this.processingQueue = true;
                        _loop_1 = function () {
                            var request;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!(this_1.activeRequests.size >= this_1.maxConcurrentRequests)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/, "continue"];
                                    case 2:
                                        request = this_1.requestQueue.shift();
                                        if (!request) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        this_1.processRequest(request).catch(function (error) {
                                            _this.emit(types_1.LLMRequestEvent.Error + request.id, error);
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!(this.requestQueue.length > 0)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        this.processingQueue = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process a single request
     */
    LLMRequestExecutionService.prototype.processRequest = function (requestInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutId, response, error_1, llmError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        requestInfo.status = 'processing';
                        requestInfo.controller = new AbortController();
                        this.activeRequests.set(requestInfo.id, requestInfo);
                        this.emit(types_1.LLMRequestEvent.Started, {
                            requestId: requestInfo.id,
                            timestamp: new Date()
                        });
                        timeoutId = setTimeout(function () {
                            if (requestInfo.controller) {
                                requestInfo.controller.abort();
                            }
                        }, this.requestTimeout);
                        return [4 /*yield*/, this.executeRequest(requestInfo)];
                    case 1:
                        response = _a.sent();
                        clearTimeout(timeoutId);
                        this.emit(types_1.LLMRequestEvent.Success + requestInfo.id, response);
                        this.emit(types_1.LLMRequestEvent.Completed, {
                            requestId: requestInfo.id,
                            duration: Date.now() - requestInfo.startTime
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        requestInfo.status = 'failed';
                        llmError = this.wrapError(error_1);
                        this.emit(types_1.LLMRequestEvent.Error + requestInfo.id, llmError);
                        throw llmError;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute the actual LLM request
     */
    LLMRequestExecutionService.prototype.executeRequest = function (requestInfo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with the active LLM provider
                throw new Error('Not implemented');
            });
        });
    };
    /**
     * Abort a request
     */
    LLMRequestExecutionService.prototype.abortRequest = function (requestId) {
        var request = this.activeRequests.get(requestId);
        if (!request || !request.controller) {
            return false;
        }
        request.controller.abort();
        request.status = 'aborted';
        this.activeRequests.delete(requestId);
        this.emit(types_1.LLMRequestEvent.Aborted, {
            requestId: requestId,
            timestamp: new Date()
        });
        return true;
    };
    /**
     * Get request status
     */
    LLMRequestExecutionService.prototype.getRequestStatus = function (requestId) {
        var _a;
        return (_a = this.activeRequests.get(requestId)) === null || _a === void 0 ? void 0 : _a.status;
    };
    /**
     * Get active request count
     */
    LLMRequestExecutionService.prototype.getActiveRequestCount = function () {
        return this.activeRequests.size;
    };
    /**
     * Get queued request count
     */
    LLMRequestExecutionService.prototype.getQueuedRequestCount = function () {
        return this.requestQueue.length;
    };
    /**
     * Check if the service is connected and ready
     */
    LLMRequestExecutionService.prototype.isConnected = function () {
        var _a;
        return ((_a = this.provider) === null || _a === void 0 ? void 0 : _a.getStatus()) === 'active';
    };
    LLMRequestExecutionService.prototype.wrapError = function (error) {
        if (error instanceof Error) {
            return new types_1.LLMRequestError(error.message, error);
        }
        return new types_1.LLMRequestError(String(error));
    };
    LLMRequestExecutionService.prototype.dispose = function () {
        // Abort all active requests
        for (var _i = 0, _a = this.activeRequests.keys(); _i < _a.length; _i++) {
            var requestId = _a[_i];
            this.abortRequest(requestId);
        }
        this.removeAllListeners();
    };
    return LLMRequestExecutionService;
}(events_1.EventEmitter));
exports.LLMRequestExecutionService = LLMRequestExecutionService;
