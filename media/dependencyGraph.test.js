const { JSDOM } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock D3.js
const mockD3 = {
    create: jest.fn(() => ({
        attr: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
        data: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        call: jest.fn().mockReturnThis(),
        node: jest.fn().mockReturnValue(document.createElement('svg'))
    })),
    forceSimulation: jest.fn(() => ({
        force: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        alphaTarget: jest.fn().mockReturnThis(),
        restart: jest.fn(),
        stop: jest.fn()
    })),
    scaleOrdinal: jest.fn(() => ({
        domain: jest.fn().mockReturnThis(),
        range: jest.fn()
    })),
    forceLink: jest.fn(),
    forceManyBody: jest.fn(() => ({
        strength: jest.fn()
    })),
    forceCenter: jest.fn(),
    forceCollide: jest.fn(() => ({
        radius: jest.fn()
    })),
    zoom: jest.fn(() => ({
        scaleExtent: jest.fn().mockReturnThis(),
        on: jest.fn()
    })),
    drag: jest.fn(() => ({
        on: jest.fn().mockReturnThis()
    }))
};

describe('Dependency Graph', () => {
    let dom;
    let document;
    let window;
    let vscode;
    let d3;

    beforeEach(() => {
        // Mock VS Code API
        vscode = {
            postMessage: jest.fn()
        };
        global.acquireVsCodeApi = () => vscode;
        global.d3 = mockD3;

        // Set up DOM environment
        const html = `
            <html>
                <body>
                    <div id="graph-visualization"></div>
                    <div id="graph-placeholder"></div>
                </body>
            </html>
        `;

        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost'
        });
        document = dom.window.document;
        window = dom.window;

        // Load the dependencyGraph.js script
        const graphScript = require('fs').readFileSync(require('path').join(__dirname, 'dependencyGraph.js'), 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.textContent = graphScript;
        document.body.appendChild(scriptEl);
    });

    describe('initialization', () => {
        test('requests initial graph data on load', () => {
            expect(vscode.postMessage).toHaveBeenCalledWith({
                command: 'getGraph'
            });
        });
    });

    describe('message handling', () => {
        test('handles graph update message', () => {
            const mockGraph = {
                nodes: [
                    { id: '1', name: 'file1.js', type: 'file', path: '/src/file1.js' },
                    { id: '2', name: 'file2.js', type: 'file', path: '/src/file2.js' }
                ],
                links: [
                    { source: '1', target: '2', type: 'import' }
                ]
            };

            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            // Check if graph container is visible
            const container = document.getElementById('graph-visualization');
            const placeholder = document.getElementById('graph-placeholder');
            expect(container.style.display).toBe('block');
            expect(placeholder.style.display).toBe('none');
        });

        test('shows placeholder when graph is empty', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: { nodes: [], links: [] }
                }
            });
            window.dispatchEvent(event);

            const container = document.getElementById('graph-visualization');
            const placeholder = document.getElementById('graph-placeholder');
            expect(container.style.display).toBe('none');
            expect(placeholder.style.display).toBe('flex');
        });

        test('handles null graph data gracefully', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: null
                }
            });
            window.dispatchEvent(event);

            const container = document.getElementById('graph-visualization');
            const placeholder = document.getElementById('graph-placeholder');
            expect(container.style.display).toBe('none');
            expect(placeholder.style.display).toBe('flex');
        });

        test('handles graph with nodes but no links', () => {
            const mockGraph = {
                nodes: [
                    { id: '1', name: 'file1.js', type: 'file', path: '/src/file1.js' }
                ],
                links: []
            };

            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            expect(d3.forceSimulation).toHaveBeenCalledWith(mockGraph.nodes);
            expect(d3.forceLink).toHaveBeenCalledWith([]);
        });

        test('handles undefined nodes or links gracefully', () => {
            const mockGraph = {
                nodes: undefined,
                links: undefined
            };

            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            const container = document.getElementById('graph-visualization');
            const placeholder = document.getElementById('graph-placeholder');
            expect(container.style.display).toBe('none');
            expect(placeholder.style.display).toBe('flex');
        });
    });

    describe('graph visualization', () => {
        const mockGraph = {
            nodes: [
                { id: '1', name: 'file1.js', type: 'file', size: 100 },
                { id: '2', name: 'pkg1', type: 'package', size: 200 },
                { id: '3', name: 'external1', type: 'external' }
            ],
            links: [
                { source: '1', target: '2', type: 'dependency', strength: 2 },
                { source: '2', target: '3', type: 'import' }
            ]
        };

        test('creates force simulation with correct configuration', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            expect(d3.forceSimulation).toHaveBeenCalledWith(mockGraph.nodes);
            expect(d3.forceLink).toHaveBeenCalledWith(mockGraph.links);
        });

        test('creates color scale with correct domain', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            expect(d3.scaleOrdinal().domain).toHaveBeenCalledWith(['file', 'package', 'external']);
        });

        test('adds zoom functionality', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            expect(d3.zoom().scaleExtent).toHaveBeenCalledWith([0.2, 5]);
        });

        test('creates legend with all node and link types', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            const legend = document.querySelector('.legend');
            expect(legend).toBeTruthy();
            expect(legend.querySelectorAll('.legend-item').length).toBe(6);
            expect(legend.innerHTML).toContain('File');
            expect(legend.innerHTML).toContain('Package');
            expect(legend.innerHTML).toContain('External');
            expect(legend.innerHTML).toContain('Dependency');
            expect(legend.innerHTML).toContain('ES Import');
            expect(legend.innerHTML).toContain('Require');
        });

        test('handles different node size properties', () => {
            const mockGraph = {
                nodes: [
                    { id: '1', name: 'file1.js', type: 'file', size: 100 },
                    { id: '2', name: 'file2.js', type: 'file' } // No size property
                ],
                links: []
            };

            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            expect(d3.forceSimulation).toHaveBeenCalledWith(mockGraph.nodes);
        });

        test('renders nodes with different link types correctly', () => {
            const mockGraph = {
                nodes: [
                    { id: '1', name: 'file1.js', type: 'file' },
                    { id: '2', name: 'file2.js', type: 'file' },
                    { id: '3', name: 'file3.js', type: 'file' }
                ],
                links: [
                    { source: '1', target: '2', type: 'dependency' },
                    { source: '2', target: '3', type: 'import' },
                    { source: '1', target: '3', type: 'require' }
                ]
            };

            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            expect(d3.forceSimulation).toHaveBeenCalledWith(mockGraph.nodes);
            expect(d3.forceLink).toHaveBeenCalledWith(mockGraph.links);
        });

        test('updates container when graph changes', () => {
            // First render an empty graph
            window.dispatchEvent(new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: { nodes: [], links: [] }
                }
            }));

            const container = document.getElementById('graph-visualization');
            const placeholder = document.getElementById('graph-placeholder');

            // Then update with a non-empty graph
            window.dispatchEvent(new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            }));

            expect(container.style.display).toBe('block');
            expect(placeholder.style.display).toBe('none');
        });

        test('cleans up resources when destroyed', () => {
            // First render a graph
            window.dispatchEvent(new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            }));

            // Then destroy it by rendering an empty container
            const container = document.getElementById('graph-visualization');
            container.innerHTML = '';

            // Create a new graph with an empty container
            window.dispatchEvent(new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            }));

            // Check that the container has been updated
            expect(container.innerHTML).not.toBe('');
        });
    });

    describe('drag behavior', () => {
        const mockGraph = {
            nodes: [
                { id: '1', name: 'file1.js', type: 'file' }
            ],
            links: []
        };

        test('creates drag behavior with correct callbacks', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: mockGraph
                }
            });
            window.dispatchEvent(event);

            expect(d3.drag().on).toHaveBeenCalledTimes(3);
        });
    });

    describe('error handling', () => {
        test('handles malformed graph data gracefully', () => {
            const malformedGraph = {
                nodes: "not an array",
                links: { invalid: "structure" }
            };

            const event = new window.MessageEvent('message', {
                data: {
                    command: 'updateGraph',
                    graph: malformedGraph
                }
            });

            // Should not throw an error
            expect(() => window.dispatchEvent(event)).not.toThrow();
        });
    });
});
