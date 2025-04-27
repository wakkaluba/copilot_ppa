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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSDocTSDocIntegration = void 0;
var vscode = require("vscode");
var ts = require("typescript");
/**
 * Service responsible for handling JSDoc/TSDoc generation and integration
 */
var JSDocTSDocIntegration = /** @class */ (function () {
    /**
     * Constructor for the JSDoc/TSDoc integration service
     * @param llmProvider The LLM provider to use for generating documentation
     */
    function JSDocTSDocIntegration(llmProvider) {
        this.llmProvider = llmProvider;
        this.supportedLanguages = ['javascript', 'typescript'];
        this.outputChannel = vscode.window.createOutputChannel('JSDoc/TSDoc Integration');
    }
    /**
     * Generate documentation for a specific file
     */
    JSDocTSDocIntegration.prototype.generateDocumentation = function (document_1) {
        return __awaiter(this, arguments, void 0, function (document, options) {
            var sourceFile, edits, workspaceEdit, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.supportedLanguages.includes(document.languageId)) {
                            throw new Error("Language ".concat(document.languageId, " not supported"));
                        }
                        sourceFile = ts.createSourceFile(document.fileName, document.getText(), ts.ScriptTarget.Latest, true);
                        edits = [];
                        this.visitNode(sourceFile, document, edits, options);
                        workspaceEdit = new vscode.WorkspaceEdit();
                        workspaceEdit.set(document.uri, edits);
                        return [4 /*yield*/, vscode.workspace.applyEdit(workspaceEdit)];
                    case 1:
                        _a.sent();
                        this.outputChannel.appendLine("Documentation generated for ".concat(document.fileName));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("Error generating documentation: ".concat(error_1));
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate documentation for a specific symbol
     */
    JSDocTSDocIntegration.prototype.generateSymbolDocumentation = function (node, existingDoc, options) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeType, symbolInfo, prompt, documentation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodeType = this.getNodeType(node);
                        symbolInfo = this.extractSymbolInfo(node);
                        prompt = this.buildDocumentationPrompt(nodeType, symbolInfo, existingDoc, options);
                        return [4 /*yield*/, this.llmProvider.generateDocumentation(prompt)];
                    case 1:
                        documentation = _a.sent();
                        return [2 /*return*/, this.formatDocumentation(documentation, options.style || 'jsdoc')];
                }
            });
        });
    };
    /**
     * Visit AST nodes to find documentation targets
     */
    JSDocTSDocIntegration.prototype.visitNode = function (node, document, edits, options) {
        var _this = this;
        if (this.shouldDocumentNode(node)) {
            var existingDoc = this.getExistingDocumentation(node);
            if (!existingDoc || options.overwrite) {
                this.generateSymbolDocumentation(node, existingDoc, options)
                    .then(function (docString) {
                    var position = document.positionAt(node.getStart());
                    var insertPosition = new vscode.Position(position.line, 0);
                    edits.push(vscode.TextEdit.insert(insertPosition, docString + '\n'));
                })
                    .catch(function (error) {
                    _this.outputChannel.appendLine("Error generating documentation for symbol: ".concat(error));
                });
            }
        }
        ts.forEachChild(node, function (child) { return _this.visitNode(child, document, edits, options); });
    };
    /**
     * Check if a node should be documented
     */
    JSDocTSDocIntegration.prototype.shouldDocumentNode = function (node) {
        return (ts.isClassDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            ts.isFunctionDeclaration(node) ||
            ts.isMethodDeclaration(node) ||
            ts.isPropertyDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isTypeAliasDeclaration(node) ||
            (ts.isVariableDeclaration(node) && this.isExportedVariable(node)));
    };
    /**
     * Check if a variable declaration is exported
     */
    JSDocTSDocIntegration.prototype.isExportedVariable = function (node) {
        var _a, _b;
        var getParentStatement = function (n) {
            if (!n.parent) {
                return undefined;
            }
            if (ts.isVariableStatement(n.parent)) {
                return n.parent;
            }
            return getParentStatement(n.parent);
        };
        var statement = getParentStatement(node);
        return (_b = (_a = statement === null || statement === void 0 ? void 0 : statement.modifiers) === null || _a === void 0 ? void 0 : _a.some(function (modifier) { return modifier.kind === ts.SyntaxKind.ExportKeyword; })) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Extract existing documentation from a node
     */
    JSDocTSDocIntegration.prototype.getExistingDocumentation = function (node) {
        var jsDocNodes = ts.getJSDocTags(node);
        if (jsDocNodes.length === 0) {
            return undefined;
        }
        var sourceFile = node.getSourceFile();
        var fullText = sourceFile.getFullText();
        var docRanges = jsDocNodes.map(function (doc) { return ({
            start: doc.pos,
            end: doc.end
        }); });
        return docRanges.map(function (range) {
            return fullText.substring(range.start, range.end).trim();
        }).join('\n');
    };
    /**
     * Extract relevant information from a node for documentation
     */
    JSDocTSDocIntegration.prototype.extractSymbolInfo = function (node) {
        var _a;
        var info = {
            kind: node.kind,
            name: this.getNodeName(node)
        };
        if (ts.isFunctionLike(node)) {
            info['parameters'] = node.parameters.map(function (param) {
                var _a;
                return ({
                    name: param.name.getText(),
                    type: (_a = param.type) === null || _a === void 0 ? void 0 : _a.getText()
                });
            });
            info['returnType'] = (_a = node.type) === null || _a === void 0 ? void 0 : _a.getText();
        }
        if (ts.isClassDeclaration(node)) {
            info['members'] = node.members.map(function (member) {
                var _a;
                return ({
                    name: (_a = member.name) === null || _a === void 0 ? void 0 : _a.getText(),
                    kind: member.kind
                });
            });
        }
        return info;
    };
    /**
     * Get the name of a node
     */
    JSDocTSDocIntegration.prototype.getNodeName = function (node) {
        if (ts.isIdentifier(node)) {
            return node.text;
        }
        if ('name' in node) {
            var name_1 = node.name;
            return name_1 === null || name_1 === void 0 ? void 0 : name_1.text;
        }
        return undefined;
    };
    /**
     * Build a documentation prompt for the LLM
     */
    JSDocTSDocIntegration.prototype.buildDocumentationPrompt = function (nodeType, symbolInfo, existingDoc, options) {
        var prompt = "Generate ".concat(options.style || 'jsdoc', " documentation for:\n");
        prompt += "Type: ".concat(nodeType, "\n");
        prompt += "Name: ".concat(symbolInfo['name'] || 'Anonymous', "\n");
        if (symbolInfo['parameters']) {
            prompt += 'Parameters:\n';
            symbolInfo['parameters'].forEach(function (param) {
                prompt += "- ".concat(param.name, ": ").concat(param.type || 'any', "\n");
            });
        }
        if (symbolInfo['returnType']) {
            prompt += "Return type: ".concat(symbolInfo['returnType'], "\n");
        }
        if (existingDoc) {
            prompt += "\nExisting documentation:\n".concat(existingDoc, "\n");
        }
        if (options.style === 'tsdoc') {
            prompt += '\nUse TSDoc style documentation.';
        }
        return prompt;
    };
    /**
     * Format the generated documentation
     */
    JSDocTSDocIntegration.prototype.formatDocumentation = function (documentation, style) {
        var lines = documentation.split('\n').map(function (line) { return line.trim(); });
        var formatted = style === 'jsdoc'
            ? __spreadArray(__spreadArray(['/**'], lines.map(function (line) { return " * ".concat(line); }), true), [' */'], false) : __spreadArray(__spreadArray(['/**'], lines.map(function (line) { return " * ".concat(line); }), true), [' */'], false);
        return formatted.join('\n');
    };
    /**
     * Get the type of a node for documentation purposes
     */
    JSDocTSDocIntegration.prototype.getNodeType = function (node) {
        if (ts.isClassDeclaration(node)) {
            return 'class';
        }
        if (ts.isInterfaceDeclaration(node)) {
            return 'interface';
        }
        if (ts.isFunctionDeclaration(node)) {
            return 'function';
        }
        if (ts.isMethodDeclaration(node)) {
            return 'method';
        }
        if (ts.isPropertyDeclaration(node)) {
            return 'property';
        }
        if (ts.isEnumDeclaration(node)) {
            return 'enum';
        }
        if (ts.isTypeAliasDeclaration(node)) {
            return 'type';
        }
        if (ts.isVariableDeclaration(node)) {
            return 'variable';
        }
        return 'other';
    };
    /**
     * Clean up resources
     */
    JSDocTSDocIntegration.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return JSDocTSDocIntegration;
}());
exports.JSDocTSDocIntegration = JSDocTSDocIntegration;
