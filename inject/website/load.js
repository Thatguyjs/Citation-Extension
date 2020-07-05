// Load popup data


window['citation-ext'] = {

	// Citation format
	_format: null,


	// Popup container
	_container: document.createElement('div'),


	// Header & title
	_header: document.createElement('div'),
	_title: document.createElement('span'),


	// Close button
	_close: document.createElement('button'),


	// Popup iframe
	_popup: document.createElement('iframe'),


	// Initialize elements
	init: function() {
		this._container.className = 'citation-ext';
		this._container.id = 'citation-ext-container';

		this._header.className = 'citation-ext';
		this._header.id = 'citation-ext-header';

		this._title.className = 'citation-ext';
		this._title.innerText = 'Citation Maker';

		this._close.className = 'citation-ext';
		this._close.innerText = 'X';

		this._popup.className = 'citation-ext';
		this._popup.id = 'citation-ext-popup';
		this._popup.src = sessionStorage.getItem('citation-ext-path');

		this._popup.addEventListener('load', () => {
			window.dispatchEvent(new Event('citation-ext-popup-loaded'));
		});

		// Assemble the popup
		this._header.appendChild(this._title);
		this._header.appendChild(this._close);

		this._container.appendChild(this._header);
		this._container.appendChild(this._popup);

		// Add the popup to the document
		document.body.appendChild(this._container);

		// Get the citation format
		let format = sessionStorage.getItem('citation-ext-format');

		if(format) {
			this._format = format;
		}
		else {
			window.addEventListener('citation-ext-format-loaded', () => {
				window['citation-ext']._format = sessionStorage.getItem('citation-ext-format');
			}, { once: true });
		}

		// Log the initial message
		window.CitationLogger.log("Loaded popup");
	},


	// Get the citation format
	getFormat: async function() {
		return new Promise((resolve, reject) => {
			if(window['citation-ext']._format) resolve(window['citation-ext']._format);

			window.addEventListener('citation-ext-format-loaded', () => {
				resolve(sessionStorage.getItem('citation-ext-format'));
			}, { once: true });
		});
	}

};


window['citation-ext'].init();
