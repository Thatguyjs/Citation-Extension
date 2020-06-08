// Initialize scripts after the page is loaded

window.addEventListener('load', async () => {
	await ExtStorage.init();
	Formatter.init();

	Main.init();

	Stats.init();
	Create.init();
});
