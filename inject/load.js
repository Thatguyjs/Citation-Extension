// Load all popup scripts


(async function() {
	'use strict';

	// Check if the popup already exists
	if(document.getElementById('citation-ext-container') !== null) {
		window.CitationLogger.log("Popup already exists!");
		return;
	}


	// Load a single script
	async function loadScript(name) {
		let script = document.createElement('script');
		script.className = 'citation-ext-file';
		script.src = chrome.runtime.getURL(name);

		return new Promise((resolve, reject) => {
			script.addEventListener('load', resolve, { once: true });
			document.body.appendChild(script);
		});
	}


	// Load multiple scripts
	async function loadScripts(names) {
		for(let n in names) {
			await loadScript(names[n]);
		}
	}


	// Load a single stylesheet
	async function loadSheet(name) {
		let sheet = document.createElement('link');
		sheet.className = 'citation-ext-file';
		sheet.rel = 'stylesheet';
		sheet.href = chrome.runtime.getURL(name);

		return new Promise((resolve, reject) => {
			sheet.addEventListener('load', resolve, { once: true });
			document.body.appendChild(sheet);
		});
	}


	// Loads multiple stylesheets
	async function loadSheets(names) {
		for(let n in names) {
			await loadSheet(names[n]);
		}
	}


	// Connect to the extension & get the active format
	let connection = chrome.runtime.connect({ name: "Citation-Extension" });

	connection.onMessage.addListener((message) => {
		sessionStorage.setItem('citation-ext-format', message.format);
		window.dispatchEvent(new Event('citation-ext-format-loaded'));
	});


	// Store popup path
	sessionStorage.setItem(
		'citation-ext-path',
		chrome.runtime.getURL('inject/popup/index.html')
	);


	// Load main stylesheets
	await loadSheets([
		"inject/general/general.css",

		"inject/website/style.css"
	]);


	// Load main scripts
	loadScripts([
		"inject/general/log.js",
		"inject/general/message.js",

		"inject/website/load.js",
		"inject/website/remove.js",

		"inject/website/main.js",
		"inject/website/listener.js",

		"inject/website/drag.js"
	]);

}());
