// Listen for messages from the parent window


window.CitationMessenger.init(null);

window.CitationMessenger.listen((type, data) => {
	switch(type) {

		// Init the popup
		case 'init':
			CitationPopup.init(data);
		break;


		// Receive a click
		case 'click':
			CitationPopup.choose(data);
		break;


		// Set a citation element
		case 'set':
			CitationFormatter.setElement(data[0], data[1]);
		break;

	}
});
