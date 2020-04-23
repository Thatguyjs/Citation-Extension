// Actively cite a webpage, or get it from storage


// A list of supported citation formats
window.CitationFormats = {
	"MLA8": {
		manual: ['authors', 'publishers', 'publishdate'],
		automatic: ['title', 'url']
	},
	"IEEE": {
		manual: ['authors', 'publishers', 'publishdate'],
		automatic: ['title', 'url', 'accessdate']
	}
};


// Construct citations from data
window.CitationConstructor = {

	// @description: The citation while it's being made
	_citation: {},

	// @description: The current citation format
	_currentFormat: {},

	// @description: The current citation element
	_currentElement: 0,

	// @description: Whether the citation is finished
	_finished: false,


	// @description: All attached listeners (local)
	_listeners: [],


	// @description: Dispatch an event to all local listeners
	_fireEvent: function(event, data) {
		for(let l in this._listeners) {
			if(this._listeners[l] === null) continue;

			if(this._listeners[l].event === event) {
				this._listeners[l].call(data);
			}
		}
	},


	// @description: Listen for various events that can be dispatched with only one listener
	addListener: function(eventname, callback) {
		if(typeof callback !== 'function') {
			return window.CitationLogger.error("addListener() expected a callback.");
		}

		return this._listeners.push({
			event: eventname,
			call: callback
		}) - 1;
	},


	// @description: Remove an active listener
	removeListener: function(index) {
		if(index > -1 && index < this._listeners.length) {
			this._listeners[index] = null;

			while(this._listeners[this._listeners.length-1] === null) {
				this._listeners = this._listeners.slice(0, -1);
			}
		}
		else {
			window.CitationLogger.error(`Unable to remove listener at index ${index}`);
		}
	},


	// @description: Get the current citation element
	getCurrentElement: function() {
		return this._currentFormat.manual[this._currentElement];
	},


	// @description: Go to the next citation element
	nextElement: function() {
		this._currentElement++;

		// Citation finished
		if(!this.getCurrentElement()) {
			this._citationElement = 0;
			this._finished = true;
			this._fireEvent('finish', this._citation);
			return;
		}

		this._fireEvent('update', this._citation);
	},


	// @description: Go to the previous citation element
	prevElement: function() {
		if(this._currentElement > 0) {
			this._currentElement--;

			this._fireEvent('update', this._citation);
		}
	},


	// @description: Called when an update to the citation process happens
	updateCitation: function(type, data, automatic) {

		// Add citation element
		switch(type) {

			// Citation Type
			case 'type':
				// Separate types are not supported yet
				window.CitationLogger.log("Separate citation types are not supported yet.");

				this._citation.type = "Article"; // Temp
			break;

			// Author
			case 'authors':
				if(!this._citation.authors) this._citation.authors = [];
				this._citation.authors.push(window.CitationParser.parseAuthor(data, automatic));

				automatic = true; // Don't go to the next element
			break;

			// Publish Date
			case 'publishdate':
				this._citation.publishdate = window.CitationParser.parsePublishDate(data, automatic);
			break;

			// Access Date
			case 'accessdate':
				this._citation.accessdate = window.CitationParser.parseAccessDate(data, automatic);
			break;

			// Publisher
			case 'publishers':
				if(!this._citation.publishers) this._citation.publishers = [];
				this._citation.publishers.push(window.CitationParser.parsePublisher(data, automatic));

				automatic = true; // Don't go to the next element
			break;

			// Title
			case 'title':
				this._citation.title = window.CitationParser.parseTitle(data, automatic);
			break;

			// Url
			case 'url':
				this._citation.url = window.CitationParser.parseUrl(data, automatic);
			break;

		}

		// Increment the currentElement variable
		if(!automatic) {
			this._currentElement++;
		}

		// Citation finished
		if(!this.getCurrentElement()) {
			this._citationElement = 0;
			this._finished = true;
			this._fireEvent('finish', this._citation);
			return;
		}

		// Send update event
		this._fireEvent('update', this._citation);
	},


	// @description: Initiate citation object and listeners for getting elements
	createCitation: function(format) {
		format = window.CitationFormats[format];
		if(!format) {
			this._currentFormat = null;
			return window.CitationLogger.error(`Format "${format}" not found.`);
		}

		this._citation = {};
		this._currentFormat = format;
		this._currentElement = 0;
		this._finished = false;

		for(let i in format.automatic) {
			this.updateCitation(format.automatic[i], null, true);
		}


		window.CitationListeners.add(document, 'click', () => {
			// Closed the citation popup
			if(!window.InjectedPopup) return;

			if(!event.path.includes(window.InjectedPopup.container)) {
				window.CitationConstructor._fireEvent('click', event);

				if(!window.CitationConstructor._finished) {
					let currentElem = window.CitationConstructor.getCurrentElement();
					window.CitationConstructor.updateCitation(currentElem, event.target.innerHTML, false);
				}
			}
		});

		this.preventLinks();

		let listener = this.addListener('finish', () => {
			setTimeout(() => {
				this.allowLinks();
				this.removeListener(listener);
			}, 50);
		});
	},


	// @description: Stop links from redirecting
	preventLinks: function() {
		let links = Array.from(document.getElementsByTagName("a"));

		for(let l in links) {
			if(!links[l].getAttribute) continue;

			links[l].setAttribute('data-href', links[l].href);
			links[l].href = "javascript:void(0);";
		}
	},


	// @description: Allow links to redirect
	allowLinks: function() {
		let links = Array.from(document.getElementsByTagName("a"));

		for(let l in links) {
			links[l].href = links[l].getAttribute('data-href');
			links[l].removeAttribute('data-href');
		}
	}

};
