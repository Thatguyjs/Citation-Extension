// General popup management


// Document metadata
window['citation-ext-meta'] = {

	// Meta elements
	_elements: Array.from(document.getElementsByTagName('meta')),


	// Get an element's content
	get: function(name, attr=null) {
		if(!attr) {
			for(let e in this._elements) {
				if(!(this._elements[e] instanceof HTMLElement)) continue;
				let elemName = this._elements[e].getAttribute('property');

				if(elemName === 'article:' + name || elemName === 'og:' + name || elemName === 'twitter:' + name) {
					return this._elements[e].getAttribute('content');
				}
			}
		}
		else {
			for(let e in this._elements) {
				if(!(this._elements[e] instanceof HTMLElement)) continue;

				if(this._elements[e].getAttribute(attr) === name) {
					return this._elements[e].getAttribute('content');
				}
			}
		}

		return null;
	}

};


// Get an element from a path
window['citation-ext-path'] = function(element, path) {
	if(path[1] === 'none') {
		window.CitationMessenger.send(
			'set',
			element,
			document.querySelector(path[0]).innerText
		);
	}
	else if(path[1] === 'id') {
		window.CitationMessenger.send(
			'set',
			element,
			document.querySelector(path[0] + '#' + path[2]).innerText
		);
	}
	else if(path[1] === 'class') {
		let classes = path[2].replace(/\s/g, '.');

		window.CitationMessenger.send(
			'set',
			element,
			document.querySelector(path[0] + '.' + classes).innerText
		);
	}
}


// Get a citation element
window['citation-ext-get'] = function(element, path="") {
	let response = "";

	switch(element) {

		case 'Title':
			response = document.title || window['citation-ext-meta'].get('title');
			break;

		case 'Url':
			response = window.location.href;
			break;

		case 'Authors':
			response = window['citation-ext-meta'].get('author', 'name');
			break;

		case 'Publishers':
			response = window['citation-ext-meta'].get('site_name');
			break;

		case 'Access_Date':
			window.CitationMessenger.send('set', element, null, 'automatic');
			break;

	}

	if(response) window.CitationMessenger.send('set', element, response);
}


// Send a "click" event to the popup
window['citation-ext-click'] = {

	// Listening state
	_listening: false,


	// Tag names to ignore when clicked
	_ignoreTags: ['HTML', 'HEAD', 'BODY'],


	// User clicks
	_callback: function(event) {
		if(window['citation-ext-click']._ignoreTags.includes(event.target.tagName)) return;
		if(event.path.includes(window['citation-ext']._container)) return;

		window.CitationMessenger.send('click', event.target.innerText);

		// Send the path of the element
		let path = [event.target.tagName, 'id', event.target.id];
		if(!path[2]) path = [event.target.tagName, 'class', event.target.className];
		if(!path[2]) path[1] = 'none';

		window.CitationMessenger.send('path', path);
	},


	// Start listening
	start: function() {
		if(this._listening) return;

		this._listening = true;
		document.addEventListener('click', this._callback);
	},


	// Stop listening
	stop: function() {
		if(!this._listening) return;

		this._listening = false;
		document.removeEventListener('click', this._callback);
	}

};


// Prevent links from redirecting
window['citation-ext-links'] = {

	// Array of website links
	_links: [],


	// Add all links
	init: function() {
		let links = Array.from(document.querySelectorAll('a'));

		for(let l in links) {
			this._links.push({
				element: links[l],
				url: links[l].href
			});
		}
	},


	// Block links
	block: function() {
		for(let l in this._links) {
			if(!this._links[l].element) continue;
			this._links[l].element.href = 'javascript:void(0);';
		}
	},


	// Allow links
	allow: function() {
		for(let l in this._links) {
			if(!this._links[l].element) continue;
			this._links[l].element.href = this._links[l].url;
		}
	}

};


// Initialize & block links
window['citation-ext-links'].init();
window['citation-ext-links'].block();
