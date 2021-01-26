const CitationManager = {

	// File upload area, mode, and external window
	_uploadArea: document.getElementById('file-upload'),
	_uploadMode: 'current',
	_uploadWindow: null,


	// Citation context menu
	_citationMenuId: null,


	// Citation sections
	sections: {},


	// Citations & containers
	citations: [],
	containers: [],


	// Selected citations (indices)
	selected: [],
	_lastToggled: null,


	// Handle file uploads
	_handleUpload: function() {
		if(!this._uploadArea.files.length) return;

		const files = [...this._uploadArea.files];
		let index = 1;

		const reader = new FileReader();

		reader.addEventListener('load', (event) => {
			const data = HistoryFormatter._loadFile(reader.result);

			if(!data.error) {
				// Todo: Support for containers
				CitationManager.loadCitations(data.citations, files[index - 1].name);
			}
			else PopupManager.add('default', HistoryFormatter.errors[data.error], {
				type: 'error',
				duration: 3
			});

			if(index < files.length) reader.readAsArrayBuffer(files[index++]);
		});

		reader.readAsArrayBuffer(files[0]);
		this._uploadArea.value = "";
	},


	// Initialize the manager
	init: async function() {
		this._citationMenuId = ContextMenu.addPreset([
			{ type: 'text', name: 'copy', icon: 'copy', text: 'Copy text' },
			{ type: 'text', name: 'open-link', icon: 'open', text: 'Open link' },
			{ type: 'separator' },
			{ type: 'text', name: 'rename', icon: 'text', text: 'Rename' },
			{ type: 'text', name: 'edit', icon: 'edit', text: 'Edit' },
			{ type: 'separator' },
			{ type: 'text', name: 'delete', icon: 'delete', text: 'Delete' }
		], this.contextMenuEvent);

		this._uploadArea.addEventListener('change', this._handleUpload.bind(this));

		this.createSection('default', false);
	},


	// Handle context menu events
	contextMenuEvent: function(name, data) {
		const citation = data[0];
		const index = data[1];

		switch(name) {

			// Copy the citation body
			case 'copy':
				navigator.clipboard.writeText(
					citation.element.querySelector('.citation-body').innerText
				);
				break;

			// Open the citation's url in a new tab
			case 'open-link':
				if(!citation.citation.url) break;
				window.open(citation.citation.url);
				break;

			// Rename the citation
			case 'rename': {
				let name = prompt("New Name:");
				if(!name) name = citation.citation.name;

				citation.citation.name = name;
				citation.element.querySelector('.citation-name').innerText = name;
				} break;

			// Edit the citation
			case 'edit':
				break;

			// Delete the citation
			case 'delete':
				CitationManager.removeCitation(index);
				break;

		}
	},


	// Create a citation section
	createSection: function(name, showName=true) {
		if(!name) return;
		if(this.sections[name]) return this.sections[name];

		this.sections[name] = document.createElement('div');
		this.sections[name].classList.add('section');
		this.sections[name].classList.add('section-' + name);

		if(showName) {
			let nameElem = document.createElement('h2');
			nameElem.classList.add('section-name');
			nameElem.innerText = name;

			this.sections[name].appendChild(nameElem);
		}

		CitationLoader._citationList.appendChild(this.sections[name]);
		return this.sections[name];
	},


	// Load citations
	loadCitations: function(citations, sectionName='default') {
		const offset = this.citations.length;
		let section = this.createSection(sectionName);
		let copy = [];

		if(this._uploadMode === 'new') {
			this._uploadMode = 'current';
			this._uploadWindow.dispatchEvent(new CustomEvent('citations', {
				detail: citations
			}));
			return;
		}

		for(let c in citations) {
			copy.push({
				citation: citations[c],
				element: CitationLoader.loadCitation(citations[c], section),
				section
			});

			// Right-click on a citation
			copy[c].element.addEventListener('contextmenu', (event) => {
				ContextMenu.loadPreset(this._citationMenuId, {
					show: true,
					x: event.clientX,
					y: event.clientY,
					data: [copy[c], +c + offset]
				});

				event.preventDefault();
			});

			// Select a citation
			copy[c].element.querySelector('.citation-select-area').addEventListener('click', (event) => {
				if(event.shiftKey && CitationManager._lastToggled !== null) {
					let ind = Math.min(+c, CitationManager._lastToggled);
					const end = Math.max(+c, CitationManager._lastToggled);
					const select = CitationManager.selected.includes(CitationManager._lastToggled);

					while(ind <= end) {
						if(select) CitationManager.select(+ind);
						else CitationManager.deselect(+ind);
						ind++;
					}
				}
				else CitationManager.toggleSelect(+c);
			});
		}

		this.citations.push(...copy);
	},


	// Remove a citation
	removeCitation: function(index) {
		const citation = this.citations[index];
		if(!citation) return;

		console.log("Remove:", citation);
	},


	// Toggle a citation selection
	toggleSelect: function(index) {
		if(this.selected.includes(index)) this.deselect(index);
		else this.select(index);
	},


	// Select a citation
	select: function(index, update=true) {
		const checkbox = this.citations[index]?.element.querySelector('.citation-select');
		if(!checkbox || this.selected.includes(index)) return;

		this.selected.push(index);
		ChangeSVGIcon(checkbox, "checkbox-checked");

		this._lastToggled = index;
		if(update) Toolbar.updateButtons();
	},


	// Deselect a citation
	deselect: function(index, update=true) {
		const checkbox = this.citations[index]?.element.querySelector('.citation-select');
		if(!checkbox || !this.selected.includes(index)) return;

		this.selected.splice(this.selected.indexOf(index), 1);
		ChangeSVGIcon(checkbox, "checkbox-blank");

		this._lastToggled = index;
		if(update) Toolbar.updateButtons();
	},


	// Select all citations
	selectAll: function() {
		for(let c in this.citations) {
			this.select(+c, false);
		}

		Toolbar.updateButtons();
	},


	// Deselect all citations
	deselectAll: function() {
		for(let c in this.citations) {
			this.deselect(+c, false);
		}

		Toolbar.updateButtons();
	},


	// Import citations from a file
	importCitations: function(mode='current') {
		if(mode === 'current') {
			this._uploadMode = mode;
			this._uploadArea.click();
		}
		else if(mode === 'new') {
			this._uploadMode = mode;
			this._uploadArea.click();
			this._uploadWindow = window.open("./index.html");
		}
	},


	// Export citations to a file
	exportCitations: function() {

	}

};
