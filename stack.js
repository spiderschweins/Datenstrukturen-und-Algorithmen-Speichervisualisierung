/**
 * Stack (LIFO) and Queue (FIFO) and Deque Visualization
 */
VizRegistry.register('stack', {
    category: 'linear',
    name: 'Stack',
    icon: '📚',
    complexity: { time: 'O(1) push/pop/top', space: 'O(n)' },
    data: [],

    init() {
        this.data = [10, 25, 7];
        UI.addControls(`
            <input type="number" id="stack-val" placeholder="Wert" value="42" style="width:80px">
            <button class="primary" onclick="stackViz.push()">Ablegen</button>
            <button class="danger" onclick="stackViz.pop()">Abheben</button>
            <button onclick="stackViz.peek()">Oberstes Element</button>
            <div class="separator"></div>
            <button onclick="stackViz.randomFill()">Zufällig</button>
            <button class="danger" onclick="stackViz.clear()">Leeren</button>
        `);
        this.render();
    },
    destroy() { this.data = []; },

    render() {
        const c = UI.getContainer();
        let html = '<div class="stack-container">';
        html += '<div class="sq-label">← Basis</div>';
        this.data.forEach((val, i) => {
            const isTop = i === this.data.length - 1;
            html += `<div class="sq-item ${isTop ? 'top' : ''}">${val}${isTop ? ' ← TOP' : ''}</div>`;
        });
        if (this.data.length === 0) {
            html += '<div style="color:var(--text-muted);padding:20px">Stack ist leer</div>';
        }
        html += '<div class="sq-label">Top →</div>';
        html += '</div>';
        html += `<div style="text-align:center;font-size:13px;color:var(--text-secondary);margin-top:8px">
            Größe: <b>${this.data.length}</b> | LIFO — Last In, First Out |
            Speicher: <b>${this.data.length * 4 + 16} Bytes</b> (Array-basiert)
        </div>`;
        c.innerHTML = html;
        memSim.layoutArray(this.data);
    },

    push() {
        const val = parseInt(document.getElementById('stack-val')?.value || 0);
        this.data.push(val);
        Renderer.log('PUSH', `${val} auf den Stack — O(1)`, 'success');
        this.render();
    },

    pop() {
        if (this.data.length === 0) {
            Renderer.log('ERROR', 'Stack ist leer!', 'danger');
            return;
        }
        const val = this.data.pop();
        Renderer.log('POP', `${val} vom Stack entfernt — O(1)`, 'warning');
        this.render();
    },

    peek() {
        if (this.data.length === 0) {
            Renderer.log('ERROR', 'Stack ist leer!', 'danger');
            return;
        }
        const val = this.data[this.data.length - 1];
        Renderer.log('TOP', `Top-Element: ${val} — O(1)`, 'success');
    },

    randomFill() {
        this.data = Renderer.randomArray(Renderer.randomInt(3, 8));
        this.render();
    },

    clear() {
        this.data = [];
        this.render();
    }
});

const stackViz = VizRegistry.get('stack');

// Queue
VizRegistry.register('queue', {
    category: 'linear',
    name: 'Queue',
    icon: '🚶',
    complexity: { time: 'O(1) enqueue/dequeue', space: 'O(n)' },
    data: [],

    init() {
        this.data = [10, 25, 7];
        UI.addControls(`
            <input type="number" id="q-val" placeholder="Wert" value="42" style="width:80px">
            <button class="primary" onclick="queueViz.enqueue()">Einfügen</button>
            <button class="danger" onclick="queueViz.dequeue()">Entfernen</button>
            <button onclick="queueViz.peek()">Front lesen</button>
            <div class="separator"></div>
            <button onclick="queueViz.randomFill()">Zufällig</button>
            <button class="danger" onclick="queueViz.clear()">Leeren</button>
        `);
        this.render();
    },
    destroy() { this.data = []; },

    render() {
        const c = UI.getContainer();
        let html = '<div style="display:flex;align-items:center;gap:4px;padding:40px 20px;flex-wrap:wrap">';
        html += '<div class="sq-label" style="color:var(--danger)">FRONT →</div>';
        this.data.forEach((val, i) => {
            const isFront = i === 0;
            const isRear = i === this.data.length - 1;
            html += `<div class="sq-item ${isFront ? 'top' : ''}" style="width:auto;min-width:60px">${val}</div>`;
        });
        html += '<div class="sq-label" style="color:var(--success)">← ENDE</div>';
        html += '</div>';
        html += `<div style="text-align:center;font-size:13px;color:var(--text-secondary)">
            Größe: <b>${this.data.length}</b> | FIFO — First In, First Out |
            Circular Array: <b>${Math.max(this.data.length, 4) * 4 + 16} Bytes</b>
        </div>`;
        c.innerHTML = html;
        memSim.layoutArray(this.data);
    },

    enqueue() {
        const val = parseInt(document.getElementById('q-val')?.value || 0);
        this.data.push(val);
        Renderer.log('ENQUEUE', `${val} hinten eingefügt — O(1)`, 'success');
        this.render();
    },

    dequeue() {
        if (this.data.length === 0) {
            Renderer.log('ERROR', 'Queue ist leer!', 'danger');
            return;
        }
        const val = this.data.shift();
        Renderer.log('DEQUEUE', `${val} vorne entfernt — O(1) mit Circular Array`, 'warning');
        this.render();
    },

    peek() {
        if (this.data.length === 0) return;
        Renderer.log('FRONT', `Front-Element: ${this.data[0]} — O(1)`, 'success');
    },

    randomFill() {
        this.data = Renderer.randomArray(Renderer.randomInt(3, 8));
        this.render();
    },

    clear() {
        this.data = [];
        this.render();
    }
});

const queueViz = VizRegistry.get('queue');

// Deque
VizRegistry.register('deque', {
    category: 'linear',
    name: 'Deque',
    icon: '↔️',
    complexity: { time: 'O(1) alle Operationen', space: 'O(n)' },
    data: [],

    init() {
        this.data = [10, 25, 7, 42];
        UI.addControls(`
            <input type="number" id="dq-val" placeholder="Wert" value="99" style="width:80px">
            <button class="primary" onclick="dequeViz.addFirst()">Vorne +</button>
            <button class="primary" onclick="dequeViz.addLast()">Hinten +</button>
            <button class="danger" onclick="dequeViz.removeFirst()">Vorne -</button>
            <button class="danger" onclick="dequeViz.removeLast()">Hinten -</button>
        `);
        this.render();
    },
    destroy() { this.data = []; },

    render() {
        const c = UI.getContainer();
        let html = '<div style="display:flex;align-items:center;gap:4px;padding:40px 20px;flex-wrap:wrap">';
        html += '<div class="sq-label" style="color:var(--info)">FRONT ↔</div>';
        this.data.forEach((val) => {
            html += `<div class="sq-item" style="width:auto;min-width:60px">${val}</div>`;
        });
        html += '<div class="sq-label" style="color:var(--info)">↔ REAR</div>';
        html += '</div>';
        html += `<div style="text-align:center;font-size:13px;color:var(--text-secondary)">
            Größe: <b>${this.data.length}</b> | Double-Ended Queue — Einfügen/Entfernen an beiden Enden O(1)
        </div>`;
        c.innerHTML = html;
        memSim.layoutArray(this.data);
    },

    addFirst() {
        const val = parseInt(document.getElementById('dq-val')?.value || 0);
        this.data.unshift(val);
        Renderer.log('ADD_FIRST', `${val} vorne eingefügt — O(1)`, 'success');
        this.render();
    },

    addLast() {
        const val = parseInt(document.getElementById('dq-val')?.value || 0);
        this.data.push(val);
        Renderer.log('ADD_LAST', `${val} hinten eingefügt — O(1)`, 'success');
        this.render();
    },

    removeFirst() {
        if (this.data.length === 0) return;
        const val = this.data.shift();
        Renderer.log('REM_FIRST', `${val} vorne entfernt — O(1)`, 'warning');
        this.render();
    },

    removeLast() {
        if (this.data.length === 0) return;
        const val = this.data.pop();
        Renderer.log('REM_LAST', `${val} hinten entfernt — O(1)`, 'warning');
        this.render();
    }
});

const dequeViz = VizRegistry.get('deque');
