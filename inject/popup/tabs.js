// Update citation tabs


const TabManager = {

	// List of tab elements & ids
	_tabs: Array.from(document.getElementById('content-tabs').children),
	_tabIds: [
		'Title', 'Authors', 'Publishers',
		'Publish_Date', 'Access_Date', 'Finish'
	],


	// The active tab & index
	_activeTab: null,
	_tabIndex: -1,


	// The tab title
	_tabTitle: document.getElementById('tab-name'),


	// Get a specific tab
	getTab: function(name) {
		let index = name;

		if(typeof name !== 'number') {
			index = this._tabIds.indexOf(name);
		}

		return this._tabs[index];
	},


	// Set the active tab
	setTab: function(name) {
		if(this._activeTab) this._activeTab.classList.remove('active-tab');

		if(typeof name === 'number') {
			this._tabIndex = name;
			this._activeTab = this._tabs[name];
		}
		else {
			this._tabIndex = this._tabIds.indexOf(name);
			this._activeTab = this._tabs[this._tabIndex];
		}

		this._activeTab.classList.add('active-tab');

		// Update text
		this._tabTitle.innerText = this._activeTab.id.slice(4).replace('_', ' ');
	},


	// Go to the next tab
	nextTab: function() {
		this.setTab(this._tabIndex + 1);
	},


	// Go to the previous tab
	previousTab: function() {
		this.setTab(this._tabIndex - 1);
	},


	// Check if the tab is first
	isFirstTab: function() {
		return this._tabIndex === 0;
	},


	// Check if the tab is last
	isLastTab: function() {
		return this._tabIndex === (this._tabIds.length - 1);
	}

};
