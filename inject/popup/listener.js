// Listen for messages from the parent window


let loaded = false;


window.CitationMessenger.init(
	window.CitationMessenger.IFRAME,
);


window.CitationMessenger.addListener((message) => {
	switch(message[0]) {

		// Initialize the popup
		case 'init':
			loaded = true;
			CitationPopup.init(message[1]);
			break;


		// Recieve click data
		case 'click':
			CitationPopup.choose(null, message[1], message[2]);
			break;


		// Set a citation element
		case 'set':
			CitationPopup.choose(message[1], message[2], message[3]);
			break;

	}
});


// Keep sending 'ready' until we get a response
let interval = setInterval(() => {
	if(loaded) {
		clearInterval(interval);
		return;
	}

	window.CitationMessenger.send('ready');
}, 200);
