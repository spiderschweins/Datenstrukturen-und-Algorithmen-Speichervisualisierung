/**
 * Binary Search Tree Visualization
 */
VizRegistry.register('bst', {
    category: 'trees',
    name: 'Binärer Suchbaum',
    icon: '🌲',
    complexity: { time: 'O(h) — O(log n) bis O(n)', space: 'O(n)' },
    root: null,

    init() {
        this.root = null;
        [30, 15, 45, 8, 22, 38, 55].forEach(v => this.bstInsert(v));
        UI.addControls(`
            <input type="number" id="bst-val" placeholder="Wert" value="25" style="width:80px">
            <button class="primary" onclick="bstViz.insert()">Einfügen</button>
            <button class="danger" onclick="bstViz.remove()">Entfernen</button>
            <button onclick="bstViz.search()">Suchen</button>
            <div class="separator"></div>
            <button onclick="bstViz.inorder()">Inorder</button>
            <button onclick="bstViz.preorder()">Preorder</button>
            <button onclick="bstViz.randomBuild()">Zufällig</button>
            <button class="danger" onclick="bstViz.clear()">Leeren</button>
        `);
        this.render();
    },

    destroy() { this.root = null; },

    makeNode(key) {
        return { key, left: null, right: null, x: 0, y: 0 };
    },

    bstInsert(key) {
        if (!this.root) { this.root = this.makeNode(key); return; }
        let node = this.root;
        while (true) {
            if (key < node.key) {
                if (!node.left) { node.left = this.makeNode(key); return; }
                node = node.left;
            } else if (key > node.key) {
                if (!node.right) { node.right = this.makeNode(key); return; }
                node = node.right;
            } else return; // duplicate
        }
    },

    bstRemove(key) {
        this.root = this._remove(this.root, key);
    },

    _remove(node, key) {
        if (!node) return null;
        if (key < node.key) { node.left = this._remove(node.left, key); }
        else if (key > node.key) { node.right = this._remove(node.right, key); }
        else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            // Find inorder successor
            let succ = node.right;
            while (succ.left) succ = succ.left;
            node.key = succ.key;
            node.right = this._remove(node.right, succ.key);
        }
        return node;
    },

    async insert() {
        const val = parseInt(document.getElementById('bst-val')?.value || 0);
        if (!this.root) {
            this.root = this.makeNode(val);
            Renderer.log('INSERT', `${val} als Wurzel eingefügt`, 'success');
            this.render();
            return;
        }

        let node = this.root;
        let path = [];
        while (true) {
            path.push(node);
            this.render();
            this.highlightPath(path);
            await Renderer.sleep();

            if (val < node.key) {
                Renderer.log('COMPARE', `${val} < ${node.key} → links`);
                if (!node.left) {
                    node.left = this.makeNode(val);
                    Renderer.log('INSERT', `${val} eingefügt`, 'success');
                    break;
                }
                node = node.left;
            } else if (val > node.key) {
                Renderer.log('COMPARE', `${val} > ${node.key} → rechts`);
                if (!node.right) {
                    node.right = this.makeNode(val);
                    Renderer.log('INSERT', `${val} eingefügt`, 'success');
                    break;
                }
                node = node.right;
            } else {
                Renderer.log('DUPLICATE', `${val} existiert bereits`, 'warning');
                break;
            }
        }
        this.render();
    },

    async remove() {
        const val = parseInt(document.getElementById('bst-val')?.value || 0);
        this.bstRemove(val);
        Renderer.log('REMOVE', `${val} entfernt`, 'warning');
        this.render();
    },

    async search() {
        const val = parseInt(document.getElementById('bst-val')?.value || 0);
        let node = this.root;
        let path = [];
        while (node) {
            path.push(node);
            this.render();
            this.highlightPath(path);
            await Renderer.sleep();

            if (val === node.key) {
                Renderer.log('FOUND', `${val} gefunden nach ${path.length} Vergleichen`, 'success');
                return;
            } else if (val < node.key) {
                Renderer.log('COMPARE', `${val} < ${node.key} → links`);
                node = node.left;
            } else {
                Renderer.log('COMPARE', `${val} > ${node.key} → rechts`);
                node = node.right;
            }
        }
        Renderer.log('NOT_FOUND', `${val} nicht im Baum`, 'danger');
    },

    async inorder() {
        const result = [];
        const traverse = async (node) => {
            if (!node) return;
            await traverse(node.left);
            result.push(node.key);
            Renderer.log('VISIT', `${node.key}`, 'success');
            await traverse(node.right);
        };
        await traverse(this.root);
        Renderer.log('INORDER', `[${result.join(', ')}] — sortiert!`, 'success');
    },

    async preorder() {
        const result = [];
        const traverse = async (node) => {
            if (!node) return;
            result.push(node.key);
            Renderer.log('VISIT', `${node.key}`);
            await traverse(node.left);
            await traverse(node.right);
        };
        await traverse(this.root);
        Renderer.log('PREORDER', `[${result.join(', ')}]`, 'success');
    },

    randomBuild() {
        this.root = null;
        const vals = Renderer.shuffle(Array.from({ length: 10 }, (_, i) => (i + 1) * 5));
        vals.forEach(v => this.bstInsert(v));
        Renderer.log('BUILD', `BST mit ${vals.length} Knoten erstellt`);
        this.render();
    },

    clear() { this.root = null; this.render(); },

    render() {
        const c = UI.getContainer();
        c.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'tree-container';
        container.style.minHeight = '350px';
        c.appendChild(container);

        if (!this.root) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">Baum ist leer</div>';
            return;
        }

        const width = c.offsetWidth || 700;
        this.assignPositions(this.root, 0, width, 0);
        this.drawTree(container, this.root);

        // Stats
        const h = this.getHeight(this.root);
        const n = this.getSize(this.root);
        const info = document.createElement('div');
        info.style.cssText = 'font-size:12px;color:var(--text-secondary);margin-top:8px;padding:8px';
        info.innerHTML = `Knoten: <b>${n}</b> | Höhe: <b>${h}</b> |
            Optimal: <b>${Math.floor(Math.log2(n))}</b> |
            Pro Knoten: <b>32 Bytes</b> (4B Key + 4B Pad + 8B Left + 8B Right + 8B Parent) |
            Gesamt: <b>${n * 32 + 8} Bytes</b>`;
        c.appendChild(info);

        // Memory layout
        const nodes = [];
        const collectNodes = (node) => {
            if (!node) return;
            nodes.push({ key: node.key });
            collectNodes(node.left);
            collectNodes(node.right);
        };
        collectNodes(this.root);
        memSim.layoutBST(nodes);
    },

    assignPositions(node, left, right, depth) {
        if (!node) return;
        const mid = (left + right) / 2;
        node.x = mid;
        node.y = depth * 60 + 30;
        this.assignPositions(node.left, left, mid, depth + 1);
        this.assignPositions(node.right, mid, right, depth + 1);
    },

    drawTree(container, node) {
        if (!node) return;

        // Draw edges first
        if (node.left) {
            Renderer.drawTreeEdge(container, node.x, node.y, node.left.x, node.left.y);
            this.drawTree(container, node.left);
        }
        if (node.right) {
            Renderer.drawTreeEdge(container, node.x, node.y, node.right.x, node.right.y);
            this.drawTree(container, node.right);
        }

        // Draw node
        const el = document.createElement('div');
        el.className = 'tree-node';
        el.dataset.key = node.key;
        el.style.left = (node.x - 22) + 'px';
        el.style.top = (node.y - 22) + 'px';
        el.textContent = node.key;
        container.appendChild(el);
    },

    highlightPath(path) {
        document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('highlight'));
        path.forEach(node => {
            const el = document.querySelector(`.tree-node[data-key="${node.key}"]`);
            if (el) el.classList.add('highlight');
        });
    },

    getHeight(node) {
        if (!node) return -1;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    },

    getSize(node) {
        if (!node) return 0;
        return 1 + this.getSize(node.left) + this.getSize(node.right);
    }
});

const bstViz = VizRegistry.get('bst');
