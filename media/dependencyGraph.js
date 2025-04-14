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
        const placeholder = document.getElementById('graph-placeholder');
        
        if (!graph || !graph.nodes || graph.nodes.length === 0) {
            container.style.display = 'none';
            placeholder.style.display = 'flex';
            return;
        }
        
        container.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Clear previous graph
        container.innerHTML = '';
        
        // Create a proper dependency graph visualization
        createDependencyGraph('graph-visualization', graph);
    }
    
    // D3.js Dependency Graph Visualization

    // Function to create a force-directed graph
    function createDependencyGraph(containerId, graphData) {
        // Get the container dimensions
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const width = container.clientWidth;
        const height = Math.max(container.clientHeight, 500);
        
        // Clear previous content
        container.innerHTML = '';
        
        if (!graphData || !graphData.nodes || !graphData.links || graphData.nodes.length === 0) {
            container.innerHTML = '<div class="empty-state">No dependency data available</div>';
            return;
        }
        
        // Create SVG element
        const svg = d3.create('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto;');
        
        // Set up a color scale for node types
        const color = d3.scaleOrdinal()
            .domain(['file', 'package', 'external'])
            .range(['#c586c0', '#ce9178', '#dcdcaa']);
        
        // Create a force simulation
        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
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
            .data(graphData.links)
            .join('line')
            .attr('stroke', d => d.type === 'dependency' ? '#999' : d.type === 'import' ? '#569cd6' : '#4ec9b0')
            .attr('stroke-width', d => d.strength ? d.strength * 2 : 1.5)
            .attr('marker-end', d => `url(#arrow-${d.type})`);
        
        // Create node groups
        const node = svg.append('g')
            .selectAll('.node')
            .data(graphData.nodes)
            .join('g')
            .attr('class', 'node')
            .call(drag(simulation));
        
        // Node circles with different colors based on type
        node.append('circle')
            .attr('r', d => d.size ? Math.sqrt(d.size) / 10 + 5 : 8)
            .attr('fill', d => color(d.type))
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
        
        // Add zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([0.2, 5])
            .on('zoom', (event) => {
                svg.selectAll('g').attr('transform', event.transform);
            });
        
        svg.call(zoom);
        
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
        
        return {
            update: function(newData) {
                // TODO: Implement update functionality
            },
            destroy: function() {
                simulation.stop();
                container.innerHTML = '';
            }
        };
    }
    
    // Message the extension to get the initial state
    vscode.postMessage({ command: 'getGraph' });
})();
