/**
 * Graph algorithms visualization
 */
VizRegistry.register('graph', {
    category: 'graphs',
    name: 'Graphalgorithmen',
    icon: 'G',
    complexity: { time: 'O(V + E) bis O(E log V)', space: 'O(V + E)' },
    nodes: [],
    edges: [],
    algorithm: 'bfs',
    startNode: 'A',
    nodeStates: {},
    edgeStates: {},
    distances: {},

    init() {
        this.nodes = [
            { id: 'A', x: 90, y: 80 },
            { id: 'B', x: 250, y: 60 },
            { id: 'C', x: 430, y: 110 },
            { id: 'D', x: 130, y: 240 },
            { id: 'E', x: 310, y: 230 },
            { id: 'F', x: 500, y: 250 }
        ];
        this.edges = [
            { from: 'A', to: 'B', weight: 4 },
            { from: 'A', to: 'D', weight: 2 },
            { from: 'B', to: 'C', weight: 6 },
            { from: 'B', to: 'E', weight: 5 },
            { from: 'C', to: 'F', weight: 3 },
            { from: 'D', to: 'E', weight: 7 },
            { from: 'E', to: 'F', weight: 1 },
            { from: 'C', to: 'E', weight: 2 }
        ];
        this.algorithm = 'bfs';
        this.startNode = 'A';
        this.clearState();
        UI.addControls(`
            <select id="graph-alg" onchange="graphViz.setAlgorithm(this.value)">
                <option value="bfs">BFS</option>
                <option value="dfs">DFS</option>
                <option value="dijkstra">Dijkstra</option>
                <option value="prim">Prim</option>
                <option value="kruskal">Kruskal</option>
            </select>
            <select id="graph-start" onchange="graphViz.setStart(this.value)">
                ${this.nodes.map(node => `<option value="${node.id}">${node.id}</option>`).join('')}
            </select>
            <button class="primary" onclick="graphViz.run()">Ausführen</button>
            <button onclick="graphViz.randomizeWeights()">Neue Gewichte</button>
            <button class="danger" onclick="graphViz.reset()">Zurücksetzen</button>
        `);
        this.render();
    },

    destroy() {
        this.clearState();
    },

    clearState() {
        this.nodeStates = {};
        this.edgeStates = {};
        this.distances = {};
        this.nodes.forEach(node => {
            this.nodeStates[node.id] = '';
            this.distances[node.id] = Infinity;
        });
    },

    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
        Renderer.log('ALGO', `${algorithm} ausgewählt`, 'success');
        this.reset();
    },

    setStart(nodeId) {
        this.startNode = nodeId;
        this.reset();
    },

    edgeId(a, b) {
        return [a, b].sort().join('-');
    },

    getNeighbors(nodeId) {
        return this.edges
            .filter(edge => edge.from === nodeId || edge.to === nodeId)
            .map(edge => ({
                id: edge.from === nodeId ? edge.to : edge.from,
                weight: edge.weight,
                edgeId: this.edgeId(edge.from, edge.to)
            }));
    },

    async stepRender() {
        this.render();
        await Renderer.sleep(Math.max(80, Renderer.getDelay() / 2));
    },

    async run() {
        this.reset();
        Renderer.log('START', `${this.algorithm} ab ${this.startNode}`, 'success');
        if (this.algorithm === 'bfs') await this.runBfs();
        if (this.algorithm === 'dfs') await this.runDfs();
        if (this.algorithm === 'dijkstra') await this.runDijkstra();
        if (this.algorithm === 'prim') await this.runPrim();
        if (this.algorithm === 'kruskal') await this.runKruskal();
    },

    async runBfs() {
        const queue = [this.startNode];
        const visited = new Set([this.startNode]);
        const order = [];
        this.nodeStates[this.startNode] = 'in-cloud';
        await this.stepRender();

        while (queue.length) {
            const current = queue.shift();
            this.nodeStates[current] = 'current';
            order.push(current);
            await this.stepRender();

            for (const neighbor of this.getNeighbors(current)) {
                if (visited.has(neighbor.id)) continue;
                visited.add(neighbor.id);
                queue.push(neighbor.id);
                this.edgeStates[neighbor.edgeId] = 'discovery';
                this.nodeStates[neighbor.id] = 'in-cloud';
                await this.stepRender();
            }
            this.nodeStates[current] = 'visited';
        }
        Renderer.log('ORDER', `BFS: ${order.join(' -> ')}`, 'success');
    },

    async runDfs() {
        const visited = new Set();
        const order = [];
        const visit = async (nodeId, parentId = null) => {
            visited.add(nodeId);
            order.push(nodeId);
            this.nodeStates[nodeId] = 'current';
            await this.stepRender();

            for (const neighbor of this.getNeighbors(nodeId)) {
                if (neighbor.id === parentId) continue;
                if (!visited.has(neighbor.id)) {
                    this.edgeStates[neighbor.edgeId] = 'discovery';
                    await visit(neighbor.id, nodeId);
                    this.nodeStates[nodeId] = 'current';
                    await this.stepRender();
                } else if (!this.edgeStates[neighbor.edgeId]) {
                    this.edgeStates[neighbor.edgeId] = 'back';
                }
            }
            this.nodeStates[nodeId] = 'visited';
            await this.stepRender();
        };

        await visit(this.startNode);
        Renderer.log('ORDER', `DFS: ${order.join(' -> ')}`, 'success');
    },

    async runDijkstra() {
        const unsettled = new Set(this.nodes.map(node => node.id));
        this.distances[this.startNode] = 0;

        while (unsettled.size) {
            let current = null;
            unsettled.forEach(nodeId => {
                if (current === null || this.distances[nodeId] < this.distances[current]) {
                    current = nodeId;
                }
            });
            if (current === null || this.distances[current] === Infinity) break;
            unsettled.delete(current);
            this.nodeStates[current] = 'current';
            await this.stepRender();

            for (const neighbor of this.getNeighbors(current)) {
                if (!unsettled.has(neighbor.id)) continue;
                const nextDistance = this.distances[current] + neighbor.weight;
                this.edgeStates[neighbor.edgeId] = 'current';
                if (nextDistance < this.distances[neighbor.id]) {
                    this.distances[neighbor.id] = nextDistance;
                    this.nodeStates[neighbor.id] = 'in-cloud';
                    Renderer.log('RELAX', `${current} -> ${neighbor.id} = ${nextDistance}`, 'warning');
                }
                await this.stepRender();
                if (this.edgeStates[neighbor.edgeId] === 'current') {
                    this.edgeStates[neighbor.edgeId] = 'visited';
                }
            }
            this.nodeStates[current] = 'visited';
        }
        Renderer.log('DIST', Object.entries(this.distances).map(([node, dist]) => `${node}:${dist === Infinity ? 'inf' : dist}`).join(' | '), 'success');
    },

    async runPrim() {
        const inTree = new Set();
        const key = {};
        const parent = {};
        this.nodes.forEach(node => {
            key[node.id] = Infinity;
            parent[node.id] = null;
        });
        key[this.startNode] = 0;

        while (inTree.size < this.nodes.length) {
            let current = null;
            this.nodes.forEach(node => {
                if (!inTree.has(node.id) && (current === null || key[node.id] < key[current])) {
                    current = node.id;
                }
            });
            if (current === null) break;

            inTree.add(current);
            this.nodeStates[current] = 'current';
            if (parent[current]) {
                this.edgeStates[this.edgeId(current, parent[current])] = 'mst';
            }
            await this.stepRender();
            this.nodeStates[current] = 'visited';

            for (const neighbor of this.getNeighbors(current)) {
                if (inTree.has(neighbor.id)) continue;
                if (neighbor.weight < key[neighbor.id]) {
                    key[neighbor.id] = neighbor.weight;
                    parent[neighbor.id] = current;
                    this.nodeStates[neighbor.id] = 'in-cloud';
                    await this.stepRender();
                }
            }
        }
        Renderer.log('MST', 'Prim-MST berechnet', 'success');
    },

    async runKruskal() {
        const parent = {};
        const find = node => {
            if (parent[node] !== node) parent[node] = find(parent[node]);
            return parent[node];
        };
        const unite = (a, b) => {
            const rootA = find(a);
            const rootB = find(b);
            if (rootA === rootB) return false;
            parent[rootB] = rootA;
            return true;
        };

        this.nodes.forEach(node => { parent[node.id] = node.id; });
        const sortedEdges = [...this.edges].sort((a, b) => a.weight - b.weight);

        for (const edge of sortedEdges) {
            const id = this.edgeId(edge.from, edge.to);
            this.edgeStates[id] = 'current';
            await this.stepRender();
            if (unite(edge.from, edge.to)) {
                this.edgeStates[id] = 'mst';
                this.nodeStates[edge.from] = 'visited';
                this.nodeStates[edge.to] = 'visited';
                Renderer.log('ACCEPT', `${edge.from}-${edge.to} (${edge.weight})`, 'success');
            } else {
                this.edgeStates[id] = 'rejected';
                Renderer.log('REJECT', `${edge.from}-${edge.to} (${edge.weight})`, 'warning');
            }
            await this.stepRender();
        }
    },

    randomizeWeights() {
        this.edges = this.edges.map(edge => ({ ...edge, weight: Renderer.randomInt(1, 9) }));
        Renderer.log('WEIGHTS', 'Neue Kantengewichte gesetzt', 'success');
        this.reset();
    },

    reset() {
        this.clearState();
        this.render();
    },

    render() {
        const c = UI.getContainer();
        c.innerHTML = '<div class="graph-container"></div>';
        const host = c.firstElementChild;
        const svg = Renderer.createSVG(host, 620, 360);

        this.edges.forEach(edge => {
            const from = this.nodes.find(node => node.id === edge.from);
            const to = this.nodes.find(node => node.id === edge.to);
            const id = this.edgeId(edge.from, edge.to);
            const state = this.edgeStates[id] || '';
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', `graph-edge ${state}`);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', to.x);
            line.setAttribute('y2', to.y);
            group.appendChild(line);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', (from.x + to.x) / 2);
            label.setAttribute('y', (from.y + to.y) / 2 - 8);
            label.textContent = edge.weight;
            group.appendChild(label);
            svg.appendChild(group);
        });

        this.nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', `graph-node ${this.nodeStates[node.id] || ''}`);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 22);
            group.appendChild(circle);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', node.x);
            label.setAttribute('y', node.y);
            label.textContent = node.id;
            group.appendChild(label);

            if (this.distances[node.id] !== Infinity) {
                const dist = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                dist.setAttribute('x', node.x);
                dist.setAttribute('y', node.y + 32);
                dist.setAttribute('class', 'dist-label');
                dist.textContent = this.distances[node.id];
                group.appendChild(dist);
            }
            svg.appendChild(group);
        });

        const info = document.createElement('div');
        info.style.cssText = 'margin-top:12px;font-size:13px;color:var(--text-secondary)';
        info.innerHTML = `Algorithmus: <b>${this.algorithm}</b> | Start: <b>${this.startNode}</b> |
            Knoten: <b>${this.nodes.length}</b> | Kanten: <b>${this.edges.length}</b>`;
        c.appendChild(info);
        memSim.layoutGraph(this.nodes.length, this.edges.length);
    }
});

const graphViz = VizRegistry.get('graph');