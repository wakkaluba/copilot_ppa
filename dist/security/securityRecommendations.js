"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityRecommendations = void 0;
const RecommendationGenerator_1 = require("./recommendations/RecommendationGenerator");
const HtmlRenderer_1 = require("./recommendations/HtmlRenderer");
/**
 * Entry point for generating and displaying security recommendations
 */
class SecurityRecommendations {
    context;
    generator;
    constructor(context, codeScanner) {
        this.context = context;
        this.generator = new RecommendationGenerator_1.RecommendationGenerator(codeScanner);
    }
    /**
     * Generate security recommendations
     */
    async generateRecommendations() {
        return await this.generator.generateRecommendations();
    }
    /**
     * Show recommendations in a webview
     */
    async showRecommendations(result) {
        HtmlRenderer_1.HtmlRenderer.showRecommendations(this.context, result);
    }
}
exports.SecurityRecommendations = SecurityRecommendations;
//# sourceMappingURL=securityRecommendations.js.map