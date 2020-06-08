// Loads and displays popup content

(function() {

	// Holds popup contents & header
	window['citation-ext-container'] = document.createElement('div');
	window['citation-ext-container'].className = "citation-ext";
	window['citation-ext-container'].id = "citation-ext-container";

	// Header & title
	window['citation-ext-header'] = document.createElement('div');
	window['citation-ext-header'].className = "citation-ext";
	window['citation-ext-header'].id = "citation-ext-header";

	// Not an <h1>, because our parser searches for <h1> elements
	let title = document.createElement('span');
	title.className = "citation-ext";
	title.innerHTML = "Citation Maker";

	// Close button
	window['citation-ext-close'] = document.createElement('button');
	window['citation-ext-close'].className = "citation-ext";
	window['citation-ext-close'].id = "citation-ext-close";
	window['citation-ext-close'].innerHTML = "X";

	// Popup contents
	window['citation-ext-popup'] = document.createElement('iframe');
	window['citation-ext-popup'].className = "citation-ext";
	window['citation-ext-popup'].id = "citation-ext-popup";
	window['citation-ext-popup'].src = sessionStorage.getItem('citation-ext-popup-path');

	// Combine elements
	window['citation-ext-header'].appendChild(title);
	window['citation-ext-header'].appendChild(window['citation-ext-close']);

	window['citation-ext-container'].appendChild(window['citation-ext-header']);
	window['citation-ext-container'].appendChild(window['citation-ext-popup']);

	document.body.appendChild(window['citation-ext-container']);

	// Log load message
	window.CitationLogger.log("Loaded popup");
	
})();
