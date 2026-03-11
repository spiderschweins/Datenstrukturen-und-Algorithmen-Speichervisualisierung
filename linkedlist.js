/**
 * Singly & Doubly Linked List Visualization
 */
VizRegistry.register('linkedlist', {
    category: 'linear',
    name: 'Verkettete Liste',
    icon: '🔗',
    complexity: { time: 'O(1) insert/delete, O(n) search', space: 'O(n)' },
    data: [],
    type: 'singly',

    init() {
        this.data = [10, 25, 7, 42, 13];
        this.type = 'singly';
        UI.addControls(`
            <input type="number" id="ll-val" placeholder="Wert" value="99" style="width:80px">
            <button class="primary" onclick="llViz.addFirst()">Am Anfang</button>
            <button onclick="llViz.addLast()">Am Ende</button>
            <button class="danger" onclick="llViz.removeFirst()">Ersten entf.</button>
            <button class="danger" onclick="llViz.removeLast()">Letzten entf.</button>
            <div class="separator"></div>
            <select id="ll-type" onchange="llViz.switchType(this.value)">
                <option value="singly">Einfach verkettet</option>
                <option value="doubly">Doppelt verkettet</option>
            </select>
            <button onclick="llViz.search()">Suchen</button>
            <button onclick="llViz.randomFill()">Zufällig</button>
        `);
        this.render();
    },

    destroy() { this.data = []; },

    render() {
        const c = UI.getContainer();
        let html = '<div class="ll-container">';

        if (this.type === 'doubly') {
            html += `<div class="ll-null" style="margin-right:4px">null ←</div>`;
        }

        this.data.forEach((val, i) => {
            html += `<div class="ll-node" data-index="${i}">`;
            html += `<div class="node-box">`;
            if (this.type === 'doubly') {
                html += `<div class="node-ptr" style="font-size:9px;border-right:1px solid var(--border)">←</div>`;
            }
            html += `<div class="node-data">${val}</div>`;
            html += `<div class="node-ptr">●→</div>`;
            html += `</div>`;
            if (i < this.data.length - 1) {
                html += `<div class="node-arrow"></div>`;
            }
            html += `</div>`;
        });

        html += `<div class="ll-null">null</div>`;
        html += '</div>';

        // Info
        const nodeSize = this.type === 'singly' ? 16 : 24;
        html += `<div style="margin-top:16px;font-size:13px;color:var(--text-secondary)">
            Länge: <b>${this.data.length}</b> |
            Typ: <b>${this.type === 'singly' ? 'Einfach verkettet' : 'Doppelt verkettet'}</b> |
            Pro Knoten: <b>${nodeSize} Bytes</b> (${this.type === 'singly' ? '4B Daten + 4B Padding + 8B Pointer' : '4B Daten + 4B Padding + 8B Next + 8B Prev'}) |
            Gesamt: <b>${this.data.length * nodeSize + 8} Bytes</b>
        </div>`;

        c.innerHTML = html;
        memSim.layoutLinkedList(this.data);
    },

    async addFirst() {
        const val = parseInt(document.getElementById('ll-val')?.value || 0);
        this.data.unshift(val);
        Renderer.log('ADD_FIRST', `${val} — Neuer Head, O(1)`, 'success');
        this.render();
        this.highlightNode(0);
    },

    async addLast() {
        const val = parseInt(document.getElementById('ll-val')?.value || 0);
        this.data.push(val);
        Renderer.log('ADD_LAST', `${val} — Am Ende, O(${this.type === 'singly' ? 'n' : '1'})`, 'success');
        this.render();
        this.highlightNode(this.data.length - 1);
    },

    removeFirst() {
        if (this.data.length === 0) return;
        const val = this.data.shift();
        Renderer.log('REMOVE_FIRST', `${val} entfernt — O(1)`, 'warning');
        this.render();
    },

    removeLast() {
        if (this.data.length === 0) return;
        const val = this.data.pop();
        Renderer.log('REMOVE_LAST', `${val} entfernt — O(${this.type === 'singly' ? 'n' : '1'})`, 'warning');
        this.render();
    },

    async search() {
        const val = parseInt(document.getElementById('ll-val')?.value || 0);
        Renderer.log('SEARCH', `Suche ${val}...`);

        for (let i = 0; i < this.data.length; i++) {
            this.highlightNode(i);
            await Renderer.sleep();
            if (this.data[i] === val) {
                Renderer.log('FOUND', `${val} an Position ${i}`, 'success');
                return;
            }
        }
        Renderer.log('NOT_FOUND', `${val} nicht gefunden`, 'danger');
    },

    switchType(type) {
        this.type = type;
        Renderer.log('TYPE', `Gewechselt zu ${type === 'singly' ? 'einfach' : 'doppelt'} verkettet`);
        this.render();
    },

    randomFill() {
        this.data = Renderer.randomArray(Renderer.randomInt(3, 8));
        this.render();
    },

    highlightNode(idx) {
        const nodes = document.querySelectorAll('.ll-node');
        nodes.forEach(n => n.classList.remove('highlight'));
        if (nodes[idx]) {
            nodes[idx].classList.add('highlight');
            setTimeout(() => nodes[idx]?.classList.remove('highlight'), 800);
        }
    }
});

const llViz = VizRegistry.get('linkedlist');
