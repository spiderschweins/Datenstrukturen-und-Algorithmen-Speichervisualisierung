/**
 * AVL Tree Visualization with rotations
 */
VizRegistry.register('avl', {
    category: 'trees',
    name: 'AVL-Baum',
    icon: '⚖️',
    complexity: { time: 'O(log n) alle Ops', space: 'O(n)' },
    root: null,

    init() {
        this.root = null;
        [30, 15, 45, 8, 22, 38, 55, 3, 12].forEach(v => this.root = this.avlInsert(this.root, v));
        UI.addControls(`
            <input type="number" id="avl-val" placeholder="Wert" value="10" style="width:80px">
            <button class="primary" onclick="avlViz.insert()">Einfügen</button>
            <button class="danger" onclick="avlViz.remove()">Entfernen</button>
            <button onclick="avlViz.search()">Suchen</button>
            <div class="separator"></div>
            <button onclick="avlViz.randomBuild()">Zufällig</button>
            <button class="danger" onclick="avlViz.clear()">Leeren</button>
        `);
        this.render();
    },

    destroy() { this.root = null; },

    makeNode(key) {
        return { key, left: null, right: null, height: 0, x: 0, y: 0 };
    },

    height(n) { return n ? n.height : -1; },

    balanceFactor(n) { return n ? this.height(n.left) - this.height(n.right) : 0; },

    updateHeight(n) {
        if (n) n.height = 1 + Math.max(this.height(n.left), this.height(n.right));
    },

    rotateRight(y) {
        const x = y.left;
        y.left = x.right;
        x.right = y;
        this.updateHeight(y);
        this.updateHeight(x);
        Renderer.log('ROTATE_R', `Rechtsrotation um ${y.key}`, 'warning');
        return x;
    },

    rotateLeft(x) {
        const y = x.right;
        x.right = y.left;
        y.left = x;
        this.updateHeight(x);
        this.updateHeight(y);
        Renderer.log('ROTATE_L', `Linksrotation um ${x.key}`, 'warning');
        return y;
    },

    balance(node) {
        this.updateHeight(node);
        const bf = this.balanceFactor(node);

        if (bf > 1) {
            if (this.balanceFactor(node.left) < 0) {
                Renderer.log('DOUBLE', `Links-Rechts Doppelrotation`, 'warning');
                node.left = this.rotateLeft(node.left);
            }
            return this.rotateRight(node);
        }
        if (bf < -1) {
            if (this.balanceFactor(node.right) > 0) {
                Renderer.log('DOUBLE', `Rechts-Links Doppelrotation`, 'warning');
                node.right = this.rotateRight(node.right);
            }
            return this.rotateLeft(node);
        }
        return node;
    },

    avlInsert(node, key) {
        if (!node) return this.makeNode(key);
        if (key < node.key) node.left = this.avlInsert(node.left, key);
        else if (key > node.key) node.right = this.avlInsert(node.right, key);
        else return node;
        return this.balance(node);
    },

    avlRemove(node, key) {
        if (!node) return null;
        if (key < node.key) node.left = this.avlRemove(node.left, key);
        else if (key > node.key) node.right = this.avlRemove(node.right, key);
        else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            let succ = node.right;
            while (succ.left) succ = succ.left;
            node.key = succ.key;
            node.right = this.avlRemove(node.right, succ.key);
        }
        return this.balance(node);
    },

    insert() {
        const val = parseInt(document.getElementById('avl-val')?.value || 0);
        this.root = this.avlInsert(this.root, val);
        Renderer.log('INSERT', `${val} eingefügt (mit Rebalancing)`, 'success');
        this.render();
    },

    remove() {
        const val = parseInt(document.getElementById('avl-val')?.value || 0);
        this.root = this.avlRemove(this.root, val);
        Renderer.log('REMOVE', `${val} entfernt (mit Rebalancing)`, 'warning');
        this.render();
    },

    async search() {
        const val = parseInt(document.getElementById('avl-val')?.value || 0);
        let node = this.root;
        let steps = 0;
        while (node) {
            steps++;
            const el = document.querySelector(`.tree-node[data-key="${node.key}"]`);
            if (el) el.classList.add('highlight');
            await Renderer.sleep();

            if (val === node.key) {
                Renderer.log('FOUND', `${val} in ${steps} Schritten (max: ${this.height(this.root) + 1})`, 'success');
                return;
            }
            node = val < node.key ? node.left : node.right;
        }
        Renderer.log('NOT_FOUND', `${val} nicht im Baum`, 'danger');
    },

    randomBuild() {
        this.root = null;
        const vals = Renderer.shuffle(Array.from({ length: 12 }, (_, i) => (i + 1) * 4));
        vals.forEach(v => this.root = this.avlInsert(this.root, v));
        Renderer.log('BUILD', `AVL-Baum mit ${vals.length} Knoten, Höhe ${this.height(this.root)}`);
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

        const n = this.getSize(this.root);
        const info = document.createElement('div');
        info.style.cssText = 'font-size:12px;color:var(--text-secondary);margin-top:8px;padding:8px';
        info.innerHTML = `Knoten: <b>${n}</b> | Höhe: <b>${this.height(this.root)}</b> |
            Garantiert: <b>O(log n) = O(${Math.ceil(Math.log2(n + 1))})</b> |
            Balance-Regel: |h(left) - h(right)| ≤ 1 |
            Pro Knoten: <b>40 Bytes</b> (+ height + balance Felder)`;
        c.appendChild(info);
        memSim.layoutBST(this.collectNodes(this.root));
    },

    assignPositions(node, left, right, depth) {
        if (!node) return;
        const mid = (left + right) / 2;
        node.x = mid;
        node.y = depth * 65 + 30;
        this.assignPositions(node.left, left, mid, depth + 1);
        this.assignPositions(node.right, mid, right, depth + 1);
    },

    drawTree(container, node) {
        if (!node) return;
        if (node.left) {
            Renderer.drawTreeEdge(container, node.x, node.y, node.left.x, node.left.y);
            this.drawTree(container, node.left);
        }
        if (node.right) {
            Renderer.drawTreeEdge(container, node.x, node.y, node.right.x, node.right.y);
            this.drawTree(container, node.right);
        }

        const el = document.createElement('div');
        el.className = 'tree-node';
        el.dataset.key = node.key;
        el.style.left = (node.x - 22) + 'px';
        el.style.top = (node.y - 22) + 'px';
        el.textContent = node.key;

        // Balance factor badge
        const bf = this.balanceFactor(node);
        const badge = document.createElement('span');
        badge.className = `balance-factor ${Math.abs(bf) > 1 ? 'unbalanced' : ''}`;
        badge.textContent = bf;
        el.appendChild(badge);

        container.appendChild(el);
    },

    getSize(node) {
        if (!node) return 0;
        return 1 + this.getSize(node.left) + this.getSize(node.right);
    },

    collectNodes(node) {
        if (!node) return [];
        return [{ key: node.key }, ...this.collectNodes(node.left), ...this.collectNodes(node.right)];
    }
});

const avlViz = VizRegistry.get('avl');

/* Splay Tree */
VizRegistry.register('splay', {
    category: 'trees',
    name: 'Splay-Baum',
    icon: '🔄',
    complexity: { time: 'O(log n) amortisiert', space: 'O(n)' },
    root: null,

    init() {
        this.root = null;
        [30, 15, 45, 8, 22, 38, 55].forEach(v => this.bstInsertNoSplay(v));
        UI.addControls(`
            <input type="number" id="splay-val" placeholder="Wert" value="8" style="width:80px">
            <button class="primary" onclick="splayViz.insert()">Einfügen</button>
            <button onclick="splayViz.searchAndSplay()">Suchen (Splay)</button>
            <button class="danger" onclick="splayViz.remove()">Entfernen</button>
            <div class="separator"></div>
            <button onclick="splayViz.randomBuild()">Zufällig</button>
        `);
        this.render();
    },
    destroy() { this.root = null; },

    makeNode(key) { return { key, left: null, right: null, x: 0, y: 0 }; },

    bstInsertNoSplay(key) {
        if (!this.root) { this.root = this.makeNode(key); return; }
        let n = this.root;
        while (true) {
            if (key < n.key) { if (!n.left) { n.left = this.makeNode(key); return; } n = n.left; }
            else if (key > n.key) { if (!n.right) { n.right = this.makeNode(key); return; } n = n.right; }
            else return;
        }
    },

    rotateRight(node) {
        const x = node.left; node.left = x.right; x.right = node; return x;
    },
    rotateLeft(node) {
        const x = node.right; node.right = x.left; x.left = node; return x;
    },

    splay(node, key) {
        if (!node || node.key === key) return node;
        if (key < node.key) {
            if (!node.left) return node;
            if (key < node.left.key) { // zig-zig
                node.left.left = this.splay(node.left.left, key);
                node = this.rotateRight(node);
                Renderer.log('ZIG-ZIG', `Doppel-Rechtsrotation`, 'warning');
            } else if (key > node.left.key) { // zig-zag
                node.left.right = this.splay(node.left.right, key);
                if (node.left.right) node.left = this.rotateLeft(node.left);
                Renderer.log('ZIG-ZAG', `Links dann Rechtsrotation`, 'warning');
            }
            return node.left ? this.rotateRight(node) : node;
        } else {
            if (!node.right) return node;
            if (key > node.right.key) { // zag-zag
                node.right.right = this.splay(node.right.right, key);
                node = this.rotateLeft(node);
                Renderer.log('ZAG-ZAG', `Doppel-Linksrotation`, 'warning');
            } else if (key < node.right.key) { // zag-zig
                node.right.left = this.splay(node.right.left, key);
                if (node.right.left) node.right = this.rotateRight(node.right);
                Renderer.log('ZAG-ZIG', `Rechts dann Linksrotation`, 'warning');
            }
            return node.right ? this.rotateLeft(node) : node;
        }
    },

    insert() {
        const val = parseInt(document.getElementById('splay-val')?.value || 0);
        this.bstInsertNoSplay(val);
        this.root = this.splay(this.root, val);
        Renderer.log('INSERT', `${val} eingefügt und an Wurzel gesplayt`, 'success');
        this.render();
    },

    searchAndSplay() {
        const val = parseInt(document.getElementById('splay-val')?.value || 0);
        this.root = this.splay(this.root, val);
        if (this.root && this.root.key === val) {
            Renderer.log('SPLAY', `${val} an Wurzel gesplayt`, 'success');
        } else {
            Renderer.log('SPLAY', `${val} nicht gefunden, nächster Knoten an Wurzel`, 'warning');
        }
        this.render();
    },

    remove() {
        const val = parseInt(document.getElementById('splay-val')?.value || 0);
        this.root = this.splay(this.root, val);
        if (!this.root || this.root.key !== val) {
            Renderer.log('NOT_FOUND', `${val} nicht im Baum`, 'danger'); return;
        }
        if (!this.root.left) { this.root = this.root.right; }
        else {
            const right = this.root.right;
            this.root = this.splay(this.root.left, val);
            this.root.right = right;
        }
        Renderer.log('REMOVE', `${val} entfernt`, 'warning');
        this.render();
    },

    randomBuild() {
        this.root = null;
        Renderer.shuffle(Array.from({ length: 9 }, (_, i) => (i + 1) * 5)).forEach(v => this.bstInsertNoSplay(v));
        this.render();
    },

    render() {
        // Reuse BST render logic
        const c = UI.getContainer();
        c.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'tree-container';
        container.style.minHeight = '350px';
        c.appendChild(container);
        if (!this.root) { container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">Baum ist leer</div>'; return; }
        const width = c.offsetWidth || 700;
        this.assignPos(this.root, 0, width, 0);
        this.drawNode(container, this.root);
        const info = document.createElement('div');
        info.style.cssText = 'font-size:12px;color:var(--text-secondary);margin-top:8px;padding:8px';
        info.innerHTML = `Splay-Baum: Zuletzt zugegriffene Elemente an der Wurzel | Amortisiert O(log n) |
            Operationen: zig-zig, zig-zag, zag-zig, zag-zag`;
        c.appendChild(info);
    },

    assignPos(node, l, r, d) {
        if (!node) return;
        node.x = (l + r) / 2; node.y = d * 60 + 30;
        this.assignPos(node.left, l, (l + r) / 2, d + 1);
        this.assignPos(node.right, (l + r) / 2, r, d + 1);
    },

    drawNode(container, node) {
        if (!node) return;
        if (node.left) { Renderer.drawTreeEdge(container, node.x, node.y, node.left.x, node.left.y); this.drawNode(container, node.left); }
        if (node.right) { Renderer.drawTreeEdge(container, node.x, node.y, node.right.x, node.right.y); this.drawNode(container, node.right); }
        const el = document.createElement('div');
        el.className = 'tree-node';
        el.style.left = (node.x - 22) + 'px'; el.style.top = (node.y - 22) + 'px';
        el.textContent = node.key;
        container.appendChild(el);
    }
});

const splayViz = VizRegistry.get('splay');
