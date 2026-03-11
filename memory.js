/**
 * Memory Layout Simulator
 * Shows how data structures look in physical memory (64-bit system)
 */
class MemorySimulator {
    constructor() {
        this.baseAddress = 0x7FFE0000;
        this.memory = new Map(); // address -> { bytes, label, type }
        this.nextFree = this.baseAddress;
        this.expandedBlocks = new Set();
        this.POINTER_SIZE = 8; // 64-bit
        this.INT_SIZE = 4;     // 32-bit int
        this.DOUBLE_SIZE = 8;  // 64-bit double
    }

    reset() {
        this.memory.clear();
        this.nextFree = this.baseAddress;
        this.expandedBlocks.clear();
    }

    getCollapsedByteCount(block) {
        return block.size <= 16 ? 16 : 8;
    }

    getByteClass(block, index) {
        return block.byteKinds[index];
    }

    attachExpandHandlers(display, highlightAddrs) {
        const toggles = display.querySelectorAll('.mem-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const addr = Number(toggle.dataset.addr);
                if (this.expandedBlocks.has(addr)) {
                    this.expandedBlocks.delete(addr);
                } else {
                    this.expandedBlocks.add(addr);
                }
                this.renderHTML(highlightAddrs);
            });
        });
    }

    allocate(size, label = '', type = 'data') {
        const addr = this.nextFree;
        this.memory.set(addr, {
            size,
            label,
            type,
            bytes: new Array(size).fill(0),
            byteKinds: new Array(size).fill('empty')
        });
        this.nextFree += size;
        // Align to 8 bytes
        this.nextFree = Math.ceil(this.nextFree / 8) * 8;
        return addr;
    }

    writeInt(addr, value, offset = 0) {
        const block = this.memory.get(addr);
        if (!block) return;
        const bytes = this.intToBytes(value);
        for (let i = 0; i < 4 && offset + i < block.bytes.length; i++) {
            block.bytes[offset + i] = bytes[i];
            block.byteKinds[offset + i] = 'data';
        }
    }

    writePointer(addr, ptrValue, offset = 0) {
        const block = this.memory.get(addr);
        if (!block) return;
        const bytes = this.ptrToBytes(ptrValue);
        for (let i = 0; i < 8 && offset + i < block.bytes.length; i++) {
            block.bytes[offset + i] = bytes[i];
            block.byteKinds[offset + i] = 'pointer';
        }
    }

    intToBytes(val) {
        const buf = new ArrayBuffer(4);
        new Int32Array(buf)[0] = val;
        return Array.from(new Uint8Array(buf));
    }

    ptrToBytes(val) {
        // Simplified: show as 4 meaningful bytes
        return [
            (val >> 24) & 0xFF, (val >> 16) & 0xFF,
            (val >> 8) & 0xFF, val & 0xFF,
            0x00, 0x00, 0x7F, 0xFE
        ];
    }

    getTotalBytes() {
        let total = 0;
        this.memory.forEach(block => total += block.size);
        return total;
    }

    getTotalBits() {
        return this.getTotalBytes() * 8;
    }

    renderHTML(highlightAddrs = []) {
        const display = document.getElementById('memory-display');
        const stats = document.getElementById('memory-stats');
        if (!display) return;

        const entries = Array.from(this.memory.entries()).sort((a, b) => a[0] - b[0]);
        const totalBytes = this.getTotalBytes();
        const totalBits = this.getTotalBits();
        const blocks = this.memory.size;
        const firstAddr = entries[0]?.[0] || this.baseAddress;
        const lastEntry = entries[entries.length - 1];
        const lastAddr = lastEntry ? lastEntry[0] + lastEntry[1].size : this.baseAddress;

        let html = `
            <div class="memory-overview">
                <div class="memory-overview-row">
                    <span class="memory-overview-label">Adressbereich</span>
                    <span class="memory-overview-value">0x${firstAddr.toString(16).toUpperCase()} - 0x${lastAddr.toString(16).toUpperCase()}</span>
                </div>
                <div class="memory-overview-row">
                    <span class="memory-overview-label">Interpretation</span>
                    <span class="memory-overview-value">Links steht die Adresse, in der Mitte liegen die ersten Bytes, rechts der logische Blockname.</span>
                </div>
            </div>
            <div class="memory-legend">
                <span class="legend-chip"><span class="legend-swatch data"></span>Datenbyte</span>
                <span class="legend-chip"><span class="legend-swatch pointer"></span>Pointerbyte</span>
                <span class="legend-chip"><span class="legend-swatch highlight"></span>Aktiver Block</span>
                <span class="legend-chip"><span class="legend-swatch empty"></span>Leer oder Padding</span>
            </div>
        `;

        for (const [addr, block] of entries) {
            const isHighlight = highlightAddrs.includes(addr);
            const collapsedBytes = this.getCollapsedByteCount(block);
            const isExpanded = this.expandedBlocks.has(addr);
            const visibleBytes = isExpanded ? block.bytes.length : Math.min(block.bytes.length, collapsedBytes);
            html += `<div class="mem-row ${isHighlight ? 'active' : ''}">`;
            html += `<div class="mem-meta">`;
            html += `<span class="mem-addr">0x${addr.toString(16).toUpperCase()}</span>`;
            html += `<span class="mem-size">${block.size} B</span>`;
            html += `</div>`;
            html += `<span class="mem-content">`;

            for (let i = 0; i < visibleBytes; i++) {
                const cls = this.getByteClass(block, i);
                html += `<span class="mem-byte ${cls}">${block.bytes[i].toString(16).padStart(2, '0')}</span>`;
            }
            if (block.bytes.length > visibleBytes) {
                html += `<button type="button" class="mem-byte empty mem-toggle" data-addr="${addr}" aria-label="Weitere Bytes anzeigen">...</button>`;
            } else if (block.bytes.length > collapsedBytes) {
                html += `<button type="button" class="mem-byte empty mem-toggle" data-addr="${addr}" aria-label="Weniger Bytes anzeigen">−</button>`;
            }
            html += `</span>`;
            html += `<span class="mem-label ${isHighlight ? 'active' : ''}">${block.label}</span>`;
            html += `</div>`;
        }

        display.innerHTML = html;
        this.attachExpandHandlers(display, highlightAddrs);

        if (stats) {
            stats.innerHTML = `
                <div class="stat-row"><span>Blöcke</span><span class="stat-value">${blocks}</span></div>
                <div class="stat-row"><span>Bytes gesamt</span><span class="stat-value">${totalBytes} B</span></div>
                <div class="stat-row"><span>Bits gesamt</span><span class="stat-value">${totalBits} bit</span></div>
                <div class="stat-row"><span>Pointer-Größe</span><span class="stat-value">${this.POINTER_SIZE} B (64-bit)</span></div>
                <div class="stat-row"><span>Int-Größe</span><span class="stat-value">${this.INT_SIZE} B (32-bit)</span></div>
                <div class="stat-row"><span>Faustregel</span><span class="stat-value">Gesamt = Summe aller Blockgrößen</span></div>
            `;
        }
    }

    // Specific layouts for different data structures
    layoutArray(arr) {
        this.reset();
        // Array header: length (4B) + capacity (4B) + pointer to data (8B) = 16B
        const header = this.allocate(16, 'Array-Kopf', 'data');
        this.writeInt(header, arr.length, 0);
        this.writeInt(header, arr.length, 4);

        // Data block: n * 4B for ints
        const dataSize = Math.max(arr.length, 1) * this.INT_SIZE;
        const data = this.allocate(dataSize, 'Array-Daten', 'data');
        this.writePointer(header, data, 8);

        arr.forEach((val, i) => {
            this.writeInt(data, val, i * this.INT_SIZE);
        });

        this.renderHTML([data]);
    }

    layoutLinkedList(values) {
        this.reset();
        // Each node: data (4B) + padding (4B) + next pointer (8B) = 16B
        // Head pointer: 8B
        const headPtr = this.allocate(8, 'Head-Pointer', 'pointer');

        let prevAddr = null;
        const nodeAddrs = [];

        values.forEach((val, i) => {
            const nodeAddr = this.allocate(16, `Knoten[${i}]`, 'data');
            nodeAddrs.push(nodeAddr);
            this.writeInt(nodeAddr, val, 0);

            if (i === 0) {
                this.writePointer(headPtr, nodeAddr, 0);
            }
            if (prevAddr !== null) {
                this.writePointer(prevAddr, nodeAddr, 8);
            }
            prevAddr = nodeAddr;
        });

        // Last node's next = NULL
        if (prevAddr !== null) {
            this.writePointer(prevAddr, 0x0, 8);
        }

        this.renderHTML(nodeAddrs);
    }

    layoutBST(nodes) {
        this.reset();
        // Each node: key (4B) + padding (4B) + left ptr (8B) + right ptr (8B) + parent ptr (8B) = 32B
        const rootPtr = this.allocate(8, 'Root-Pointer', 'pointer');

        if (nodes.length > 0) {
            const addrs = [];
            nodes.forEach((node, i) => {
                const addr = this.allocate(32, `Knoten(${node.key})`, 'data');
                addrs.push(addr);
                this.writeInt(addr, node.key, 0);
            });
            this.writePointer(rootPtr, addrs[0], 0);
            this.renderHTML(addrs);
        } else {
            this.renderHTML([]);
        }
    }

    layoutHashTable(table, capacity) {
        this.reset();
        // Table header: size (4B) + capacity (4B) + load factor (8B) + pointer to buckets (8B)
        const header = this.allocate(24, 'HT-Kopf', 'data');
        const bucketsSize = capacity * this.POINTER_SIZE;
        const buckets = this.allocate(bucketsSize, 'Bucket-Feld', 'pointer');
        this.writePointer(header, buckets, 16);

        let entryCount = 0;
        table.forEach((bucket, i) => {
            if (bucket && bucket.length > 0) {
                bucket.forEach(entry => {
                    const entryAddr = this.allocate(24, `Eintrag(${entry.key})`, 'data');
                    this.writeInt(entryAddr, entry.key, 0);
                    this.writeInt(entryAddr, entry.value, 4);
                    entryCount++;
                });
            }
        });

        this.writeInt(header, entryCount, 0);
        this.writeInt(header, capacity, 4);
        this.renderHTML([]);
    }

    layoutGraph(numVertices, numEdges) {
        this.reset();
        // Adjacency list representation
        // Array of vertex pointers: n * 8B
        const vertexArray = this.allocate(numVertices * 8, 'Knotenfeld', 'pointer');
        // Each edge stored in both adjacency lists: (target vertex 4B + weight 4B + next ptr 8B) = 16B
        const edgeStorage = this.allocate(numEdges * 2 * 16, 'Kantenspeicher', 'data');
        this.renderHTML([vertexArray]);
    }
}

// Global instance
const memSim = new MemorySimulator();
