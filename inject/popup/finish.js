// Finish the active citation


const CitationFinisher = {

	// Citation name element
	_nameElem: document.getElementById('citation-name'),


	// The formatted citation element
	_formatElem: document.getElementById('citation-formatted'),


	// Copy / Save buttons
	_copyButton: document.getElementById('button-copy'),
	_saveButton: document.getElementById('button-next'),


	// The unformatted citation
	_raw: {},


	// The formatted citation
	_formatted: "",


	// Finish the citation
	finish: function(citation) {
		this._raw = citation;
		this._formatted = Formatter.format(citation);

		this._formatElem.innerText = this._formatted;
	},


	// Save the citation
	save: function() {
		let citation = CitationFinisher._raw;

		let date = new Date();

		// Create citation metadata
		citation.created = {
			day: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		};

		citation.modified = citation.created;
		citation.name = CitationFinisher._nameElem.value || "New Citation";

		citation.containers = [];

		// Add it to storage
		ExtStorage.get("citation-storage", (data) => {
			if(!Array.isArray(data['citation-storage'])) {
				data['citation-storage'] = [];
			}

			data['citation-storage'].push(citation);

			ExtStorage.set(data);

			// Update button text
			CitationFinisher._saveButton.innerText = "Saved!";

			setTimeout(() => {
				if(TabManager.isLastTab()) {
					CitationFinisher._saveButton.innerText = "Save";
				}
			}, 1000);
		});
	},


	// Copy the citation
	copy: async function() {
		window.CitationMessenger.send('copy', CitationFinisher._formatted);

		let response = [''];

		while(response[0] !== 'copy') {
			response = await window.CitationMessenger.receive();
		}

		switch(response[1]) {

			case 'ok':
				this._copyButton.innerText = "Copied!";
			break;

			default:
				this._copyButton.innerText = "Error!";
			break;

		}

		setTimeout(() => {
			CitationFinisher._copyButton.innerText = "Copy";
		}, 1000);
	}

};
