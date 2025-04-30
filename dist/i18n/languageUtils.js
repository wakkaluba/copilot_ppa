"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageNames = void 0;
exports.getLanguageName = getLanguageName;
exports.getLanguageByName = getLanguageByName;
exports.isKnownLanguage = isKnownLanguage;
exports.languageNames = new Map([
    ['en', 'English'], ['es', 'Spanish'], ['de', 'German'],
    ['fr', 'French'], ['it', 'Italian'], ['pt', 'Portuguese'],
    ['ja', 'Japanese'], ['ko', 'Korean'], ['zh', 'Chinese'],
    ['ru', 'Russian'], ['ar', 'Arabic'], ['tr', 'Turkish'],
    ['pl', 'Polish'], ['nl', 'Dutch'], ['sv', 'Swedish'],
    ['no', 'Norwegian'], ['fi', 'Finnish'], ['da', 'Danish'],
    ['cs', 'Czech'], ['uk', 'Ukrainian'], ['hu', 'Hungarian'],
    ['th', 'Thai'], ['el', 'Greek']
]);
function getLanguageName(language) {
    return exports.languageNames.get(language) || language;
}
function getLanguageByName(name) {
    for (const [code, langName] of exports.languageNames) {
        if (langName.toLowerCase() === name.toLowerCase()) {
            return code;
        }
    }
    return null;
}
function isKnownLanguage(language) {
    return exports.languageNames.has(language);
}
//# sourceMappingURL=languageUtils.js.map