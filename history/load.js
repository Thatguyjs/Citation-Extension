// Initialize scripts after the page is loaded

window.addEventListener('load', async () => {
	await ExtStorage.init();
	Formatter.init();

	ContextMenu.init();
	Toolbar.init();

	await CitationManager.init();
	Main.init();
});
