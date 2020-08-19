// Tab class


class Tab {
	constructor(title="New Tab", id=null, options={}) {
		this.title = title;
		this.id = id;

		this.citations = [];
		this.selected = []; // Citation indexes

		this._header = null;
		this._body = null;

		if(options.generateElements) {
			this._constructHeader();
			this._constructBody();
		}

		this._eventCallback = options.eventCallback || null;
		this.setPermissions(options.permissions || null);
	}


	// Set tab permissions
	setPermissions(options) {
		if(!options) return 0;

		let bitField = 0;

		if(options.removable === false) bitField |= 1;
		if(options.duplicatable === false) bitField |= 2;
		if(options.mergeable === false) bitField |= 4;

		this._permissions = bitField;
		this.updateHeader();

		return bitField;
	}


	// Get a permission bit from a tab
	getPermission(name) {
		let andBit = 0;

		switch(name) {

			case 'removable':
				andBit = 1;
				break;

			case 'duplicatable':
				andBit = 2;
				break;

			case 'mergeable':
				andBit = 4;
				break;

		}

		return (this._permissions & andBit) === 0;
	}


	// Dispatch a tab event
	_dispatchEvent(name) {
		if(!this._eventCallback) return;

		this._eventCallback({ name, tabId: this.id });
	}


	// Construct the tab header element
	_constructHeader() {
		if(this._header) this._header.parentNode.removeChild(this._header);

		this._header = document.createElement('div');
		this._header.className = `tab-header tab-header-${this.id}`;
		this._header.setAttribute('draggable', 'true');

		let title = document.createElement('span');
		title.className = 'tab-title';
		title.innerText = this.title;

		let saveInd = document.createElement('div');
		saveInd.className = 'tab-save-indicator hidden';

		let closeBtn = document.createElement('button');
		closeBtn.setAttribute('title', 'Close tab');
		closeBtn.className = 'tab-close-button';
		closeBtn.innerHTML = '<svg><use href="#icon-tabs-close"/></svg>';

		this._header.appendChild(title);
		this._header.appendChild(closeBtn);
		this._header.appendChild(saveInd);

		this._header.addEventListener('click', (event) => {
			if(event.path.includes(closeBtn)) {
				this._dispatchEvent('close');
			}
			else {
				this._dispatchEvent('click');
			}
		});
	}


	// Construct the tab body element
	_constructBody() {
		if(this._body) this._body.parentNode.removeChild(this._body);

		this._body = document.createElement('div');
		this._body.className = `tab-body tab-body-${this.id} hidden`;
	}


	// Get the header element
	get header() {
		if(!this._header) this._constructHeader();
		return this._header;
	}


	// Get the body element
	get body() {
		if(!this._body) this._constructBody();
		return this._body;
	}


	// Update header settings
	updateHeader() {
		if(!this._header) return;

		if(this.getPermission('removable')) {
			this._header.classList.remove('non-removable');
		}
		else {
			this._header.classList.add('non-removable');
		}
	}


	// Rename the tab
	rename(title="New Tab") {
		this.title = title;
		if(this._header) this._header.querySelector('tab-title').innerText = title;
	}


	// Hide the tab body
	hide() {
		if(!this._body) return;

		this._body.classList.add('hidden');
		this._header.classList.remove('active');
	}


	// Show the tab body
	show() {
		if(!this._body) return;

		this._body.classList.remove('hidden');
		this._header.classList.add('active');
	}


	// Close the tab
	close() {
		this._header.classList.add('closing');
		setTimeout(this.removeHeader.bind(this), 300);

		this.removeBody();
	}


	// Remove the header element
	removeHeader() {
		if(!this._header) return;
		this._header.parentNode.removeChild(this._header);
	}


	// Remove the body element
	removeBody() {
		if(!this._body) return;
		this._body.parentNode.removeChild(this._body);
	}


	// Load citations into the tab
	loadCitations(citations) {
		if(!this._body) this._constructBody();

		let months = [
			'Jan', 'Feb', 'Mar', 'Apr',
			'May', 'Jun', 'Jul', 'Aug',
			'Sep', 'Oct', 'Nov', 'Dec'
		];

		for(let c in citations) {
			let element = document.createElement('div');
			element.className = 'citation display-tiles citation-id-' + c;
			element.innerHTML = TabManager._citationTemplate;

			element.querySelector('.citation-title').innerText = citations[c].name;
			element.querySelector('.citation-format').innerText = citations[c].format;

			let formatted = Formatter.format(citations[c]);
			element.querySelector('.citation-body').innerText = formatted;

			let createdDate = [
				citations[c].created.day,
				months[citations[c].created.month - 1] + '.',
				citations[c].created.year
			];

			element.querySelector('.citation-date').innerText = createdDate.join(' ');

			this.citations.push({ citation: citations[c], element });
			this._body.appendChild(element);
		}
	}


	// Remove a citation
	removeCitation(index) {
		this.body.removeChild(this.citations[index].element);
		this.citations[index].citation = null;
	}


	// Set the save indicator's visibility
	setSaveIndicator(visible=true) {
		let element = this.header.querySelector('.tab-save-indicator');

		if(visible) element.classList.remove('hidden');
		else element.classList.add('hidden');
	}


	// Toggle a citation's selected state
	toggleSelect(index, updateToolbar=true) {
		let svg = this.citations[index].element.querySelector('.citation-select');

		if(this.selected.includes(index)) {
			ChangeSVGIcon(svg, 'checkbox-blank');
			this.selected.splice(this.selected.indexOf(index), 1);
		}
		else {
			ChangeSVGIcon(svg, 'checkbox-checked');
			this.selected.push(index);
		}

		if(updateToolbar) Toolbar.updateState(this.id);
	}


	// Select all citations in the tab
	selectAll() {
		for(let c in this.citations) {
			let ind = +c;

			if(!this.selected.includes(ind)) {
				this.toggleSelect(ind, false);
			}
		}
	}


	// De-select all citations in the tab
	deselectAll() {
		while(this.selected.length) {
			this.toggleSelect(this.selected[0], false);
		}
	}

}
