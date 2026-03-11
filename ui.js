/**
 * UI Management
 */
const snippet = (language, code) => ({ language, code: code.trim() });
const link = (label, href) => ({ label, href });

const implementationSnippets = {
    memoryplay: snippet('Python', `import ctypes

class ListNode(ctypes.Structure):
    _fields_ = [
        ('value', ctypes.c_int32),
        ('next', ctypes.c_void_p),
    ]

print('Node-Größe:', ctypes.sizeof(ListNode), 'Bytes')`),
    array: snippet('Python', `class DynamicArray:
    def __init__(self):
        self.data = []

    def append(self, value):
        self.data.append(value)

    def insert_at(self, index, value):
        self.data.insert(index, value)

    def get(self, index):
        return self.data[index]`),
    linkedlist: snippet('Python', `class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

class LinkedList:
    def __init__(self):
        self.head = None

    def add_first(self, value):
        self.head = Node(value, self.head)

    def add_last(self, value):
        if not self.head:
            self.head = Node(value)
            return
        node = self.head
        while node.next:
            node = node.next
        node.next = Node(value)`),
    stack: snippet('Python', `class Stack:
    def __init__(self):
        self.items = []

    def push(self, value):
        self.items.append(value)

    def pop(self):
        return self.items.pop()

    def peek(self):
        return self.items[-1]`),
    queue: snippet('Python', `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, value):
        self.items.append(value)

    def dequeue(self):
        return self.items.popleft()

    def front(self):
        return self.items[0]`),
    deque: snippet('Python', `from collections import deque

items = deque([10, 25, 7])
items.appendleft(5)
items.append(42)
left = items.popleft()
right = items.pop()`),
    heap: snippet('Python', `import heapq

heap = []
for value in [15, 9, 6, 7, 4, 2, 1]:
    heapq.heappush(heap, value)

heapq.heappush(heap, 3)
root = heapq.heappop(heap)
next_root = heap[0]`),
    bst: snippet('Python', `class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None

def insert(node, key):
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    return node

def search(node, key):
    while node and node.key != key:
        node = node.left if key < node.key else node.right
    return node`),
    avl: snippet('Python', `def height(node):
    return -1 if node is None else node.height

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    return y

def rebalance(node):
    balance = height(node.left) - height(node.right)
    if balance > 1:
        return rotate_right(node)
    if balance < -1:
        return rotate_left(node)
    return node`),
    splay: snippet('Python', `def rotate_right(node):
    child = node.left
    node.left = child.right
    child.right = node
    return child

def splay(node, key):
    if node is None or node.key == key:
        return node
    if key < node.key and node.left:
        node.left.left = splay(node.left.left, key)
        return rotate_right(node)
    if key > node.key and node.right:
        node.right.right = splay(node.right.right, key)
        return rotate_left(node)
    return node`),
    hashtable: snippet('Python', `class HashTable:
    def __init__(self, capacity=8):
        self.buckets = [[] for _ in range(capacity)]

    def _index(self, key):
        return hash(key) % len(self.buckets)

    def set(self, key, value):
        bucket = self.buckets[self._index(key)]
        for entry in bucket:
            if entry[0] == key:
                entry[1] = value
                return
        bucket.append([key, value])`),
    mapset: snippet('Python', `scores = {4: 40, 11: 110}
visited = {4, 11, 19}

scores[27] = 270
contains_11 = 11 in visited
value_4 = scores.get(4)
visited.discard(19)`),
    sorting: snippet('Python', `def quicksort(values):
    if len(values) <= 1:
        return values
    pivot = values[-1]
    left = [x for x in values[:-1] if x <= pivot]
    right = [x for x in values[:-1] if x > pivot]
    return quicksort(left) + [pivot] + quicksort(right)`),
    graph: snippet('Python', `import heapq

def dijkstra(graph, start):
    dist = {start: 0}
    heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost > dist.get(node, float('inf')):
            continue
        for nxt, weight in graph[node]:
            new_cost = cost + weight
            if new_cost < dist.get(nxt, float('inf')):
                dist[nxt] = new_cost
                heapq.heappush(heap, (new_cost, nxt))
    return dist`)
};

const multiImplementationSnippets = {
    memoryplay: [
        snippet('Python · ctypes', `import ctypes

class TreeNode(ctypes.Structure):
    _fields_ = [
        ('key', ctypes.c_int32),
        ('left', ctypes.c_void_p),
        ('right', ctypes.c_void_p),
        ('parent', ctypes.c_void_p),
    ]

print('TreeNode:', ctypes.sizeof(TreeNode), 'Bytes')`),
        snippet('Java · Objektmodell', `class Node {
    int value;
    Node next;
}

// Die genaue Objektgröße hängt von JVM, Header und Alignment ab,
// enthält aber immer Nutzdaten plus Verwaltungsinformationen.`)
    ],
    sorting: [
        snippet('Python · Quicksort', `def quicksort(values):
    if len(values) <= 1:
        return values
    pivot = values[-1]
    left = [x for x in values[:-1] if x <= pivot]
    right = [x for x in values[:-1] if x > pivot]
    return quicksort(left) + [pivot] + quicksort(right)`),
        snippet('Python · Mergesort', `def mergesort(values):
    if len(values) <= 1:
        return values
    mid = len(values) // 2
    left = mergesort(values[:mid])
    right = mergesort(values[mid:])
    merged = []
    while left and right:
        merged.append(left.pop(0) if left[0] <= right[0] else right.pop(0))
    return merged + left + right`),
        snippet('Python · Heapsort', `import heapq

def heapsort(values):
    heap = list(values)
    heapq.heapify(heap)
    return [heapq.heappop(heap) for _ in range(len(heap))]`),
        snippet('Python · Bucketsort', `def bucketsort(values):
    buckets = [[] for _ in range(10)]
    for value in values:
        buckets[min(9, value // 10)].append(value)
    result = []
    for bucket in buckets:
        result.extend(sorted(bucket))
    return result`),
        snippet('Python · Radixsort', `def radixsort(values):
    exp = 1
    output = list(values)
    while max(output, default=0) // exp > 0:
        buckets = [[] for _ in range(10)]
        for value in output:
            buckets[(value // exp) % 10].append(value)
        output = [value for bucket in buckets for value in bucket]
        exp *= 10
    return output`)
    ],
    graph: [
        snippet('Python · BFS', `from collections import deque

def bfs(graph, start):
    seen = {start}
    order = []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return order`),
        snippet('Python · DFS', `def dfs(graph, start, seen=None, order=None):
    seen = seen or set()
    order = order or []
    seen.add(start)
    order.append(start)
    for nxt in graph[start]:
        if nxt not in seen:
            dfs(graph, nxt, seen, order)
    return order`),
        snippet('Python · Dijkstra', `import heapq

def dijkstra(graph, start):
    dist = {start: 0}
    heap = [(0, start)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost > dist.get(node, float('inf')):
            continue
        for nxt, weight in graph[node]:
            new_cost = cost + weight
            if new_cost < dist.get(nxt, float('inf')):
                dist[nxt] = new_cost
                heapq.heappush(heap, (new_cost, nxt))
    return dist`),
        snippet('Python · Prim', `import heapq

def prim(graph, start):
    seen = {start}
    heap = [(w, start, nxt) for nxt, w in graph[start]]
    heapq.heapify(heap)
    mst = []
    while heap:
        weight, src, dst = heapq.heappop(heap)
        if dst in seen:
            continue
        seen.add(dst)
        mst.append((src, dst, weight))
        for nxt, w in graph[dst]:
            if nxt not in seen:
                heapq.heappush(heap, (w, dst, nxt))
    return mst`),
        snippet('Python · Kruskal', `def kruskal(vertices, edges):
    parent = {v: v for v in vertices}

    def find(v):
        while parent[v] != v:
            v = parent[v]
        return v

    mst = []
    for u, v, w in sorted(edges, key=lambda edge: edge[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[rv] = ru
            mst.append((u, v, w))
    return mst`)
    ]
};

const wikiLinks = {
    memoryplay: [
        link('Wikipedia: Computer memory', 'https://en.wikipedia.org/wiki/Computer_memory'),
        link('Wikipedia: Data structure alignment', 'https://en.wikipedia.org/wiki/Data_structure_alignment'),
        link('Wikipedia: Locality of reference', 'https://en.wikipedia.org/wiki/Locality_of_reference')
    ],
    array: [link('Wikipedia: Dynamic array', 'https://en.wikipedia.org/wiki/Dynamic_array')],
    linkedlist: [link('Wikipedia: Linked list', 'https://en.wikipedia.org/wiki/Linked_list')],
    stack: [link('Wikipedia: Stack', 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)')],
    queue: [link('Wikipedia: Queue', 'https://en.wikipedia.org/wiki/Queue_(abstract_data_type)')],
    deque: [link('Wikipedia: Deque', 'https://en.wikipedia.org/wiki/Double-ended_queue')],
    heap: [link('Wikipedia: Heap', 'https://en.wikipedia.org/wiki/Heap_(data_structure)')],
    bst: [link('Wikipedia: Binary search tree', 'https://en.wikipedia.org/wiki/Binary_search_tree')],
    avl: [link('Wikipedia: AVL tree', 'https://en.wikipedia.org/wiki/AVL_tree')],
    splay: [link('Wikipedia: Splay tree', 'https://en.wikipedia.org/wiki/Splay_tree')],
    hashtable: [link('Wikipedia: Hash table', 'https://en.wikipedia.org/wiki/Hash_table')],
    mapset: [
        link('Wikipedia: Associative array', 'https://en.wikipedia.org/wiki/Associative_array'),
        link('Wikipedia: Set', 'https://en.wikipedia.org/wiki/Set_(abstract_data_type)')
    ],
    sorting: [link('Wikipedia: Sorting algorithm', 'https://en.wikipedia.org/wiki/Sorting_algorithm')],
    graph: [
        link('Wikipedia: Graph theory', 'https://en.wikipedia.org/wiki/Graph_theory'),
        link('Wikipedia: Dijkstra', 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm')
    ]
};

const memoryNotes = {
    memoryplay: 'Diese Ansicht ist selbst das Speicherlabor. Du kannst Modell, Anzahl und Wertgröße ändern und direkt beobachten, wie Nutzdaten, Pointer, Header und Padding den Gesamtspeicher verändern.',
    array: 'Hier steht jedes Element direkt neben dem nächsten im Speicher. Deshalb ist indexbasierter Zugriff schnell, aber Einfügen in der Mitte verschiebt viele Werte.',
    linkedlist: 'Jeder Knoten enthält Nutzdaten plus mindestens einen Pointer. Die Visualisierung zeigt deshalb mehr Verwaltungsbytes als beim Array mit gleicher Elementzahl.',
    stack: 'Der Stack liegt hier array-basiert im Speicher. Nur das Ende ist aktiv, daher bleibt die Speicherbewegung lokal und gut lesbar.',
    queue: 'Die Queue wird als Ringpuffer gedacht: wichtig sind Front- und End-Index, nicht das physische Nachrücken aller Elemente.',
    deque: 'Auch bei der Deque sind beide Enden aktiv. Der Speicherblock bleibt zusammenhängend, aber logisch sind zwei Zugriffspunkte relevant.',
    heap: 'Der Heap nutzt denselben linearen Speicher wie ein Array. Eltern- und Kindbeziehungen entstehen nur über Indexrechnung, nicht über explizite Pointer.',
    bst: 'Im Speicher erscheinen einzelne Knoten mit Schlüssel und Verweisen auf Kinder. Die Form des Baums beeinflusst direkt die Zahl der verfolgten Pointer.',
    avl: 'Zum normalen Baumknoten kommen Höhendaten oder Balanceinformation hinzu. Diese Zusatzfelder kosten Speicher, verhindern aber ungünstige Höhen.',
    splay: 'Ein Splay-Baum speichert weniger explizite Balanceinformation als ein AVL-Baum, bezahlt dafür aber mit häufigen Rotationen nach Zugriffen.',
    hashtable: 'Entscheidend sind Bucket-Feld und Kollisionsstrategie. Das Speicherbild unterscheidet zwischen leerem Tabellenfeld, Datenkette und Pointerbezügen.',
    mapset: 'Map und Set nutzen ähnliche Hash-Speicherstrukturen. Eine Map speichert zusätzlich den Wert, während ein Set nur den Schlüssel tragen muss.',
    sorting: 'Die Sortieransicht arbeitet direkt auf einem Feld im Speicher. Markierungen zeigen Vergleichs- und Tauschpositionen, ohne dass neue Knoten entstehen.',
    graph: 'Ein Graph wird hier als Knotenmenge plus Kantenliste gedacht. Speicherbedarf wächst mit V und E, je nach Darstellung auch mit der gewählten Struktur.'
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

const UI = {
    currentViz: null,
    running: false,
    categoryOrder: ['fundamentals', 'linear', 'trees', 'hashing', 'sorting', 'graphs', 'maps'],
    categoryBadges: {
        fundamentals: 'MEM',
        linear: '01',
        trees: '02',
        hashing: '03',
        sorting: '04',
        graphs: '05',
        maps: '06'
    },
    meta: {
        memoryplay: {
            short: 'MEM',
            summary: 'Das Speicherlabor ist eine ganze Arbeitsfläche nur für Speicherlayout: Adressen, Header, Pointer, Padding und Datenlokalität lassen sich hier direkt variieren.',
            theory: 'Speicher ist nicht nur ein Hintergrundthema. Datenstrukturen verhalten sich unterschiedlich, weil sie Blöcke verschieden anordnen: zusammenhängend, verkettet oder mit zusätzlicher Verwaltungsinformation. Dieses Labor macht genau diese Unterschiede sichtbar.',
            algorithmNotes: [
                { label: 'Array-Modell', detail: 'Alle Nutzdaten liegen in einem Block. Das ist cachefreundlich, aber unflexibel bei Einfügen in der Mitte.' },
                { label: 'Listen-Modell', detail: 'Jeder Knoten trägt eigene Verwaltungsdaten. Das macht Einfügen lokal günstig, aber Speicher und Lokalität schlechter.' },
                { label: 'Baum-Modell', detail: 'Mehrere Pointer pro Knoten erlauben Struktur, kosten aber zusätzlichen Verwaltungsraum.' },
                { label: 'Record-Modell', detail: 'Gemischte Felder erzeugen oft Padding, weil Ausrichtung und Feldgrößen nicht beliebig gepackt werden.' }
            ],
            notation: [
                'Gesamt = Nutzdaten + Overhead + Padding',
                'Array: n · sizeof(T) + Header',
                'Liste: n · (sizeof(T) + Pointer + Padding)',
                'Lokalität: zusammenhängend > verkettet'
            ],
            actions: [
                { label: 'Modell wählen', detail: 'Wechselt zwischen Array, Liste, Baumknoten und Record-Struktur.' },
                { label: 'Elemente und Wertgröße ändern', detail: 'Zeigt sofort, wie sich Nutzdaten und Overhead gegeneinander verschieben.' },
                { label: 'Beispiel laden', detail: 'Erzeugt ein anderes Szenario zum direkten Vergleich.' }
            ]
        },
        array: {
            short: 'ARR',
            summary: 'Das dynamische Array zeigt, wann direkter Indexzugriff konstant bleibt und wann eine Kapazitätsverdopplung teuer wird.',
            theory: 'Ein dynamisches Array kapselt einen zusammenhängenden Speicherbereich. Solange freie Kapazität vorhanden ist, ist Anfügen billig; bei einem vollen Array müssen alle Werte umkopiert werden.',
            notation: [
                'T<sub>Zugriff</sub>(n) = O(1)',
                'T<sub>append</sub>(n) = O(1) amortisiert',
                'T<sub>resize</sub>(n) = O(n)',
                'Adresse(i) = base + i · sizeof(x)'
            ],
            actions: [
                { label: 'Einfügen', detail: 'Hängt einen Wert hinten an und zeigt bei Bedarf die Kapazitätsverdopplung.' },
                { label: 'An Index', detail: 'Fügt einen Wert an einer konkreten Position ein und visualisiert das Verschieben.' },
                { label: 'Zugriff', detail: 'Markiert die direkte Adressierung über den Index.' }
            ]
        },
        linkedlist: {
            short: 'LL',
            summary: 'Die verkettete Liste vergleicht direkten Kopfzugriff mit linearem Traversieren und macht Pointerkosten sichtbar.',
            theory: 'Listen, Stacks und Queues lassen sich als Ketten von Knoten formulieren. Hier siehst du den Unterschied zwischen einfach und doppelt verketteter Speicherung direkt im Knotenlayout.',
            notation: [
                'T<sub>addFirst</sub>(n) = O(1)',
                'T<sub>addLast</sub>(n) = O(n) bei singly',
                'M<sub>Knoten</sub> = Daten + Pointer',
                'next(x) = Adresse des Folgeknotens'
            ],
            actions: [
                { label: 'Am Anfang', detail: 'Setzt einen neuen Head und zeigt die konstante Laufzeit.' },
                { label: 'Am Ende', detail: 'Fügt hinten an und macht den Traversierungsaufwand sichtbar.' },
                { label: 'Typ wechseln', detail: 'Vergleicht einfach und doppelt verkettete Knoten inklusive Speicherbedarf.' }
            ]
        },
        stack: {
            short: 'STK',
            summary: 'Der Stack reduziert die Sicht auf genau ein aktives Ende und erklärt das LIFO-Prinzip ohne Ablenkung.',
            theory: 'Ein Stack ist eine lineare Struktur mit Zugriff auf nur eine Seite. Push, Pop und Peek arbeiten auf derselben Seite und bleiben deshalb konstant.',
            notation: [
                'T<sub>push</sub>(n) = O(1)',
                'T<sub>pop</sub>(n) = O(1)',
                'T<sub>peek</sub>(n) = O(1)',
                'LIFO = Last In, First Out'
            ],
            actions: [
                { label: 'Ablegen', detail: 'Legt ein Element oben auf den Stack.' },
                { label: 'Abheben', detail: 'Entfernt das oberste Element.' },
                { label: 'Oberstes Element', detail: 'Liest den aktuellen Stack-Kopf ohne Mutation.' }
            ]
        },
        queue: {
            short: 'QUE',
            summary: 'Die Queue trennt Einfügen und Entfernen konsequent auf Front und Ende und erklärt damit FIFO.',
            theory: 'Queues sind das Gegenstück zum Stack: zuerst eingefügte Elemente verlassen die Struktur auch zuerst. Die Visualisierung orientiert sich am Modell eines Circular Arrays.',
            notation: [
                'T<sub>enqueue</sub>(n) = O(1)',
                'T<sub>dequeue</sub>(n) = O(1)',
                'front, rear ∈ [0, m-1]',
                'FIFO = First In, First Out'
            ],
            actions: [
                { label: 'Einfügen', detail: 'Schreibt einen Wert am hinteren Ende der Queue.' },
                { label: 'Entfernen', detail: 'Nimmt das vorderste Element aus der Queue.' },
                { label: 'Front lesen', detail: 'Zeigt das nächste Element ohne es zu entfernen.' }
            ]
        },
        deque: {
            short: 'DEQ',
            summary: 'Die Deque kombiniert Stack- und Queue-Ideen und zeigt, wie beide Enden symmetrisch bedient werden können.',
            theory: 'Eine Double-Ended Queue erlaubt Einfügen und Entfernen auf beiden Seiten. Sie eignet sich für Sliding Windows, Bidirectional Search oder Scheduler mit bevorzugten Enden.',
            notation: [
                'T<sub>pushLeft</sub>(n) = O(1)',
                'T<sub>pushRight</sub>(n) = O(1)',
                'T<sub>popLeft</sub>(n) = O(1)',
                'Deque = Double-Ended Queue'
            ],
            actions: [
                { label: 'Vorne plus', detail: 'Fügt an der linken Seite ein.' },
                { label: 'Hinten plus', detail: 'Fügt an der rechten Seite ein.' },
                { label: 'Vorne oder hinten minus', detail: 'Entfernt vom ausgewählten Ende.' }
            ]
        },
        heap: {
            short: 'HEP',
            summary: 'Der Heap koppelt die Array-Sicht mit dem Baum und macht Upheap- und Downheap-Schritte nachvollziehbar.',
            theory: 'Ein Heap ist ein array-basierter Baum für Prioritätswarteschlangen. Entscheidend ist die Heap-Eigenschaft, nicht die globale Sortierung aller Knoten.',
            notation: [
                'T<sub>insert</sub>(n) = O(log n)',
                'T<sub>removeRoot</sub>(n) = O(log n)',
                'parent(i) = ⌊(i - 1) / 2⌋',
                'left(i) = 2i + 1, right(i) = 2i + 2'
            ],
            actions: [
                { label: 'Einfügen', detail: 'Fügt unten ein und arbeitet sich per Upheap nach oben.' },
                { label: 'Wurzel entfernen', detail: 'Entfernt Minimum oder Maximum und repariert den Heap per Downheap.' },
                { label: 'Heap-Typ', detail: 'Wechselt zwischen Min-Heap und Max-Heap.' }
            ]
        },
        bst: {
            short: 'BST',
            summary: 'Der binäre Suchbaum zeigt Suchpfade, Traversierungen und die Abhängigkeit von der Baumhöhe.',
            theory: 'Die Ordnung im BST ermöglicht schnelles Suchen, solange der Baum nicht entartet. Traversierungen erklären, warum Inorder eine sortierte Ausgabe ergibt.',
            notation: [
                'T<sub>search</sub>(n) = O(h)',
                'h<sub>best</sub> ≈ log<sub>2</sub>(n)',
                'h<sub>worst</sub> = n - 1',
                'Inorder ⇒ sortierte Schlüssel'
            ],
            actions: [
                { label: 'Einfügen', detail: 'Folgt dem Vergleichspfad bis zur passenden Blattposition.' },
                { label: 'Suchen', detail: 'Markiert die links- und rechts-Entscheidungen entlang des Pfads.' },
                { label: 'Traversierung', detail: 'Vergleicht Inorder und Preorder direkt auf demselben Baum.' }
            ]
        },
        avl: {
            short: 'AVL',
            summary: 'Der AVL-Baum ergänzt den BST um Balancefaktoren und Rotationen, damit die Höhe stabil logarithmisch bleibt.',
            theory: 'AVL-Bäume halten die Differenz der Teilbaumhöhen klein. Genau diese Balance-Regel ermöglicht garantierte logarithmische Suche und Aktualisierung.',
            notation: [
                '|h(left) - h(right)| ≤ 1',
                'T<sub>search</sub>(n) = O(log n)',
                'T<sub>insert/remove</sub>(n) = O(log n)',
                'Rotationen = lokale Strukturreparatur'
            ],
            actions: [
                { label: 'Einfügen oder Entfernen', detail: 'Führt nach der Mutation gegebenenfalls Rotationen aus.' },
                { label: 'Suchen', detail: 'Vergleicht die Pfadlänge mit der aktuellen Baumhöhe.' },
                { label: 'Zufällig', detail: 'Erstellt einen Baum, an dem Balancefaktoren gut ablesbar sind.' }
            ]
        },
        splay: {
            short: 'SPL',
            summary: 'Der Splay-Baum optimiert häufig genutzte Elemente durch Selbstanpassung statt durch explizite Balancefaktoren.',
            theory: 'Splay-Bäume haben keine feste Balance-Regel. Stattdessen wird der zuletzt verwendete Knoten durch Zig-, Zig-Zig- und Zig-Zag-Rotationen nach oben geholt.',
            notation: [
                'T<sub>ops</sub>(n) = O(log n) amortisiert',
                'Splay(x) ⇒ x wird zur Wurzel',
                'Zig, Zig-Zig, Zig-Zag = lokale Rotationen',
                'Einzelne Operationen können O(n) kosten'
            ],
            actions: [
                { label: 'Suchen und Splayen', detail: 'Bewegt den Treffer oder den nächsten Knoten an die Wurzel.' },
                { label: 'Einfügen', detail: 'Fügt zuerst ein und zieht den neuen Knoten dann nach oben.' },
                { label: 'Entfernen', detail: 'Splayt erst den Zielknoten und verbindet dann die Teilbäume neu.' }
            ]
        },
        hashtable: {
            short: 'HASH',
            summary: 'Die Hash-Tabelle zeigt sowohl Bucket-Ketten als auch offene Adressierung und macht Kollisionen konkret sichtbar.',
            theory: 'Hash-Tabellen unterscheiden sich vor allem durch ihre Kollisionsstrategie. Genau diese Strategien können hier mit denselben Schlüsseln gegeneinander getestet werden.',
            notation: [
                'T<sub>avg</sub>(n) = O(1)',
                'T<sub>worst</sub>(n) = O(n)',
                'Index = h(key) mod m',
                'α = n / m = Lastfaktor'
            ],
            actions: [
                { label: 'Einfügen', detail: 'Zeigt den berechneten Bucket oder die Sondierungsfolge.' },
                { label: 'Suchen', detail: 'Markiert alle besuchten Felder bis zum Treffer oder Abbruch.' },
                { label: 'Modus', detail: 'Vergleicht Verkettung, lineares Sondieren und Double Hashing.' }
            ]
        },
        mapset: {
            short: 'MAP',
            summary: 'Map und Set werden in derselben Oberfläche gegenübergestellt, damit der Unterschied zwischen Schlüsselmenge und Schlüssel-Wert-Paar klar bleibt.',
            theory: 'Ein Set speichert nur Zugehörigkeit, eine Map speichert zu einem Schlüssel einen Wert. Beide bauen oft auf Hashing auf, nutzen die Schlüssel aber unterschiedlich.',
            notation: [
                'Set: key',
                'Map: key → value',
                'Contains/Get = O(1) im Mittel',
                'Duplicate keys werden überschrieben oder ignoriert'
            ],
            actions: [
                { label: 'Hinzufügen oder Setzen', detail: 'Legt einen Eintrag an oder aktualisiert ihn.' },
                { label: 'Entfernen', detail: 'Löscht einen Schlüssel aus Map oder Set.' },
                { label: 'Enthält oder Lesen', detail: 'Zeigt je nach Modus Existenz oder gespeicherten Wert.' }
            ]
        },
        sorting: {
            short: 'SORT',
            summary: 'Die Sortieransicht verbindet Balkenbild, Indexsicht und markierte Vergleichszustände, damit Unterschiede zwischen Algorithmen lesbar werden.',
            theory: 'Beim Sortieren zählen nicht nur die Endordnung, sondern auch Vergleichsstrategie, Pivotwahl und Zusatzspeicher. Genau diese Aspekte werden hier schrittweise markiert.',
            algorithmNotes: [
                { label: 'Quicksort', detail: 'Teilt am Pivot. Sehr schnell im Mittel, aber empfindlich bei schlechter Pivotwahl.' },
                { label: 'Mergesort', detail: 'Teilt rekursiv und führt geordnet zusammen. Stabil, aber mit Zusatzspeicher.' },
                { label: 'Heapsort', detail: 'Nutzt den Heap als Zwischenstruktur. Garantiert O(n log n), aber nicht stabil.' },
                { label: 'Bucketsort', detail: 'Verteilt Werte zuerst in Bereiche. Gut, wenn Wertebereich und Verteilung passen.' },
                { label: 'Radixsort', detail: 'Sortiert Stelle für Stelle. Kein Vergleichssortierer, dafür stark von der Schlüsseldarstellung abhängig.' }
            ],
            notation: [
                'Quick, Merge, Heap: Θ(n log n) im typischen Fall',
                'Schlechte Eingaben können Θ(n²) erzeugen',
                'Stabilität und Zusatzspeicher variieren je Algorithmus',
                'Vergleiche + Vertauschungen bestimmen das Profil'
            ],
            actions: [
                { label: 'Start', detail: 'Führt den gewählten Algorithmus schrittweise aus.' },
                { label: 'Neue Daten', detail: 'Erzeugt eine frische Eingabe für den Vergleich.' },
                { label: 'Absteigend', detail: 'Erstellt eine schwierige Ausgangsreihenfolge.' }
            ]
        },
        graph: {
            short: 'GRF',
            summary: 'Die Graphansicht deckt Traversierungen und Optimierungsalgorithmen in einer gemeinsamen Knoten-Kanten-Sprache ab.',
            theory: 'Die Visualisierung konzentriert sich auf Graphbegriffe, Speicherverfahren und Standardalgorithmen. Im Vordergrund stehen Besuchsreihenfolge, Kantenzustände und Distanzwerte.',
            algorithmNotes: [
                { label: 'BFS', detail: 'Breitensuche besucht schichtweise und ist zentral für kürzeste Wege in ungewichteten Graphen.' },
                { label: 'DFS', detail: 'Tiefensuche folgt erst einem Pfad bis zum Ende und ist nützlich für Komponenten und Zyklen.' },
                { label: 'Dijkstra', detail: 'Findet kürzeste Wege bei nichtnegativen Kantengewichten.' },
                { label: 'Prim', detail: 'Baut einen minimalen Spannbaum ausgehend von einem Startknoten auf.' },
                { label: 'Kruskal', detail: 'Wählt global die leichtesten Kanten und vermeidet Zyklen per Union-Find.' }
            ],
            notation: [
                'BFS, DFS: O(V + E)',
                'Dijkstra: O(E log V) mit Priority Queue',
                'Prim: O(E log V) je nach Implementierung',
                'Graphspeicherung: Adjazenzliste vs. Matrix'
            ],
            actions: [
                { label: 'Algorithmus wählen', detail: 'Schaltet zwischen Traversierung und Optimierungsverfahren um.' },
                { label: 'Startknoten', detail: 'Definiert den Einstiegspunkt für BFS, DFS, Dijkstra oder Prim.' },
                { label: 'Neue Gewichte', detail: 'Erzeugt ein neues Szenario für kürzeste Wege oder MST.' }
            ]
        }
    },

    init() {
        this.buildNav();
        this.renderLandingCards();
        this.setupSearch();
        this.setupSpeed();
        this.renderWelcomeOverview();
        this.updateSpeedControl(null);
    },

    getMeta(vizId, viz = VizRegistry.get(vizId)) {
        const fallbackShort = (viz?.name || vizId).replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
        return {
            short: fallbackShort,
            summary: 'Interaktive Visualisierung mit Fokus auf Laufzeit, Struktur und Speicher.',
            theory: 'Diese Ansicht zeigt die Kernidee der Datenstruktur oder des Algorithmus und verbindet Operationen mit Speicher- und Laufzeitverhalten.',
            notation: [],
            actions: [],
            algorithmNotes: [],
            memory: 'Das Speicherbild ergänzt die Hauptansicht und zeigt, welche Nutz- und Verwaltungsdaten für die aktuelle Struktur anfallen.',
            implementation: implementationSnippets[vizId] || snippet('Python', 'pass'),
            implementations: multiImplementationSnippets[vizId] || null,
            links: wikiLinks[vizId] || [],
            ...this.meta[vizId],
            memory: memoryNotes[vizId] || 'Das Speicherbild ergänzt die Hauptansicht und zeigt, welche Nutz- und Verwaltungsdaten für die aktuelle Struktur anfallen.'
        };
    },

    buildNav() {
        const list = document.getElementById('nav-list');
        list.innerHTML = '';

        const home = document.createElement('li');
        home.className = 'nav-item active';
        home.innerHTML = `<span class="nav-icon nav-index">00</span><span>Start</span>`;
        home.onclick = () => this.showWelcome();
        list.appendChild(home);

        const cats = VizRegistry.getCategories();
        this.categoryOrder.forEach(catId => {
            const cat = cats[catId];
            if (!cat) return;

            const catEl = document.createElement('li');
            catEl.className = 'nav-category';
            catEl.dataset.category = catId;
            catEl.innerHTML = `
                <span class="arrow">▼</span>
                <span class="nav-index">${this.categoryBadges[catId] || '--'}</span>
                <span>${cat.name}</span>
            `;
            catEl.onclick = () => {
                catEl.classList.toggle('collapsed');
                const items = list.querySelectorAll(`.nav-item[data-category="${catId}"]`);
                items.forEach(item => item.classList.toggle('hidden'));
            };
            list.appendChild(catEl);

            cat.items.forEach(vizId => {
                const viz = VizRegistry.get(vizId);
                const meta = this.getMeta(vizId, viz);
                const item = document.createElement('li');
                item.className = 'nav-item';
                item.dataset.category = catId;
                item.dataset.vizId = vizId;
                item.innerHTML = `<span class="nav-icon">${meta.short}</span><span>${viz.name}</span>`;
                item.onclick = () => this.showViz(vizId);
                list.appendChild(item);
            });
        });
    },

    renderLandingCards() {
        const host = document.getElementById('landing-category-grid');
        const cats = VizRegistry.getCategories();
        if (!host) return;

        host.innerHTML = '';
        this.categoryOrder.forEach(catId => {
            const cat = cats[catId];
            if (!cat) return;
            const first = cat.items[0];
            const preview = cat.items.slice(0, 3).map(vizId => VizRegistry.get(vizId)?.name).filter(Boolean).join(', ');
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'feature-card';
            card.innerHTML = `
                <span class="feature-index">${this.categoryBadges[catId] || '--'}</span>
                <h3>${cat.name}</h3>
                <p>${preview}</p>
                <span class="feature-link">Direkt öffnen</span>
            `;
            card.onclick = () => this.showViz(first);
            host.appendChild(card);
        });
    },

    renderWelcomeOverview() {
        const cats = VizRegistry.getCategories();
        Object.keys(cats).forEach(catId => {
            const items = document.querySelectorAll(`#nav-list .nav-item[data-category="${catId}"]`);
            if (items.length) {
                items.forEach(item => item.classList.remove('hidden'));
            }
        });
    },

    setupSearch() {
        const input = document.getElementById('search-input');
        input.addEventListener('input', event => {
            const query = event.target.value.toLowerCase().trim();
            const counts = {};
            document.querySelectorAll('#nav-list .nav-item[data-viz-id]').forEach(item => {
                const viz = VizRegistry.get(item.dataset.vizId);
                const meta = this.getMeta(item.dataset.vizId, viz);
                const haystack = `${viz.name} ${meta.summary} ${meta.theory}`.toLowerCase();
                const match = !query || haystack.includes(query);
                item.style.display = match ? '' : 'none';
                counts[item.dataset.category] = (counts[item.dataset.category] || 0) + (match ? 1 : 0);
            });

            document.querySelectorAll('#nav-list .nav-category').forEach(catEl => {
                const visibleCount = counts[catEl.dataset.category] || 0;
                catEl.style.display = visibleCount > 0 || !query ? '' : 'none';
            });
        });
    },

    setupSpeed() {
        const slider = document.getElementById('speed-slider');
        const label = document.getElementById('speed-label');
        const speedNames = {
            1: 'Sehr langsam',
            2: 'Langsam',
            3: 'Ruhig',
            4: 'Moderat',
            5: 'Normal',
            6: 'Flüssig',
            7: 'Schnell',
            8: 'Sehr schnell',
            9: 'Direkt',
            10: 'Maximal'
        };
        const updateLabel = () => {
            label.textContent = speedNames[slider.value] || `${slider.value}/10`;
        };
        updateLabel();
        slider.addEventListener('input', () => {
            updateLabel();
        });
    },

    updateSpeedControl(vizId) {
        const control = document.getElementById('speed-control');
        const slider = document.getElementById('speed-slider');
        const hint = document.getElementById('speed-hint');
        if (!control || !slider || !hint) return;

        if (!vizId) {
            control.classList.add('is-hidden');
            slider.disabled = true;
            hint.textContent = 'Auf der Startseite gibt es keine zeitgesteuerten Animationen';
            return;
        }

        const profile = Renderer.getAnimationProfile(vizId);
        slider.disabled = !profile.enabled;
        hint.textContent = profile.hint;
        control.classList.toggle('is-hidden', !profile.enabled);
        control.classList.toggle('is-disabled', !profile.enabled);
    },

    showWelcome() {
        this.destroyCurrent();
        document.getElementById('welcome-screen').classList.add('active');
        document.getElementById('viz-screen').classList.remove('active');
        this.setActiveNav(null);
        this.updateSpeedControl(null);
    },

    showViz(vizId) {
        const viz = VizRegistry.get(vizId);
        if (!viz) return;

        this.destroyCurrent();

        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('viz-screen').classList.add('active');

        const meta = this.getMeta(vizId, viz);
        const category = VizRegistry.getCategories()[viz.category];
        document.getElementById('viz-kicker').textContent = category ? category.name : 'Visualisierung';
        document.getElementById('viz-title').textContent = viz.name;
        document.getElementById('viz-summary').textContent = meta.summary;

        const compEl = document.getElementById('viz-complexity');
        compEl.innerHTML = '';
        if (viz.complexity?.time) {
            compEl.innerHTML += `<span class="complexity-badge time">Zeit: ${viz.complexity.time}</span>`;
        }
        if (viz.complexity?.space) {
            compEl.innerHTML += `<span class="complexity-badge space">Speicher: ${viz.complexity.space}</span>`;
        }

        this.renderTheory(vizId, viz);
        this.renderActionGuide(vizId, viz);

        document.getElementById('viz-controls').innerHTML = '';
        document.getElementById('viz-container').innerHTML = '';
        document.getElementById('memory-display').innerHTML = '';
        document.getElementById('memory-stats').innerHTML = '';
        Renderer.clearLog();

        this.currentViz = viz;
        viz.init();
        this.setActiveNav(vizId);
        this.updateSpeedControl(vizId);
    },

    renderTheory(vizId, viz) {
        const meta = this.getMeta(vizId, viz);
        const host = document.getElementById('theory-content');
        const codeBlocks = (meta.implementations || [meta.implementation]).map(block => `
            <details class="code-accordion">
                <summary>${block.language} ausklappen</summary>
                <pre><code>${escapeHtml(block.code)}</code></pre>
            </details>
        `).join('');
        const algorithmOverview = meta.algorithmNotes.length ? `
            <div class="theory-block">
                <h4>Algorithmen im Überblick</h4>
                <div class="algorithm-note-list">
                    ${meta.algorithmNotes.map(item => `
                        <div class="algorithm-note">
                            <strong>${item.label}</strong>
                            <p>${item.detail}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        host.innerHTML = `
            <div class="theory-block">
                <h4>Kernidee</h4>
                <p>${meta.theory}</p>
            </div>
            ${algorithmOverview}
            <div class="theory-block">
                <h4>Mathematische Notation</h4>
                <div class="math-list">
                    ${meta.notation.map(line => `<div class="math-line">${line}</div>`).join('')}
                </div>
            </div>
            <div class="theory-block">
                <h4>Speicherbezug</h4>
                <p>${meta.memory}</p>
            </div>
            <div class="theory-block">
                <h4>Implementierung</h4>
                ${codeBlocks}
            </div>
            <div class="theory-block">
                <h4>Weiterlesen</h4>
                <div class="resource-links">
                    ${meta.links.map(resource => `<a class="resource-link" href="${resource.href}" target="_blank" rel="noreferrer noopener">${resource.label}</a>`).join('')}
                </div>
            </div>
        `;
    },

    renderActionGuide(vizId, viz) {
        const meta = this.getMeta(vizId, viz);
        const host = document.getElementById('action-guide');
        host.innerHTML = meta.actions.map(action => `
            <div class="action-chip">
                <span class="action-label">${action.label}</span>
                <span class="action-detail">${action.detail}</span>
            </div>
        `).join('');
    },

    destroyCurrent() {
        this.running = false;
        if (this.currentViz && this.currentViz.destroy) {
            this.currentViz.destroy();
        }
        this.currentViz = null;
    },

    setActiveNav(vizId) {
        document.querySelectorAll('#nav-list .nav-item').forEach(item => {
            item.classList.toggle('active', vizId ? item.dataset.vizId === vizId : !item.dataset.vizId);
        });
    },

    addControls(html) {
        document.getElementById('viz-controls').innerHTML = html;
    },

    getContainer() {
        return document.getElementById('viz-container');
    }
};

function showCategory(catId) {
    const cats = VizRegistry.getCategories();
    if (cats[catId] && cats[catId].items.length > 0) {
        UI.showViz(cats[catId].items[0]);
    }
}
