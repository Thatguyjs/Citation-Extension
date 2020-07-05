// Listen for popup messages

window.CitationMessenger.init(
	window.CitationMessenger.PARENT,
	window['citation-ext']._popup
);


window.CitationMessenger.addListener(async (message) => {
	switch(message[0]) {

		// Error message
		case 'error':
			window.CitationLogger.log("ERROR:", message[1]);
			break;


		// Iframe loaded, send back format
		case 'ready':
			{
				let format = await window['citation-ext']._format;
				window.CitationLogger.log("Using format:", format);

				window.CitationMessenger.send('init', format);
			}
			break;


		// Get elements automatically
		case 'get':
			window['citation-ext-get'](message[1]);
			break;


		// Start / stop listening for clicks
		case 'click':
			if(message[1] === 'start') window['citation-ext-click'].start();
			else window['citation-ext-click'].stop();
			break;


		// Copy text
		case 'copy':
			if(!navigator.clipboard) {
				window.CitationMessenger.send('copy', 'error');
				break;
			}

			navigator.clipboard.writeText(
				message[1]
			).then(() => {
				window.CitationMessenger.send('copy', 'ok');
			}).catch(() => {
				window.CitationMessenger.send('copy', 'error');
			});
			break;

	}
});
