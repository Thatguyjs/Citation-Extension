const Main = {

	// Initialize the main object
	init: function() {

		// Create the initial tab
		CitationManager.createTab();
		CitationManager.setTab(0);

		// Load the citation list
		this.loadCitations();

		// Refresh the citation list
		document.getElementById("refresh-list").addEventListener('click', () => {
			this.loadCitations();
		});

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

			// Click on a citation
			if(event.path[e].classList.contains('citation-table')) {
				ContextMenu.create([
					"Copy",
					"#break",
					"Edit",
					"Delete"
				], (index, text) => {
					this.menuClick(text, event.path[e].parentNode);
				}, true);

				break;
			}

		}
	},


	// Callback for clicking a context menu button
	menuClick: function(text, container) {
		switch(text) {

			case 'Copy':
				navigator.clipboard.writeText(
					container.querySelector('.citation-body').innerHTML
				).catch(alert);
			break;

			case 'Edit':
				alert("Editing is not implemented yet");
			break;

			case 'Delete':
				if(confirm("Delete the citation?")) {
					let index = container.id.slice(container.id.lastIndexOf('-') + 1);
					index = Number(index);

					ExtStorage.get("citation-storage", (data) => {
						data['citation-storage'].splice(index, 1);

						// TEMP COMMENT
						ExtStorage.set(data);
					});

					CitationManager._tabList.removeChild(container);
				}
			break;

		}
	}

};
