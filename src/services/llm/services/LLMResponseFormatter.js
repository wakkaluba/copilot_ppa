"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMResponseFormatter = void 0;
var types_1 = require("../types");
/**
 * Service for formatting and processing LLM responses
 */
var LLMResponseFormatter = /** @class */ (function () {
    function LLMResponseFormatter() {
    }
    /**
     * Format a raw LLM response
     */
    LLMResponseFormatter.prototype.format = function (rawResponse, options) {
        var _a;
        if (options === void 0) { options = {}; }
        try {
            var context_1 = {
                format: options.format || 'text',
                maxLength: options.maxLength,
                includeMetadata: (_a = options.includeMetadata) !== null && _a !== void 0 ? _a : true,
                preserveFormatting: options.preserveFormatting
            };
            var content = this.formatContent(rawResponse, context_1);
            var usage = this.extractTokenUsage(rawResponse);
            return this.createResponse(content, usage, options);
        }
        catch (error) {
            throw new types_1.LLMResponseError('Failed to format response', error instanceof Error ? error : undefined);
        }
    };
    /**
     * Format response content based on format type
     */
    LLMResponseFormatter.prototype.formatContent = function (rawResponse, context) {
        var content = '';
        if (typeof rawResponse === 'string') {
            content = rawResponse;
        }
        else if (typeof rawResponse === 'object' && rawResponse !== null) {
            content = this.extractContentFromObject(rawResponse);
        }
        else {
            content = String(rawResponse);
        }
        return this.applyFormatting(content, context);
    };
    /**
     * Extract content from response object
     */
    LLMResponseFormatter.prototype.extractContentFromObject = function (obj) {
        // Handle different response structures
        if ('text' in obj) {
            return String(obj.text);
        }
        if ('content' in obj) {
            return String(obj.content);
        }
        if ('message' in obj) {
            return String(obj.message);
        }
        if ('choices' in obj && Array.isArray(obj.choices)) {
            return obj.choices.map(function (choice) {
                return typeof choice === 'string' ? choice :
                    typeof choice === 'object' && choice ?
                        String(choice.text || choice.content || choice.message || '') :
                        '';
            }).join('\n').trim();
        }
        return JSON.stringify(obj);
    };
    /**
     * Apply formatting based on context
     */
    LLMResponseFormatter.prototype.applyFormatting = function (content, context) {
        var formatted = content;
        // Apply format-specific formatting
        switch (context.format) {
            case 'text':
                formatted = this.formatAsText(formatted, context);
                break;
            case 'json':
                formatted = this.formatAsJson(formatted, context);
                break;
            case 'markdown':
                formatted = this.formatAsMarkdown(formatted, context);
                break;
            case 'code':
                formatted = this.formatAsCode(formatted, context);
                break;
        }
        // Apply length limit if specified
        if (context.maxLength && formatted.length > context.maxLength) {
            formatted = formatted.slice(0, context.maxLength) + '...';
        }
        return formatted;
    };
    /**
     * Format as plain text
     */
    LLMResponseFormatter.prototype.formatAsText = function (content, context) {
        if (!context.preserveFormatting) {
            // Normalize whitespace
            return content
                .replace(/\r\n/g, '\n')
                .replace(/\s+/g, ' ')
                .trim();
        }
        return content;
    };
    /**
     * Format as JSON
     */
    LLMResponseFormatter.prototype.formatAsJson = function (content, context) {
        try {
            // If content is already JSON string, parse and re-stringify
            var parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, context.preserveFormatting ? 2 : 0);
        }
        catch (_a) {
            // If not valid JSON, try to convert to JSON
            return JSON.stringify({ content: content }, null, context.preserveFormatting ? 2 : 0);
        }
    };
    /**
     * Format as Markdown
     */
    LLMResponseFormatter.prototype.formatAsMarkdown = function (content, context) {
        if (!context.preserveFormatting) {
            // Basic Markdown cleanup
            return content
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }
        return content;
    };
    /**
     * Format as code
     */
    LLMResponseFormatter.prototype.formatAsCode = function (content, context) {
        if (!context.preserveFormatting) {
            // Basic code formatting
            return content
                .replace(/\r\n/g, '\n')
                .replace(/\t/g, '    ')
                .replace(/[ \t]+$/gm, '')
                .trim();
        }
        return content;
    };
    /**
     * Extract token usage information
     */
    LLMResponseFormatter.prototype.extractTokenUsage = function (rawResponse) {
        if (typeof rawResponse === 'object' && rawResponse && 'usage' in rawResponse) {
            var usage = rawResponse.usage;
            if (typeof usage === 'object' && usage) {
                return {
                    promptTokens: usage.prompt_tokens || 0,
                    completionTokens: usage.completion_tokens || 0,
                    totalTokens: usage.total_tokens || 0
                };
            }
        }
        return undefined;
    };
    /**
     * Create formatted response object
     */
    LLMResponseFormatter.prototype.createResponse = function (content, usage, options) {
        if (options === void 0) { options = {}; }
        var response = {
            content: content,
            format: options.format || 'text',
            timestamp: new Date()
        };
        if (options.includeMetadata !== false) {
            response.metadata = {
                formatVersion: '1.0',
                contentLength: content.length,
                usage: usage
            };
        }
        return response;
    };
    /**
     * Validate response format
     */
    LLMResponseFormatter.prototype.validateFormat = function (format) {
        return ['text', 'json', 'markdown', 'code'].includes(format);
    };
    /**
     * Stream response chunks
     */
    LLMResponseFormatter.prototype.streamResponse = function (responseStream_1) {
        return __asyncGenerator(this, arguments, function streamResponse_1(responseStream, options) {
            var buffer, _a, responseStream_2, responseStream_2_1, chunk, e_1_1;
            var _b, e_1, _c, _d;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        buffer = '';
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 8, 9, 14]);
                        _a = true, responseStream_2 = __asyncValues(responseStream);
                        _e.label = 2;
                    case 2: return [4 /*yield*/, __await(responseStream_2.next())];
                    case 3:
                        if (!(responseStream_2_1 = _e.sent(), _b = responseStream_2_1.done, !_b)) return [3 /*break*/, 7];
                        _d = responseStream_2_1.value;
                        _a = false;
                        chunk = _d;
                        buffer += this.formatContent(chunk, {
                            format: options.format || 'text',
                            preserveFormatting: true
                        });
                        return [4 /*yield*/, __await(this.createResponse(buffer, undefined, options))];
                    case 4: return [4 /*yield*/, _e.sent()];
                    case 5:
                        _e.sent();
                        _e.label = 6;
                    case 6:
                        _a = true;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 14];
                    case 8:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 14];
                    case 9:
                        _e.trys.push([9, , 12, 13]);
                        if (!(!_a && !_b && (_c = responseStream_2.return))) return [3 /*break*/, 11];
                        return [4 /*yield*/, __await(_c.call(responseStream_2))];
                    case 10:
                        _e.sent();
                        _e.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 13: return [7 /*endfinally*/];
                    case 14: return [4 /*yield*/, __await(this.format(buffer, options))];
                    case 15: 
                    // Final formatted response
                    return [4 /*yield*/, _e.sent()];
                    case 16:
                        // Final formatted response
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return LLMResponseFormatter;
}());
exports.LLMResponseFormatter = LLMResponseFormatter;
