export class UISettingsPanel {
    private _panel: vscode.WebviewPanel;

    constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
    }

    /**
     * Select a specific tab in the panel
     */
    public selectTab(tabName: string): void {
        if (!this._panel.visible) {
            return;
        }
        
        this._panel.webview.postMessage({
            command: 'selectTab',






















}    }        // ...existing code...        `                break;                }                    }                        tabEl.click();                    if (tabEl) {                    const tabEl = document.querySelector(`.tab[data-tab="${tabToSelect}"]`);                if (tabToSelect) {                const tabToSelect = message.tab;            case 'selectTab':        `        // In the script section, add the following to the message handler:        // ...existing code...    private _getHtmlForWebview() {    }        });            tab: tabName            tab: tabName
        });
    }
}