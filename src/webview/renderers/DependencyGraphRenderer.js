"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraphRenderer = void 0;
var DependencyGraphRenderer = /** @class */ (function () {
    function DependencyGraphRenderer() {
    }
    DependencyGraphRenderer.prototype.render = function (dependencies) {
        return "\n            <!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Dependency Graph</title>\n                <style>\n                    ".concat(this.getStyles(), "\n                </style>\n                <script src=\"https://d3js.org/d3.v7.min.js\"></script>\n            </head>\n            <body>\n                <div id=\"graph\"></div>\n                <div id=\"controls\">\n                    <button onclick=\"refreshGraph()\">Refresh</button>\n                    <button onclick=\"exportSvg()\">Export SVG</button>\n                </div>\n                <script>\n                    ").concat(this.getScript(dependencies), "\n                </script>\n            </body>\n            </html>\n        ");
    };
    DependencyGraphRenderer.prototype.getStyles = function () {
        return "\n            body { margin: 0; padding: 20px; }\n            #graph { width: 100%; height: calc(100vh - 100px); }\n            #controls { position: fixed; top: 20px; right: 20px; }\n            .node { cursor: pointer; }\n            .link { stroke: #999; stroke-opacity: 0.6; }\n        ";
    };
    DependencyGraphRenderer.prototype.getScript = function (dependencies) {
        return "\n            const vscode = acquireVsCodeApi();\n            const data = ".concat(JSON.stringify(dependencies), ";\n\n            function refreshGraph() {\n                vscode.postMessage({ command: 'refresh', workspaceRoot: data.workspaceRoot });\n            }\n\n            function exportSvg() {\n                const svg = document.querySelector('svg');\n                vscode.postMessage({ command: 'exportSvg', data: svg.outerHTML });\n            }\n\n            // D3.js graph initialization and rendering code here\n            // (Implementation details omitted for brevity)\n        ");
    };
    return DependencyGraphRenderer;
}());
exports.DependencyGraphRenderer = DependencyGraphRenderer;
