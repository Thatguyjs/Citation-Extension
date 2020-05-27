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

		// Selected citations
		this._selected = [];

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

			// Selecting citations
			element.querySelector('.citation-checkbox').addEventListener('click', (event) => {
				if(CitationManager._activeTab.isSelected(Number(c))) {
					CitationManager._activeTab.deselect(Number(c));
				}
				else {
					CitationManager._activeTab.select(Number(c));
				}
			});

			// Dragging citations
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


	// Select a citation
	select(index, check=true) {
		if(index < 0 || index >= this._citations.length) return -1;

		let img = this._element.children[index].querySelector('.citation-checkbox');
		img.src = 'svg/checkbox_checked.svg';

		this._selected.push(index);

		// Update the CitationManager's selected state
		if(check) CitationManager.updateAllSelected();
	}


	// De-select a citation
	deselect(index, check=true) {
		if(index < 0 || index >= this._citations.length) return -1;
		if(!this._selected.includes(index)) return -1;

		let img = this._element.children[index].querySelector('.citation-checkbox');
		img.src = 'svg/checkbox_blank.svg';

		this._selected.splice(this._selected.indexOf(index), 1);

		// Update the CitationManager's selected state
		if(check) CitationManager.updateAllSelected();
	}


	// Select all citations
	selectAll() {
		let length = this._citations.length;

		for(let i = 0; i < length; i++) {
			this.select(i, false);
		}
	}


	// De-select all citations
	deselectAll() {
		let length = this._citations.length;

		for(let i = 0; i < length; i++) {
			this.deselect(i, false);
		}
	}


	// Check if a citation is selected
	isSelected(index) {
		if(index < 0 || index >= this._citations.length) return false;

		return this._selected.includes(index);
	}

};
