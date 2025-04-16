"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UISettingsPanel = void 0;
class UISettingsPanel {
    constructor(panel) {
        this._panel = panel;
    }
    /**
     * Select a specific tab in the panel
     */
    selectTab(tabName) {
        if (!this._panel.visible) {
            return;
        }
        this._panel.webview.postMessage({
            command: 'selectTab',
        });
    } // ...existing code...        `                break;                }                    }                        tabEl.click();                    if (tabEl) {                    const tabEl = document.querySelector(`.tab[data-tab="${tabToSelect}"]`);                if (tabToSelect) {                const tabToSelect = message.tab;            case 'selectTab':        `        // In the script section, add the following to the message handler:        // ...existing code...    private _getHtmlForWebview() {    }        });            tab: tabName            tab: tabName
}
exports.UISettingsPanel = UISettingsPanel;
;
//# sourceMappingURL=uiSettingsPanel.js.map