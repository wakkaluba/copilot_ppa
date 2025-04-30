"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCodeActionProvider = void 0;
const vscode = __importStar(require("vscode"));
class AgentCodeActionProvider {
    static providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
        vscode.CodeActionKind.RefactorRewrite
    ];
    async provideCodeActions(document, range, context, token) {
        const actions = [];
        // Add explain code action
        const explainAction = new vscode.CodeAction('Explain this code', vscode.CodeActionKind.QuickFix);
        explainAction.command = {
            command: 'copilot-ppa.explainCode',
            title: 'Explain Code',
            arguments: [document, range]
        };
        actions.push(explainAction);
        // Add suggest improvements action
        const improveAction = new vscode.CodeAction('Suggest improvements', vscode.CodeActionKind.RefactorRewrite);
        improveAction.command = {
            command: 'copilot-ppa.suggestImprovements',
            title: 'Suggest Improvements',
            arguments: [document, range]
        };
        actions.push(improveAction);
        return actions;
    }
}
exports.AgentCodeActionProvider = AgentCodeActionProvider;
//# sourceMappingURL=AgentCodeActionProvider.js.map