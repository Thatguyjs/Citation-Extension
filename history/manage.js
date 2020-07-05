// Create, modify, and remove citations


const CitationManager = {

	// Tab / header elements
	_tabHeaders: document.getElementById("tab-headers"),
	_tabList: document.getElementById("citation-tabs"),


	// "No citations" message
	_message: document.getElementById("citations-empty"),


	// Citation element html
	_citationHTML: "",


	// All tabs / active tab / new tab button
	_tabs: [],
	_activeTab: null,
	_createTab: document.getElementById("import-tab"),


	// Selection type & element
	_selectionType: 'active',
	_selectionTypeElem: document.getElementById("selection-type"),


	// If all citations are selected / "Select all" button
	_allSelected: false,
	_selectAllElem: document.getElementById("select-all"),


	// Event callback
	_eventCallback: () => {},


	// Get basic information
	init: function() {
		// Change the selection type
		this._selectionTypeElem.addEventListener('click', (event) => {
			if(CitationManager._selectionType === 'active') {
				CitationManager._selectionType = 'all';

				CitationManager._selectionTypeElem.children[0].src = "svg/tabs_all.svg";
				CitationManager._selectionTypeElem.title = "All Tabs";
			}
			else {
				CitationManager._selectionType = 'active';

				CitationManager._selectionTypeElem.children[0].src = "svg/tabs_active.svg";
				CitationManager._selectionTypeElem.title = "Active Tab";
			}
		});

		// Listen for imports
		document.getElementById('import-tab').addEventListener(
			'click', this.import
		);

		// Exports are handled in toolbar.js

		// Load the citations
		return new Promise((resolve, reject) => {
			ExtStorage.readFile("./history/citation_elem.html", (data) => {
				this._citationHTML = data;
				resolve();
			});
		});
	},


	// Set the event callback function
	setCallback: function(callback) {
		this._eventCallback = callback;
	},


	// Load citation + container lists
	createTab: function(name, active=false) {
		// Create the tab header / related elements
		let header = document.createElement('div');
		header.className = "tab-header";
		header.id = "tab-header-" + this._tabs.length;

		let headerName = document.createElement('span');
		headerName.innerHTML = name || "New Citation";

		let closeButton = document.createElement('button');
		closeButton.className = "tab-close";
		closeButton.innerHTML = "<img src=\"svg/close_tab.svg\">";

		header.appendChild(headerName);
		header.appendChild(closeButton);

		// Listen for header clicks
		let headerClick = () => {
			let id = header.id;
			id = id.slice(id.lastIndexOf('-') + 1);

			CitationManager.setTab(Number(id));
		}

		header.addEventListener('click', headerClick);
		headerName.addEventListener('click', headerClick);

		// Listen for closeButton clicks
		closeButton.addEventListener('click', () => {
			let id = header.id;
			id = id.slice(id.lastIndexOf('-') + 1);

			CitationManager.removeTab(Number(id));
		});

		// Create the tab container
		let container = document.createElement('div');
		container.className = "citation-tab";

		this._tabHeaders.insertBefore(header, this._createTab);
		this._tabList.appendChild(container);

		this._tabs.push(new CitationTab(
			this._tabs.length,
			header,
			container
		));

		if(active) {
			if(this._activeTab) {
				this._activeTab._element.classList.remove('citation-tab-active');
				this._activeTab._header.classList.remove('tab-header-active');
			}

			this._activeTab = this._tabs[this._tabs.length - 1];
			this._activeTab._element.classList.add('citation-tab-active');
			this._activeTab._header.classList.add('tab-header-active');

			this._message.style.display = "block";
		}
	},


	// Go to another tab
	setTab: function(tabId) {
		if(tabId < 0 || tabId >= this._tabs.length) return -1;

		if(this._activeTab) {
			this._activeTab._element.classList.remove('citation-tab-active');
			this._activeTab._header.classList.remove('tab-header-active');
		}

		this._activeTab = this._tabs[tabId];
		this._activeTab._element.classList.add('citation-tab-active');
		this._activeTab._header.classList.add('tab-header-active');

		// Display "No citations found"
		if(this._activeTab._citations.length) {
			this._message.style.display = "none";

			// Update the "Select all" button
			this.updateAllSelected();
		}
		else {
			this._message.style.display = "block";
		}

		return 0;
	},


	// Load citations and containers into the active tab
	load: function(citations=[], containers=[]) {
		if(this._activeTab) {
			this._activeTab.load(citations, containers);

			if(citations.length) {
				this._message.style.display = "none";

				// Update the "Select all" button
				this.updateAllSelected();
			}
		}
	},


	// Clear the active tab's citations
	clearTab: function() {
		if(this._activeTab) {
			this._activeTab.clear();
		}
	},


	// Remove a tab
	removeTab: function(tabId) {
		if(tabId < 1 || tabId >= this._tabs.length) return -1; // Prevent default tab from closing
		if(!this._tabs[tabId]) return -1; // Tab was already closed

		// Switch tabs if the current tab is closed
		if(this._activeTab._id == tabId) {
			this.setTab(tabId - 1);
		}

		// Remove the header
		this._tabHeaders.removeChild(this._tabs[tabId]._header);

		// Remove element
		this._tabList.removeChild(this._tabs[tabId]._element);

		// Erase the tab value
		this._tabs[tabId] = null;

		// Remove null tabs
		tabId = this._tabs.length - 1;

		while(this._tabs[tabId] === null) {
			this._tabs.pop();
		}
	},


	// Select all citations in the active tab
	selectAll: function() {
		this._selectAllElem.children[0].src = 'svg/checkbox_checked.svg';

		this._activeTab.selectAll();
		this._allSelected = true;

		this.updateExport();
	},


	// De-select all citations in the active tab
	deselectAll: function() {
		this._selectAllElem.children[0].src = 'svg/checkbox_blank.svg';

		this._activeTab.deselectAll();
		this._allSelected = false;

		this.updateExport();
	},


	// Check if all citations are selected in the active tab
	updateAllSelected: function() {
		let selectNum = this._activeTab._selected.length;
		let all = selectNum === this._activeTab._citations.length;

		if(all && selectNum > 0) {
			this._selectAllElem.children[0].src = 'svg/checkbox_checked.svg';
			this._allSelected = true;
		}
		else {
			this._selectAllElem.children[0].src = 'svg/checkbox_blank.svg';
			this._allSelected = false;
		}

		this.updateExport();
	},


	// Update the "Export Selected" button
	updateExport: function() {
		if(!this.getSelected().citations.length) {
			Toolbar._buttons['export'].classList.add('disabled');
		}
		else {
			Toolbar._buttons['export'].classList.remove('disabled');
		}
	},


	// Get selected citations
	getSelected: function() {
		let citations = [];
		let elements = [];

		// Get from active tab
		if(this._selectionType === 'active') {
			for(let c in this._activeTab._selected) {
				let index = this._activeTab._selected[c];

				citations.push(this._activeTab._citations[index]);
				elements.push(this._activeTab._element.querySelector('.citation-num-' + c));
			}
		}

		// Get from all tabs
		else {
			for(let t in this._tabs) {
				for(let c in this._tabs[t]._selected) {
					let index = this._tabs[t]._selected[c];

					citations.push(this._tabs[t]._citations[index]);
					elements.push(this._tabs[t]._element.querySelector('.citation-num-' + c));
				}
			}
		}

		return {
			citations,
			elements
		};
	},


	// Import citations
	import: function() {
		let area = document.getElementById('import-area');

		area.onchange = () => {
			let name = area.files[0].name;
			name = name.slice(0, name.lastIndexOf('.'));

			let reader = new FileReader();

			reader.onload = () => {
				let data = HistoryFormatter._loadFile(reader.result);

				// Error checking
				if(data.error) {
					console.log(HistoryFormatter.errors[data.error]);
					return;
				}

				CitationManager.createTab(name, true);
				CitationManager.load(data.citations, data.containers);
			}

			reader.readAsText(area.files[0]);

			area.value = '';
		};

		area.click();
	}

};
