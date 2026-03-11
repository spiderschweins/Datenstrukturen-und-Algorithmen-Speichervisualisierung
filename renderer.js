/**
 * Rendering utilities for visualizations
 */
const Renderer = {
    animationProfiles: {
        array: { enabled: true, hint: 'Wirkt bei Einfügen, Zugriff und Resize-Schritten' },
        linkedlist: { enabled: true, hint: 'Wirkt bei Traversierung und markierten Knotenpfaden' },
        stack: { enabled: false, hint: 'Diese Ansicht aktualisiert direkt ohne Zeitsteuerung' },
        queue: { enabled: false, hint: 'Diese Ansicht aktualisiert direkt ohne Zeitsteuerung' },
        deque: { enabled: false, hint: 'Diese Ansicht aktualisiert direkt ohne Zeitsteuerung' },
        heap: { enabled: true, hint: 'Wirkt bei Upheap- und Downheap-Schritten' },
        bst: { enabled: true, hint: 'Wirkt bei Suchpfaden und Traversierungen' },
        avl: { enabled: true, hint: 'Wirkt bei Suche und markierten Rotationen' },
        splay: { enabled: false, hint: 'Die Splay-Operation aktualisiert hier direkt' },
        hashtable: { enabled: true, hint: 'Wirkt bei Sondierung und Bucket-Suche' },
        mapset: { enabled: false, hint: 'Map und Set aktualisieren direkt ohne Zeitsteuerung' },
        sorting: { enabled: true, hint: 'Wirkt beim schrittweisen Sortieren' },
        graph: { enabled: true, hint: 'Wirkt bei BFS, DFS, Dijkstra, Prim und Kruskal' },
        memoryplay: { enabled: false, hint: 'Das Speicherlabor reagiert direkt auf Eingaben' }
    },

    logLabels: {
        INIT: 'Start',
        RENDER: 'Anzeige',
        ACCESS: 'Zugriff',
        INSERT: 'Einfügen',
        UPDATE: 'Aktualisieren',
        REMOVE: 'Entfernen',
        CLEAR: 'Leeren',
        SEARCH: 'Suche',
        FOUND: 'Treffer',
        NOT_FOUND: 'Kein Treffer',
        ERROR: 'Fehler',
        START: 'Start',
        DONE: 'Fertig',
        BUILD: 'Aufbau',
        RANDOM: 'Zufall',
        TYPE: 'Typ',
        MODE: 'Modus',
        COMPARE: 'Vergleich',
        VISIT: 'Besuch',
        RESIZE: 'Resize',
        ORDER: 'Reihenfolge',
        DIST: 'Distanzen',
        RELAX: 'Relax',
        ACCEPT: 'Akzeptiert',
        REJECT: 'Verworfen',
        ALGO: 'Algorithmus',
        PUSH: 'Push',
        POP: 'Pop',
        TOP: 'Peek',
        FRONT: 'Front',
        ENQUEUE: 'Einfügen',
        DEQUEUE: 'Entfernen',
        ADD_FIRST: 'Vorne ein',
        ADD_LAST: 'Hinten ein',
        REMOVE_FIRST: 'Vorne raus',
        REMOVE_LAST: 'Hinten raus',
        REM_FIRST: 'Vorne raus',
        REM_LAST: 'Hinten raus',
        INORDER: 'Inorder',
        PREORDER: 'Preorder',
        ROTATE_L: 'Linksrotation',
        ROTATE_R: 'Rechtsrotation',
        DOUBLE: 'Doppelrotation',
        SPLAY: 'Splay',
        BUCKET: 'Bucket',
        WEIGHTS: 'Gewichte',
        SWAP: 'Tausch',
        REVERSE: 'Absteigend',
        RADIX: 'Radix',
        MST: 'Spannbaum',
        DUPLICATE: 'Duplikat'
    },

    /** Get animation delay based on speed slider */
    getDelay() {
        const slider = document.getElementById('speed-slider');
        if (!slider || slider.disabled) {
            return 600;
        }
        const speed = parseInt(document.getElementById('speed-slider')?.value || 5);
        return Math.max(50, 1100 - speed * 100);
    },

    getAnimationProfile(vizId) {
        return this.animationProfiles[vizId] || { enabled: false, hint: 'Diese Ansicht nutzt keine zeitgesteuerten Animationen' };
    },

    /** Sleep for animation */
    sleep(ms) {
        if (ms === undefined) ms = this.getDelay();
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /** Add log entry */
    log(op, detail, type = '') {
        const content = document.getElementById('log-content');
        if (!content) return;
        const count = content.children.length;
        const label = this.logLabels[op] || op;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type ? 'highlight-' + type : ''}`;
        entry.innerHTML = `
            <span class="log-time">${count + 1}</span>
            <span class="log-op">${label}</span>
            <span class="log-detail">${detail}</span>
        `;
        content.appendChild(entry);
        content.scrollTop = content.scrollHeight;
    },

    clearLog() {
        const content = document.getElementById('log-content');
        if (content) content.innerHTML = '';
    },

    /** Draw line between two tree nodes */
    drawTreeEdge(container, x1, y1, x2, y2, className = '') {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        const line = document.createElement('div');
        line.className = `tree-edge ${className}`;
        line.style.width = `${length}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;
        container.appendChild(line);
        return line;
    },

    /** Create SVG for graphs */
    createSVG(container, width, height) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        container.appendChild(svg);
        return svg;
    },

    /** Format number with commas */
    formatNum(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /** Generate random int between min and max (inclusive) */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /** Generate random array */
    randomArray(size, min = 1, max = 99) {
        return Array.from({ length: size }, () => this.randomInt(min, max));
    },

    /** Shuffle array */
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
};
