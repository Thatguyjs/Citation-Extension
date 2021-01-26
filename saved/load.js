window.addEventListener('load', async () => {
	await ExtStorage.init();
	Formatter.init();

	ContextMenu.init();
	Toolbar.init();
	PopupManager.init();

	CitationManager.init();
	await CitationLoader.init();

	Main.init();
}, { once: true });
