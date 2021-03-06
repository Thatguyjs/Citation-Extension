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

		// Selected citations / last toggled
		this._selected = [];
		this._lastToggled = -1;
	}


	// Load citations / containers into a tab
	load(citations, containers) {
		let months = [
			'January', 'February', 'March', 'April',
			'May', 'June', 'July', 'August',
			'September', 'October', 'November', 'December'
		];

		this._citations = citations;
		this._containers = containers;

		for(let c in citations) {
			let element = document.createElement('div');
			element.className = "citation citation-num-" + c;
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
				if(Main._keys.includes('Shift')) {
					CitationManager._activeTab.toggleRange(Number(c));
				}
				else if(CitationManager._activeTab.isSelected(Number(c))) {
					CitationManager._activeTab.deselect(Number(c));
				}
				else {
					CitationManager._activeTab.select(Number(c));
				}
			});

			// Dragging citations
			element.querySelector('.citation-section-right').addEventListener(
				'mousedown', (event) => {
					CitationManager._eventCallback('drag', Number(c), event);
					event.preventDefault();
				}
			);

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

		// Check if it's already selected
		if(this._selected.includes(index)) return -1;

		// Chage the image, add it to the selected array
		let img = this._element.querySelector('.citation-num-' + index);
		img = img.querySelector('.citation-checkbox');

		img.src = 'svg/checkbox_checked.svg';

		this._selected.push(index);
		this._lastToggled = index;

		// Update the CitationManager's selected state
		if(check) CitationManager.updateAllSelected();
	}


	// De-select a citation
	deselect(index, check=true) {
		if(index < 0 || index >= this._citations.length) return -1;
		if(!this._selected.includes(index)) return -1;

		let img = this._element.querySelector('.citation-num-' + index);
		img = img.querySelector('.citation-checkbox');

		img.src = 'svg/checkbox_blank.svg';

		this._selected.splice(this._selected.indexOf(index), 1);
		this._lastToggled = index;

		// Update the CitationManager's selected state
		if(check) CitationManager.updateAllSelected();
	}


	// Toggle a range selection
	toggleRange(endIndex, check=true) {
		if(endIndex < 0 || endIndex >= this._citations.length) return -1;

		let min = Math.min(this._lastToggled, endIndex);
		let max = Math.max(this._lastToggled, endIndex + 1);

		let select = this._selected.includes(this._lastToggled);

		for(let i = min; i < max; i++) {
			if(select) this.select(i, false);
			else this.deselect(i, false);
		}

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
