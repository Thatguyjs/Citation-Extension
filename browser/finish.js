// Check to see if a citation is finished


const Finish = {

	// All buttons that lead to this page
	_buttons: [],


	// All action buttons
	_actions: {
		"finish-edit": "editCitation",
		"finish-copy": "copyCitation",
		"finish-save": "saveCitation"
	},


	// The finished citation container
	_container: document.getElementById("finish-container"),


	// The finished citation
	_citation: {},


	// Initialize the "finish" page
	init: function() {

		// Get the redirect buttons
		this._buttons = [...document.getElementsByClassName("redirect-finish")];

		for(let b in this._buttons) {
			this._buttons[b].addEventListener('click', () => {

				chrome.tabs.executeScript({
					file: "inject/check.js"
				});

				// Get the citation
				chrome.runtime.onConnect.addListener((client) => {
					if(client.name === Create.name) {
						client.onMessage.addListener(this.checkCitation);
					}
				});

			});
		}

		// Listen for action buttons
		for(let b in this._actions) {
			document.getElementsByClassName(b)[0].addEventListener(
				'click',
				this[this._actions[b]]
			);
		}

	},


	// Check for a citation
	checkCitation: function(message) {
		if(message.finished) {
			document.getElementsByClassName("finish-success")[0].classList.remove("hidden");
			document.getElementsByClassName("finish-error")[0].classList.add("hidden");

			// Store the citation
			Finish._citation = message.citation;

			// Format the citation
			let formatted = Formatter.format(message.citation);

			document.getElementsByClassName("finish-format")[0].innerHTML = message.citation.format;
			document.getElementsByClassName("finish-data")[0].innerHTML = formatted;
		}
	},


	// Edit a citation's elements
	editCitation: function() {
		console.log("TODO: Edit citation");
	},


	// Copy a citation's content
	copyCitation: function(event) {
		navigator.clipboard.writeText(
			document.getElementsByClassName("finish-data")[0].innerHTML,
		).then(() => {
			event.target.innerHTML = "Copied!";
		}).catch((error) => {
			event.target.innerHTML = "Error!";
		}).finally(() => {
			setTimeout(() => {
				event.target.innerHTML = "Copy";
			}, 1000);
		});
	},


	// Register & save a citation
	saveCitation: function() {
		let citation = Finish._citation;

		let date = new Date();

		// Create citation metadata
		citation.created = {
			day: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		};

		citation.modified = {
			day: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		};

		citation.name = "New Citation";

		citation.containers = [];

		// Add it to history
		ExtStorage.get("citation-storage", (data) => {
			if(!Array.isArray(data['citation-storage'])) {
				data['citation-storage'] = [];
			}

			data['citation-storage'].push(citation);

			ExtStorage.set(data);
		});
	}

};
