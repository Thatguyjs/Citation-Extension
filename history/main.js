const Main = {

	// Home tab
	homeTab: null,


	init: function() {
		this.homeTab = TabManager.createTab('My Citations', true, {
			removable: false
		});

		TabManager.loadCitations(this.homeTab, CitationManager.localCitations);
	}

};
