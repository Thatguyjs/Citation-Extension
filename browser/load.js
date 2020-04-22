// Initialize scripts after the page is loaded

window.addEventListener('load', async () => {
	await ExtStorage.init();
	Formatter.init();

	Main.init();

	Finish.init();
	Create.init();
});
