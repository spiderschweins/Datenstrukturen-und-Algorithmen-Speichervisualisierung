/**
 * Dynamic Array (ArrayList) Visualization
 */
VizRegistry.register('array', {
    category: 'linear',
    name: 'Dynamisches Array',
    icon: '📊',
    complexity: { time: 'O(1) amortisiert / O(n) im Worst Case', space: 'O(n)' },
    data: [],
    capacity: 4,

    init() {
        this.data = [10, 25, 7, 42];
        this.capacity = 8;
        UI.addControls(`
            <input type="number" id="arr-val" placeholder="Wert" value="15" style="width:80px">
            <input type="number" id="arr-idx" placeholder="Index" value="" style="width:70px">
            <button class="primary" onclick="arrViz.insert()">Einfügen</button>
            <button onclick="arrViz.insertAt()">An Index</button>
            <button class="danger" onclick="arrViz.removeLast()">Entfernen</button>
            <button onclick="arrViz.access()">Zugriff [i]</button>
            <div class="separator"></div>
            <button onclick="arrViz.randomFill()">Zufällig</button>
            <button class="danger" onclick="arrViz.clear()">Leeren</button>
        `);
        this.render();
    },

    destroy() { this.data = []; },

    render() {
        const c = UI.getContainer();
        let html = '<div class="array-container">';
        for (let i = 0; i < this.capacity; i++) {
            const hasValue = i < this.data.length;
            const cls = hasValue ? '' : 'empty';
            html += `<div class="array-cell ${cls}">
                <div class="cell-value">${hasValue ? this.data[i] : ''}</div>
                <div class="cell-index">[${i}]</div>
            </div>`;
        }
        html += '</div>';
        html += `<div style="margin-top:12px;font-size:13px;color:var(--text-secondary)">
            Größe: <b>${this.data.length}</b> | Kapazität: <b>${this.capacity}</b> |
            Auslastung: <b>${(this.data.length / this.capacity * 100).toFixed(0)}%</b>
        </div>`;
        c.innerHTML = html;

        memSim.layoutArray(this.data);
        Renderer.log('RENDER', `Array[${this.data.length}/${this.capacity}]`);
    },

    async insert() {
        const val = parseInt(document.getElementById('arr-val')?.value || 0);
        if (this.data.length >= this.capacity) {
            const oldCap = this.capacity;
            this.capacity *= 2;
            Renderer.log('RESIZE', `Kapazität ${oldCap} → ${this.capacity} (verdoppelt)`, 'warning');
            this.render();
            await Renderer.sleep();
        }
        this.data.push(val);
        Renderer.log('INSERT', `${val} an Position ${this.data.length - 1}`, 'success');
        this.render();
        this.highlightCell(this.data.length - 1);
    },

    async insertAt() {
        const val = parseInt(document.getElementById('arr-val')?.value || 0);
        const idx = parseInt(document.getElementById('arr-idx')?.value || 0);
        if (idx < 0 || idx > this.data.length) {
            Renderer.log('ERROR', `Index ${idx} außerhalb [0, ${this.data.length}]`, 'danger');
            return;
        }
        if (this.data.length >= this.capacity) {
            this.capacity *= 2;
            Renderer.log('RESIZE', `Kapazität verdoppelt auf ${this.capacity}`, 'warning');
        }
        // Shift elements
        for (let i = this.data.length; i > idx; i--) {
            this.data[i] = this.data[i - 1];
            this.render();
            this.highlightCell(i);
            await Renderer.sleep(Renderer.getDelay() / 2);
        }
        this.data[idx] = val;
        Renderer.log('INSERT', `${val} an Index ${idx} (${this.data.length - idx - 1} Elemente verschoben)`, 'success');
        this.render();
        this.highlightCell(idx);
    },

    async removeLast() {
        if (this.data.length === 0) {
            Renderer.log('ERROR', 'Array ist leer', 'danger');
            return;
        }
        const val = this.data.pop();
        Renderer.log('REMOVE', `${val} entfernt (letztes Element)`, 'warning');
        this.render();
    },

    async access() {
        const idx = parseInt(document.getElementById('arr-idx')?.value || 0);
        if (idx < 0 || idx >= this.data.length) {
            Renderer.log('ERROR', `Index ${idx} außerhalb [0, ${this.data.length - 1}]`, 'danger');
            return;
        }
        Renderer.log('ACCESS', `arr[${idx}] = ${this.data[idx]} — O(1) Direktzugriff`, 'success');
        this.highlightCell(idx);
    },

    randomFill() {
        this.data = Renderer.randomArray(Renderer.randomInt(4, 12));
        this.capacity = Math.pow(2, Math.ceil(Math.log2(this.data.length + 1)));
        Renderer.log('RANDOM', `${this.data.length} zufällige Elemente`, 'success');
        this.render();
    },

    clear() {
        this.data = [];
        this.capacity = 4;
        Renderer.log('CLEAR', 'Array geleert', 'warning');
        this.render();
    },

    highlightCell(idx) {
        const cells = document.querySelectorAll('.array-cell');
        if (cells[idx]) {
            cells[idx].classList.add('highlight');
            setTimeout(() => cells[idx]?.classList.remove('highlight'), 800);
        }
    }
});

const arrViz = VizRegistry.get('array');
