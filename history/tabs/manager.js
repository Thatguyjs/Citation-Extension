// Tab manager


// Tab Manager
const TabManager = {

	// Citation template (dynamically loaded)
	_citationTemplate: null,


	// Header container
	_headerElement: document.getElementById('tab-headers'),


	// New tab button
	_createTabButton: document.getElementById('tab-create'),


	// Body container
	_bodyElement: document.getElementById('tab-contents'),


	// Tab list
	_tabs: [],


	// Active tab (index)
	_active: -1,


	// Home tab id
	_homeId: -1,


	// Tab header context menu
	_headerMenuId: null,


	// Initialize the tab manager
	init: async function() {
		let response = await fetch('citation/citation.html');
		this._citationTemplate = await response.text();

		this._headerMenuId = ContextMenu.addPreset([
			{ type: 'text', name: 'close-other', text: 'Close other tabs' },
			{ type: 'text', name: 'close-all', text: 'Close all tabs' },
			{ type: 'separator' },
			{ type: 'text', name: 'merge', text: 'Merge with...' },
			{ type: 'text', name: 'duplicate', text: 'Duplicate tab' }
		], this._tabMenuEvent);

		this._createTabButton.addEventListener('click', () => {
			CitationManager.importCitations();
		});
	},


	// Recieve a tab event
	_tabEvent: function(event) {
		switch(event.name) {

			// Click the tab header
			case 'click':
				this.setTab(event.tabId);
				break;

			// Click the close button
			case 'close':
				this.removeTab(event.tabId);
				break;

		}
	},


	// Recieve a tab context menu event
	_tabMenuEvent: function(name, data) {
		if(name === 'close-other') {
			let other = TabManager._tabs.filter(tab => tab.id !== data.id);

			for(let o in other) {
				TabManager.removeTab(other[o].id);
			}
		}
		else if(name === 'close-all') {
			let t = TabManager._tabs.length;

			while(t-- > 0) {
				TabManager.removeTab(t);
			}
		}
		else if(name === 'merge') {
			alert("Merging tabs isn't implemented yet");
		}
		else if(name === 'duplicate') {
			let newId = TabManager.createTab(data.title + ' (copy)', true);

			let citations = data.citations.map(citation => citation.citation);
			TabManager.loadCitations(newId, citations);
		}
	},


	// Create a new tab
	createTab: function(title, active=false, permissions={}) {
		let tab = new Tab(title, this._tabs.length, {
			generateElements: true,
			eventCallback: this._tabEvent.bind(this),
			permissions
		});

		tab.header.addEventListener('contextmenu', (event) => {
			ContextMenu.loadPreset(this._headerMenuId, {
				show: true,
				x: event.clientX,
				y: event.clientY,
				data: tab
			});

			event.preventDefault();
		});

		tab.header.addEventListener('dragstart', (event) => {
			DragManager.drag(tab.header, event, {
				direction: 'horizontal',
				filter: '.tab-header',
				callback: () => {
					this._headerElement.appendChild(this._createTabButton);
					this.setTab(tab.id);
				}
			});

			event.preventDefault();
		});

		this._headerElement.insertBefore(tab.header, this._createTabButton);
		this._bodyElement.appendChild(tab.body);
		this._tabs.push(tab);

		if(permissions.home) this._homeId = tab.id;
		if(active) this.setTab(tab.id);

		return tab.id;
	},


	// Set the active tab
	setTab: function(id) {
		if(this._active > -1) {
			this._tabs[this._active].hide();
		}

		this._active = id;
		if(id === -1) return;

		Toolbar.updateState(id);
		this._tabs[this._active].show();
	},


	// Get the active tab
	get active() {
		return this._tabs[this._active];
	},


	// Get a tab
	getTab: function(id) {
		return this._tabs[id];
	},


	// Get the home tab
	get homeTab() {
		return this._tabs[this._homeId];
	},


	// Remove a tab
	removeTab: function(id) {
		let tab = this._tabs[id];
		if(!tab.getPermission('removable')) return;

		tab.close();
		if(this._active > id) this._active--;

		this._tabs.splice(id, 1);
		let tabNum = this._tabs.length;

		for(let i = id; i < tabNum; i++) {
			this._tabs[i].id--;
		}

		if(this._active === id) {
			if(this._active === tabNum) {
				this._active = Math.max(id - 1, 0);
				if(!this._tabs.length) this._active = -1;
			}

			this.setTab(this._active);
		}
	},


	// Load citations into an existing tab
	loadCitations: function(id, citations) {
		this._tabs[id].loadCitations(citations);

		CitationManager.addCitationEvents(id);
	},


	// Get selected citations
	getSelected: function(tabMode) {
		let citations = [];

		if(tabMode === 'single') {
			for(let s in this.active.selected) {
				citations.push(this.active.citations[this.active.selected[s]]);
			}
		}
		else if(tabMode === 'all') {
			for(let t in this._tabs) {
				for(let s in this._tabs[t].selected) {
					citations.push(this._tabs[t].citations[this._tabs[t].selected[s]]);
				}
			}
		}

		return citations;
	},


	// Set save indicator visibility for tabs
	setSaveIndicator: function(visible=true, tabMode='single') {
		if(tabMode === 'single') {
			this.active.setSaveIndicator(visible);
		}
		else {
			for(let t in this._tabs) {
				this._tabs[t].setSaveIndicator(visible);
			}
		}
	}

};
