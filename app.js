document.addEventListener('DOMContentLoaded', () => {
    UI.init();
    Renderer.clearLog();
    Renderer.log('INIT', `${Object.keys(VizRegistry.getAll()).length} Visualisierungen geladen`, 'success');
});

window.addEventListener('beforeunload', () => {
    UI.destroyCurrent();
});