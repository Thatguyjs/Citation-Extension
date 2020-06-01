const Main = {

	// Initialize the main object
	init: function() {

		// Create the initial tab
		CitationManager.createTab("My Citations", true);

		// Load the citation list
		this.loadCitations();

		// Override right-clicks
		window.addEventListener('contextmenu', (event) => {
			this.rclick(event);
			event.preventDefault();
		});

		// Set the event callback
		CitationManager.setCallback(this.eventCallback);
	},


	// Load local citations
	loadCitations: function() {
		ExtStorage.get("citation-storage", (data) => {
			if(!Array.isArray(data['citation-storage'])) {
				data['citation-storage'] = [];
			}

			// Load into the default tab
			CitationManager.setTab(0);
			CitationManager.clearTab();
			CitationManager.load(data['citation-storage'], []);
		});
	},


	// General event callback
	eventCallback: function(type, id) {
		switch(type) {

			case 'drag':
			return 0;

			case 'show-containers':
			return Main.showContainers(id);

		}
	},


	// Callback to show all containers
	showContainers: function(citation) {
		console.log("TODO: Show all containers");
	},


	// Callback for right-clicking on the page
	rclick: function(event) {
		for(let e in event.path) {
			if(!event.path[e].className) continue;

			// Right-click on a citation
			if(event.path[e].classList.contains('citation-table')) {
				ContextMenu.create([
					"Copy",
					"Open Link",
					"#break",
					"Edit",
					"Delete"
				], (index, text) => {
					this.citationMenuClick(text, event.path[e].parentNode);
				}, true);

				break;
			}

			// Right-click on a tab
			else if(event.path[e].classList.contains('tab-header')) {
				ContextMenu.create([
					"Close Tab",
					"Close Other Tabs",
					"Close All Tabs",
					"#break",
					"Merge With...",
					"#break",
					"Duplicate Tab"
				], (index, text) => {
					this.tabMenuClick(text, event.path[e]);
				}, true);
			}

		}
	},


	// Callback for clicking a citation context menu button
	citationMenuClick: function(text, container) {
		let index = container.id.slice(container.id.lastIndexOf('-') + 1);

		switch(text) {

			case 'Copy':
				navigator.clipboard.writeText(
					container.querySelector('.citation-body').innerHTML
				).catch(alert);
			break;

			case 'Open Link':
				let citation = CitationManager._activeTab._citations[index];
				window.open(citation.url);
			break;

			case 'Edit':
				alert("Editing is not implemented yet");
			break;

			case 'Delete':
				if(confirm("Delete the citation?")) {
					ExtStorage.get("citation-storage", (data) => {
						data['citation-storage'].splice(Number(index), 1);

						// TEMP COMMENT
						ExtStorage.set(data);
					});

					CitationManager._activeTab._element.removeChild(container);
				}
			break;

		}
	},


	// Callback for clicking a tab context menu button
	tabMenuClick: function(text, tab) {
		let index = tab.id.slice(tab.id.lastIndexOf('-') + 1);
		let name = tab.querySelector('span').innerHTML;

		let clickedTab = CitationManager._tabs[Number(index)];

		switch(text) {

			// Closing stuff
			case 'Close Tab':
				tab.querySelector('button').click();
			break;

			case 'Close Other Tabs':
				for(let t in CitationManager._tabs) {
					if(t === index) continue;

					CitationManager.removeTab(Number(t));
				}
			break;

			case 'Close All Tabs':
				for(let t in CitationManager._tabs) {
					CitationManager.removeTab(Number(t));
				}
			break;


			// Modification stuff
			case 'Merge With...':
				alert("Merging is not implemented yet!");
			break;


			// Other tab stuff
			case 'Duplicate Tab':
				CitationManager.createTab(name + ' (duplicate)', true);
				CitationManager.load(clickedTab._citations, clickedTab._containers);
			break;

		}
	}

};
