/**
 * Heap / Priority Queue Visualization
 * Shows both tree view and underlying array
 */
VizRegistry.register('heap', {
    category: 'trees',
    name: 'Heap und Prioritätswarteschlange',
    icon: '⛰️',
    complexity: { time: 'O(log n) für Einfügen und Entfernen', space: 'O(n)' },
    data: [],
    isMin: true,

    init() {
        this.data = [];
        this.isMin = true;
        [15, 9, 6, 7, 4, 2, 1].forEach(v => this.heapInsert(v));
        UI.addControls(`
            <input type="number" id="heap-val" placeholder="Wert" value="3" style="width:80px">
            <button class="primary" onclick="heapViz.insert()">Einfügen</button>
            <button class="danger" onclick="heapViz.removeMin()">Wurzel entfernen</button>
            <select id="heap-type" onchange="heapViz.switchType(this.value)">
                <option value="min">Min-Heap</option>
                <option value="max">Max-Heap</option>
            </select>
            <div class="separator"></div>
            <button onclick="heapViz.randomBuild()">Zufällig</button>
            <button class="danger" onclick="heapViz.clear()">Leeren</button>
        `);
        this.render();
    },

    destroy() { this.data = []; },

    compare(a, b) {
        return this.isMin ? a < b : a > b;
    },

    heapInsert(val) {
        this.data.push(val);
        this.upheap(this.data.length - 1);
    },

    upheap(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.compare(this.data[i], this.data[parent])) {
                [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
                i = parent;
            } else break;
        }
    },

    downheap(i) {
        const n = this.data.length;
        while (true) {
            let target = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.compare(this.data[left], this.data[target])) target = left;
            if (right < n && this.compare(this.data[right], this.data[target])) target = right;
            if (target === i) break;
            [this.data[i], this.data[target]] = [this.data[target], this.data[i]];
            i = target;
        }
    },

    async insert() {
        const val = parseInt(document.getElementById('heap-val')?.value || 0);
        this.data.push(val);
        Renderer.log('INSERT', `${val} eingefügt, Upheap startet...`);
        this.render();
        await Renderer.sleep();

        let i = this.data.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            this.highlightNodes([i, parent]);
            await Renderer.sleep();
            if (this.compare(this.data[i], this.data[parent])) {
                [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
                Renderer.log('SWAP', `Tausche ${this.data[parent]} ↔ ${this.data[i]}`, 'warning');
                i = parent;
                this.render();
                await Renderer.sleep();
            } else break;
        }
        Renderer.log('DONE', `Heap-Eigenschaft wiederhergestellt`, 'success');
        this.render();
    },

    async removeMin() {
        if (this.data.length === 0) {
            Renderer.log('ERROR', 'Heap ist leer!', 'danger');
            return;
        }
        const min = this.data[0];
        Renderer.log('REMOVE', `${this.isMin ? 'Min' : 'Max'}: ${min}`, 'warning');

        this.data[0] = this.data[this.data.length - 1];
        this.data.pop();

        if (this.data.length > 0) {
            let i = 0;
            this.render();
            await Renderer.sleep();

            while (true) {
                let target = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                if (left < this.data.length && this.compare(this.data[left], this.data[target])) target = left;
                if (right < this.data.length && this.compare(this.data[right], this.data[target])) target = right;
                if (target === i) break;

                this.highlightNodes([i, target]);
                await Renderer.sleep();

                [this.data[i], this.data[target]] = [this.data[target], this.data[i]];
                Renderer.log('DOWNHEAP', `Tausche Index ${i} ↔ ${target}`, 'warning');
                i = target;
                this.render();
                await Renderer.sleep();
            }
        }
        Renderer.log('DONE', `Heap-Eigenschaft wiederhergestellt`, 'success');
        this.render();
    },

    switchType(type) {
        this.isMin = type === 'min';
        const values = [...this.data];
        this.data = [];
        values.forEach(v => this.heapInsert(v));
        Renderer.log('TYPE', `Gewechselt zu ${type === 'min' ? 'Min' : 'Max'}-Heap`);
        this.render();
    },

    randomBuild() {
        this.data = [];
        Renderer.randomArray(Renderer.randomInt(7, 15), 1, 50).forEach(v => this.heapInsert(v));
        this.render();
    },

    clear() {
        this.data = [];
        this.render();
    },

    render() {
        const c = UI.getContainer();
        let html = '<div class="heap-dual">';

        // Tree view
        html += '<div class="tree-container" style="min-height:250px">';
        if (this.data.length > 0) {
            const levels = Math.floor(Math.log2(this.data.length)) + 1;
            const width = c.offsetWidth || 700;

            for (let i = 0; i < this.data.length; i++) {
                const level = Math.floor(Math.log2(i + 1));
                const posInLevel = i - (Math.pow(2, level) - 1);
                const nodesInLevel = Math.pow(2, level);
                const x = (posInLevel + 0.5) * (width / nodesInLevel) - 22;
                const y = level * 60 + 10;

                // Draw edge to parent
                if (i > 0) {
                    const parent = Math.floor((i - 1) / 2);
                    const pLevel = Math.floor(Math.log2(parent + 1));
                    const pPos = parent - (Math.pow(2, pLevel) - 1);
                    const pNodes = Math.pow(2, pLevel);
                    const px = (pPos + 0.5) * (width / pNodes);
                    const py = pLevel * 60 + 32;
                    const cx = (posInLevel + 0.5) * (width / nodesInLevel);
                    const cy = y + 0;
                    const dx = cx - px;
                    const dy = cy - py;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    html += `<div class="tree-edge" style="width:${len}px;left:${px}px;top:${py}px;transform:rotate(${angle}deg)"></div>`;
                }

                html += `<div class="tree-node" data-idx="${i}" style="left:${x}px;top:${y}px">${this.data[i]}</div>`;
            }
        }
        html += '</div>';

        // Array view
        html += '<div style="padding:0 10px">';
        html += '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Array-Darstellung (physischer Speicher):</div>';
        html += '<div class="array-container">';
        this.data.forEach((val, i) => {
            html += `<div class="array-cell"><div class="cell-value" style="width:40px;height:40px;font-size:12px">${val}</div><div class="cell-index">[${i}]</div></div>`;
        });
        html += '</div>';

        html += `<div style="font-size:12px;color:var(--text-secondary);margin-top:8px">
            Parent(i) = [(i-1)/2] | Left(i) = 2i+1 | Right(i) = 2i+2 |
            Größe: <b>${this.data.length}</b> |
            Speicher: <b>${this.data.length * 4 + 16} Bytes</b>
        </div>`;
        html += '</div></div>';

        c.innerHTML = html;
        memSim.layoutArray(this.data);
    },

    highlightNodes(indices) {
        document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('highlight'));
        indices.forEach(i => {
            const node = document.querySelector(`.tree-node[data-idx="${i}"]`);
            if (node) node.classList.add('highlight');
        });
    }
});

const heapViz = VizRegistry.get('heap');
