// Create, modify, and remove citations


const CitationList = {

	// Main citation list container
	_list: document.getElementById("citation-list"),

	// "No citations" message
	_message: document.getElementById("citations-empty"),


	// Citation element html
	_citationHTML: "",


	// Get basic information
	init: function() {
		return new Promise((resolve, reject) => {
			ExtStorage.readFile("./history/citation_elem.html", (data) => {
				this._citationHTML = data;
				resolve();
			});
		});
	},


	// Load citation + container lists
	load: function(object) {
		if(object.citations.length) {
			this._message.style.display = 'none';
		}

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
				object.citations[c].created.month + '.',
				object.citations[c].created.year
			].join(' ');

			element.querySelector('.citation-created').innerHTML = createdDate;

			this._list.appendChild(element);
		}
	}

};
