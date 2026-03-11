/**
 * Sorting algorithms visualization
 */
VizRegistry.register('sorting', {
    category: 'sorting',
    name: 'Sortieralgorithmen',
    icon: 'S',
    complexity: { time: 'O(n log n) bis O(n^2)', space: 'algorithmusabhängig' },
    data: [],
    algorithm: 'quick',
    running: false,
    comparing: [],
    swapping: [],
    sorted: [],
    pivot: null,

    init() {
        this.data = Renderer.randomArray(16, 5, 99);
        this.algorithm = 'quick';
        this.running = false;
        this.comparing = [];
        this.swapping = [];
        this.sorted = [];
        this.pivot = null;
        UI.addControls(`
            <select id="sort-alg" onchange="sortingViz.setAlgorithm(this.value)">
                <option value="quick">Quicksort</option>
                <option value="merge">Mergesort</option>
                <option value="heap">Heapsort</option>
                <option value="bucket">Bucketsort</option>
                <option value="radix">Radixsort</option>
            </select>
            <button class="primary" onclick="sortingViz.startSort()">Start</button>
            <button onclick="sortingViz.randomize()">Neue Daten</button>
            <button onclick="sortingViz.reverse()">Absteigend</button>
            <button class="danger" onclick="sortingViz.resetMarks()">Markierungen leeren</button>
        `);
        this.render();
    },

    destroy() {
        this.running = false;
        this.data = [];
    },

    setAlgorithm(algorithm) {
        if (this.running) return;
        this.algorithm = algorithm;
        Renderer.log('ALGO', `${algorithm} ausgewählt`, 'success');
        this.render();
    },

    randomize() {
        if (this.running) return;
        this.data = Renderer.randomArray(16, 5, 99);
        this.resetMarks();
        Renderer.log('RANDOM', 'Neue Zufallsfolge erzeugt', 'success');
        this.render();
    },

    reverse() {
        if (this.running) return;
        this.data = [...this.data].sort((a, b) => b - a);
        this.resetMarks();
        Renderer.log('REVERSE', 'Worst-Case-ähnliche Reihenfolge erzeugt', 'warning');
        this.render();
    },

    resetMarks() {
        this.comparing = [];
        this.swapping = [];
        this.sorted = [];
        this.pivot = null;
        this.render();
    },

    async pause() {
        this.render();
        await Renderer.sleep(Math.max(40, Renderer.getDelay() / 2));
    },

    async compareIndices(indices, pivot = null) {
        this.comparing = indices;
        this.swapping = [];
        this.pivot = pivot;
        await this.pause();
    },

    async swap(i, j) {
        this.swapping = [i, j];
        this.comparing = [];
        await this.pause();
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
        await this.pause();
    },

    markSorted(indices) {
        const set = new Set(this.sorted);
        indices.forEach(index => set.add(index));
        this.sorted = Array.from(set);
    },

    async startSort() {
        if (this.running) return;
        this.running = true;
        this.resetMarks();
        Renderer.log('START', `${this.algorithm} startet mit ${this.data.length} Elementen`, 'success');

        try {
            if (this.algorithm === 'quick') {
                await this.quickSort(0, this.data.length - 1);
            } else if (this.algorithm === 'merge') {
                await this.mergeSort(0, this.data.length - 1);
            } else if (this.algorithm === 'heap') {
                await this.heapSort();
            } else if (this.algorithm === 'bucket') {
                await this.bucketSort();
            } else if (this.algorithm === 'radix') {
                await this.radixSort();
            }
            this.markSorted(this.data.map((_, index) => index));
            Renderer.log('DONE', `${this.algorithm} abgeschlossen`, 'success');
        } finally {
            this.comparing = [];
            this.swapping = [];
            this.pivot = null;
            this.running = false;
            this.render();
        }
    },

    async quickSort(left, right) {
        if (left > right) return;
        if (left === right) {
            this.markSorted([left]);
            this.render();
            return;
        }

        const pivotIndex = await this.partition(left, right);
        this.markSorted([pivotIndex]);
        await this.quickSort(left, pivotIndex - 1);
        await this.quickSort(pivotIndex + 1, right);
    },

    async partition(left, right) {
        const pivotValue = this.data[right];
        let storeIndex = left;
        this.pivot = right;
        for (let index = left; index < right; index++) {
            await this.compareIndices([index, storeIndex], right);
            if (this.data[index] <= pivotValue) {
                await this.swap(index, storeIndex);
                storeIndex++;
            }
        }
        await this.swap(storeIndex, right);
        return storeIndex;
    },

    async mergeSort(left, right) {
        if (left >= right) return;
        const mid = Math.floor((left + right) / 2);
        await this.mergeSort(left, mid);
        await this.mergeSort(mid + 1, right);
        await this.merge(left, mid, right);
    },

    async merge(left, mid, right) {
        const leftPart = this.data.slice(left, mid + 1);
        const rightPart = this.data.slice(mid + 1, right + 1);
        let leftIndex = 0;
        let rightIndex = 0;
        let target = left;

        while (leftIndex < leftPart.length && rightIndex < rightPart.length) {
            await this.compareIndices([target], null);
            if (leftPart[leftIndex] <= rightPart[rightIndex]) {
                this.data[target++] = leftPart[leftIndex++];
            } else {
                this.data[target++] = rightPart[rightIndex++];
            }
            await this.pause();
        }
        while (leftIndex < leftPart.length) {
            this.data[target++] = leftPart[leftIndex++];
            await this.pause();
        }
        while (rightIndex < rightPart.length) {
            this.data[target++] = rightPart[rightIndex++];
            await this.pause();
        }
    },

    async heapSort() {
        const heapify = async (length, root) => {
            let largest = root;
            const left = 2 * root + 1;
            const right = 2 * root + 2;

            if (left < length) {
                await this.compareIndices([largest, left]);
                if (this.data[left] > this.data[largest]) largest = left;
            }
            if (right < length) {
                await this.compareIndices([largest, right]);
                if (this.data[right] > this.data[largest]) largest = right;
            }
            if (largest !== root) {
                await this.swap(root, largest);
                await heapify(length, largest);
            }
        };

        for (let index = Math.floor(this.data.length / 2) - 1; index >= 0; index--) {
            await heapify(this.data.length, index);
        }
        for (let end = this.data.length - 1; end > 0; end--) {
            await this.swap(0, end);
            this.markSorted([end]);
            await heapify(end, 0);
        }
        this.markSorted([0]);
    },

    async bucketSort() {
        const buckets = Array.from({ length: 10 }, () => []);
        for (let index = 0; index < this.data.length; index++) {
            await this.compareIndices([index]);
            const bucketIndex = Math.min(9, Math.floor(this.data[index] / 10));
            buckets[bucketIndex].push(this.data[index]);
            Renderer.log('BUCKET', `${this.data[index]} -> Bucket ${bucketIndex}`, 'warning');
        }
        let writeIndex = 0;
        buckets.forEach(bucket => bucket.sort((a, b) => a - b));
        for (const bucket of buckets) {
            for (const value of bucket) {
                this.data[writeIndex] = value;
                this.markSorted([writeIndex]);
                writeIndex++;
                await this.pause();
            }
        }
    },

    async radixSort() {
        const max = Math.max(...this.data, 0);
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            const buckets = Array.from({ length: 10 }, () => []);
            for (let index = 0; index < this.data.length; index++) {
                await this.compareIndices([index]);
                const digit = Math.floor(this.data[index] / exp) % 10;
                buckets[digit].push(this.data[index]);
            }
            let writeIndex = 0;
            for (const bucket of buckets) {
                for (const value of bucket) {
                    this.data[writeIndex++] = value;
                    await this.pause();
                }
            }
            Renderer.log('RADIX', `Ziffernstelle ${exp} verarbeitet`, 'success');
        }
    },

    render() {
        const c = UI.getContainer();
        const max = Math.max(...this.data, 1);
        let html = '<div class="sort-bars">';
        this.data.forEach((value, index) => {
            const classes = ['sort-bar'];
            if (this.comparing.includes(index)) classes.push('comparing');
            if (this.swapping.includes(index)) classes.push('swapping');
            if (this.sorted.includes(index)) classes.push('sorted');
            if (this.pivot === index) classes.push('pivot');
            html += `<div class="${classes.join(' ')}" style="height:${Math.max(16, (value / max) * 260)}px" title="${value}"></div>`;
        });
        html += '</div>';
        html += '<div class="array-container">';
        this.data.forEach((value, index) => {
            const classes = ['array-cell'];
            if (this.comparing.includes(index)) classes.push('comparing');
            if (this.swapping.includes(index)) classes.push('active');
            if (this.sorted.includes(index)) classes.push('sorted');
            html += `<div class="${classes.join(' ')}"><div class="cell-value">${value}</div><div class="cell-index">[${index}]</div></div>`;
        });
        html += '</div>';
        html += `<div style="margin-top:12px;font-size:13px;color:var(--text-secondary)">
            Algorithmus: <b>${this.algorithm}</b> | Elemente: <b>${this.data.length}</b> |
            Wertebereich: <b>${Math.min(...this.data)}-${Math.max(...this.data)}</b>
        </div>`;
        c.innerHTML = html;
        memSim.layoutArray(this.data);
    }
});

const sortingViz = VizRegistry.get('sorting');