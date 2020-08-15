window.addEventListener('load', async () => {
	await ExtStorage.init();
	Formatter.init();

	ContextMenu.init();
	Toolbar.init();

	await TabManager.init();
	await CitationManager.init();

	Main.init();

}, { once: true });
