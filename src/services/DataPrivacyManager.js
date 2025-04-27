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
exports.DataPrivacyManager = void 0;
var vscode = require("vscode");
var crypto = require("crypto");
var path = require("path");
var WorkspaceManager_1 = require("./WorkspaceManager");
var DataPrivacyManager = /** @class */ (function () {
    function DataPrivacyManager() {
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        this.storagePath = path.join(this.getExtensionPath(), 'secure-storage');
        this.encryptionKey = this.getOrCreateEncryptionKey();
    }
    DataPrivacyManager.getInstance = function () {
        if (!this.instance) {
            this.instance = new DataPrivacyManager();
        }
        return this.instance;
    };
    DataPrivacyManager.prototype.storeConversation = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var encrypted, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encrypted = this.encrypt(JSON.stringify(data));
                        filePath = path.join(this.storagePath, "".concat(id, ".enc"));
                        return [4 /*yield*/, this.workspaceManager.writeFile(filePath, encrypted)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DataPrivacyManager.prototype.loadConversation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, encrypted, decrypted, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        filePath = path.join(this.storagePath, "".concat(id, ".enc"));
                        return [4 /*yield*/, this.workspaceManager.readFile(filePath)];
                    case 1:
                        encrypted = _a.sent();
                        decrypted = this.decrypt(encrypted);
                        return [2 /*return*/, JSON.parse(decrypted)];
                    case 2:
                        error_1 = _a.sent();
                        console.warn("Failed to load conversation ".concat(id, ":"), error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DataPrivacyManager.prototype.cleanSensitiveData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, retentionDays, files, now, _i, files_1, file, stat, age;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = vscode.workspace.getConfiguration('copilot-ppa');
                        retentionDays = config.get('dataRetentionDays', 30);
                        return [4 /*yield*/, this.workspaceManager.listFiles(this.storagePath)];
                    case 1:
                        files = _a.sent();
                        now = Date.now();
                        _i = 0, files_1 = files;
                        _a.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 6];
                        file = files_1[_i];
                        return [4 /*yield*/, vscode.workspace.fs.stat(vscode.Uri.file(file))];
                    case 3:
                        stat = _a.sent();
                        age = now - stat.mtime;
                        if (!(age > retentionDays * 24 * 60 * 60 * 1000)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.workspaceManager.deleteFile(file)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DataPrivacyManager.prototype.validateDataPrivacy = function (data) {
        // Ensure no external URLs or sensitive patterns
        var dataStr = JSON.stringify(data);
        var sensitivePatterns = [
            /https?:\/\/(?!localhost|127\.0\.0\.1)/i,
            /password/i,
            /secret/i,
            /token/i,
        ];
        return !sensitivePatterns.some(function (pattern) { return pattern.test(dataStr); });
    };
    DataPrivacyManager.prototype.getOrCreateEncryptionKey = function () {
        var keyPath = path.join(this.getExtensionPath(), '.key');
        try {
            return Buffer.from(this.workspaceManager.readFile(keyPath), 'hex');
        }
        catch (_a) {
            var key = crypto.randomBytes(32);
            this.workspaceManager.writeFile(keyPath, key.toString('hex'));
            return key;
        }
    };
    DataPrivacyManager.prototype.encrypt = function (text) {
        var iv = crypto.randomBytes(16);
        var cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        var encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        var tag = cipher.getAuthTag();
        return "".concat(iv.toString('hex'), ":").concat(encrypted.toString('hex'), ":").concat(tag.toString('hex'));
    };
    DataPrivacyManager.prototype.decrypt = function (text) {
        var _a = text.split(':'), ivHex = _a[0], encryptedHex = _a[1], tagHex = _a[2];
        var iv = Buffer.from(ivHex, 'hex');
        var encrypted = Buffer.from(encryptedHex, 'hex');
        var tag = Buffer.from(tagHex, 'hex');
        var decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final('utf8');
    };
    DataPrivacyManager.prototype.getExtensionPath = function () {
        var extension = vscode.extensions.getExtension('your-publisher.copilot-ppa');
        if (!extension) {
            throw new Error('Extension not found');
        }
        return extension.extensionPath;
    };
    return DataPrivacyManager;
}());
exports.DataPrivacyManager = DataPrivacyManager;
