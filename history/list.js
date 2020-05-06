// Create, modify, and remove citations


const CitationList = {

	// Loaded citation properties
	_citations: {},


	// Citation element display container
	_list: document.getElementById("citation-list"),


	// "No citations" message
	_message: document.getElementById("citations-empty"),


	// Citation element html
	_citationHTML: "",


	// Get basic information
	init: function() {

		// Listen for imports
		document.getElementById('citation-import').addEventListener(
			'click', this.import
		);

		// Listen for exports
		document.getElementById('citation-export').addEventListener(
			'click', this.export
		);

		// Load the citations
		return new Promise((resolve, reject) => {
			ExtStorage.readFile("./history/citation_elem.html", (data) => {
				this._citationHTML = data;
				resolve();
			});
		});
	},


	// Load citation + container lists
	load: function(object, callback) {
		if(object.citations.length) {
			this._message.style.display = 'none';
		}

		let months = [
			'Jan', 'Feb', 'Mar', 'Apr',
			'May', 'Jun', 'Jul', 'Aug',
			'Sep', 'Oct', 'Nov', 'Dec'
		];

		this._citations = object;

		for(let c in object.citations) {
			let element = document.createElement('div');
			element.id = "citation-num-" + c;
			element.className = "citation";
			element.innerHTML = this._citationHTML;

			let formatted = Formatter.format(object.citations[c]);

			element.querySelector('.citation-name').innerHTML = object.citations[c].name;
			element.querySelector('.citation-body').innerHTML = formatted;

			let createdDate = [
				object.citations[c].created.day,
				months[object.citations[c].created.month - 1],
				object.citations[c].created.year
			].join(' ');

			element.querySelector('.citation-created').innerHTML = createdDate;

			element.querySelector('.citation-section-left').addEventListener('mousedown', (event) => {
				callback('drag', Number(c));
				event.preventDefault();
			});

			this._list.appendChild(element);
		}
	},


	// Clear the citation list
	clear: function() {
		let parent = document.getElementById('citation-list');

		let elements = document.getElementsByClassName('citation');
		elements = elements ? Array.from(elements) : [];

		for(let e in elements) {
			parent.removeChild(elements[e]);
		}
	},


	// Import citations
	import: function() {
		let area = document.getElementById('import-area');

		area.addEventListener('change', (event) => {
			let reader = new FileReader();

			reader.onload = () => {
				let citations = HistoryFormatter._loadFile(reader.result);

				CitationList.clear();
				CitationList.load(citations, Main.eventCallback);
			}

			reader.readAsText(area.files[0]);
		});

		area.click();
	},


	// Export citations
	export: function() {
		let historyString = HistoryFormatter.export(CitationList._citations);
		historyString = "data:text/chf," + historyString;

		chrome.downloads.download({
			url: historyString,
			filename: "history.chf"
		});
	}

};
