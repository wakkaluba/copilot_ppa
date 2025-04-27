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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsTreeDataProvider = void 0;
var vscode = require("vscode");
var ConversationsTreeDataProvider = /** @class */ (function () {
    function ConversationsTreeDataProvider(conversationManager) {
        var _this = this;
        this.conversationManager = conversationManager;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        // Listen to conversation changes
        this.conversationManager.onConversationChanged(function () { return _this.refresh(); });
        this.conversationManager.onConversationAdded(function () { return _this.refresh(); });
        this.conversationManager.onConversationRemoved(function () { return _this.refresh(); });
        this.conversationManager.onConversationsImported(function () { return _this.refresh(); });
    }
    ConversationsTreeDataProvider.prototype.getTreeItem = function (element) {
        return element;
    };
    ConversationsTreeDataProvider.prototype.getChildren = function (element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            return this.conversationManager.getConversations().then(function (conversations) {
                return conversations.map(function (conversation) { return new ConversationTreeItem(conversation); });
            });
        }
    };
    ConversationsTreeDataProvider.prototype.refresh = function () {
        this._onDidChangeTreeData.fire(undefined);
    };
    return ConversationsTreeDataProvider;
}());
exports.ConversationsTreeDataProvider = ConversationsTreeDataProvider;
var ConversationTreeItem = /** @class */ (function (_super) {
    __extends(ConversationTreeItem, _super);
    function ConversationTreeItem(conversation) {
        var _this = _super.call(this, conversation.title, vscode.TreeItemCollapsibleState.None) || this;
        _this.conversation = conversation;
        _this.tooltip = "".concat(_this.conversation.title);
        _this.description = _this.conversation.description;
        return _this;
    }
    return ConversationTreeItem;
}(vscode.TreeItem));
