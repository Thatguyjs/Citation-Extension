// Menu for creating citations


const Create = {

	// The name accepted for connecting to a website
	name: "Citation-Extension",


	// List of citation formats
	_formats: [
		"MLA8",
		"IEEE",
		"BibTeX"
	],


	// Format list element
	_formatList: document.getElementById("format-list"),


	// Load stuff
	init: function() {

		// Future: Users can create / load custom formats?

		// Load formats into _formatList
		for(let f in this._formats) {
			this.addFormat(this._formats[f]);
		}

	},


	// Add a format to _formatList
	addFormat: function(name) {

		// Create the format element
		let container = document.createElement("div");
		container.className = "format-type";
		container.setAttribute('name', name);
		container.innerHTML = "<h2>" + name + "</h2>";

		// Add a click listener
		container.addEventListener('click', () => {
			Create.start(container.getAttribute('name'));
		});

		// Add the format to the list
		this._formatList.appendChild(container);
	},


	// Choose a format & launch the popup
	start: function(format) {
		chrome.tabs.query({ active: true }, (tabs) => {

			// Block on non-http(s) urls
			if(tabs[0].url.slice(0, 4) !== 'http') {
				return;
			}

			// Load popup scripts
			chrome.tabs.executeScript({ file: "inject/general/log.js" });
			chrome.tabs.executeScript({ file: "inject/load.js" });

			// Give the popup the selected format
			chrome.runtime.onConnect.addListener((client) => {
				if(client.name === this.name) {
					client.postMessage({ format: format });

					// Close the citation window
					window.close();
				}
			});
		});
	}

};
