// Remove all extension data from the page


window['citation-ext']._close.addEventListener('click', () => {

	// Allow links
	window['citation-ext-links'].allow();

	// Remove container
	document.body.removeChild(window['citation-ext']._container);

	// Remove files
	let files = Array.from(document.getElementsByClassName('citation-ext-file'));

	for(let f in files) {
		document.body.removeChild(files[f]);
	}

	// Log remove message
	window.CitationLogger.log("Removed Popup");

	// Remove listeners
	window.CitationMessenger.destroy();
	window['citation-ext-click'].stop();

	// Delete script data
	delete window.CitationMessenger;
	delete window.CitationLogger;

});
