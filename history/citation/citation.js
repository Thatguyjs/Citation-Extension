const CitationManager = {

	// File upload area
	_uploadArea: document.getElementById('file-upload'),


	// Citation context menu
	_citationMenuId: null,


	// List of local citations and containers
	_citations: [],
	_containers: [],


	// Handle file uploads
	_handleUpload: function(event) {
		if(!this._uploadArea.files.length) return;

		let files = [...this._uploadArea.files];
		let next = 1;

		let reader = new FileReader();

		reader.addEventListener('load', () => {
			let data = HistoryFormatter._loadFile(reader.result);

			if(!data.error) {
				// Todo: Support for containers
				let tabId = TabManager.createTab(files[next - 1].name, true);
				TabManager.loadCitations(tabId, data.citations);
			}

			if(next < files.length) reader.readAsText(files[next++]);
		});

		reader.readAsText(files[0]);
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

		this._handleUpload = this._handleUpload.bind(this);
		this._uploadArea.addEventListener('change', this._handleUpload);

		return new Promise((resolve, reject) => {
			ExtStorage.getPreset('citations', (error, citations) => {
				this._citations = citations;
				resolve();
			});
		});
	},


	// Get local citations
	get localCitations() {
		return this._citations;
	},


	// Get local containers
	get localContainers() {
		return this._containers;
	},


	// Add citation events to citations from a tab
	addCitationEvents: function(tabId) {
		let citations = TabManager.getTab(tabId).citations;

		for(let c in citations) {

			// Right click
			citations[c].element.addEventListener('contextmenu', (event) => {
				ContextMenu.loadPreset(this._citationMenuId, {
					show: true,
					x: event.clientX,
					y: event.clientY,
					data: citations[c]
				});

				event.preventDefault();
			});

			// Select
			let selectArea = citations[c].element.querySelector('.citation-select-area');

			selectArea.addEventListener('click', () => {
				TabManager.getTab(tabId).toggleSelect(Number(c));
			});

			// Drag
			let dragArea = citations[c].element.querySelector('.citation-drag-area');

			dragArea.addEventListener('mousedown', (event) => {
				citations[c].element.classList.add('grabbing');

				DragManager.drag(citations[c].element, event, {
					direction: 'vertical',
					callback: () => {
						citations[c].element.classList.remove('grabbing');
					}
				});
			});
		}
	},


	// Handle context menu events
	contextMenuEvent: function(name, citation) {
		let id = null;
		let classList = [...citation.element.classList];

		for(let c in classList) {
			if(classList[c].includes('id')) {
				id = +classList[c].slice(classList[c].lastIndexOf('-') + 1);
				break;
			}
		}

		switch(name) {

			case 'open-link':
				window.open(citation.citation.url, '_blank');
				break;

			case 'copy':
				navigator.clipboard.writeText(
					citation.element.querySelector('.citation-body').innerText
				).catch((error) => {
					alert("Copy error");
				});
				break;

		}
	},


	// Copy multiple citations
	copyCitations: function(citations=null) {
		if(!citations || !citations.length) return;

		let copyString = "";

		for(let c in citations) {
			copyString += citations[c].element.querySelector('pre').innerText + '\n\n';
		}

		navigator.clipboard.writeText(copyString).catch(() => {
			alert("Copy error");
		});
	},


	// Export citations
	exportCitations: function(citations=null) {
		if(!citations || !citations.length) return;

		for(let c in citations) {
			citations[c] = citations[c].citation;
		}

		let exportString = HistoryFormatter.export({
			citations,
			containers: [] // TODO
		});

		exportString = 'data:text/chf,' + exportString;

		chrome.downloads.download({
			url: exportString,
			filename: 'citation-history.chf'
		});
	},


	// Import a history file
	importCitations: function() {
		this._uploadArea.click();
	}

};
