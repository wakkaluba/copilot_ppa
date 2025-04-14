import * as vscode from 'vscode';
import * as path from 'path';
import { DependencyGraph } from '../tools/dependencyAnalyzer';

export class DependencyGraphViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'localLlmAgent.dependencyGraphView';
    
    private _view?: vscode.WebviewView;
    
    constructor(
        private readonly _extensionUri: vscode.Uri
    ) {}
    
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showInformationMessage(message.text);
                    return;
            }
        });
    }
    
    /**
     * Update the dependency graph visualization
     * @param graph The dependency graph to visualize
     */
    public updateGraph(graph: DependencyGraph): void {
        if (this._view) {
            this._view.webview.postMessage({ command: 'updateGraph', graph });
        }
    }
    
    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get the local path to scripts
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'dependencyGraph.js')
        );
        
        // Get CSS file
        const styleMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'dependencyGraph.css')
        );
        
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>Dependency Graph</title>
            </head>
            <body>
                <div class="container">
                    <h1>Dependency Graph</h1>
                    <div id="graph-container">
                        <div id="graph-placeholder">No dependency graph to display. Run the "Analyze Dependencies" command to generate a graph.</div>
                        <div id="graph-visualization"></div>
                    </div>
                </div>
                
                <script nonce="${nonce}" src="${scriptUri}"></script>
                <script nonce="${nonce}">
                    (function () {
                        const vscode = acquireVsCodeApi();
                        let graph = null;
                        
                        // Handle messages from the extension
                        window.addEventListener('message', event => {
                            const message = event.data;
                            
                            switch (message.command) {
                                case 'updateGraph':
                                    graph = message.graph;
                                    renderGraph(message.graph);
                                    break;
                            }
                        });
                        
                        function renderGraph(graph) {
                            const container = document.getElementById('graph-visualization');
                            if (!container) return;
                            
                            // Clear the container
                            container.innerHTML = '';
                            
                            if (!graph || !graph.nodes || !graph.links || graph.nodes.length === 0) {
                                container.innerHTML = '<div class="empty-state">No dependency data available</div>';
                                return;
                            }
                            
                            // Use D3.js to create a force-directed graph
                            const width = container.clientWidth;
                            const height = container.clientHeight || 500;
                            
                            // Create SVG element
                            const svg = d3.create('svg')
                                .attr('width', width)
                                .attr('height', height)
                                .attr('viewBox', [0, 0, width, height])
                                .attr('style', 'max-width: 100%; height: auto;');
                            
                            // Create a force simulation
                            const simulation = d3.forceSimulation(graph.nodes)
                                .force('link', d3.forceLink(graph.links).id(d => d.id).distance(100))
                                .force('charge', d3.forceManyBody().strength(-300))
                                .force('center', d3.forceCenter(width / 2, height / 2))
                                .force('collision', d3.forceCollide().radius(30));
                            
                            // Define arrow markers for links
                            svg.append('defs').selectAll('marker')
                                .data(['dependency', 'import', 'require'])
                                .join('marker')
                                .attr('id', d => `arrow-${d}`)
                                .attr('viewBox', '0 -5 10 10')
                                .attr('refX', 15)
                                .attr('refY', 0)
                                .attr('markerWidth', 6)
                                .attr('markerHeight', 6)
                                .attr('orient', 'auto')
                                .append('path')
                                .attr('fill', d => d === 'dependency' ? '#999' : d === 'import' ? '#569cd6' : '#4ec9b0')
                                .attr('d', 'M0,-5L10,0L0,5');
                            
                            // Create links
                            const link = svg.append('g')
                                .attr('stroke-opacity', 0.6)
                                .selectAll('line')
                                .data(graph.links)
                                .join('line')
                                .attr('stroke', d => d.type === 'dependency' ? '#999' : d.type === 'import' ? '#569cd6' : '#4ec9b0')
                                .attr('stroke-width', d => d.strength ? d.strength * 2 : 1.5)
                                .attr('marker-end', d => `url(#arrow-${d.type})`);
                            
                            // Create node groups
                            const node = svg.append('g')
                                .selectAll('.node')
                                .data(graph.nodes)
                                .join('g')
                                .attr('class', 'node')
                                .call(drag(simulation));
                            
                            // Node circles with different colors based on type
                            node.append('circle')
                                .attr('r', d => d.size ? Math.sqrt(d.size) / 10 + 5 : 8)
                                .attr('fill', d => {
                                    switch (d.type) {
                                        case 'file': return '#c586c0';
                                        case 'package': return '#ce9178';
                                        case 'external': return '#dcdcaa';
                                        default: return '#888';
                                    }
                                })
                                .attr('stroke', '#fff')
                                .attr('stroke-width', 1.5);
                            
                            // Add text labels to nodes
                            node.append('text')
                                .attr('dx', 12)
                                .attr('dy', '.35em')
                                .text(d => d.name)
                                .attr('font-size', '10px')
                                .attr('fill', '#e6e6e6');
                            
                            // Add title for hover tooltip
                            node.append('title')
                                .text(d => `${d.name}\nType: ${d.type}\nPath: ${d.path}`);
                            
                            // Update positions on simulation tick
                            simulation.on('tick', () => {
                                link
                                    .attr('x1', d => d.source.x)
                                    .attr('y1', d => d.source.y)
                                    .attr('x2', d => d.target.x)
                                    .attr('y2', d => d.target.y);
                                
                                node.attr('transform', d => `translate(${d.x},${d.y})`);
                            });
                            
                            // Drag behavior function
                            function drag(simulation) {
                                function dragstarted(event) {
                                    if (!event.active) simulation.alphaTarget(0.3).restart();
                                    event.subject.fx = event.subject.x;
                                    event.subject.fy = event.subject.y;
                                }
                                
                                function dragged(event) {
                                    event.subject.fx = event.x;
                                    event.subject.fy = event.y;
                                }
                                
                                function dragended(event) {
                                    if (!event.active) simulation.alphaTarget(0);
                                    event.subject.fx = null;
                                    event.subject.fy = null;
                                }
                                
                                return d3.drag()
                                    .on('start', dragstarted)
                                    .on('drag', dragged)
                                    .on('end', dragended);
                            }
                            
                            // Append the SVG to the container
                            container.appendChild(svg.node());
                            
                            // Add legend
                            const legend = document.createElement('div');
                            legend.className = 'legend';
                            legend.innerHTML = `
                                <div class="legend-item"><span class="legend-dot file"></span> File</div>
                                <div class="legend-item"><span class="legend-dot package"></span> Package</div>
                                <div class="legend-item"><span class="legend-dot external"></span> External</div>
                                <div class="legend-item"><span class="legend-line dependency"></span> Dependency</div>
                                <div class="legend-item"><span class="legend-line import"></span> ES Import</div>
                                <div class="legend-item"><span class="legend-line require"></span> Require</div>
                            `;
                            container.appendChild(legend);
                        }
                        
                        // Request initial data
                        vscode.postMessage({
                            command: 'requestData'
                        });
                    })();
                </script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
