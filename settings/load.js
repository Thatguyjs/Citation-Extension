window.addEventListener('load', async () => {
	ExtStorage.init();

	Settings.init();

	Main.init();
}, { once: true });
