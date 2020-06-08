// Loads files to be injected


// Loads a script into the page
async function loadScript(path, callback) {
	let element = document.createElement('script');
	element.className = "citation-ext-script";
	element.src = chrome.runtime.getURL(path);

	document.body.appendChild(element);

	return new Promise((resolve, reject) => {
		element.onload = () => {
			if(typeof callback === 'function') callback();
			resolve();
		}
	});
}


// Loads multiple scripts, one at a time
async function loadScripts(scripts, callback) {
	for(let s in scripts) {
		await loadScript(scripts[s]);
	}

	if(typeof callback === 'function') callback();
}


// Loads a stylesheet into the page
async function loadStyle(path, callback) {
	let element = document.createElement("link");
	element.rel = "stylesheet";
	element.className = "citation-ext-style";
	element.href = chrome.runtime.getURL(path);

	document.body.appendChild(element);

	return new Promise((resolve, reject) => {
		element.onload = () => {
			if(typeof callback === 'function') callback();
			resolve();
		}
	});
}


// Loads multiple stylesheets, one at a time
async function loadStyles(sheets, callback) {
	for(let s in sheets) {
		await loadStyle(sheets[s]);
	}

	if(typeof callback === 'function') callback();
}


// Loads all content
(function() {
	'use strict';


	// Check if a popup already exists
	if(document.getElementById('citation-ext-container') !== null) {
		window.CitationLogger.log("Popup already exists!");
		return;
	}


	// Connect to the extension
	window['citation-ext-connection'] = chrome.runtime.connect({
		name: "Citation-Extension"
	});


	// Get citation data, create popup
	window['citation-ext-connection'].onMessage.addListener(async (message) => {
		sessionStorage.setItem('citation-ext-format', message.format);
		sessionStorage.setItem('citation-ext-popup-path', chrome.runtime.getURL('inject/popup/popup.html'));

		// TODO: Check if a citation needs to be created or sent back

		// Load stylesheets
		loadStyles([
			"inject/general/general.css",

			"inject/popup/container.css"
		]);

		// Load scripts
		loadScripts([
			"inject/general/log.js",
			"inject/general/message.js",

			"inject/popup/load.js",
			"inject/window.js",

			"inject/popup/drag.js"
		]);

		delete window['citation-ext-connection'];
	});

}());
