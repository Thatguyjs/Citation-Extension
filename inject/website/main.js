// General popup management


// Get a citation element
window['citation-ext-get'] = function(element) {
	let response = "";

	switch(element) {

		// Title
		case 'Title':
			response = document.title;
			break;


		// Url
		case 'Url':
			response = window.location.href;
			break;


		// Access date
		case 'Access_Date':
			window.CitationMessenger.send('set', element, null, 'automatic');
			break;

	}

	if(response.length) window.CitationMessenger.send('set', element, response);
}


// Send a "click" event to the popup
window['citation-ext-click'] = {

	// Listening state
	_listening: false,


	// User clicks
	_callback: function(event) {
		if(event.path.includes(window['citation-ext']._popup)) return;

		window.CitationMessenger.send('click', event.target.innerText);
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
			this._links[l].element.href = 'javascript:void(0);';
		}
	},


	// Allow links
	allow: function() {
		for(let l in this._links) {
			this._links[l].element.href = this._links[l].url;
		}
	}

};


// Initialize & block links
window['citation-ext-links'].init();
window['citation-ext-links'].block();
