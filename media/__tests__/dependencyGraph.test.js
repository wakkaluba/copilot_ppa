// filepath: d:\___coding\tools\copilot_ppa\media\__tests__\dependencyGraph.test.js

describe('Dependency Graph UI', () => {
    let mockVSCode;
    let mockD3;
    let container;
    let placeholder;

    // Mock the D3.js functionality before tests
    beforeEach(() => {
        // Create mock DOM structure
        document.body.innerHTML = `
            <div id="graph-visualization"></div>
            <div id="graph-placeholder" style="display: none;"></div>
        `;

        // Get DOM elements
        container = document.getElementById('graph-visualization');
        placeholder = document.getElementById('graph-placeholder');

        // Mock VS Code API
        mockVSCode = {
            postMessage: jest.fn()
        };
        global.acquireVsCodeApi = jest.fn(() => mockVSCode);

        // Mock D3.js methods
        mockD3 = {
            create: jest.fn().mockReturnThis(),
            attr: jest.fn().mockReturnThis(),
            append: jest.fn().mockReturnThis(),
            selectAll: jest.fn().mockReturnThis(),
            data: jest.fn().mockReturnThis(),
            join: jest.fn().mockReturnThis(),
            forceSimulation: jest.fn().mockReturnValue({
                force: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis()
            }),
            forceManyBody: jest.fn().mockReturnValue({
                strength: jest.fn().mockReturnThis()
            }),
            forceLink: jest.fn().mockReturnValue({
                id: jest.fn().mockReturnThis(),
                distance: jest.fn().mockReturnThis()
            }),
            forceCenter: jest.fn().mockReturnThis(),
            forceCollide: jest.fn().mockReturnValue({
                radius: jest.fn().mockReturnThis()
            }),
            scaleOrdinal: jest.fn().mockReturnValue({
                domain: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis()
            }),
            zoom: jest.fn().mockReturnValue({
                scaleExtent: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis()
            }),
            drag: jest.fn().mockReturnValue({
                on: jest.fn().mockReturnThis()
            }),
            node: jest.fn().mockReturnValue({})
        };

        global.d3 = mockD3;

        // Define a spy on the createDependencyGraph function that will be defined
        // in the dependencyGraph.js file
        jest.spyOn(global, 'createDependencyGraph');

        // Load the script under test
        require('../dependencyGraph.js');
    });

    afterEach(() => {
        jest.resetModules();
        document.body.innerHTML = '';
        jest.restoreAllMocks();
        delete global.d3;
    });

    describe('Message Handling', () => {
        test('should initialize and request graph data on load', () => {
            // Verify that the script sends a request for initial graph data
            expect(mockVSCode.postMessage).toHaveBeenCalledWith({ command: 'getGraph' });
        });

        test('should update graph when receiving updateGraph message', () => {
            // Sample graph data
            const graphData = {
                nodes: [
                    { id: 'node1', name: 'File1', type: 'file', path: '/path/to/file1.js', size: 100 },
                    { id: 'node2', name: 'Package1', type: 'package', path: '/path/to/package1', size: 200 }
                ],
                links: [
                    { source: 'node1', target: 'node2', type: 'dependency', strength: 2 }
                ]
            };

            // Send updateGraph message
            window.dispatchEvent(new MessageEvent('message', {
                data: { command: 'updateGraph', graph: graphData }
            }));

            // Verify createDependencyGraph was called with the right parameters
            expect(global.createDependencyGraph).toHaveBeenCalledWith('graph-visualization', graphData);
        });
    });

    describe('Graph Rendering', () => {
        test('should show placeholder when graph data is empty', () => {
            // Send updateGraph message with empty graph
            window.dispatchEvent(new MessageEvent('message', {
                data: { command: 'updateGraph', graph: { nodes: [], links: [] } }
            }));

            // Verify placeholder is shown and container is hidden
            expect(container.style.display).toBe('none');
            expect(placeholder.style.display).toBe('flex');
        });

        test('should show placeholder when graph data is null', () => {
            // Send updateGraph message with null graph
            window.dispatchEvent(new MessageEvent('message', {
                data: { command: 'updateGraph', graph: null }
            }));

            // Verify placeholder is shown and container is hidden
            expect(container.style.display).toBe('none');
            expect(placeholder.style.display).toBe('flex');
        });

        test('should show graph container when valid graph data is received', () => {
            // Sample valid graph data
            const graphData = {
                nodes: [
                    { id: 'node1', name: 'File1', type: 'file', path: '/path/to/file1.js', size: 100 }
                ],
                links: []
            };

            // Send updateGraph message
            window.dispatchEvent(new MessageEvent('message', {
                data: { command: 'updateGraph', graph: graphData }
            }));

            // Verify container is shown and placeholder is hidden
            expect(container.style.display).toBe('block');
            expect(placeholder.style.display).toBe('none');
        });
    });

    describe('D3.js Integration', () => {
        test('should create force-directed graph with D3', () => {
            // Create sample graph data with various node types and link types
            const graphData = {
                nodes: [
                    { id: 'file1', name: 'main.js', type: 'file', path: '/src/main.js', size: 150 },
                    { id: 'pkg1', name: 'lodash', type: 'package', path: 'node_modules/lodash', size: 300 },
                    { id: 'ext1', name: 'react', type: 'external', path: 'external/react', size: 250 }
                ],
                links: [
                    { source: 'file1', target: 'pkg1', type: 'dependency', strength: 1 },
                    { source: 'file1', target: 'ext1', type: 'import', strength: 2 },
                    { source: 'pkg1', target: 'ext1', type: 'require', strength: 3 }
                ]
            };

            // Directly call createDependencyGraph (which is exposed globally in the tested script)
            window.dispatchEvent(new MessageEvent('message', {
                data: { command: 'updateGraph', graph: graphData }
            }));

            // Verify expected D3 methods were called for graph creation
            expect(d3.create).toHaveBeenCalled();
            expect(d3.scaleOrdinal).toHaveBeenCalled();
            expect(d3.forceSimulation).toHaveBeenCalledWith(graphData.nodes);
            expect(d3.forceLink).toHaveBeenCalledWith(graphData.links);
        });

        test('should handle different node and link types correctly', () => {
            // Create sample graph data with various node types and link types
            const graphData = {
                nodes: [
                    { id: 'file1', name: 'main.js', type: 'file', path: '/src/main.js', size: 150 },
                    { id: 'pkg1', name: 'lodash', type: 'package', path: 'node_modules/lodash', size: 300 },
                    { id: 'ext1', name: 'react', type: 'external', path: 'external/react', size: 250 }
                ],
                links: [
                    { source: 'file1', target: 'pkg1', type: 'dependency', strength: 1 },
                    { source: 'file1', target: 'ext1', type: 'import', strength: 2 },
                    { source: 'pkg1', target: 'ext1', type: 'require', strength: 3 }
                ]
            };

            // Call createDependencyGraph through the message handler
            window.dispatchEvent(new MessageEvent('message', {
                data: { command: 'updateGraph', graph: graphData }
            }));

            // Verify the color scale was set up with the correct domains
            expect(d3.scaleOrdinal).toHaveBeenCalled();
            const domainCall = mockD3.scaleOrdinal().domain;
            expect(domainCall).toHaveBeenCalledWith(['file', 'package', 'external']);
        });
    });

    describe('Error Handling', () => {
        test('should handle unexpected message types gracefully', () => {
            // Send an unexpected message type
            window.dispatchEvent(new MessageEvent('message', {
                data: { command: 'unknownCommand', someData: 'test' }
            }));

            // Verify nothing breaks (no exception thrown)
            // And the container state remains unchanged
            expect(container.style.display).not.toBe('none');
            expect(placeholder.style.display).toBe('none');
        });
    });
});
