/**
 * Hash table and Map/Set visualizations
 */
VizRegistry.register('hashtable', {
    category: 'hashing',
    name: 'Hash-Tabelle',
    icon: '#',
    complexity: { time: 'O(1) avg / O(n) worst', space: 'O(n)' },
    capacity: 8,
    mode: 'chaining',
    entries: [],
    table: [],
    highlightBuckets: [],

    init() {
        this.capacity = 8;
        this.mode = 'chaining';
        this.entries = [
            { key: 12, value: 120 },
            { key: 20, value: 200 },
            { key: 28, value: 280 },
            { key: 7, value: 70 }
        ];
        this.highlightBuckets = [];
        UI.addControls(`
            <input type="number" id="ht-key" placeholder="Schlüssel" value="36" style="width:92px">
            <input type="number" id="ht-val" placeholder="Wert" value="360" style="width:90px">
            <button class="primary" onclick="hashViz.insert()">Einfügen</button>
            <button class="danger" onclick="hashViz.remove()">Entfernen</button>
            <button onclick="hashViz.search()">Suchen</button>
            <div class="separator"></div>
            <select id="ht-mode" onchange="hashViz.switchMode(this.value)">
                <option value="chaining">Separate Chaining</option>
                <option value="linear">Linear Probing</option>
                <option value="double">Double Hashing</option>
            </select>
            <button onclick="hashViz.randomFill()">Zufallsdaten</button>
            <button class="danger" onclick="hashViz.clear()">Leeren</button>
        `);
        this.rebuild();
    },

    destroy() {
        this.entries = [];
        this.table = [];
        this.highlightBuckets = [];
    },

    hash1(key) {
        return Math.abs(key) % this.capacity;
    },

    hash2(key) {
        return 1 + (Math.abs(key) % Math.max(1, this.capacity - 1));
    },

    probeIndex(key, step) {
        const h1 = this.hash1(key);
        if (this.mode === 'linear') {
            return (h1 + step) % this.capacity;
        }
        return (h1 + step * this.hash2(key)) % this.capacity;
    },

    ensureCapacity() {
        if (this.entries.length / this.capacity > 0.7) {
            this.capacity *= 2;
            Renderer.log('RESIZE', `Kapazität auf ${this.capacity} vergrößert`, 'warning');
            this.rebuild();
        }
    },

    rebuild() {
        if (this.mode === 'chaining') {
            this.table = Array.from({ length: this.capacity }, () => []);
            this.entries.forEach(entry => {
                this.table[this.hash1(entry.key)].push({ ...entry });
            });
        } else {
            this.table = Array(this.capacity).fill(null);
            this.entries.forEach(entry => {
                for (let step = 0; step < this.capacity; step++) {
                    const idx = this.probeIndex(entry.key, step);
                    if (!this.table[idx] || this.table[idx].key === entry.key) {
                        this.table[idx] = { ...entry };
                        break;
                    }
                }
            });
        }
        this.render();
    },

    getProbePath(key) {
        if (this.mode === 'chaining') {
            const idx = this.hash1(key);
            const bucket = this.table[idx] || [];
            return { visited: [idx], found: bucket.some(entry => entry.key === key) };
        }

        const visited = [];
        for (let step = 0; step < this.capacity; step++) {
            const idx = this.probeIndex(key, step);
            visited.push(idx);
            const slot = this.table[idx];
            if (!slot) {
                return { visited, found: false };
            }
            if (slot.key === key) {
                return { visited, found: true };
            }
        }
        return { visited, found: false };
    },

    async insert() {
        const key = parseInt(document.getElementById('ht-key')?.value || 0);
        const value = parseInt(document.getElementById('ht-val')?.value || 0);
        const existing = this.entries.find(entry => entry.key === key);
        this.highlightBuckets = this.getProbePath(key).visited;
        this.render();
        await Renderer.sleep(Renderer.getDelay() / 2);

        if (existing) {
            existing.value = value;
            Renderer.log('UPDATE', `${key} -> ${value}`, 'success');
        } else {
            this.entries.push({ key, value });
            Renderer.log('INSERT', `${key} -> ${value}`, 'success');
        }

        this.ensureCapacity();
        this.rebuild();
    },

    async search() {
        const key = parseInt(document.getElementById('ht-key')?.value || 0);
        const path = this.getProbePath(key);
        this.highlightBuckets = path.visited;
        this.render();
        await Renderer.sleep(Renderer.getDelay() / 2);

        const entry = this.entries.find(item => item.key === key);
        if (entry) {
            Renderer.log('FOUND', `${key} -> ${entry.value} in ${path.visited.length} Schritt(en)`, 'success');
        } else {
            Renderer.log('NOT_FOUND', `${key} nicht gefunden`, 'danger');
        }
    },

    async remove() {
        const key = parseInt(document.getElementById('ht-key')?.value || 0);
        const path = this.getProbePath(key);
        this.highlightBuckets = path.visited;
        this.render();
        await Renderer.sleep(Renderer.getDelay() / 2);

        const before = this.entries.length;
        this.entries = this.entries.filter(entry => entry.key !== key);
        if (this.entries.length === before) {
            Renderer.log('NOT_FOUND', `${key} nicht gefunden`, 'danger');
        } else {
            Renderer.log('REMOVE', `${key} entfernt`, 'warning');
            this.rebuild();
        }
    },

    switchMode(mode) {
        this.mode = mode;
        this.highlightBuckets = [];
        Renderer.log('MODE', `Hashing-Modus: ${mode}`, 'success');
        this.rebuild();
    },

    randomFill() {
        const count = Renderer.randomInt(5, 8);
        const used = new Set();
        this.entries = [];
        while (this.entries.length < count) {
            const key = Renderer.randomInt(1, 59);
            if (used.has(key)) continue;
            used.add(key);
            this.entries.push({ key, value: Renderer.randomInt(10, 999) });
        }
        this.highlightBuckets = [];
        Renderer.log('RANDOM', `${count} Zufallseinträge erzeugt`, 'success');
        this.rebuild();
    },

    clear() {
        this.entries = [];
        this.highlightBuckets = [];
        Renderer.log('CLEAR', 'Hash-Tabelle geleert', 'warning');
        this.rebuild();
    },

    render() {
        const c = UI.getContainer();
        const normalized = this.mode === 'chaining'
            ? this.table
            : this.table.map(entry => (entry ? [entry] : []));

        let html = '<div class="ht-container">';
        normalized.forEach((bucket, idx) => {
            html += `<div class="ht-bucket">`;
            html += `<div class="ht-index ${this.highlightBuckets.includes(idx) ? 'highlight' : ''}">[${idx}]</div>`;
            html += '<div class="ht-chain">';
            if (bucket.length === 0) {
                html += '<div class="ht-entry empty">leer</div>';
            } else {
                bucket.forEach((entry, entryIdx) => {
                    html += `<div class="ht-entry ${this.highlightBuckets.includes(idx) ? 'highlight' : ''}">${entry.key}:${entry.value}</div>`;
                    if (entryIdx < bucket.length - 1) {
                        html += '<span class="ht-arrow">-></span>';
                    }
                });
            }
            html += '</div></div>';
        });
        html += '</div>';
        html += `<div style="margin-top:12px;font-size:13px;color:var(--text-secondary)">
            Elemente: <b>${this.entries.length}</b> | Buckets: <b>${this.capacity}</b> |
            Lastfaktor: <b>${(this.entries.length / this.capacity).toFixed(2)}</b> |
            Kollisionsstrategie: <b>${this.mode}</b>
        </div>`;

        c.innerHTML = html;
        memSim.layoutHashTable(normalized, this.capacity);
    }
});

const hashViz = VizRegistry.get('hashtable');

VizRegistry.register('mapset', {
    category: 'maps',
    name: 'Map und Set',
    icon: 'M',
    complexity: { time: 'O(1) avg get/set', space: 'O(n)' },
    mode: 'map',
    entries: [],
    capacity: 8,

    init() {
        this.mode = 'map';
        this.capacity = 8;
        this.entries = [
            { key: 4, value: 40 },
            { key: 11, value: 110 },
            { key: 19, value: 190 }
        ];
        UI.addControls(`
            <select id="mapset-mode" onchange="mapSetViz.switchMode(this.value)">
                <option value="map">Map</option>
                <option value="set">Set</option>
            </select>
            <input type="number" id="mapset-key" placeholder="Schlüssel" value="27" style="width:92px">
            <input type="number" id="mapset-val" placeholder="Wert" value="270" style="width:90px">
            <button class="primary" onclick="mapSetViz.upsert()">Hinzufügen / Setzen</button>
            <button class="danger" onclick="mapSetViz.remove()">Entfernen</button>
            <button onclick="mapSetViz.lookup()">Enthält / Lesen</button>
            <div class="separator"></div>
            <button onclick="mapSetViz.randomFill()">Zufallsdaten</button>
            <button class="danger" onclick="mapSetViz.clear()">Leeren</button>
        `);
        this.render();
    },

    destroy() {
        this.entries = [];
    },

    switchMode(mode) {
        this.mode = mode;
        Renderer.log('MODE', `Wechsel zu ${mode === 'map' ? 'Map' : 'Set'}`, 'success');
        this.render();
    },

    upsert() {
        const key = parseInt(document.getElementById('mapset-key')?.value || 0);
        const value = parseInt(document.getElementById('mapset-val')?.value || 0);
        const existing = this.entries.find(entry => entry.key === key);
        if (existing) {
            existing.value = value;
            Renderer.log('UPDATE', `${key} aktualisiert`, 'success');
        } else {
            this.entries.push({ key, value });
            Renderer.log('INSERT', this.mode === 'map' ? `${key} -> ${value}` : `${key} in Set`, 'success');
        }
        this.render();
    },

    remove() {
        const key = parseInt(document.getElementById('mapset-key')?.value || 0);
        const before = this.entries.length;
        this.entries = this.entries.filter(entry => entry.key !== key);
        Renderer.log(before === this.entries.length ? 'NOT_FOUND' : 'REMOVE', before === this.entries.length ? `${key} nicht gefunden` : `${key} entfernt`, before === this.entries.length ? 'danger' : 'warning');
        this.render();
    },

    lookup() {
        const key = parseInt(document.getElementById('mapset-key')?.value || 0);
        const entry = this.entries.find(item => item.key === key);
        if (!entry) {
            Renderer.log('NOT_FOUND', `${key} nicht vorhanden`, 'danger');
            return;
        }
        Renderer.log(this.mode === 'map' ? 'GET' : 'CONTAINS', this.mode === 'map' ? `${key} -> ${entry.value}` : `${key} ist im Set`, 'success');
    },

    randomFill() {
        const count = Renderer.randomInt(4, 7);
        const keys = new Set();
        this.entries = [];
        while (this.entries.length < count) {
            const key = Renderer.randomInt(1, 49);
            if (keys.has(key)) continue;
            keys.add(key);
            this.entries.push({ key, value: Renderer.randomInt(10, 499) });
        }
        Renderer.log('RANDOM', `${count} Einträge erzeugt`, 'success');
        this.render();
    },

    clear() {
        this.entries = [];
        Renderer.log('CLEAR', `${this.mode === 'map' ? 'Map' : 'Set'} geleert`, 'warning');
        this.render();
    },

    render() {
        const c = UI.getContainer();
        const buckets = Array.from({ length: this.capacity }, () => []);
        this.entries.forEach(entry => {
            buckets[Math.abs(entry.key) % this.capacity].push({ ...entry });
        });

        let html = '<div class="ht-container">';
        buckets.forEach((bucket, idx) => {
            html += `<div class="ht-bucket"><div class="ht-index">[${idx}]</div><div class="ht-chain">`;
            if (bucket.length === 0) {
                html += '<div class="ht-entry empty">leer</div>';
            } else {
                bucket.forEach((entry, entryIdx) => {
                    const label = this.mode === 'map' ? `${entry.key}:${entry.value}` : `${entry.key}`;
                    html += `<div class="ht-entry">${label}</div>`;
                    if (entryIdx < bucket.length - 1) {
                        html += '<span class="ht-arrow">-></span>';
                    }
                });
            }
            html += '</div></div>';
        });
        html += '</div>';
        html += `<div style="margin-top:12px;font-size:13px;color:var(--text-secondary)">
            Typ: <b>${this.mode === 'map' ? 'Map (Key -> Value)' : 'Set (nur eindeutige Keys)'}</b> |
            Einträge: <b>${this.entries.length}</b> |
            Bucket-Speicher: <b>${this.capacity * 8} Bytes</b>
        </div>`;

        c.innerHTML = html;
        memSim.layoutHashTable(buckets, this.capacity);
    }
});

const mapSetViz = VizRegistry.get('mapset');