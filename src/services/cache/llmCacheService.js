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
exports.LLMCacheService = void 0;
var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
var vscode = require("vscode");
var LLMCacheService = /** @class */ (function () {
    function LLMCacheService() {
        var _this = this;
        this.cacheDir = path.join(this.getExtensionPath(), 'cache');
        this.ensureCacheDirectory();
        this.cacheTTL = this.getCacheTTLFromConfig();
        this.cacheEnabled = this.getCacheEnabledFromConfig();
        this.todoPath = path.join(this.getExtensionPath(), 'zzztodo.md');
        this.finishedPath = path.join(this.getExtensionPath(), 'finished.md');
        // Listen to configuration changes
        vscode.workspace.onDidChangeConfiguration(function (e) {
            if (e.affectsConfiguration('localLLMAgent.cache')) {
                _this.cacheTTL = _this.getCacheTTLFromConfig();
                _this.cacheEnabled = _this.getCacheEnabledFromConfig();
            }
        });
    }
    LLMCacheService.prototype.getExtensionPath = function () {
        var extension = vscode.extensions.getExtension('vscode-local-llm-agent');
        if (!extension) {
            throw new Error('Extension not found');
        }
        return extension.extensionPath;
    };
    LLMCacheService.prototype.ensureCacheDirectory = function () {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    };
    LLMCacheService.prototype.getCacheTTLFromConfig = function () {
        var config = vscode.workspace.getConfiguration('localLLMAgent.cache');
        // Default to 1 hour (in milliseconds)
        return (config.get('ttlMinutes') || 60) * 60 * 1000;
    };
    LLMCacheService.prototype.getCacheEnabledFromConfig = function () {
        var config = vscode.workspace.getConfiguration('localLLMAgent.cache');
        return config.get('enabled') || true;
    };
    LLMCacheService.prototype.generateCacheKey = function (prompt, model, params) {
        var data = JSON.stringify({ prompt: prompt, model: model, params: params });
        return crypto.createHash('md5').update(data).digest('hex');
    };
    LLMCacheService.prototype.getCacheFilePath = function (key) {
        return path.join(this.cacheDir, "".concat(key, ".json"));
    };
    LLMCacheService.prototype.get = function (prompt, model, params) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cacheFilePath, cacheData;
            return __generator(this, function (_a) {
                if (!this.cacheEnabled) {
                    return [2 /*return*/, null];
                }
                cacheKey = this.generateCacheKey(prompt, model, params);
                cacheFilePath = this.getCacheFilePath(cacheKey);
                if (!fs.existsSync(cacheFilePath)) {
                    return [2 /*return*/, null];
                }
                try {
                    cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
                    // Check if cache entry is still valid
                    if (Date.now() - cacheData.timestamp > this.cacheTTL) {
                        // Cache expired
                        fs.unlinkSync(cacheFilePath);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, cacheData.response];
                }
                catch (error) {
                    console.error('Error reading from cache:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    LLMCacheService.prototype.set = function (prompt, model, params, response) {
        if (!this.cacheEnabled) {
            return;
        }
        var cacheKey = this.generateCacheKey(prompt, model, params);
        var cacheFilePath = this.getCacheFilePath(cacheKey);
        var cacheEntry = {
            timestamp: new Date(),
            response: response
        };
        try {
            fs.writeFileSync(cacheFilePath, JSON.stringify(cacheEntry), 'utf8');
        }
        catch (error) {
            console.error('Error writing to cache:', error);
        }
    };
    LLMCacheService.prototype.clearCache = function () {
        try {
            var files = fs.readdirSync(this.cacheDir);
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                fs.unlinkSync(path.join(this.cacheDir, file));
            }
        }
        catch (error) {
            console.error('Error clearing cache:', error);
        }
    };
    LLMCacheService.prototype.clearExpiredCache = function () {
        try {
            var files = fs.readdirSync(this.cacheDir);
            for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
                var file = files_2[_i];
                var filePath = path.join(this.cacheDir, file);
                try {
                    var cacheData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (Date.now() - cacheData.timestamp > this.cacheTTL) {
                        fs.unlinkSync(filePath);
                    }
                }
                catch (error) {
                    // If there's an error reading the file, remove it
                    fs.unlinkSync(filePath);
                }
            }
        }
        catch (error) {
            console.error('Error clearing expired cache:', error);
        }
    };
    LLMCacheService.prototype.updateTaskProgress = function (taskDescription, status, percentage) {
        try {
            if (!fs.existsSync(this.todoPath)) {
                return;
            }
            var todoContent = fs.readFileSync(this.todoPath, 'utf8');
            var taskLines = todoContent.split('\n');
            for (var i = 0; i < taskLines.length; i++) {
                var line = taskLines[i];
                if (line.includes(taskDescription)) {
                    // Extract task description without status prefix or percentage suffix
                    var cleanedDescription = this.extractTaskDescription(line);
                    // Create updated task line with new status and percentage
                    var statusPrefix = this.getStatusPrefix(status);
                    var updatedLine = "".concat(statusPrefix, " ").concat(cleanedDescription, " (").concat(percentage, "%)");
                    taskLines[i] = updatedLine;
                    // If task is completed, move to finished.md
                    if (status === 'completed' && percentage === 100) {
                        this.moveTaskToFinished(updatedLine);
                        taskLines.splice(i, 1);
                        i--;
                    }
                    break;
                }
            }
            todoContent = taskLines.join('\n');
            fs.writeFileSync(this.todoPath, todoContent, 'utf8');
        }
        catch (error) {
            console.error('Error updating task progress:', error);
        }
    };
    LLMCacheService.prototype.extractTaskDescription = function (taskLine) {
        // Remove status prefix
        var description = taskLine.replace(/^- \[[^\]]*\]\s*/, '');
        // Remove percentage suffix
        description = description.replace(/\s*\(\d+%\)\s*$/, '');
        return description.trim();
    };
    LLMCacheService.prototype.getStatusPrefix = function (status) {
        switch (status) {
            case 'not-started':
                return '- [ ]';
            case 'in-progress':
                return '- [/]';
            case 'completed':
                return '- [X]';
            case 'do-not-touch':
                return '- [-]';
            default:
                return '- [ ]';
        }
    };
    LLMCacheService.prototype.moveTaskToFinished = function (taskLine) {
        try {
            if (!fs.existsSync(this.finishedPath)) {
                fs.writeFileSync(this.finishedPath, '', 'utf8');
            }
            var finishedContent = fs.readFileSync(this.finishedPath, 'utf8');
            finishedContent += "\n".concat(taskLine);
            fs.writeFileSync(this.finishedPath, finishedContent, 'utf8');
        }
        catch (error) {
            console.error('Error moving task to finished:', error);
        }
    };
    LLMCacheService.prototype.getTaskProgress = function (taskDescription) {
        try {
            if (!fs.existsSync(this.todoPath)) {
                return null;
            }
            var todoContent = fs.readFileSync(this.todoPath, 'utf8');
            var taskLines = todoContent.split('\n');
            for (var _i = 0, taskLines_1 = taskLines; _i < taskLines_1.length; _i++) {
                var line = taskLines_1[_i];
                if (line.includes(taskDescription)) {
                    // Extract status
                    var statusMatch = line.match(/^- \[([^\]]*)\]/);
                    var status_1 = 'not-started';
                    if (statusMatch) {
                        var statusChar = statusMatch[1];
                        if (statusChar === '/') {
                            status_1 = 'in-progress';
                        }
                        else if (statusChar === 'X') {
                            status_1 = 'completed';
                        }
                        else if (statusChar === '-') {
                            status_1 = 'do-not-touch';
                        }
                        else {
                            status_1 = 'not-started';
                        }
                    }
                    // Extract percentage
                    var percentageMatch = line.match(/\((\d+)%\)$/);
                    var percentage = percentageMatch ? parseInt(percentageMatch[1]) : 0;
                    return { status: status_1, percentage: percentage };
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error getting task progress:', error);
            return null;
        }
    };
    return LLMCacheService;
}());
exports.LLMCacheService = LLMCacheService;
