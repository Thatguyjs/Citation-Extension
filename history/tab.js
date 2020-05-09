// Citation tabs


class CitationTab {
	constructor(id, headerElement, tabElement) {

		// Tab id
		this._id = id;

		// Container header / content
		this._header = headerElement;
		this._element = tabElement;

		// Citation / container lists
		this._citations = [];
		this._containers = [];

	}


	// Load citations / containers into a tab
	load(citations, containers) {
		let months = [
			'Jan', 'Feb', 'Mar', 'Apr',
			'May', 'Jun', 'Jul', 'Aug',
			'Sep', 'Oct', 'Nov', 'Dec'
		];

		this._citations = citations;
		this._containers = containers;

		for(let c in citations) {
			let element = document.createElement('div');
			element.id = "citation-num-" + c;
			element.className = "citation";
			element.innerHTML = CitationManager._citationHTML;

			let formatted = Formatter.format(citations[c]);

			element.querySelector('.citation-name').innerHTML = citations[c].name;
			element.querySelector('.citation-body').innerHTML = formatted;

			let createdDate = [
				citations[c].created.day,
				months[citations[c].created.month - 1],
				citations[c].created.year
			].join(' ');

			element.querySelector('.citation-created').innerHTML = createdDate;

			element.querySelector('.citation-section-left').addEventListener('mousedown', (event) => {
				CitationManager._eventCallback('drag', Number(c));
				event.preventDefault();
			});

			this._element.appendChild(element);
		}
	}


	// Clear all citations / containers
	clear() {
		let children = Array.from(this._element.children);

		for(let c in children) {
			this._element.removeChild(children[c]);
		}
	}

};
