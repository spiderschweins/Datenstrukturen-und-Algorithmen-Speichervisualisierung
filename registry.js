/**
 * Visualization Registry - extensible system for adding new visualizations
 */
const VizRegistry = {
    categories: {},
    visualizations: {},

    registerCategory(id, name, icon) {
        this.categories[id] = { name, icon, items: [] };
    },

    register(vizId, config) {
        // config: { category, name, icon, complexity: {time, space}, init, destroy }
        this.visualizations[vizId] = config;
        if (this.categories[config.category]) {
            this.categories[config.category].items.push(vizId);
        }
    },

    get(vizId) {
        return this.visualizations[vizId];
    },

    getAll() {
        return this.visualizations;
    },

    getCategories() {
        return this.categories;
    }
};

// Register all categories
VizRegistry.registerCategory('fundamentals', 'Speicher', '🧠');
VizRegistry.registerCategory('linear', 'Lineare Strukturen', '📦');
VizRegistry.registerCategory('trees', 'Bäume', '🌳');
VizRegistry.registerCategory('hashing', 'Hashing', '#️⃣');
VizRegistry.registerCategory('sorting', 'Sortierung', '🔄');
VizRegistry.registerCategory('graphs', 'Graphen', '🕸️');
VizRegistry.registerCategory('maps', 'Maps & PQ', '🗺️');
