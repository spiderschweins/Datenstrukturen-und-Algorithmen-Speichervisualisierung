/**
 * Interactive memory playground
 */
VizRegistry.register('memoryplay', {
    category: 'fundamentals',
    name: 'Speicherlabor',
    icon: 'MEM',
    complexity: { time: 'Analyse statt Algorithmus', space: 'abhängig vom Modell' },
    config: null,
    report: null,

    init() {
        this.config = {
            model: 'array',
            count: 6,
            valueSize: 4
        };
        UI.addControls(`
            <select id="mem-model" onchange="memoryPlayViz.buildFromControls()">
                <option value="array">Kontiguierliches Array</option>
                <option value="list">Verkettete Knoten</option>
                <option value="tree">Baumknoten</option>
                <option value="record">Gemischter Record</option>
            </select>
            <input type="number" id="mem-count" min="1" max="24" value="6" placeholder="Elemente" style="width:92px">
            <select id="mem-size" onchange="memoryPlayViz.buildFromControls()">
                <option value="1">1 Byte</option>
                <option value="4" selected>4 Byte</option>
                <option value="8">8 Byte</option>
            </select>
            <button class="primary" onclick="memoryPlayViz.buildFromControls()">Aufbauen</button>
            <button onclick="memoryPlayViz.loadExample()">Beispiel</button>
            <button class="danger" onclick="memoryPlayViz.clear()">Leeren</button>
        `);
        this.build();
    },

    destroy() {
        this.config = null;
        this.report = null;
    },

    readControls() {
        const model = document.getElementById('mem-model')?.value || 'array';
        const count = Math.max(1, Math.min(24, parseInt(document.getElementById('mem-count')?.value || 6, 10)));
        const valueSize = parseInt(document.getElementById('mem-size')?.value || 4, 10);
        this.config = { model, count, valueSize };
    },

    fillData(addr, size, seed) {
        const block = memSim.memory.get(addr);
        if (!block) return;
        for (let index = 0; index < size; index++) {
            block.bytes[index] = (seed + index * 13) & 0xFF;
        }
    },

    loadExample() {
        const examples = [
            { model: 'array', count: 12, valueSize: 4 },
            { model: 'list', count: 7, valueSize: 4 },
            { model: 'tree', count: 9, valueSize: 8 },
            { model: 'record', count: 5, valueSize: 1 }
        ];
        const pick = examples[Renderer.randomInt(0, examples.length - 1)];
        this.config = pick;
        document.getElementById('mem-model').value = pick.model;
        document.getElementById('mem-count').value = pick.count;
        document.getElementById('mem-size').value = String(pick.valueSize);
        this.build();
        Renderer.log('EXAMPLE', `${pick.model} mit ${pick.count} Einträgen geladen`, 'success');
    },

    clear() {
        memSim.reset();
        memSim.renderHTML([]);
        this.report = null;
        UI.getContainer().innerHTML = `
            <div class="memory-lab">
                <div class="memory-lab-hero">
                    <p class="memory-lab-kicker">Speicherlabor</p>
                    <h3>Leerer Arbeitsbereich</h3>
                    <p>Wähle oben ein Modell und baue ein Szenario auf. Rechts siehst du danach die konkreten Speicherblöcke und ihre Bytes.</p>
                </div>
            </div>
        `;
        Renderer.log('CLEAR', 'Speicherlabor geleert', 'warning');
    },

    buildFromControls() {
        this.readControls();
        this.build();
    },

    build() {
        const { model, count, valueSize } = this.config;
        memSim.reset();

        let payloadBytes = 0;
        let structuralBytes = 0;
        let highlights = [];
        let title = '';
        let explanation = '';
        let locality = '';
        let formula = '';
        let pointerFields = 0;

        if (model === 'array') {
            title = 'Kontiguierliches Array';
            explanation = 'Alle Werte liegen in einem zusammenhängenden Datenblock. Ein Header verweist auf diesen Bereich und speichert Verwaltungsdaten wie Länge und Kapazität.';
            locality = 'Sehr hoch: benachbarte Elemente liegen direkt nebeneinander.';
            formula = 'Header + n · sizeof(T)';

            const header = memSim.allocate(16, 'Array-Kopf', 'data');
            const data = memSim.allocate(Math.max(1, count * valueSize), 'Array-Daten', 'data');
            memSim.writeInt(header, count, 0);
            memSim.writeInt(header, count, 4);
            memSim.writePointer(header, data, 8);
            for (let index = 0; index < count; index++) {
                this.fillData(data, Math.min(valueSize, memSim.memory.get(data).bytes.length - index * valueSize), 24 + index);
            }
            payloadBytes = count * valueSize;
            structuralBytes = 16;
            highlights = [data];
        } else if (model === 'list') {
            title = 'Verkettete Knoten';
            explanation = 'Jeder Knoten enthält Nutzdaten plus Pointer auf den nächsten Knoten. Der Speicher ist flexibler, aber nicht lokal zusammenhängend.';
            locality = 'Niedriger: aufeinanderfolgende logische Elemente liegen physisch getrennt.';
            formula = 'Head-Pointer + n · (Padding + sizeof(T) + Pointer)';
            pointerFields = 1;

            const head = memSim.allocate(memSim.POINTER_SIZE, 'Head-Pointer', 'pointer');
            const dataFieldSize = Math.max(8, valueSize);
            let prev = null;
            for (let index = 0; index < count; index++) {
                const node = memSim.allocate(dataFieldSize + memSim.POINTER_SIZE, `Knoten[${index}]`, 'data');
                this.fillData(node, valueSize, 40 + index);
                if (index === 0) memSim.writePointer(head, node, 0);
                if (prev !== null) memSim.writePointer(prev, node, dataFieldSize);
                prev = node;
                highlights.push(node);
            }
            if (prev !== null) memSim.writePointer(prev, 0x0, Math.max(8, valueSize));
            payloadBytes = count * valueSize;
            structuralBytes = memSim.POINTER_SIZE + count * (Math.max(8, valueSize) - valueSize + memSim.POINTER_SIZE);
        } else if (model === 'tree') {
            title = 'Baumknoten';
            explanation = 'Ein Baumknoten trägt neben dem Wert gleich mehrere Verweise. Dadurch wird Suche über Struktur möglich, aber jeder Knoten wird deutlich größer.';
            locality = 'Mittel bis niedrig: logische Nachbarschaft folgt Zeigern, nicht Speicherlage.';
            formula = 'Root-Pointer + n · (Padding + sizeof(T) + 3 · Pointer)';
            pointerFields = 3;

            const root = memSim.allocate(memSim.POINTER_SIZE, 'Root-Pointer', 'pointer');
            const dataFieldSize = Math.max(8, valueSize);
            const nodeSize = dataFieldSize + memSim.POINTER_SIZE * 3;
            let rootAddr = 0;
            for (let index = 0; index < count; index++) {
                const node = memSim.allocate(nodeSize, `Knoten(${index})`, 'data');
                this.fillData(node, valueSize, 80 + index);
                highlights.push(node);
                if (index === 0) rootAddr = node;
            }
            if (rootAddr) memSim.writePointer(root, rootAddr, 0);
            payloadBytes = count * valueSize;
            structuralBytes = memSim.POINTER_SIZE + count * (Math.max(8, valueSize) - valueSize + memSim.POINTER_SIZE * 3);
        } else {
            title = 'Gemischter Record';
            explanation = 'Gemischte Felder zeigen, dass reale Objekte selten nur aus einem Typ bestehen. Kleine Felder erzeugen oft Padding, damit Pointer und größere Werte korrekt ausgerichtet liegen.';
            locality = 'Hoch innerhalb eines Records, aber jeder Eintrag enthält zusätzlichen Verwaltungsraum.';
            formula = 'n · (Felder + Padding + optionaler Pointer)';
            pointerFields = 1;

            const statusSize = 1;
            const idSize = 4;
            const valueField = valueSize;
            const prefix = 8;
            const recordSize = prefix + Math.max(8, valueField) + memSim.POINTER_SIZE;
            for (let index = 0; index < count; index++) {
                const record = memSim.allocate(recordSize, `Record[${index}]`, 'data');
                this.fillData(record, statusSize, 1 + index);
                this.fillData(record, idSize, 10 + index);
                this.fillData(record, valueField, 20 + index);
                memSim.writePointer(record, 0x0, prefix + Math.max(8, valueField));
                highlights.push(record);
            }
            payloadBytes = count * (statusSize + idSize + valueField);
            structuralBytes = count * (recordSize - (statusSize + idSize + valueField));
        }

        memSim.renderHTML(highlights);
        const totalBytes = memSim.getTotalBytes();
        const paddingBytes = Math.max(0, totalBytes - payloadBytes - structuralBytes);
        this.report = {
            title,
            explanation,
            locality,
            formula,
            payloadBytes,
            structuralBytes,
            paddingBytes,
            totalBytes,
            pointerFields,
            count,
            valueSize
        };
        this.render();
    },

    render() {
        const c = UI.getContainer();
        if (!this.report) {
            this.clear();
            return;
        }

        const payloadPct = this.report.totalBytes ? (this.report.payloadBytes / this.report.totalBytes) * 100 : 0;
        const structuralPct = this.report.totalBytes ? (this.report.structuralBytes / this.report.totalBytes) * 100 : 0;
        const paddingPct = Math.max(0, 100 - payloadPct - structuralPct);

        c.innerHTML = `
            <div class="memory-lab">
                <div class="memory-lab-hero">
                    <p class="memory-lab-kicker">Speicherlabor</p>
                    <h3>${this.report.title}</h3>
                    <p>${this.report.explanation}</p>
                </div>
                <div class="memory-lab-grid">
                    <article class="memory-lab-card">
                        <span class="memory-lab-label">Formel</span>
                        <strong>${this.report.formula}</strong>
                        <p>Elemente: ${this.report.count} · Wertgröße: ${this.report.valueSize} Byte · Pointer pro Eintrag: ${this.report.pointerFields}</p>
                    </article>
                    <article class="memory-lab-card">
                        <span class="memory-lab-label">Lokalität</span>
                        <strong>${this.report.locality}</strong>
                        <p>Je zusammenhängender die Daten liegen, desto besser sind Zugriffe für Cache und sequentielles Traversieren.</p>
                    </article>
                    <article class="memory-lab-card">
                        <span class="memory-lab-label">Padding</span>
                        <strong>${this.report.paddingBytes} Byte</strong>
                        <p>Padding entsteht, wenn Felder oder Blöcke ausgerichtet werden müssen. Es trägt keine Nutzdaten, belegt aber Speicher.</p>
                    </article>
                </div>
                <div class="memory-composition-card">
                    <div class="memory-lab-label">Speicherzusammensetzung</div>
                    <div class="memory-composition-bar">
                        <span class="memory-segment payload" style="width:${payloadPct}%">Nutzdaten</span>
                        <span class="memory-segment overhead" style="width:${structuralPct}%">Overhead</span>
                        <span class="memory-segment padding" style="width:${paddingPct}%">Padding</span>
                    </div>
                    <div class="memory-composition-stats">
                        <span>Nutzdaten: <b>${this.report.payloadBytes} B</b></span>
                        <span>Overhead: <b>${this.report.structuralBytes} B</b></span>
                        <span>Padding: <b>${this.report.paddingBytes} B</b></span>
                        <span>Gesamt: <b>${this.report.totalBytes} B</b></span>
                    </div>
                </div>
                <div class="memory-lab-notes">
                    <div class="memory-note">
                        <strong>So spielst du damit</strong>
                        <p>Erhöhe zuerst die Elementanzahl. Wechsle danach zwischen Array und Liste. Du siehst sofort, wie derselbe logische Inhalt unterschiedliche physische Kosten erzeugt.</p>
                    </div>
                    <div class="memory-note">
                        <strong>Was du vergleichen solltest</strong>
                        <p>Achte auf das Verhältnis von Nutzdaten zu Verwaltungsdaten. Besonders bei kleinen Werten dominieren Pointer, Header oder Padding sehr schnell.</p>
                    </div>
                </div>
            </div>
        `;
    }
});

const memoryPlayViz = VizRegistry.get('memoryplay');