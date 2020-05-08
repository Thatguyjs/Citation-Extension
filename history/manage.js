// Create, modify, and remove citations


const CitationManager = {

	// Citation element display container
	_tabHeaders: document.getElementById("tab-headers"),
	_tabList: document.getElementById("citation-tabs"),


	// "No citations" message
	_message: document.getElementById("citations-empty"),


	// Citation element html
	_citationHTML: "",


	// All tabs / active tab
	_tabs: [],
	_activeTab: null,


	// Event callback
	_eventCallback: () => {},


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


	// Set the event callback function
	setCallback: function(callback) {
		this._eventCallback = callback;
	},


	// Load citation + container lists
	createTab: function(active=false) {
		// Create the tab header / related elements
		let header = document.createElement('div');
		header.className = "tab-header";
		header.id = "tab-header-" + this._tabs.length;

		let closeButton = document.createElement('button');
		closeButton.className = "tab-close";

		header.appendChild(closeButton);

		// Listen for header clicks
		header.addEventListener('click', (event) => {
			let id = event.target.id;
			id = id.slice(id.lastIndexOf('-') + 1);

			CitationManager.setTab(Number(id));
		});

		// Create the tab container
		let container = document.createElement('div');
		container.className = "citation-tab";

		this._tabHeaders.appendChild(header);
		this._tabList.appendChild(container);

		this._tabs.push(new CitationTab(
			this._tabs.length,
			header,
			container
		));

		if(active) this._activeTab = this._tabs[this._tabs.length - 1];
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

		return 0;
	},


	// Load citations and containers into the active tab
	load: function(citations=[], containers=[]) {
		if(this._activeTab) {
			this._activeTab.load(citations, containers);
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

		// Switch tabs if the current tab is closed
		if(this._activeTab._id == tabId) {
			this._activeTab = this._tabs[tabId - 1];
			this._activeTab._element.classList.add('citation-tab-active');
			this._activeTab._header.classList.add('tab-header-active');
		}

		// Remove the header
		this._tabHeaders.removeChild(this._tabs[tabId]._header);

		// Remove element
		this._tabList.removeChild(this._tabs[tabId]._element);

		// Remove it from the array
		this._tabs.splice(tabId, 1);
	},


	// Import citations
	import: function() {
		let area = document.getElementById('import-area');

		area.addEventListener('change', (event) => {
			let reader = new FileReader();

			reader.onload = () => {
				let data = HistoryFormatter._loadFile(reader.result);

				CitationManager.createTab(true);
				CitationManager.load(data.citations, data.containers);
			}

			reader.readAsText(area.files[0]);
		});

		area.click();
	},


	// Export citations
	export: function() {
		let historyString = HistoryFormatter.export(CitationManager._citations);
		historyString = "data:text/chf," + historyString;

		chrome.downloads.download({
			url: historyString,
			filename: "history.chf"
		});
	}

};
