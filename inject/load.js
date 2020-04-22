// Connect to receive citation format
window.citation_connection = chrome.runtime.connect({ name: "Citation-Extension" });


/*
	IDEA: A popup (like font ninja) appears, asks for document information, then
	click the extension again -> "Finish Citation" -> connect to page and get
	data from localStorage
*/

/*
	Use 'onclick' to get where a citation element (author, publisher,
	date published) and 'onselect' to get the order of items (author firstname,
	lastname, initial).
*/


// @description: Inject a script from the extension into an html page
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


// @description: Inject multiple scripts synchronously
async function loadScripts(scripts, callback) {
	for(let s in scripts) {
		await loadScript(scripts[s]);
	}

	if(typeof callback === 'function')
		callback();
}


// @description: Inject a stylesheet from the extension into an html page
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


// @description: Inject multiple scripts synchronously
async function loadStyles(sheets, callback) {
	for(let s in sheets) {
		await loadStyle(sheets[s]);
	}

	if(typeof callback === 'function')
		callback();
}


// Popup hasn't been injected
if(!document.getElementsByClassName("citation-ext-titlebar").length) {

	// Wait for the format message
	window.citation_connection.onMessage.addListener((message) => {
		sessionStorage.setItem("citationExtFormat", message.format);
		delete window.citation_connection;

		// Inject stylesheets
		loadStyles([
			// List styles
			"inject/css/list.css",

			// Popup style
			"inject/css/popup.css"
		]);


		// Inject scripts
		loadScripts([
			// Storage handlers
			"inject/storage.js",

			// Event listener handlers
			"inject/listen.js",

			// General citation helper functions & objects
			"inject/setup.js",

			// Parse data into citation elements
			"inject/parse.js",

			// Load the citation-creating scripts
			"inject/cite.js",

			// Load the citation-editing scripts
			"inject/edit.js",

			// Create an in-page popup for getting citation data
			"inject/popup.js"
		]);

	});

}
