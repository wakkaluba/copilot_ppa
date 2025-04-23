import { DependencyNode } from '../../services/dependencyGraph/types';

export class DependencyGraphRenderer {
    public render(dependencies: DependencyNode[]): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dependency Graph</title>
                <style>
                    ${this.getStyles()}
                </style>
                <script src="https://d3js.org/d3.v7.min.js"></script>
            </head>
            <body>
                <div id="graph"></div>
                <div id="controls">
                    <button onclick="refreshGraph()">Refresh</button>
                    <button onclick="exportSvg()">Export SVG</button>
                </div>
                <script>
                    ${this.getScript(dependencies)}
                </script>
            </body>
            </html>
        `;
    }

    private getStyles(): string {
        return `
            body { margin: 0; padding: 20px; }
            #graph { width: 100%; height: calc(100vh - 100px); }
            #controls { position: fixed; top: 20px; right: 20px; }
            .node { cursor: pointer; }
            .link { stroke: #999; stroke-opacity: 0.6; }
        `;
    }

    private getScript(dependencies: DependencyNode[]): string {
        return `
            const vscode = acquireVsCodeApi();
            const data = ${JSON.stringify(dependencies)};

            function refreshGraph() {
                vscode.postMessage({ command: 'refresh', workspaceRoot: data.workspaceRoot });
            }

            function exportSvg() {
                const svg = document.querySelector('svg');
                vscode.postMessage({ command: 'exportSvg', data: svg.outerHTML });
            }

            // D3.js graph initialization and rendering code here
            // (Implementation details omitted for brevity)
        `;
    }
}
