// Handles messages from the base window


// Close the popup
window['citation-ext-close'].addEventListener('click', () => {
	// Allow links
	window['citation-ext-links'].allow();

	// Remove container
	document.body.removeChild(window['citation-ext-container']);

	// Remove scripts
	let scripts = Array.from(document.getElementsByClassName('citation-ext-script'));

	for(let s in scripts) {
		document.body.removeChild(scripts[s]);
	}

	// Remove stylesheets
	let sheets = Array.from(document.getElementsByClassName('citation-ext-style'));

	for(let s in sheets) {
		document.body.removeChild(sheets[s]);
	}

	// Log remove message
	window.CitationLogger.log("Removed Popup");

	// Remove listeners
	window.CitationMessenger.destroy();
	window['citation-ext-click'].stop();

	// Remove objects
	delete window.CitationMessenger;
	delete window.CitationLogger;
});


// Allow or block links from redirecting
window['citation-ext-links'] = {

	// List of links
	links: Array.from(document.getElementsByTagName("a")),


	// Prepare the list of links
	init: function() {
		let links = [];

		for(let l in this.links) {
			links.push({
				elem: this.links[l],
				url: this.links[l].href
			});
		}

		this.links = links;
	},


	// Block links
	block: function() {
		for(let l in this.links) {
			this.links[l].elem.href = "javascript:void(0);";
		}
	},


	// Allow links
	allow: function() {
		for(let l in this.links) {
			this.links[l].elem.href = this.links[l].url;
		}
	}

};


// Listen for clicks
window['citation-ext-click'] = {

	// Actively listening for clicks
	listening: false,


	// Click callback
	callback: function(event) {
		if(event.path.includes(window['citation-ext-container'])) return;

		window.CitationMessenger.send('click', event.target.innerText);
	},


	// Start listening
	start: function() {
		if(this.listening) return;

		this.listening = true;
		document.addEventListener('click', this.callback);
	},


	// Stop listening
	stop: function() {
		if(!this.listening) return;

		this.listening = false;
		document.removeEventListener('click', this.callback);
	}

};


// Init the link handler
window['citation-ext-links'].init();
window['citation-ext-links'].block();


// Init the message handler & iframe
window.CitationMessenger.init(window['citation-ext-popup']);
window.CitationMessenger.send('init', sessionStorage.getItem('citation-ext-format'));


// Message handler
window.CitationMessenger.listen((type, data, ...options) => {
	switch(type) {

		// Display citation errors
		case 'error':
			window.CitationLogger.log("ERROR:", data);
			alert(data);
		break;


		// Start / stop listening for clicks
		case 'click':
			if(data === 'start') window['citation-ext-click'].start();
			else window['citation-ext-click'].stop();
		break;


		// Get an element automatically
		case 'get':
			let response = "";

			switch(data) {

				case 'Title':
					if(options[0] !== '2') {
						response = 'CITE1' + document.title;
					}
					else {
						response = 'CITE2' + document.body.querySelector('h1').innerText;
					}
				break;

				case 'Url':
					response = window.location.href;
				break;

				case 'Access_Date':
					response = new Date();
				break;

			}

			window.CitationMessenger.send('set', [data, response]);
		break;


		// Copy text
		case 'copy':
			if(!navigator.clipboard) {
				window.CitationMessenger.send('copy', 'error');
				break;
			}

			navigator.clipboard.writeText(
				data
			).then(() => {
				window.CitationMessenger.send('copy', 'ok');
			}).catch(() => {
				window.CitationMessenger.send('copy', 'error');
			});
		break;

	}
});
