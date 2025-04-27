"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExampleSearch = void 0;
const CodeExampleSearchService_1 = require("./services/CodeExampleSearchService");
class CodeExampleSearch {
    constructor(context) {
        this.service = new CodeExampleSearchService_1.CodeExampleSearchService(context);
    }
    async searchExamples(query, language) {
        return this.service.searchExamples(query, language);
    }
    async showExampleUI(examples) {
        return this.service.showExampleUI(examples);
    }
}
exports.CodeExampleSearch = CodeExampleSearch;
//# sourceMappingURL=codeExampleSearch.js.map